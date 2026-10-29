/**
 * PriorityBadge.jsx — Unified badge indicating repair priority level or SRPS score.
 *
 * Accepts either:
 *  - number: priority={94} (SRPS score 0-100)
 *  - string: priority="critical" | "high" | "medium" | "low"
 *
 * Visual threshold bands:
 *  - Critical (85-100 or 'critical'): Red
 *  - High (70-84 or 'high'): Orange
 *  - Medium (50-69 or 'medium'): Amber
 *  - Low (<50 or 'low'): Emerald
 */

import React from 'react'
import { Flame, AlertTriangle, ShieldAlert, ArrowUpRight } from 'lucide-react'

export default function PriorityBadge({ priority = 0, showScore = true, size = 'sm', className = '' }) {
  let score = null
  let level = 'low'

  if (typeof priority === 'number') {
    score = priority
    if (score >= 85) level = 'critical'
    else if (score >= 70) level = 'high'
    else if (score >= 50) level = 'medium'
    else level = 'low'
  } else if (typeof priority === 'string') {
    const num = parseInt(priority, 10)
    if (!isNaN(num) && priority.match(/^\d+$/)) {
      score = num
      if (score >= 85) level = 'critical'
      else if (score >= 70) level = 'high'
      else if (score >= 50) level = 'medium'
      else level = 'low'
    } else {
      level = priority.toLowerCase().trim()
    }
  }

  const configs = {
    critical: {
      label: 'Critical',
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      iconColor: 'text-red-500',
      icon: Flame,
    },
    high: {
      label: 'High',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      iconColor: 'text-orange-500',
      icon: AlertTriangle,
    },
    medium: {
      label: 'Medium',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      iconColor: 'text-amber-500',
      icon: ShieldAlert,
    },
    low: {
      label: 'Low',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      iconColor: 'text-emerald-500',
      icon: ArrowUpRight,
    },
  }

  const config = configs[level] || configs.low
  const IconComponent = config.icon

  const sizeClasses =
    size === 'xs'
      ? 'text-[10px] px-2 py-0.5 gap-1 font-extrabold uppercase tracking-wider'
      : size === 'lg'
      ? 'text-sm px-3.5 py-1.5 gap-2 font-black'
      : 'text-xs px-2.5 py-1 gap-1.5 font-bold'

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      <IconComponent size={size === 'xs' ? 10 : size === 'lg' ? 16 : 13} className={`shrink-0 ${config.iconColor}`} />
      <span>{config.label}</span>
      {showScore && score !== null && (
        <span className="font-mono opacity-80 text-[10px] font-semibold">({score})</span>
      )}
    </span>
  )
}
