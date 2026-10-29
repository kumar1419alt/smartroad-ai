/**
 * MapFilters.jsx
 *
 * Floating filter + search panel that sits above the map.
 * Provides:
 *   - Text search (ID / location)
 *   - Severity dropdown (All / Critical / High / Medium / Low)
 *   - Damage type dropdown
 *   - Status dropdown (All / Pending / In Progress / Resolved)
 *   - Active filter pills with clear buttons
 *   - Result count badge
 *
 * All filter state is managed by the parent (RoadDamageMap) via props.
 */

import React from 'react'
import { Search, SlidersHorizontal, X, RefreshCw } from 'lucide-react'

const SEVERITY_OPTIONS = ['All', 'Critical', 'High', 'Medium', 'Low']
const DAMAGE_OPTIONS   = [
  'All',
  'Pothole',
  'Pothole Cluster',
  'Deep Subsidence',
  'Manhole Subsidence',
  'Longitudinal Crack',
  'Edge Erosion',
  'Surface Rutting',
]
const STATUS_OPTIONS = ['All', 'Pending', 'In Progress', 'Resolved']

function Pill({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold rounded-full">
      {label}
      <button onClick={onRemove} aria-label={`Remove ${label}`} className="hover:text-blue-900 transition-colors">
        <X size={10} />
      </button>
    </span>
  )
}

export default function MapFilters({
  search,        onSearchChange,
  severity,      onSeverityChange,
  damageType,    onDamageTypeChange,
  status,        onStatusChange,
  resultCount,   totalCount,
  onReset,
}) {
  const activePills = [
    severity   !== 'All' && { key: 'sev',   label: `Severity: ${severity}`,       clear: () => onSeverityChange('All') },
    damageType !== 'All' && { key: 'dmg',   label: `Type: ${damageType}`,         clear: () => onDamageTypeChange('All') },
    status     !== 'All' && { key: 'stat',  label: `Status: ${status}`,           clear: () => onStatusChange('All') },
  ].filter(Boolean)

  const hasFilters = search || activePills.length > 0

  return (
    <div className="bg-white/97 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg p-3 space-y-2.5">

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          id="map-search"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by ID or location…"
          aria-label="Search map markers"
          className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 placeholder:text-slate-400"
        />
      </div>

      {/* Filter dropdowns */}
      <div className="grid grid-cols-3 gap-2">
        {/* Severity */}
        <div>
          <label htmlFor="map-filter-severity" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Severity</label>
          <select
            id="map-filter-severity"
            value={severity}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="w-full text-[11px] text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {SEVERITY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>

        {/* Damage type */}
        <div>
          <label htmlFor="map-filter-damage" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Type</label>
          <select
            id="map-filter-damage"
            value={damageType}
            onChange={(e) => onDamageTypeChange(e.target.value)}
            className="w-full text-[11px] text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {DAMAGE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="map-filter-status" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
          <select
            id="map-filter-status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full text-[11px] text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {STATUS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Active pills */}
      {activePills.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activePills.map((p) => <Pill key={p.key} label={p.label} onRemove={p.clear} />)}
          <button onClick={onReset} className="text-[10px] text-slate-400 hover:text-slate-600 underline">
            Clear all
          </button>
        </div>
      )}

      {/* Result count */}
      <div className="flex items-center justify-between pt-0.5 border-t border-slate-100">
        <span className="text-[10px] text-slate-400">
          Showing <span className="font-bold text-slate-700">{resultCount}</span>
          {totalCount !== resultCount && <> of <span className="font-bold text-slate-700">{totalCount}</span></>} incidents
        </span>
        {hasFilters && (
          <button
            onClick={onReset}
            aria-label="Reset all filters"
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RefreshCw size={10} />
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
