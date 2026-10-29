/**
 * SummaryCard.jsx — Reusable summary card for Citizen Dashboard statistics.
 *
 * Props:
 *  - title (e.g. "My Reports", "Pending", "In Progress", "Resolved")
 *  - count (e.g. 8, 2, 3, 3)
 *  - subtitle (e.g. "All complaints logged", "Awaiting inspection", "Repairs underway", "Completed")
 *  - icon (Lucide icon component)
 *  - variant ('blue' | 'amber' | 'indigo' | 'emerald')
 *  - active (boolean)
 *  - onClick (optional click handler)
 */

import React from 'react'

const VARIANT_STYLES = {
  blue: {
    iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    countColor: 'text-slate-900',
    ring: 'hover:border-blue-300 focus:ring-blue-500/20',
    indicator: 'bg-blue-500',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    countColor: 'text-amber-700',
    ring: 'hover:border-amber-300 focus:ring-amber-500/20',
    indicator: 'bg-amber-500',
  },
  indigo: {
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    countColor: 'text-indigo-700',
    ring: 'hover:border-indigo-300 focus:ring-indigo-500/20',
    indicator: 'bg-indigo-500',
  },
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    countColor: 'text-emerald-700',
    ring: 'hover:border-emerald-300 focus:ring-emerald-500/20',
    indicator: 'bg-emerald-500',
  },
}

export default function SummaryCard({
  title,
  count,
  subtitle,
  icon: IconComponent,
  variant = 'blue',
  active = false,
  onClick,
}) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.blue

  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      className={`relative w-full text-left bg-white rounded-2xl border p-5 shadow-xs transition-all duration-200 ${
        active
          ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
          : 'border-slate-200/80 hover:shadow-md hover:border-slate-300'
      } ${onClick ? 'cursor-pointer focus:outline-none' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {IconComponent && (
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${styles.iconBg}`}
          >
            <IconComponent size={20} aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-extrabold tracking-tight ${styles.countColor}`}>
          {count}
        </span>
        {active && (
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            Active Filter
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {subtitle}
        </p>
      )}

      {/* Subtle indicator bar */}
      <div className="mt-3.5 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${styles.indicator} rounded-full transition-all duration-500`}
          style={{ width: count > 0 ? '100%' : '0%' }}
        />
      </div>
    </Component>
  )
}
