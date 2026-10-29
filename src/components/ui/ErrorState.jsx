/**
 * ErrorState — shown when a data fetch or action fails.
 *
 * Props:
 *   error   : string | Error — error message or object
 *   title   : string — override heading
 *   onRetry : () => void — retry callback; renders a Retry button when provided
 *   compact : boolean — reduced vertical padding
 *   className: string
 */

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import Button from './Button'
import { cx } from '../../utils/helpers'

export default function ErrorState({
  error,
  title = 'Something went wrong',
  onRetry,
  compact = false,
  className,
}) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'An unexpected error occurred. Please try again.'

  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8 px-4' : 'py-16 px-6',
        className,
      )}
      role="alert"
      aria-live="assertive"
    >
      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-4">
        <AlertTriangle size={22} className="text-red-500" aria-hidden="true" />
      </span>
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{message}</p>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          className="mt-5"
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </div>
  )
}
