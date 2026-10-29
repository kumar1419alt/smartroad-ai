/**
 * PriorityAnalysisModal.jsx — Modal displaying detailed priority analysis for an issue.
 *
 * Embeds <PriorityScoreBreakdown> with interactive dispatch actions.
 */

import React, { useEffect } from 'react'
import { X, MapPin, HardHat, Send, Sparkles, AlertTriangle } from 'lucide-react'
import PriorityScoreBreakdown from './PriorityScoreBreakdown'

export default function PriorityAnalysisModal({
  complaint,
  isOpen,
  onClose,
  onDispatch,
}) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen || !complaint) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {complaint.id}
              </span>
              <span className="text-xs font-bold text-slate-400">
                Detailed SRPS Prioritization Breakdown
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-1 text-white">
              {complaint.damageType} — {complaint.location}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <MapPin size={12} className="text-blue-400" />
              {complaint.ward} • Reported: {complaint.date || 'Recent'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <PriorityScoreBreakdown complaint={complaint} showFormulaHeader={true} />
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close Analysis
          </button>

          <button
            onClick={() => {
              onClose()
              onDispatch?.(complaint)
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Send size={13} />
            Dispatch Repair Squad
          </button>
        </div>
      </div>
    </div>
  )
}
