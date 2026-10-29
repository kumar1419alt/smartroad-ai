/**
 * RecentActivity.jsx — Reusable timeline of recent road repair and complaint activities.
 *
 * Shows:
 *  - Action title and description
 *  - Location tags
 *  - Relative timestamp
 *  - Colored event dot and icon
 */

import React from 'react'
import {
  CheckCircle2,
  Wrench,
  AlertCircle,
  Calendar,
  Clock,
  Sparkles,
  MapPin,
} from 'lucide-react'

const EVENT_ICONS = {
  resolved: {
    icon: CheckCircle2,
    bg: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    line: 'bg-emerald-200',
  },
  in_progress: {
    icon: Wrench,
    bg: 'bg-blue-100 text-blue-600 border-blue-200',
    line: 'bg-blue-200',
  },
  verified: {
    icon: Sparkles,
    bg: 'bg-cyan-100 text-cyan-600 border-cyan-200',
    line: 'bg-cyan-200',
  },
  scheduled: {
    icon: Calendar,
    bg: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    line: 'bg-indigo-200',
  },
  pending: {
    icon: Clock,
    bg: 'bg-amber-100 text-amber-600 border-amber-200',
    line: 'bg-amber-200',
  },
}

export default function RecentActivity({
  activities = [],
  title = 'Recent Activity Timeline',
  subtitle = 'Live road repair milestones across Pune municipal wards',
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {activities.map((act) => {
          const config = EVENT_ICONS[act.type] || EVENT_ICONS.pending
          const IconComponent = config.icon

          return (
            <div key={act.id} className="relative group">
              {/* Event node */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-2xs ${config.bg}`}
              >
                <IconComponent size={11} aria-hidden="true" />
              </div>

              {/* Event body */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {act.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {act.time}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {act.description}
                </p>

                <div className="flex items-center gap-3 pt-1 text-[11px]">
                  {act.location && (
                    <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                      <MapPin size={11} className="text-slate-400 shrink-0" />
                      {act.location}
                    </span>
                  )}
                  {act.complaintId && (
                    <span className="font-mono text-blue-600 font-semibold">
                      {act.complaintId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
