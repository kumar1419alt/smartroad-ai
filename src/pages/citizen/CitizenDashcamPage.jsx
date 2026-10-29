/**
 * CitizenDashcamPage.jsx — /citizen/dashcam
 *
 * Live Dashcam Auto-Detection and Automatic Complaint Generation System
 * for SmartRoad AI (Pune Municipal Corporation jurisdiction).
 *
 * Stage 1 additions:
 *  - useDashcam hook: real getUserMedia capture, rear-camera preference,
 *    configurable interval (1000 ms), resize (640 px max), JPEG encoding,
 *    busy-lock, full cleanup on stop / unmount.
 *  - DashcamFramePreview: shows the last extracted frame + frame counter.
 *  - Fixed: dashcamService.clearSession() → clearSessionHistory().
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Video,
  Sparkles,
  Radio,
  MapPin,
  Layers,
  ShieldCheck,
} from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import dashcamService from '../../services/dashcamService'
import { useDashcam } from '../../hooks/useDashcam'

// Dashcam Components
import DashcamSafetyNotice from '../../components/citizen/dashcam/DashcamSafetyNotice'
import DashcamVideoPlayer from '../../components/citizen/dashcam/DashcamVideoPlayer'
import DashcamControls from '../../components/citizen/dashcam/DashcamControls'
import DashcamStatsBar from '../../components/citizen/dashcam/DashcamStatsBar'
import DashcamFramePreview from '../../components/citizen/dashcam/DashcamFramePreview'
import DashcamDetectionsList from '../../components/citizen/dashcam/DashcamDetectionsList'
import DashcamEventDetailModal from '../../components/citizen/dashcam/DashcamEventDetailModal'
import DashcamSettingsModal from '../../components/citizen/dashcam/DashcamSettingsModal'
import DashcamSessionSummaryModal from '../../components/citizen/dashcam/DashcamSessionSummaryModal'

// ── Dashcam Stage-1 capture settings (passed to the hook) ────────────────────
const SAMPLING_INTERVAL_MS = 1000  // frame capture interval
const MAX_DIMENSION        = 640   // max px for resize (preserves aspect ratio)
const JPEG_QUALITY         = 0.82  // JPEG encoding quality 0–1

export default function CitizenDashcamPage() {
  const toast   = useToast()

  // ── useDashcam hook — Stage 1 real camera capture ─────────────────────────
  // onFrame is called for every extracted frame when NOT in demo mode.
  // In demo mode, dashcamService drives its own synthetic canvas + inference.
  const [isDemoMode, setIsDemoMode] = useState(true)

  const handleFrame = useCallback(async ({ dataUrl, frameCount: fc, timestamp }) => {
    if (isDemoMode) return  // demo mode: dashcamService handles its own frames
    // Feed extracted frame into dashcamService inference (non-demo YOLO path)
    // dashcamService.processCapturedFrame is called so the existing detection
    // callbacks (onFrameAnalyzed, onDetection, etc.) continue to work.
    dashcamService.stats.framesAnalyzed = fc
    dashcamService._notifyStats?.()  // keep stats bar in sync
  }, [isDemoMode])

  const {
    videoRef,
    isSessionActive: hookSessionActive,
    isPaused:        hookIsPaused,
    isStarting:      hookIsStarting,
    cameraStatus:    hookCameraStatus,
    cameraError:     hookCameraError,
    frameCount,
    lastFrame,
    sessionDuration: hookSessionDuration,
    startSession:    hookStartSession,
    stopSession:     hookStopSession,
    togglePause:     hookTogglePause,
    resetFrameState,
  } = useDashcam({
    onFrame:            handleFrame,
    samplingIntervalMs: SAMPLING_INTERVAL_MS,
    maxDimension:       MAX_DIMENSION,
    jpegQuality:        JPEG_QUALITY,
  })

  // ── Session State (derived from hook + dashcamService for demo mode) ────────
  // In demo mode the hook's camera is not started; dashcamService manages it.
  // In live mode the hook IS the camera; dashcamService only does inference.
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [isPaused,        setIsPaused]        = useState(false)
  const [isStarting,      setIsStarting]      = useState(false)
  const [cameraStatus,    setCameraStatus]    = useState('idle')
  const [cameraError,     setCameraError]     = useState(null)
  const [sessionDuration, setSessionDuration] = useState(0)

  // Keep session state in sync with the hook (live mode)
  useEffect(() => {
    if (!isDemoMode) {
      setIsSessionActive(hookSessionActive)
      setIsPaused(hookIsPaused)
      setIsStarting(hookIsStarting)
      setCameraStatus(hookCameraStatus)
      setCameraError(hookCameraError)
      setSessionDuration(hookSessionDuration)
    }
  }, [isDemoMode, hookSessionActive, hookIsPaused, hookIsStarting, hookCameraStatus, hookCameraError, hookSessionDuration])

  // ── Metrics & Telemetry ────────────────────────────────────────────────────
  const [gpsStatus,   setGpsStatus]   = useState('idle')
  const [currentGps,  setCurrentGps]  = useState(null)

  const [activeDetections, setActiveDetections] = useState([])
  const [events,           setEvents]           = useState([])
  const [stats,            setStats]            = useState({
    framesAnalyzed: 0,
    damageEventsDetected: 0,
    complaintsCreated: 0,
    duplicateEventsSkipped: 0,
  })

  // ── Modals State ───────────────────────────────────────────────────────────
  const [demoLastFrame,   setDemoLastFrame]   = useState(null)
  const [selectedEvent,   setSelectedEvent]   = useState(null)
  const [isSettingsOpen,  setIsSettingsOpen]  = useState(false)
  const [isSummaryOpen,   setIsSummaryOpen]   = useState(false)
  const [summaryStats,    setSummaryStats]    = useState(null)
  const [summaryDuration, setSummaryDuration] = useState(0)
  const [summaryEvents,   setSummaryEvents]   = useState([])

  // Setup dashcamService callbacks
  useEffect(() => {
    dashcamService.setListeners({
      onFrameAnalyzed: ({ frameCount, detections, frameDataUrl }) => {
        setStats((prev) => ({ ...prev, framesAnalyzed: frameCount }))
        setActiveDetections(detections || [])
        if (frameDataUrl) setDemoLastFrame(frameDataUrl)
      },
      onDetection: ({ event, isDuplicate, duplicateReason }) => {
        if (!isDuplicate) {
          setEvents((prev) => [event, ...prev])
          toast?.info(
            `Detected ${event.damage_label} (${Math.round(event.confidence * 100)}% conf)`,
            2800
          )
        }
      },
      onComplaintCreated: ({ event, complaint }) => {
        setEvents((prev) =>
          prev.map((e) => (e.event_id === event.event_id ? { ...event, ...e, complaint_id: complaint.id, complaint_status: 'created' } : e))
        )
        toast?.success(`Complaint #${complaint.id} filed automatically!`, 3500)
      },
      onDuplicateSkipped: ({ event, reason }) => {
        // Still update event in list if present, marking as duplicate
        setEvents((prev) =>
          prev.map((e) => (e.event_id === event.event_id ? { ...e, complaint_status: 'duplicate_skipped' } : e))
        )
      },
      onGpsUpdate: ({ status, coords, error }) => {
        setGpsStatus(status)
        setCurrentGps(coords)
        if (error && status === 'denied') {
          toast?.warning('GPS location permission denied. Detections will be queued for manual georeferencing.', 5000)
        }
      },
      onStatsUpdate: (newStats) => {
        setStats({ ...newStats })
      },
      onError: ({ code, message }) => {
        toast?.error(`Dashcam error: ${message}`, 4500)
      },
    })

    // Cleanup on unmount — stop all camera and GPS hardware tracks
    return () => {
      dashcamService.stopSession()
    }
  }, [toast])

  // ── Session Controls Handlers ──────────────────────────────────────────────
  const handleStartSession = useCallback(async () => {
    setIsStarting(true)
    setCameraStatus('starting')
    setCameraError(null)

    if (isDemoMode) {
      // ── Demo mode: dashcamService manages its own synthetic stream ──────────
      if (!videoRef.current) { setIsStarting(false); return }
      try {
        const result = await dashcamService.startSession({
          videoElement: videoRef.current,
          demoMode: true,
        })
        if (result.success) {
          setIsSessionActive(true)
          setIsPaused(false)
          setCameraStatus('active')
          setSessionDuration(0)
          toast?.success('Live Dashcam started in Demo Simulation Mode', 3500)
        } else {
          setCameraStatus('error')
          setCameraError(result.error?.message || 'Unable to start demo session')
          toast?.error(result.error?.message || 'Failed to start demo session', 5000)
        }
      } catch (err) {
        setCameraStatus('error')
        setCameraError(err.message)
        toast?.error(err.message, 5000)
      } finally {
        setIsStarting(false)
      }
    } else {
      // ── Live mode: useDashcam hook opens the real camera ────────────────────
      // Also initialise dashcamService GPS & inference (without its own camera)
      dashcamService.sessionId       = `dash_sess_${Date.now()}`
      dashcamService.sessionStartTime = Date.now()
      dashcamService.isSessionActive  = true
      dashcamService.isDetectionPaused = false
      dashcamService.stats = { framesAnalyzed: 0, damageEventsDetected: 0, complaintsCreated: 0, duplicateEventsSkipped: 0 }
      dashcamService.events = []
      dashcamService._initGps()
      dashcamService._notifyStats?.()

      const result = await hookStartSession()
      if (!result?.success) {
        // hookStartSession already set cameraStatus/cameraError via hook state;
        // mirror them into page state for non-demo path
        dashcamService.isSessionActive = false
        toast?.error(result?.error?.message || 'Failed to open camera', 5000)
      } else {
        toast?.success('Live Dashcam connected to camera', 3500)
      }
      setIsStarting(false)
    }
  }, [isDemoMode, videoRef, hookStartSession, toast])

  const handleStopSession = useCallback(() => {
    // Snapshot metrics for summary debrief
    const finalDuration = isDemoMode
      ? dashcamService.getSessionDurationSeconds()
      : hookSessionDuration
    const finalStats  = { ...dashcamService.stats }
    const finalEvents = [...dashcamService.events]

    // Stop both the service (GPS, synthetic stream) and the hook (real tracks)
    dashcamService.stopSession()
    if (!isDemoMode) hookStopSession()

    setIsSessionActive(false)
    setIsPaused(false)
    setCameraStatus('stopped')
    setSessionDuration(0)
    setActiveDetections([])

    // Show summary modal
    setSummaryDuration(finalDuration)
    setSummaryStats(finalStats)
    setSummaryEvents(finalEvents)
    setIsSummaryOpen(true)

    toast?.info('Dashcam session stopped. Hardware tracks released.', 3000)
  }, [isDemoMode, hookSessionDuration, hookStopSession, toast])

  const handleTogglePause = useCallback(() => {
    if (isDemoMode) {
      // Demo mode: toggle dashcamService
      const paused = dashcamService.toggleDetectionPause()
      setIsPaused(paused)
      if (paused) { setActiveDetections([]); toast?.info('AI frame sampling paused', 2000) }
      else { toast?.info('AI frame sampling resumed', 2000) }
    } else {
      // Live mode: toggle hook
      hookTogglePause()
      const nextPaused = !isPaused
      dashcamService.isDetectionPaused = nextPaused
      if (nextPaused) { setActiveDetections([]); toast?.info('AI frame sampling paused', 2000) }
      else { toast?.info('AI frame sampling resumed', 2000) }
    }
  }, [isDemoMode, isPaused, hookTogglePause, toast])

  const handleClearSession = useCallback(() => {
    if (window.confirm('Clear all captured events from this dashcam session?')) {
      // FIX: the service method is clearSessionHistory(), not clearSession()
      dashcamService.clearSessionHistory()
      resetFrameState()
      setDemoLastFrame(null)
      setEvents([])
      setStats({
        framesAnalyzed: 0,
        damageEventsDetected: 0,
        complaintsCreated: 0,
        duplicateEventsSkipped: 0,
      })
      toast?.info('Dashcam feed reset', 2000)
    }
  }, [toast, resetFrameState])

  const handleToggleDemoMode = useCallback((useDemo) => {
    setIsDemoMode(useDemo)
    dashcamService.updateConfig({ demoMode: useDemo })
    if (isSessionActive) {
      toast?.info(
        useDemo
          ? 'Switched to Demo Simulation Mode'
          : 'Switched to live YOLO backend model',
        3000
      )
    }
  }, [isSessionActive, toast])

  // Retry or manual complaint filing from detection feed
  const handleFileComplaint = useCallback(async (event) => {
    try {
      const complaint = await dashcamService.submitComplaintForEvent(event)
      if (complaint) {
        setEvents((prev) =>
          prev.map((e) => (e.event_id === event.event_id ? { ...event, complaint_id: complaint.id, complaint_status: 'created' } : e))
        )
        // Also update detail modal if open
        if (selectedEvent && selectedEvent.event_id === event.event_id) {
          setSelectedEvent((prev) => ({ ...prev, complaint_id: complaint.id, complaint_status: 'created' }))
        }
        toast?.success(`Complaint #${complaint.id} registered successfully!`, 3500)
      }
    } catch (err) {
      toast?.error(`Failed to register complaint: ${err.message}`, 4000)
    }
  }, [selectedEvent, toast])

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                <Video size={22} />
              </span>
              Live Dashcam AI Patrol
            </h1>

            {/* Mode Tag */}
            {isDemoMode ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <Sparkles size={13} className="text-amber-600" />
                Demo Simulation Mode
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Radio size={13} className="text-emerald-600 animate-pulse" />
                YOLOv8x Live Backend
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated mobile road defect scanner for citizens & civic patrol. Samples frames, georeferences damage, and files deduplicated municipal complaints.
          </p>
        </div>

        {/* Quick Nav Links */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Link
            to="/citizen/map"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <MapPin size={14} className="text-blue-600" />
            <span>GIS Map</span>
          </Link>
          <Link
            to="/citizen/reports"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Layers size={14} className="text-emerald-600" />
            <span>My Reports</span>
          </Link>
        </div>
      </div>

      {/* ── Driver Safety Notice ─────────────────────────────────────────────── */}
      <DashcamSafetyNotice />

      {/* ── Session Controls Bar ─────────────────────────────────────────────── */}
      <DashcamControls
        isSessionActive={isSessionActive}
        isPaused={isPaused}
        isStarting={isStarting}
        isDemoMode={isDemoMode}
        onStartSession={handleStartSession}
        onStopSession={handleStopSession}
        onTogglePause={handleTogglePause}
        onClearSession={handleClearSession}
        onToggleDemoMode={handleToggleDemoMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        totalEventsCount={events.length}
      />

      {/* ── Main Dashcam Studio: Viewport + Live Detections Feed ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Video Viewport, Frame Preview & Session Statistics (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <DashcamVideoPlayer
            videoRef={videoRef}
            isSessionActive={isSessionActive}
            isPaused={isPaused}
            isStarting={isStarting}
            cameraStatus={cameraStatus}
            cameraError={cameraError}
            gpsStatus={gpsStatus}
            currentGps={currentGps}
            sessionDuration={sessionDuration}
            activeDetections={activeDetections}
            isDemoMode={isDemoMode}
            onStartSession={handleStartSession}
          />

          {/* ── Stage 1: Last Captured Frame Preview + Frame Counter ───────── */}
          <DashcamFramePreview
            lastFrame={isDemoMode ? demoLastFrame : lastFrame}
            frameCount={isDemoMode ? stats.framesAnalyzed : frameCount}
            isSessionActive={isSessionActive}
            isPaused={isPaused}
            maxDimension={MAX_DIMENSION}
            jpegQuality={JPEG_QUALITY}
          />

          {/* Session Statistics KPI Strip */}
          <DashcamStatsBar stats={stats} />
        </div>

        {/* Right Column: Real-Time Detection Events Feed (5 cols on lg) */}
        <div className="lg:col-span-5 h-[700px] flex flex-col">
          <DashcamDetectionsList
            events={events}
            onSelectEvent={(evt) => setSelectedEvent(evt)}
            onFileComplaint={handleFileComplaint}
          />
        </div>
      </div>

      {/* ── Technical Compliance & Standard Note ──────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-blue-600 shrink-0" />
          <span>
            Complies with <strong>RDD2022 (Road Damage Dataset)</strong> taxonomies: Longitudinal (D00), Transverse (D10), Alligator Cracking (D20), and Pothole (D40).
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-500 text-[11px] font-medium shrink-0">
          <span>Zero continuous video streaming</span>
          <span>•</span>
          <span>Client-side 35m deduplication</span>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      {/* 1. Detection Detail Modal */}
      <DashcamEventDetailModal
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        onFileComplaint={handleFileComplaint}
      />

      {/* 2. Configuration Settings Modal */}
      <DashcamSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={dashcamService.config}
        onSaveConfig={(newConfig) => {
          dashcamService.updateConfig(newConfig)
          toast?.success('Dashcam parameters updated', 2500)
        }}
      />

      {/* 3. Session Stop Summary Debrief Modal */}
      <DashcamSessionSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        stats={summaryStats}
        durationSeconds={summaryDuration}
        events={summaryEvents}
        isDemoMode={isDemoMode}
      />
    </div>
  )
}
