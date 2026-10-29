/**
 * AdminStatCard.jsx — Reusable KPI stat card for Administrator Command Center.
 *
 * Displays key municipal metrics with custom color accents, trends,
 * badges, and micro-interactions.
 */

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const COLOR_MAP = {
  blue: {
    bg: 'bg-blue-50/70',
    border: 'border-blue-200/80',
    iconBg: 'bg-blue-600',
    iconText: 'text-white',
    accent: 'text-blue-600',
    gradient: 'from-blue-500/10 to-transparent',
  },
  red: {
    bg: 'bg-red-50/70',
    border: 'border-red-200/80',
    iconBg: 'bg-red-600',
    iconText: 'text-white',
    accent: 'text-red-600',
    gradient: 'from-red-500/10 to-transparent',
  },
  amber: {
    bg: 'bg-amber-50/70',
    border: 'border-amber-200/80',
    iconBg: 'bg-amber-500',
    iconText: 'text-white',
    accent: 'text-amber-600',
    gradient: 'from-amber-500/10 to-transparent',
  },
  emerald: {
    bg: 'bg-emerald-50/70',
    border: 'border-emerald-200/80',
    iconBg: 'bg-emerald-600',
    iconText: 'text-white',
    accent: 'text-emerald-600',
    gradient: 'from-emerald-500/10 to-transparent',
  },
  purple: {
    bg: 'bg-purple-50/70',
    border: 'border-purple-200/80',
    iconBg: 'bg-purple-600',
    iconText: 'text-white',
    accent: 'text-purple-600',
    gradient: 'from-purple-500/10 to-transparent',
  },
}

export default function AdminStatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendType = 'up', // 'up' | 'down' | 'neutral' | 'danger'
  badge,
  badgeVariant = 'default',
  color = 'blue',
  subtitle,
  onClick,
}) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue

  const renderTrendIcon = () => {
    if (trendType === 'up') return <TrendingUp size={13} className="text-emerald-600" />
    if (trendType === 'down') return <TrendingDown size={13} className="text-emerald-600" />
    if (trendType === 'danger') return <TrendingUp size={13} className="text-red-600" />
    return <Minus size={13} className="text-slate-400" />
  }

  const getTrendColor = () => {
    if (trendType === 'danger') return 'text-red-600 font-semibold'
    if (trendType === 'down' || trendType === 'up') return 'text-emerald-700 font-semibold'
    return 'text-slate-500'
  }

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-white border ${c.border} p-5 shadow-xs hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-slate-400' : ''
      }`}
    >
      {/* Background soft glow gradient */}
      <div
        className={`absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br ${c.gradient} pointer-events-none blur-xl`}
      />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="flex items-baseline gap-2.5">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </h3>
            {badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {badge}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl ${c.iconBg} ${c.iconText} flex items-center justify-center shadow-xs shrink-0`}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      {/* Footer trend & subtitle */}
      {(trend || subtitle) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 relative z-10">
          {trend ? (
            <div className="flex items-center gap-1.5">
              {renderTrendIcon()}
              <span className={getTrendColor()}>{trend}</span>
            </div>
          ) : (
            <span />
          )}

          {subtitle && (
            <span className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
