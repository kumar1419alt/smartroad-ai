/**
 * Button — primary reusable action component.
 *
 * Props:
 *   variant  : 'primary' | 'secondary' | 'ghost' | 'danger'
 *   size     : 'sm' | 'md' | 'lg'
 *   loading  : boolean — shows spinner and disables interaction
 *   disabled : boolean
 *   icon     : React element (Lucide icon) — rendered before label
 *   iconRight: React element — rendered after label
 *   fullWidth: boolean
 *   ...rest  : forwarded to <button>
 */

import React from 'react'
import { Loader2 } from 'lucide-react'
import { cx } from '../../utils/helpers'

const VARIANT_CLASSES = {
  primary:
    'bg-blue-600 text-white border-transparent hover:bg-blue-700 active:bg-blue-800 shadow-sm',
  secondary:
    'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 active:bg-slate-100 shadow-sm',
  ghost:
    'bg-transparent text-slate-600 border-transparent hover:bg-slate-100 active:bg-slate-200',
  danger:
    'bg-red-600 text-white border-transparent hover:bg-red-700 active:bg-red-800 shadow-sm',
  'danger-ghost':
    'bg-transparent text-red-600 border-transparent hover:bg-red-50 active:bg-red-100',
  navy:
    'bg-navy-800 text-white border-transparent hover:bg-navy-700 active:bg-navy-900 shadow-sm',
}

const SIZE_CLASSES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
}

const ICON_SIZE = {
  sm: 14,
  md: 16,
  lg: 16,
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  fullWidth = false,
  className,
  type = 'button',
  ...rest
}) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      className={cx(
        // Base
        'inline-flex items-center justify-center font-medium rounded-md border transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2',
        'select-none cursor-pointer',
        // Variant
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary,
        // Size
        SIZE_CLASSES[size],
        // States
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 size={ICON_SIZE[size]} className="animate-spin shrink-0" />
      ) : Icon ? (
        <Icon size={ICON_SIZE[size]} className="shrink-0" />
      ) : null}

      {children && <span>{children}</span>}

      {!loading && IconRight && (
        <IconRight size={ICON_SIZE[size]} className="shrink-0" />
      )}
    </button>
  )
}
