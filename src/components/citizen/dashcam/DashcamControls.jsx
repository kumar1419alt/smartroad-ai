/**
 * DashcamControls.jsx — Interactive Session Controls & Mode Switches.
 */

import React from 'react'
import {
  Play,
  Square,
  Pause,
  RotateCcw,
  Settings,
  Sparkles,
  Radio,
  Sliders,
  Trash2,
} from 'lucide-react'
import Button from '../../ui/Button'

export default function DashcamControls({
  isSessionActive,
  isPaused,
  isStarting,
  isDemoMode,
  onStartSession,
  onStopSession,
  onTogglePause,
  onClearSession,
  onToggleDemoMode,
  onOpenSettings,
  totalEventsCount = 0,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* ── Left: Primary Session Actions ──────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        {!isSessionActive ? (
          <Button
            variant="primary"
            size="lg"
            icon={Play}
            loading={isStarting}
            onClick={onStartSession}
            className="shadow-sm shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            Start Live Dashcam
          </Button>
        ) : (
          <>
            <Button
              variant="danger"
              size="lg"
              icon={Square}
              onClick={onStopSession}
              className="shadow-sm font-bold"
            >
              Stop Dashcam
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={isPaused ? Play : Pause}
              onClick={onTogglePause}
              className={isPaused ? 'border-amber-300 bg-amber-50 text-amber-800' : ''}
            >
              {isPaused ? 'Resume AI Detection' : 'Pause AI Detection'}
            </Button>
          </>
        )}

        {/* Clear Events (when stopped and has events) */}
        {!isSessionActive && totalEventsCount > 0 && (
          <Button
            variant="ghost"
            size="md"
            icon={Trash2}
            onClick={onClearSession}
            className="text-slate-500 hover:text-red-600"
            title="Clear detection feed"
          >
            Clear Feed
          </Button>
        )}
      </div>

      {/* ── Right: Mode Switcher & Settings ────────────────────────────────── */}
      <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
        {/* Demo Mode vs YOLO Live Switcher */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => onToggleDemoMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              isDemoMode
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Controlled simulation for local UI demo without requiring a running YOLO Python backend"
          >
            <Sparkles size={13} className={isDemoMode ? 'text-amber-500' : 'text-slate-400'} />
            <span>Demo Mode</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleDemoMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              !isDemoMode
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Connects to FastAPI YOLO backend at configured endpoint"
          >
            <Radio size={13} className={!isDemoMode ? 'text-emerald-500' : 'text-slate-400'} />
            <span>YOLO Live</span>
          </button>
        </div>

        {/* Dashcam Settings Button */}
        <Button
          variant="secondary"
          size="md"
          icon={Settings}
          onClick={onOpenSettings}
          title="Configure confidence threshold, sampling interval, and YOLO endpoint URL"
        >
          <span className="hidden sm:inline">Settings</span>
        </Button>
      </div>
    </div>
  )
}
