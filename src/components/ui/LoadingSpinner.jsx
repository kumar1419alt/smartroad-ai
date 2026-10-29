/**
 * LoadingSpinner — accessible animated spinner.
 *
 * Props:
 *   size    : 'sm' | 'md' | 'lg' | 'xl'
 *   label   : string — aria-label and optional visible text
 *   centered: boolean — wraps in a centred flex container
 *   className: string
 */

import React from 'react'
import { Loader2 } from 'lucide-react'
import { cx } from '../../utils/helpers'

const SIZE_MAP = {
  sm: 16,
  md: 24,
  lg: 36,
  xl: 48,
}

export default function LoadingSpinner({
  size = 'md',
  label = 'Loading…',
  centered = false,
  showLabel = false,
  className,
}) {
  const px = SIZE_MAP[size] ?? SIZE_MAP.md

  const spinner = (
    <span
      role="status"
      aria-label={label}
      className={cx('inline-flex flex-col items-center gap-2', className)}
    >
      <Loader2
        size={px}
        className="animate-spin text-blue-600"
        aria-hidden="true"
      />
      {showLabel && (
        <span className="text-sm text-slate-500">{label}</span>
      )}
    </span>
  )

  if (centered) {
    return (
      <div className="flex items-center justify-center w-full py-12">
        {spinner}
      </div>
    )
  }

  return spinner
}
