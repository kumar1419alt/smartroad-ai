/**
 * AnalyticsCard.jsx — Reusable Card wrapper for Recharts analytics widgets.
 *
 * Provides consistent title, subtitle, badge indicators, action headers,
 * and responsive chart containment.
 */

import React from 'react'

export default function AnalyticsCard({
  title,
  subtitle,
  badge,
  action,
  children,
  className = '',
  minHeight = '300px',
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between transition-all hover:shadow-sm ${className}`}
    >
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
            {badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{subtitle}</p>
          )}
        </div>

        {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
      </div>

      {/* Chart Canvas Container */}
      <div className="flex-1 w-full" style={{ minHeight }}>
        {children}
      </div>
    </div>
  )
}
