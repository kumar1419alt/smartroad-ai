/**
 * DashcamFramePreview.jsx — Last Captured Frame Preview Panel.
 *
 * Shows the most recently extracted JPEG frame from the live camera,
 * the running frame counter, the per-frame capture dimensions info,
 * and a subtle pulse animation when a new frame arrives.
 *
 * Props:
 *  - lastFrame       {string|null}  — Base64 JPEG data URL of the last extracted frame
 *  - frameCount      {number}       — Total frames captured so far
 *  - isSessionActive {boolean}
 *  - isPaused        {boolean}
 *  - maxDimension    {number}       — Configured resize limit (shown in caption)
 *  - jpegQuality     {number}       — Configured JPEG quality 0–1 (shown in caption)
 */

import React, { useEffect, useRef, useState } from 'react'
import { Camera, Layers, ImageOff, Pause, Activity } from 'lucide-react'

export default function DashcamFramePreview({
  lastFrame       = null,
  frameCount      = 0,
  isSessionActive = false,
  isPaused        = false,
  maxDimension    = 640,
  jpegQuality     = 0.82,
}) {
  // Flash animation: briefly highlight the border when a new frame arrives
  const [isFlashing, setIsFlashing] = useState(false)
  const prevFrameRef = useRef(null)

  useEffect(() => {
    if (lastFrame && lastFrame !== prevFrameRef.current) {
      prevFrameRef.current = lastFrame
      setIsFlashing(true)
      const t = setTimeout(() => setIsFlashing(false), 250)
      return () => clearTimeout(t)
    }
  }, [lastFrame])

  // ── Idle / no session ────────────────────────────────────────────────────────
  if (!isSessionActive) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
              <Camera size={14} />
            </span>
            <h3 className="text-sm font-bold text-slate-700">Frame Preview</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {maxDimension}px · JPEG {Math.round(jpegQuality * 100)}%
          </span>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-slate-400">
          <span className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <ImageOff size={22} className="text-slate-400" />
          </span>
          <p className="text-xs text-center leading-relaxed max-w-[200px]">
            Start the dashcam session to see live frame captures here.
          </p>
        </div>
      </div>
    )
  }

  // ── Active session ────────────────────────────────────────────────────────────
  return (
    <div
      className={`rounded-2xl border shadow-xs overflow-hidden bg-white transition-all duration-150 ${
        isFlashing ? 'border-blue-400 shadow-blue-200/60 shadow-md' : 'border-slate-200'
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`p-1.5 rounded-lg ${
              isPaused ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-600'
            }`}
          >
            {isPaused ? <Pause size={14} /> : <Activity size={14} className="animate-pulse" />}
          </span>
          <h3 className="text-sm font-bold text-slate-700">
            {isPaused ? 'Preview Paused' : 'Live Frame Preview'}
          </h3>
        </div>

        {/* Frame counter badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
          <Layers size={12} className="text-blue-500" />
          <span className="text-[11px] font-bold font-mono text-slate-700">
            {frameCount.toLocaleString()} frame{frameCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Frame image area */}
      <div className="relative bg-slate-950 aspect-video">
        {lastFrame ? (
          <img
            src={lastFrame}
            alt={`Captured frame #${frameCount}`}
            className="w-full h-full object-contain"
            draggable={false}
          />
        ) : (
          /* Waiting for first frame */
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
            <span className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Waiting for first frame…</p>
          </div>
        )}

        {/* Overlay: frame number watermark */}
        {lastFrame && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-mono text-white/80 select-none pointer-events-none">
            #{frameCount}
          </div>
        )}

        {/* Paused overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
              <Pause size={13} />
              Capture Paused
            </span>
          </div>
        )}
      </div>

      {/* Footer: config info */}
      <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Max&nbsp;<strong className="text-slate-600">{maxDimension}px</strong> · JPEG&nbsp;<strong className="text-slate-600">{Math.round(jpegQuality * 100)}%</strong></span>
        {lastFrame && (
          <span className="text-slate-400">
            {isPaused ? '— sampling paused —' : 'frames not uploaded'}
          </span>
        )}
      </div>
    </div>
  )
}
