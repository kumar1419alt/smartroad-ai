/**
 * StatusBadge.jsx — Unified status badge for complaint & repair lifecycle.
 *
 * Supports statuses:
 *  - Pending / Under Review (Amber)
 *  - Assigned (Blue)
 *  - In Progress (Sky/Blue with pulsing dot)
 *  - Scheduled (Indigo/Purple)
 *  - Resolved / Completed (Emerald)
 *  - Rejected / Closed (Slate)
 */

import React from 'react'
import { Clock, Wrench, CheckCircle2, Calendar, AlertCircle, XCircle, UserCheck } from 'lucide-react'

const STATUS_CONFIGS = {
  pending: {
    label: 'Pending Review',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock,
  },
  'pending review': {
    label: 'Pending Review',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock,
  },
  assigned: {
    label: 'Assigned',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    icon: UserCheck,
  },
  'in progress': {
    label: 'In Progress',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dot: 'bg-sky-500 animate-pulse',
    icon: Wrench,
  },
  'in_progress': {
    label: 'In Progress',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dot: 'bg-sky-500 animate-pulse',
    icon: Wrench,
  },
  scheduled: {
    label: 'Scheduled',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
    icon: Calendar,
  },
  resolved: {
    label: 'Resolved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    icon: XCircle,
  },
  closed: {
    label: 'Closed',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    icon: AlertCircle,
  },
}

export default function StatusBadge({ status = 'Pending', showIcon = true, size = 'sm', className = '' }) {
  const normalizedKey = (status || '').toLowerCase().trim()
  const config = STATUS_CONFIGS[normalizedKey] || {
    label: status,
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    icon: Clock,
  }

  const IconComponent = config.icon

  const sizeClasses =
    size === 'xs'
      ? 'text-[10px] px-2 py-0.5 gap-1 font-bold'
      : size === 'lg'
      ? 'text-sm px-3.5 py-1.5 gap-2 font-bold'
      : 'text-xs px-2.5 py-1 gap-1.5 font-bold'

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} whitespace-nowrap ${className}`}
    >
      {showIcon && (
        <span className="relative flex items-center justify-center shrink-0">
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        </span>
      )}
      <span>{config.label}</span>
    </span>
  )
}
