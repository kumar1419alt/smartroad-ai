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
        'bg-white rounded-xl border border-slate-200',
        'shadow-[0_1px_3px_0_rgb(0_0_0/0.08),0_1px_2px_-1px_rgb(0_0_0/0.06)]',
        !noPadding && 'p-5',
        hoverable && 'transition-shadow duration-200 hover:shadow-[0_4px_6px_-1px_rgb(0_0_0/0.08),0_2px_4px_-2px_rgb(0_0_0/0.05)] cursor-pointer',
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
        'px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3',
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
    <div className={cx('px-5 py-4', className)} {...rest}>
      {children}
    </div>
  )
}

function CardFooter({ children, className, ...rest }) {
  return (
    <div
      className={cx(
        'px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-3',
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
