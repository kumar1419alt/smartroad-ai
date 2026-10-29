/**
 * SeverityIndicator.jsx — Reusable severity rating and visual meter component.
 *
 * Visual tiers:
 *  - Critical: Red (Level 4/4) — Immediate structural hazard
 *  - High: Orange (Level 3/4) — High accident risk
 *  - Medium: Amber (Level 2/4) — Noticeable surface decay
 *  - Low: Green (Level 1/4) — Minor cosmetic wear
 */

import React from 'react'
import { Flame, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react'

const SEVERITY_CONFIG = {
  critical: {
    label: 'Critical',
    level: 4,
    color: 'bg-red-500',
    text: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    desc: 'Severe depression >10cm depth; immediate puncture & skidding risk',
    icon: Flame,
  },
  high: {
    label: 'High',
    level: 3,
    color: 'bg-orange-500',
    text: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    desc: 'Moderate crater with sharp aggregate chipping along traffic line',
    icon: AlertTriangle,
  },
  medium: {
    label: 'Medium',
    level: 2,
    color: 'bg-amber-500',
    text: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    desc: 'Surface fissure or sunken manhole ring causing vehicle thuds',
    icon: ShieldAlert,
  },
  low: {
    label: 'Low',
    level: 1,
    color: 'bg-emerald-500',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    desc: 'Minor hairline crack; non-urgent cosmetic maintenance',
    icon: CheckCircle2,
  },
}

export default function SeverityIndicator({ severity = 'critical', showDescription = true }) {
  const norm = (severity || '').toLowerCase()
  const config = SEVERITY_CONFIG[norm] || SEVERITY_CONFIG.critical
  const IconComponent = config.icon

  return (
    <div className={`p-3.5 rounded-xl border ${config.bg} ${config.border}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <IconComponent size={15} className={config.text} aria-hidden="true" />
          <span className={`text-xs font-bold ${config.text}`}>
            {config.label} Severity
          </span>
        </div>
        <span className={`text-[11px] font-mono font-bold ${config.text}`}>
          Level {config.level} of 4
        </span>
      </div>

      {/* 4-Segment Level Bar */}
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-all ${
              step <= config.level ? config.color : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {showDescription && (
        <p className="text-[11px] text-slate-600 leading-relaxed">
          {config.desc}
        </p>
      )}
    </div>
  )
}
