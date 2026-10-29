/**
 * Badge — inline status/label pill.
 *
 * Props:
 *   variant  : 'default' | 'severity' | 'status' | 'outline'
 *   severity : SEVERITY enum value (used when variant='severity')
 *   status   : REPAIR_STATUS enum value (used when variant='status')
 *   size     : 'sm' | 'md'
 *   dot      : boolean — show coloured dot before label
 *   className: string
 */

import React from 'react'
import { cx, severityColors, statusColors, severityLabel, statusLabel } from '../../utils/helpers'

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
}

export default function Badge({
  children,
  variant = 'default',
  severity,
  status,
  size = 'md',
  dot = false,
  className,
}) {
  let colorClasses = 'bg-slate-100 text-slate-600 border-slate-200'
  let dotColor = 'bg-slate-400'
  let label = children

  if (variant === 'severity' && severity) {
    const c = severityColors[severity] ?? {}
    colorClasses = cx(c.bg, c.text, c.border && `border ${c.border}`)
    dotColor = c.dot
    label = children ?? severityLabel[severity]
  } else if (variant === 'status' && status) {
    const c = statusColors[status] ?? {}
    colorClasses = cx(c.bg, c.text, c.border && `border ${c.border}`)
    label = children ?? statusLabel[status]
  } else if (variant === 'outline') {
    colorClasses = 'bg-transparent text-slate-600 border-slate-300'
  }

  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 font-medium rounded-full border leading-none',
        SIZE_CLASSES[size],
        colorClasses,
        className,
      )}
    >
      {dot && (
        <span
          className={cx('w-1.5 h-1.5 rounded-full shrink-0', dotColor)}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  )
}
