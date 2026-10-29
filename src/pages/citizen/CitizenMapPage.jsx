/**
 * CitizenMapPage.jsx — /citizen/map
 *
 * Full-screen GIS Road Damage Map for citizens.
 * Delegates all map logic to <RoadDamageMap>.
 *
 * Data pipeline:
 *  mockPuneComplaints (built-in)  ──┐
 *                                   ├──▶ getSavedComplaints() ──▶ <RoadDamageMap>
 *  localStorage citizen reports  ───┘
 *
 * Ready to swap getSavedComplaints() for GET /api/complaints when backend is live.
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, PlusCircle, Info } from 'lucide-react'
import RoadDamageMap from '../../components/map/RoadDamageMap'
import { getSavedComplaints } from '../../services/complaintService'

export default function CitizenMapPage() {
  const [complaints, setComplaints] = useState([])
  const [loaded, setLoaded]         = useState(false)

  useEffect(() => {
    // Merge built-in mock data + any citizen-submitted (localStorage) reports
    const data = getSavedComplaints()
    setComplaints(data)
    setLoaded(true)
  }, [])

  // Quick stat counts
  const counts = {
    total:    complaints.length,
    critical: complaints.filter((c) => c.severity?.toLowerCase() === 'critical').length,
    active:   complaints.filter((c) => !c.status?.toLowerCase().includes('resolved')).length,
    resolved: complaints.filter((c) => c.status?.toLowerCase().includes('resolved')).length,
  }

  return (
    <div className="space-y-4 h-full flex flex-col">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin size={20} className="text-blue-600" />
            Pune City Road Damage Map
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic visualization of reported potholes, cracks, and repair progress across Pune wards
          </p>
        </div>
        <Link
          to="/citizen/report"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <PlusCircle size={15} />
          Report Damage
        </Link>
      </div>

      {/* ── Quick stat chips ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Total Incidents',  value: counts.total,    color: 'bg-slate-100 text-slate-700 border-slate-200' },
          { label: 'Critical',         value: counts.critical, color: 'bg-red-50 text-red-600 border-red-200' },
          { label: 'Active',           value: counts.active,   color: 'bg-orange-50 text-orange-600 border-orange-200' },
          { label: 'Resolved',         value: counts.resolved, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        ].map((chip) => (
          <div
            key={chip.label}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${chip.color}`}
          >
            <span className="text-base font-bold">{chip.value}</span>
            <span className="opacity-80">{chip.label}</span>
          </div>
        ))}

        {/* DEMO notice */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold ml-auto">
          <Info size={12} />
          DEMO DATA — Pune Municipal Corporation
        </div>
      </div>

      {/* ── Map ─────────────────────────────────────────────────────────── */}
      <div className="flex-1" style={{ minHeight: '68vh' }}>
        {loaded ? (
          <RoadDamageMap complaints={complaints} />
        ) : (
          <div className="h-full bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading map data…</span>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
