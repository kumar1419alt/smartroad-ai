/**
 * useDashcam.js — Reusable React hook for live camera capture & frame extraction.
 *
 * Responsibilities:
 *  - Open / pause / resume / stop the camera via navigator.mediaDevices.getUserMedia
 *  - Prefer the environment-facing (rear) camera on mobile devices
 *  - Display the live stream via a provided videoRef
 *  - Extract JPEG frames at a configurable interval (default: 1000 ms)
 *  - Resize frames to a configurable maxDimension (default: 640 px), aspect-ratio-preserved
 *  - Encode frames as JPEG at a configurable quality (default: 0.82)
 *  - Prevent concurrent frame capture (busy-lock)
 *  - Keep a frame counter and expose the most recently captured frame data URL
 *  - Clean up all tracks, intervals, animation frames, and canvas on stop / unmount
 *  - Expose granular error states for permission denial, no hardware, and other errors
 *
 * Usage:
 *   const {
 *     videoRef,
 *     isSessionActive, isPaused, isStarting,
 *     cameraStatus, cameraError,
 *     frameCount, lastFrame,
 *     sessionDuration,
 *     startSession, stopSession, pauseSession, resumeSession,
 *   } = useDashcam({ onFrame, samplingIntervalMs, maxDimension, jpegQuality })
 *
 * The `onFrame` callback receives: { dataUrl, frameCount, timestamp }
 * Frames are NOT uploaded here — the consumer decides what to do with them.
 */

import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_SAMPLING_INTERVAL_MS = 1000
const DEFAULT_MAX_DIMENSION        = 640
const DEFAULT_JPEG_QUALITY         = 0.82

// ─── Camera status values ─────────────────────────────────────────────────────
export const CAMERA_STATUS = {
  IDLE:     'idle',
  STARTING: 'starting',
  ACTIVE:   'active',
  PAUSED:   'paused',
  DENIED:   'denied',
  ERROR:    'error',
  STOPPED:  'stopped',
}

/**
 * Resize a raw video frame to fit inside `maxDimension` × `maxDimension`,
 * preserving the original aspect ratio, then encode as JPEG.
 *
 * @param {HTMLVideoElement|HTMLCanvasElement} source
 * @param {number} maxDimension
 * @param {number} quality
 * @returns {string|null} — Base64 JPEG data URL, or null on error
 */
