/**
 * Shared utility helpers used across the application.
 */

import {
  SEVERITY,
  REPAIR_STATUS,
  DAMAGE_TYPE,
} from '../constants'

// ─── Severity ─────────────────────────────────────────────────────────────────

/** Map severity enum → display label */
export const severityLabel = {
  [SEVERITY.CRITICAL]: 'Critical',
  [SEVERITY.HIGH]: 'High',
  [SEVERITY.MEDIUM]: 'Medium',
  [SEVERITY.LOW]: 'Low',
}

/** Map severity enum → Tailwind colour classes { bg, text, border, dot } */
export const severityColors = {
  [SEVERITY.CRITICAL]: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    solid: 'bg-red-500',
  },
  [SEVERITY.HIGH]: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    solid: 'bg-orange-500',
  },
  [SEVERITY.MEDIUM]: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500',
    solid: 'bg-yellow-500',
  },
  [SEVERITY.LOW]: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
    solid: 'bg-green-500',
  },
}

// ─── Status ───────────────────────────────────────────────────────────────────

/** Map status enum → display label */
export const statusLabel = {
  [REPAIR_STATUS.PENDING]: 'Pending',
  [REPAIR_STATUS.SCHEDULED]: 'Scheduled',
  [REPAIR_STATUS.IN_PROGRESS]: 'In Progress',
  [REPAIR_STATUS.COMPLETED]: 'Completed',
  [REPAIR_STATUS.DEFERRED]: 'Deferred',
}

/** Map status enum → colour classes */
export const statusColors = {
  [REPAIR_STATUS.PENDING]: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
  },
  [REPAIR_STATUS.SCHEDULED]: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  [REPAIR_STATUS.IN_PROGRESS]: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  [REPAIR_STATUS.COMPLETED]: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  [REPAIR_STATUS.DEFERRED]: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
}

// ─── Damage Type ──────────────────────────────────────────────────────────────

/** Map damage type enum → display label */
export const damageTypeLabel = {
  [DAMAGE_TYPE.POTHOLE]: 'Pothole',
  [DAMAGE_TYPE.CRACK]: 'Crack',
  [DAMAGE_TYPE.SUBSIDENCE]: 'Subsidence',
  [DAMAGE_TYPE.RUTTING]: 'Rutting',
  [DAMAGE_TYPE.EDGE_DAMAGE]: 'Edge Damage',
  [DAMAGE_TYPE.SURFACE_DETERIORATION]: 'Surface Deterioration',
}

// ─── Date / Time ──────────────────────────────────────────────────────────────

/**
 * Format an ISO date string to a readable date.
 * @param {string} iso - ISO 8601 date string
 * @returns {string} e.g. "13 Oct 2026"
 */
export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format an ISO datetime string to a readable datetime.
 * @param {string} iso - ISO 8601 datetime string
 * @returns {string} e.g. "13 Oct 2026, 13:45"
 */
export function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * Return a relative time string ("2 hours ago", "3 days ago").
 * @param {string} iso - ISO 8601 datetime string
 */
export function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(iso)
}

// ─── Numbers ──────────────────────────────────────────────────────────────────

/** Format a number with Indian locale (lakh notation). */
export function formatNumber(n) {
  if (n == null) return '—'
  return n.toLocaleString('en-IN')
}

/** Format a currency value in INR. */
export function formatCurrency(n) {
  if (n == null) return '—'
  return `₹${n.toLocaleString('en-IN')}`
}

// ─── Priority Score ───────────────────────────────────────────────────────────

/**
 * Get colour class for a 0–100 priority score.
 * @param {number} score
 */
export function priorityScoreColor(score) {
  if (score >= 85) return 'text-red-600'
  if (score >= 65) return 'text-orange-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-green-600'
}

// ─── Class Names ──────────────────────────────────────────────────────────────

/** Lightweight class-name joiner (avoids adding clsx dependency). */
export function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

/** Default fallback image for road damage when external source is offline */
export const FALLBACK_ROAD_IMAGE =
  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
