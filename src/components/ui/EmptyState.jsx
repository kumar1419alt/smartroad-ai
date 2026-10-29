/**
 * EmptyState — shown when a data set returns zero results.
 *
 * Props:
 *   icon    : Lucide icon component
 *   title   : string — primary message
 *   message : string — secondary description
 *   action  : React element — optional CTA button
 *   compact : boolean — reduced vertical padding
 *   className: string
 */

import React from 'react'
import { SearchX } from 'lucide-react'
import { cx } from '../../utils/helpers'

export default function EmptyState({
  icon: Icon = SearchX,
  title = 'No results found',
  message,
  action,
  compact = false,
  className,
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8 px-4' : 'py-16 px-6',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
        <Icon size={22} className="text-slate-400" aria-hidden="true" />
      </span>
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
      {message && (
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{message}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
