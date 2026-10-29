/**
 * DamageMarker.jsx
 *
 * A react-leaflet Marker using a custom SVG DivIcon.
 * Color-coded by severity: Critical→Red, High→Orange, Medium→Yellow, Low→Green, Resolved→Emerald.
 * Critical markers have a CSS pulse ring animation.
 */

import React from 'react'
import { Marker, useMap } from 'react-leaflet'
import L from 'leaflet'

// Severity → fill color mapping
export const SEVERITY_COLOR = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#eab308',
  low:      '#22c55e',
  resolved: '#10b981',
}

// Severity → border color (darker ring)
const SEVERITY_BORDER = {
  critical: '#b91c1c',
  high:     '#c2410c',
  medium:   '#a16207',
  low:      '#15803d',
  resolved: '#047857',
}

/**
 * Builds a Leaflet DivIcon from SVG markup.
 * @param {string} severity
 * @param {boolean} isResolved
 * @param {boolean} isSelected – selected markers are slightly larger
 */
export function buildDivIcon(severity, isResolved, isSelected = false) {
  const sev = isResolved ? 'resolved' : (severity?.toLowerCase() ?? 'medium')
  const fill = SEVERITY_COLOR[sev] ?? '#3b82f6'
  const border = SEVERITY_BORDER[sev] ?? '#1d4ed8'
  const size = isSelected ? 28 : sev === 'critical' ? 24 : 20
  const pulse = sev === 'critical' && !isResolved

  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;">
      ${pulse ? `
        <div style="
          position:absolute;inset:-4px;border-radius:50%;
          border:2px solid ${fill};opacity:0.5;
          animation:mapPulse 1.8s ease-out infinite;
        "></div>` : ''}
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${fill}" stroke="${border}" stroke-width="2"/>
        <circle cx="12" cy="12" r="4" fill="white" opacity="0.9"/>
      </svg>
    </div>
  `

  return L.divIcon({
    html,
    className: '',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor:[0, -size / 2 - 4],
  })
}

/**
 * DamageMarker — wraps react-leaflet Marker with dynamic DivIcon.
 *
 * Props:
 *   complaint: object (from mockPuneComplaints / getSavedComplaints)
 *   isSelected: boolean
 *   onClick: () => void
 *   children: popup JSX (IssuePopup)
 */
export default function DamageMarker({ complaint, isSelected, onClick, children }) {
  if (!complaint.coordinates || complaint.coordinates.length !== 2) return null

  const isResolved = (complaint.status ?? '').toLowerCase().includes('resolved')
  const icon = buildDivIcon(complaint.severity, isResolved, isSelected)

  return (
    <Marker
      position={complaint.coordinates}
      icon={icon}
      eventHandlers={{ click: onClick }}
    >
      {children}
    </Marker>
  )
}
