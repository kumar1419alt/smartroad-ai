/**
 * ToastContext.jsx — Unified global toast notification system for SmartRoad AI.
 *
 * Provides:
 *  - useToast() hook: toast.success(), toast.error(), toast.info(), toast.warning()
 *  - Floating animated toast notifications with icons, dismiss buttons, and progress timers
 *  - Accessible aria live regions
 */

import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  X,
} from 'lucide-react'

const ToastContext = createContext(null)

const TOAST_ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const TOAST_STYLES = {
  success: {
    bg: 'bg-emerald-900/95 text-white border-emerald-700/80',
    iconColor: 'text-emerald-400',
    bar: 'bg-emerald-400',
  },
  error: {
    bg: 'bg-red-950/95 text-white border-red-800/80',
    iconColor: 'text-red-400',
    bar: 'bg-red-400',
  },
  warning: {
    bg: 'bg-amber-950/95 text-white border-amber-800/80',
    iconColor: 'text-amber-400',
    bar: 'bg-amber-400',
  },
  info: {
    bg: 'bg-slate-900/95 text-white border-slate-700/80',
    iconColor: 'text-blue-400',
    bar: 'bg-blue-400',
  },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (message, type = 'info', duration = 3500) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9)
      const newToast = { id, message, type, duration }

      setToasts((prev) => [...prev.slice(-4), newToast]) // keep max 5 toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
      return id
    },
    [removeToast]
  )

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    dismiss: removeToast,
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Render Viewport */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => {
          const style = TOAST_STYLES[t.type] || TOAST_STYLES.info
          const Icon = TOAST_ICONS[t.type] || TOAST_ICONS.info
          return (
            <div
              key={t.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-2 fade-in ${style.bg}`}
            >
              <Icon size={18} className={`shrink-0 mt-0.5 ${style.iconColor}`} />
              <div className="flex-1 text-xs font-semibold leading-relaxed">
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-white/60 hover:text-white transition-colors p-0.5 rounded-lg"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    // Return graceful fallback if used outside provider
    return {
      success: (msg) => console.log('[Toast Success]', msg),
      error: (msg) => console.error('[Toast Error]', msg),
      warning: (msg) => console.warn('[Toast Warning]', msg),
      info: (msg) => console.log('[Toast Info]', msg),
      dismiss: () => {},
    }
  }
  return context
}
