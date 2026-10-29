/**
 * DashcamStatsBar.jsx — Real-Time Session Telemetry & Deduplication Counters.
 */

import React from 'react'
import {
  Layers,
  Flame,
  CheckCircle2,
  CopyX,
  HelpCircle,
  TrendingUp,
} from 'lucide-react'

export default function DashcamStatsBar({ stats = {} }) {
  const {
    framesAnalyzed = 0,
    damageEventsDetected = 0,
    complaintsCreated = 0,
    duplicateEventsSkipped = 0,
  } = stats

  const items = [
    {
      label: 'Frames Analyzed',
      value: framesAnalyzed.toLocaleString(),
      subtext: 'Sampled camera frames',
      icon: Layers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      tooltip: 'Number of individual video frames extracted and sent through the YOLO vision pipeline.',
    },
    {
      label: 'Damage Events Detected',
      value: damageEventsDetected.toLocaleString(),
      subtext: 'Pass confidence criteria',
      icon: Flame,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      tooltip: 'Total raw detection instances (Potholes, Cracks) recognized by computer vision.',
    },
    {
      label: 'Complaints Created',
      value: complaintsCreated.toLocaleString(),
      subtext: 'Filed to Municipal Queue',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      tooltip: 'Unique civic complaints registered with PMC tracking IDs and SRPS priority scores.',
    },
    {
      label: 'Duplicate Events Skipped',
      value: duplicateEventsSkipped.toLocaleString(),
      subtext: 'Filtered by 35m / 25s rule',
      icon: CopyX,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      tooltip: 'Successive detections of the same defect within 35 meters and 25 seconds suppressed to prevent ticket spam.',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className={`p-4 bg-white rounded-2xl border ${item.borderColor} shadow-xs relative overflow-hidden transition-all hover:shadow-sm`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {item.label}
                </p>
                <p className={`text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight ${item.color}`}>
                  {item.value}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {item.subtext}
                </p>
              </div>

              <div className={`p-2.5 rounded-xl ${item.bgColor} ${item.color} shrink-0`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
