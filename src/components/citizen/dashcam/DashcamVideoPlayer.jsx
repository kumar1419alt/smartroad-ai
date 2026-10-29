/**
 * DashcamVideoPlayer.jsx — Live Camera Preview with AI Bounding Box Overlays.
 */

import React, { useRef, useState, useEffect } from 'react'
import {
  Camera,
  Maximize2,
  Minimize2,
  RefreshCw,
  MapPin,
  Flame,
  AlertTriangle,
  Radio,
  Sparkles,
  Layers,
  ShieldAlert,
  Clock,
  Eye,
  Crosshair,
} from 'lucide-react'
import { ROAD_DAMAGE_CLASSES } from '../../../services/detectionService'

export default function DashcamVideoPlayer({
  videoRef,
  isSessionActive,
  isPaused,
  sessionDuration,
  gpsStatus,
  currentGps,
  activeDetections = [],
  cameraFacingMode,
  onSwitchCamera,
  isDemoMode,
  cameraError,
  isAnalyzing,
  recentDetectionsCount = 0,
}) {
  const containerRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  // Format seconds to HH:MM:SS
  const formatDuration = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const canvasRef = useRef(null)

  // Demo road canvas animation loop
  useEffect(() => {
    if (!isSessionActive || !isDemoMode || isPaused) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let offset = 0
    let animId = null

    const render = () => {
      offset = (offset + 12) % 120
      const w = canvas.width
      const h = canvas.height

      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.44)
      sky.addColorStop(0, '#0a192f')
      sky.addColorStop(0.65, '#1e293b')
      sky.addColorStop(1, '#334155')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, h * 0.44)

      // Distant Pune skyline
      ctx.fillStyle = '#1e293b'
      for (let i = 0; i < 16; i++) {
        const bh = 25 + (i % 6) * 18
        ctx.fillRect(i * (w / 16), h * 0.44 - bh, w / 18, bh)
      }

      // Ground / Roadsides
      ctx.fillStyle = '#1c3024'
      ctx.fillRect(0, h * 0.44, w, h * 0.56)

      // Asphalt Road
      ctx.fillStyle = '#1e232a'
      ctx.beginPath()
      ctx.moveTo(w * 0.44, h * 0.44)
      ctx.lineTo(w * 0.56, h * 0.44)
      ctx.lineTo(w * 0.98, h)
      ctx.lineTo(w * 0.02, h)
      ctx.closePath()
      ctx.fill()

      // Curbs
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 10
      ctx.beginPath()
      ctx.moveTo(w * 0.44, h * 0.44)
      ctx.lineTo(w * 0.02, h)
      ctx.moveTo(w * 0.56, h * 0.44)
      ctx.lineTo(w * 0.98, h)
      ctx.stroke()

      // Lane Dashes
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 6
      ctx.setLineDash([30, 35])
      ctx.lineDashOffset = -offset * 1.8
      ctx.beginPath()
      ctx.moveTo(w * 0.5, h * 0.44)
      ctx.lineTo(w * 0.5, h)
      ctx.stroke()
      ctx.setLineDash([])

      // HUD Watermark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = 'bold 13px monospace'
      ctx.fillText(`PUNE CIVIC PATROL • DEMO SIMULATION • SPEED: 42 KM/H`, 24, 34)

      animId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animId)
  }, [isSessionActive, isDemoMode, isPaused])

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl flex flex-col justify-center items-center select-none ${
        isFullscreen ? 'h-screen w-screen rounded-none' : 'aspect-video min-h-[340px] sm:min-h-[420px]'
      }`}
    >
      {/* ── 1. The Video Canvas ────────────────────────────────────────────── */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isSessionActive && !isDemoMode ? (isPaused ? 'opacity-40 grayscale' : 'opacity-100') : 'hidden'
        }`}
      />

      {/* Synthetic Road Animation Canvas for Demo Simulation */}
      {isSessionActive && isDemoMode && (
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isPaused ? 'opacity-40 grayscale' : 'opacity-100'
          }`}
        />
      )}

      {/* ── 2. Idle / Inactive / Error State Placeholder ───────────────────── */}
      {!isSessionActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-300 bg-gradient-to-b from-slate-900/90 to-slate-950/95 z-10">
          {cameraError ? (
            <div className="max-w-md p-5 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-200 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-red-900/60 border border-red-700/60 flex items-center justify-center mx-auto text-red-400">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-bold text-sm text-red-100">Camera Access Issue</h3>
              <p className="text-xs text-red-300 leading-relaxed">{cameraError}</p>
              <p className="text-[11px] text-red-400">
                Verify browser permissions in the URL lock icon or try another camera input.
              </p>
            </div>
          ) : (
            <div className="max-w-md space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 shadow-inner">
                <Camera size={30} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white tracking-tight">Dashcam Inactive</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Click <strong>&quot;Start Live Dashcam&quot;</strong> below to request camera and GPS permissions for automated road hazard scanning.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-1 text-[11px] text-slate-400">
                <span className="px-2.5 py-1 bg-slate-800/80 rounded-lg border border-slate-700/80 flex items-center gap-1.5">
                  <Crosshair size={12} className="text-blue-400" /> Rear Camera Priority
                </span>
                <span className="px-2.5 py-1 bg-slate-800/80 rounded-lg border border-slate-700/80 flex items-center gap-1.5">
                  <MapPin size={12} className="text-emerald-400" /> Live GPS Tagging
                </span>
                <span className="px-2.5 py-1 bg-slate-800/80 rounded-lg border border-slate-700/80 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-400" /> Multi-Class YOLO RDD
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 3. Paused Banner Overlay ───────────────────────────────────────── */}
      {isSessionActive && isPaused && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs z-15 text-white">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 text-center space-y-2 shadow-2xl">
            <span className="inline-flex p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Clock size={20} />
            </span>
            <h4 className="font-bold text-sm text-amber-300">Detection Temporarily Paused</h4>
            <p className="text-xs text-slate-300 max-w-xs">
              Frame extraction and AI inference suspended. Click &quot;Resume&quot; to continue monitoring.
            </p>
          </div>
        </div>
      )}

      {/* ── 4. AI Vision Bounding Box Overlay ──────────────────────────────── */}
      {isSessionActive && !isPaused && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {activeDetections.map((det, index) => {
            const classMeta = ROAD_DAMAGE_CLASSES[det.class_id] || {
              name: det.class_name,
              color: '#3b82f6',
              bgLight: 'bg-blue-600 text-white',
            }

            const { x, y, w, h } = det.box || { x: 25, y: 40, w: 50, h: 40 }

            return (
              <div
                key={det.id || `box_${index}`}
                className="absolute transition-all duration-300 rounded-lg animate-in fade-in"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${w}%`,
                  height: `${h}%`,
                  border: `2.5px solid ${classMeta.color}`,
                  boxShadow: `0 0 15px ${classMeta.color}66, inset 0 0 10px ${classMeta.color}33`,
                }}
              >
                {/* Floating Label Tag */}
                <div
                  className="absolute -top-7 left-0 flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-md font-mono whitespace-nowrap"
                  style={{ backgroundColor: classMeta.color }}
                >
                  <Flame size={10} className="text-white" />
                  <span>{det.class_id}: {classMeta.name}</span>
                  <span className="bg-black/40 px-1 py-0.2 rounded text-[9px]">
                    {Math.round(det.confidence * 100)}%
                  </span>
                </div>

                {/* Target reticle corner marks */}
                <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white" />
                <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white" />
                <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white" />
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white" />
              </div>
            )
          })}
        </div>
      )}

      {/* ── 5. Top Telemetry Bar (Duration, GPS, AI Model) ─────────────────── */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20 pointer-events-none">
        {/* Left: Status & Session Timer */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl text-white shadow-md">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                !isSessionActive
                  ? 'bg-slate-500'
                  : isPaused
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-red-500 animate-ping'
              }`}
            />
            <span className="text-xs font-bold tracking-tight uppercase">
              {!isSessionActive ? 'Standby' : isPaused ? 'Paused' : 'REC • Live'}
            </span>
            {isSessionActive && (
              <span className="font-mono text-xs text-slate-300 border-l border-slate-700 pl-2">
                {formatDuration(sessionDuration)}
              </span>
            )}
          </div>

          {/* AI Model Status Badge */}
          <div className="pointer-events-auto hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs font-semibold shadow-md">
            {isDemoMode ? (
              <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                <Sparkles size={12} />
                <span>DEMO SIMULATION</span>
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                <Radio size={12} className="animate-pulse" />
                <span>YOLOv8 BACKEND</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: GPS Badge & Controls */}
        <div className="flex items-center gap-2">
          {/* GPS Coordinates & Accuracy Chip */}
          <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs font-mono text-white shadow-md">
            <MapPin
              size={13}
              className={
                gpsStatus === 'active'
                  ? 'text-emerald-400'
                  : gpsStatus === 'searching'
                  ? 'text-amber-400 animate-bounce'
                  : 'text-red-400'
              }
            />
            {currentGps ? (
              <span className="hidden sm:inline">
                {currentGps.latitude.toFixed(4)}°, {currentGps.longitude.toFixed(4)}° (±{currentGps.accuracy}m)
              </span>
            ) : (
              <span className="text-slate-400 text-[11px] capitalize">GPS {gpsStatus}</span>
            )}
          </div>

          {/* Camera Switcher (if supported) */}
          {isSessionActive && onSwitchCamera && (
            <button
              onClick={onSwitchCamera}
              className="pointer-events-auto p-2 bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 rounded-xl text-white shadow-md transition-colors"
              title="Flip Camera (Front/Rear)"
              aria-label="Flip Camera"
            >
              <RefreshCw size={14} />
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="pointer-events-auto p-2 bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 rounded-xl text-white shadow-md transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* ── 6. Bottom HUD Overlay: Inference Pulse & Detection Counters ──── */}
      {isSessionActive && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs pointer-events-none z-20">
          {/* Sampling Indicator */}
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                isAnalyzing ? 'bg-blue-400 animate-ping' : 'bg-slate-500'
              }`}
            />
            <span className="text-[11px] font-mono">
              {isAnalyzing ? 'Sampling Frame...' : 'Vision Pipeline Ready'}
            </span>
          </div>

          {/* Recent Detection Count Bubble */}
          {recentDetectionsCount > 0 && (
            <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-red-600/90 text-white font-bold rounded-xl shadow-lg border border-red-500 animate-pulse">
              <AlertTriangle size={13} />
              <span className="text-xs">{recentDetectionsCount} Hazard{recentDetectionsCount > 1 ? 's' : ''} in Frame</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
