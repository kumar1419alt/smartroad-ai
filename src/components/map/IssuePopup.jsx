/**
 * IssuePopup.jsx
 *
 * Leaflet Popup content for a single complaint shown on the map.
 * Rendered inside a react-leaflet <Popup> — uses plain inline styles
 * so Tailwind's JIT doesn't need to scan this DOM.
 *
 * Shows:
 *   Complaint ID, Damage Type, Severity, SRPS score,
 *   Status, Date, Location  +  "View Report" link
 */

import React from 'react'
import { Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import { SEVERITY_COLOR } from './DamageMarker'

const STATUS_COLOR = {
  pending:     { bg: '#fef9c3', text: '#713f12' },
  'in progress': { bg: '#dbeafe', text: '#1e40af' },
  resolved:    { bg: '#d1fae5', text: '#065f46' },
}

function statusStyle(status = '') {
  return STATUS_COLOR[(status).toLowerCase()] ?? { bg: '#f1f5f9', text: '#475569' }
}

export default function IssuePopup({ complaint }) {
  const isResolved = (complaint.status ?? '').toLowerCase().includes('resolved')
  const sev = isResolved ? 'resolved' : (complaint.severity ?? 'medium').toLowerCase()
  const severityColor = SEVERITY_COLOR[sev] ?? '#3b82f6'
  const ss = statusStyle(complaint.status)

  return (
    <Popup
      minWidth={220}
      maxWidth={280}
      closeButton
      className="rds-popup"
    >
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12 }}>
        {/* Header: ID + type */}
        <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 6, marginBottom: 6 }}>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>{complaint.id}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span style={{
              display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
              backgroundColor: severityColor, flexShrink: 0,
            }} />
            <span style={{ fontWeight: 600, color: '#2563eb', fontSize: 11 }}>{complaint.damageType}</span>
          </div>
        </div>

        {/* Location */}
        <div style={{ color: '#64748b', fontSize: 11, marginBottom: 8, lineHeight: 1.45 }}>
          📍 {complaint.location}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
          <div style={{ background: '#f8fafc', borderRadius: 6, padding: '4px 8px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Severity</div>
            <div style={{ fontWeight: 700, color: severityColor, fontSize: 12, marginTop: 1, textTransform: 'capitalize' }}>{complaint.severity}</div>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 6, padding: '4px 8px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SRPS</div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 12, marginTop: 1 }}>{complaint.priority} / 100</div>
          </div>
        </div>

        {/* Status + date */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{
            display: 'inline-block', padding: '2px 8px', borderRadius: 20,
            fontSize: 10, fontWeight: 700,
            backgroundColor: ss.bg, color: ss.text,
          }}>
            {complaint.status}
          </span>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>{complaint.date}</span>
        </div>

        {/* AI Confidence */}
        {complaint.aiConfidence && (
          <div style={{ fontSize: 10, color: '#64748b', marginBottom: 8 }}>
            🤖 AI Confidence: <strong style={{ color: '#0f172a' }}>{complaint.aiConfidence}</strong>
          </div>
        )}

        {/* CTA */}
        <Link
          to={`/citizen/reports/${complaint.id}`}
          style={{
            display: 'block', textAlign: 'center',
            padding: '6px 0', borderRadius: 8,
            backgroundColor: '#2563eb', color: '#fff',
            fontWeight: 600, fontSize: 11, textDecoration: 'none',
          }}
        >
          View Full Report →
        </Link>
      </div>
    </Popup>
  )
}
