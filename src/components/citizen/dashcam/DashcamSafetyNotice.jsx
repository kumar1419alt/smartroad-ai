/**
 * DashcamSafetyNotice.jsx — Legal and Driver Safety Banner for Dashcam Mode.
 */

import React, { useState } from 'react'
import { AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, Info, Car } from 'lucide-react'

export default function DashcamSafetyNotice() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 shadow-xs text-xs text-amber-900 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
            <Car size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-950 text-sm">Citizen Road Dashcam Safety Advisory</span>
              <span className="px-2 py-0.5 bg-amber-200/70 text-amber-900 text-[10px] font-bold rounded-full uppercase">
                Driver Safety Protocol
              </span>
            </div>
            <p className="text-amber-800 text-xs mt-1 leading-relaxed">
              Mount your phone securely in a dashboard cradle before putting your vehicle in motion. <strong>Never operate device controls or touch the screen while driving.</strong> Detection, deduplication, and complaint registration occur autonomously.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-amber-700 hover:text-amber-950 flex items-center gap-1 font-semibold text-[11px] shrink-0 p-1.5 rounded-lg hover:bg-amber-100/50 transition-colors"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Less' : 'Details'}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-amber-200/70 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-amber-900">
          <div className="flex items-start gap-2">
            <ShieldCheck size={14} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Zero Video Storage:</strong> Video streams are not recorded or uploaded. Only sampled defect frames with verified damage are retained.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Info size={14} className="text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Automated Deduplication:</strong> Identical road defects within 35m and 25s are grouped automatically to avoid duplicate tickets.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>GPS Accuracy:</strong> Geo-verified complaints require &lt;25m GPS accuracy. Detections under low signal are queued for manual verification.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
