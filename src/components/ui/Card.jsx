/**
 * Card — surface container with consistent padding and shadow.
 *
 * Sub-components:
 *   Card.Header  — renders a padded top section with border-bottom
 *   Card.Body    — scrollable or normal content area
 *   Card.Footer  — padded bottom section with border-top
 *
 * Props:
 *   noPadding : boolean — removes default padding from Card root
 *   hoverable : boolean — adds subtle hover elevation
 *   className : string
 */

import React from 'react'
import { cx } from '../../utils/helpers'

function Card({ children, noPadding = false, hoverable = false, className, ...rest }) {
  return (
    <div
      className={cx(
        'bg-white/95 rounded-2xl border border-slate-200/80',
        'shadow-[0_1px_2px_rgb(15_23_42/0.04),0_8px_24px_rgb(15_23_42/0.04)]',
        !noPadding && 'p-4 sm:p-5',
        hoverable && 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgb(15_23_42/0.10)] cursor-pointer',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

function CardHeader({ children, className, ...rest }) {
  return (
    <div
      className={cx(
        'px-4 sm:px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

function CardBody({ children, className, ...rest }) {
  return (
    <div className={cx('px-4 sm:px-5 py-4', className)} {...rest}>
      {children}
    </div>
  )
}

function CardFooter({ children, className, ...rest }) {
  return (
    <div
      className={cx(
        'px-4 sm:px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-3',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export default Card