function captureResizedFrame(source, maxDimension, quality) {
  // Determine natural dimensions
  const srcW = source.videoWidth  ?? source.width  ?? 640
  const srcH = source.videoHeight ?? source.height ?? 480

  if (!srcW || !srcH) return null

  // Compute scaled dimensions preserving aspect ratio
  const scale  = Math.min(maxDimension / srcW, maxDimension / srcH, 1) // never upscale
  const dstW   = Math.round(srcW * scale)
  const dstH   = Math.round(srcH * scale)

  // Reuse a module-level offscreen canvas for efficiency (avoids GC pressure)
  if (!captureResizedFrame._canvas) {
    captureResizedFrame._canvas = document.createElement('canvas')
  }
  const canvas = captureResizedFrame._canvas
  canvas.width  = dstW
  canvas.height = dstH

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  try {
    ctx.drawImage(source, 0, 0, dstW, dstH)
    return canvas.toDataURL('image/jpeg', quality)
  } catch {
    return null
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * @param {object}   [options]
 * @param {function} [options.onFrame]             Called with { dataUrl, frameCount, timestamp } for each captured frame
 * @param {number}   [options.samplingIntervalMs]  Milliseconds between frames (default 1000)
 * @param {number}   [options.maxDimension]        Max width or height of captured frame in px (default 640)
 * @param {number}   [options.jpegQuality]         JPEG quality 0–1 (default 0.82)
 */
export function useDashcam({
  onFrame             = null,
  samplingIntervalMs  = DEFAULT_SAMPLING_INTERVAL_MS,
  maxDimension        = DEFAULT_MAX_DIMENSION,
  jpegQuality         = DEFAULT_JPEG_QUALITY,
} = {}) {
  // ── Refs ────────────────────────────────────────────────────────────────────
  const videoRef          = useRef(null)      // <video> DOM element
  const mediaStreamRef    = useRef(null)      // active MediaStream
  const samplingTimerRef  = useRef(null)      // setInterval ID
  const sessionStartRef   = useRef(null)      // Date.now() when session started
  const isBusyRef         = useRef(false)     // busy-lock — skip frame if previous still running
  const isPausedRef       = useRef(false)     // mirror of isPaused state (avoids stale closure)
  const isActiveRef       = useRef(false)     // mirror of isSessionActive
  const frameCountRef     = useRef(0)         // frame counter (avoids batched re-renders)
  const onFrameRef        = useRef(onFrame)   // keep latest callback without restarting interval
  const intervalMsRef     = useRef(samplingIntervalMs)
  const maxDimRef         = useRef(maxDimension)
  const qualityRef        = useRef(jpegQuality)

  // Keep option refs up to date when props change without restarting the session
  useEffect(() => { onFrameRef.current    = onFrame },           [onFrame])
  useEffect(() => { intervalMsRef.current = samplingIntervalMs }, [samplingIntervalMs])
  useEffect(() => { maxDimRef.current     = maxDimension },       [maxDimension])
  useEffect(() => { qualityRef.current    = jpegQuality },        [jpegQuality])

  // ── State ───────────────────────────────────────────────────────────────────
  const [cameraStatus,    setCameraStatus]    = useState(CAMERA_STATUS.IDLE)
  const [cameraError,     setCameraError]     = useState(null)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [isPaused,        setIsPaused]        = useState(false)
  const [isStarting,      setIsStarting]      = useState(false)
  const [frameCount,      setFrameCount]      = useState(0)
  const [lastFrame,       setLastFrame]       = useState(null)   // most recent JPEG data URL
  const [sessionDuration, setSessionDuration] = useState(0)      // seconds

  // ── Session timer ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSessionActive) {
      setSessionDuration(0)
      return
    }
    const timer = setInterval(() => {
      if (sessionStartRef.current) {
        setSessionDuration(Math.floor((Date.now() - sessionStartRef.current) / 1000))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [isSessionActive])

  // ── Internal: extract one frame ─────────────────────────────────────────────
  const _extractFrame = useCallback(() => {
    if (isBusyRef.current)       return  // busy-lock: previous frame still processing
    if (isPausedRef.current)     return  // paused
    if (!isActiveRef.current)    return  // session ended

    const video = videoRef.current
    if (!video) return

    // For a real camera stream readyState must be >= 2 (HAVE_CURRENT_DATA)
    // For demo canvas sources we accept anything
    const isRealCamera = video.srcObject && video.srcObject instanceof MediaStream
    if (isRealCamera && video.readyState < 2) return

    isBusyRef.current = true

    try {
      const dataUrl = captureResizedFrame(video, maxDimRef.current, qualityRef.current)
      if (!dataUrl) { isBusyRef.current = false; return }

      frameCountRef.current += 1
      const snap = { dataUrl, frameCount: frameCountRef.current, timestamp: Date.now() }

      // Update React state for UI
      setFrameCount(frameCountRef.current)
      setLastFrame(dataUrl)

      // Invoke consumer callback (can be async; we don't await to avoid blocking)
      if (typeof onFrameRef.current === 'function') {
        try {
          const result = onFrameRef.current(snap)
          if (result && typeof result.finally === 'function') {
            result.finally(() => { isBusyRef.current = false })
            return  // busy-lock released by promise
          }
        } catch (err) {
          console.error('[useDashcam] onFrame callback threw:', err)
        }
      }
    } finally {
      // Release busy-lock synchronously if onFrame was not async
      isBusyRef.current = false
    }
  }, []) // stable — all deps via refs

  // ── Internal: start the sampling interval ───────────────────────────────────
  const _startSamplingInterval = useCallback(() => {
    // Clear any pre-existing timer first
    if (samplingTimerRef.current) {
      clearInterval(samplingTimerRef.current)
    }

    // Take first frame quickly after stream is ready
    const firstFrameTimer = setTimeout(() => _extractFrame(), 300)

    samplingTimerRef.current = setInterval(() => _extractFrame(), intervalMsRef.current)

    // Return a cleanup function
    return () => {
      clearTimeout(firstFrameTimer)
      clearInterval(samplingTimerRef.current)
      samplingTimerRef.current = null
    }
  }, [_extractFrame])

  // ── Internal: stop and release media tracks ─────────────────────────────────
  const _stopMediaTracks = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      mediaStreamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  // ── Internal: stop sampling interval ────────────────────────────────────────
  const _stopSamplingInterval = useCallback(() => {
    if (samplingTimerRef.current) {
      clearInterval(samplingTimerRef.current)
      samplingTimerRef.current = null
    }
  }, [])

  // ── startSession ────────────────────────────────────────────────────────────
  const startSession = useCallback(async () => {
    if (isActiveRef.current) return   // already running

    setIsStarting(true)
    setCameraStatus(CAMERA_STATUS.STARTING)
    setCameraError(null)
    frameCountRef.current = 0
    setFrameCount(0)
    setLastFrame(null)
    isBusyRef.current  = false
    isPausedRef.current = false
    setIsPaused(false)

    try {
      // Request camera — prefer rear-facing on mobile (module-level helper)
      const stream = await requestCamera()
      mediaStreamRef.current = stream

      const video = videoRef.current
      if (!video) throw new Error('Video element not mounted.')

      video.srcObject   = stream
      video.muted       = true
      video.playsInline = true

      // Wait for the video to be ready to play
      await new Promise((resolve, reject) => {
        const onCanPlay = () => { video.removeEventListener('canplay', onCanPlay); resolve() }
        const onError  = () => { video.removeEventListener('error',   onError);   reject(new Error('Video element failed to load stream.')) }
        video.addEventListener('canplay', onCanPlay)
        video.addEventListener('error',   onError)
        video.play().catch(() => {})          // autoPlay may still work
        // Fallback: resolve after 2s in case canplay never fires (some browsers)
        setTimeout(resolve, 2000)
      })

      sessionStartRef.current = Date.now()
      isActiveRef.current     = true
      setIsSessionActive(true)
      setCameraStatus(CAMERA_STATUS.ACTIVE)
      _startSamplingInterval()

    } catch (err) {
      let status = CAMERA_STATUS.ERROR
      let message = err.message || 'Failed to access camera.'

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        status  = CAMERA_STATUS.DENIED
        message = 'Camera permission denied. Please allow camera access in your browser settings and try again.'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera hardware detected on this device.'
      } else if (err.name === 'NotReadableError') {
        message = 'Camera is already in use by another application.'
      } else if (err.name === 'OverconstrainedError') {
        message = 'Requested camera constraints could not be satisfied by any available camera.'
      }

      setCameraStatus(status)
      setCameraError(message)
      _stopMediaTracks()
      return { success: false, error: { name: err.name, message } }
    } finally {
      setIsStarting(false)
    }

    return { success: true }
  }, [_startSamplingInterval, _stopMediaTracks])

  // ── stopSession ─────────────────────────────────────────────────────────────
  const stopSession = useCallback(() => {
    isActiveRef.current  = false
    isPausedRef.current  = false
    isBusyRef.current    = false
    sessionStartRef.current = null

    _stopSamplingInterval()
    _stopMediaTracks()

    setIsSessionActive(false)
    setIsPaused(false)
    setSessionDuration(0)
    setCameraStatus(CAMERA_STATUS.STOPPED)
  }, [_stopSamplingInterval, _stopMediaTracks])

  // ── pauseSession ─────────────────────────────────────────────────────────────
  const pauseSession = useCallback(() => {
    if (!isActiveRef.current) return
    isPausedRef.current = true
    setIsPaused(true)
    setCameraStatus(CAMERA_STATUS.PAUSED)
  }, [])

  // ── resumeSession ────────────────────────────────────────────────────────────
  const resumeSession = useCallback(() => {
    if (!isActiveRef.current) return
    isPausedRef.current = false
    setIsPaused(false)
    setCameraStatus(CAMERA_STATUS.ACTIVE)
  }, [])

  // ── togglePause ──────────────────────────────────────────────────────────────
  const togglePause = useCallback(() => {
    if (isPausedRef.current) {
      resumeSession()
    } else {
      pauseSession()
    }
  }, [pauseSession, resumeSession])

  // ── Reset frame counter & preview ────────────────────────────────────────────
  const resetFrameState = useCallback(() => {
    frameCountRef.current = 0
    setFrameCount(0)
    setLastFrame(null)
  }, [])

  // ── Global cleanup on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      isActiveRef.current = false
      _stopSamplingInterval()
      _stopMediaTracks()
      // Release the shared offscreen canvas
      captureResizedFrame._canvas = null
    }
  }, [_stopSamplingInterval, _stopMediaTracks])

  return {
    // Refs
    videoRef,

    // State
    isSessionActive,
    isPaused,
    isStarting,
    cameraStatus,
    cameraError,
    frameCount,
    lastFrame,
    sessionDuration,

    // Controls
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    togglePause,
    resetFrameState,
  }
}

// ─── Helper: request camera with rear-camera preference & fallback ─────────────

async function requestCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera access (getUserMedia) is not supported by this browser.')
  }

  // Strategy 1: Prefer environment-facing camera at HD resolution
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width:      { ideal: 1280 },
        height:     { ideal: 720 },
      },
      audio: false,
    })
  } catch (primaryErr) {
    // Only retry on constraint / not-found errors, not on permission denial
    if (primaryErr.name === 'NotAllowedError' || primaryErr.name === 'PermissionDeniedError') {
      throw primaryErr
    }
  }

  // Strategy 2: Any camera, no constraints
  return await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
}

export default useDashcam
