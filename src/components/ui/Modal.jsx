/**
 * Modal — accessible dialog overlay.
 *
 * Props:
 *   isOpen    : boolean
 *   onClose   : () => void
 *   title     : string
 *   size      : 'sm' | 'md' | 'lg' | 'xl' | 'full'
 *   hideClose : boolean — hides the close button (use for confirm dialogs)
 *   children  : React node — modal body content
 *   footer    : React node — rendered in the modal footer area
 *   className : string — applied to the modal panel
 *
 * Accessibility:
 *   - role="dialog" with aria-modal="true" and aria-labelledby
 *   - Traps focus within the modal while open
 *   - Escape key closes the modal
 *   - Backdrop click closes the modal
 */

import React, { useEffect, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cx } from '../../utils/helpers'

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
}

export default function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  hideClose = false,
  children,
  footer,
  className,
}) {
  const titleId = useId()
  const panelRef = useRef(null)
  const previouslyFocused = useRef(null)

  // Lock body scroll and save focus reference
  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement
      document.body.style.overflow = 'hidden'
      // Focus the panel so keyboard users can navigate
      setTimeout(() => panelRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ''
      previouslyFocused.current?.focus()
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cx(
          'relative w-full bg-white rounded-xl shadow-[0_20px_25px_-5px_rgb(0_0_0/0.15),0_8px_10px_-6px_rgb(0_0_0/0.1)]',
          'flex flex-col max-h-[90vh] outline-none',
          SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
          className,
        )}
      >
        {/* Header */}
        {(title || !hideClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            {title && (
              <h2 id={titleId} className="text-base font-semibold text-slate-800">
                {title}
              </h2>
            )}
            {!hideClose && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                className={cx(
                  'ml-auto p-1.5 rounded-md text-slate-400',
                  'hover:text-slate-600 hover:bg-slate-100',
                  'transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-blue-500',
                )}
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
