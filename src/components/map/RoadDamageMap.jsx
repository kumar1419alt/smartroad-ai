/**
 * RoadDamageMap.jsx
 *
 * Full-featured GIS map built with react-leaflet.
 *
 * Features:
 *  - OSM tile layer
 *  - Severity-color-coded DamageMarker pins
 *  - Pulsing ring on Critical markers
 *  - Rich IssuePopup on marker click
 *  - MapLegend control (bottom-left Leaflet control)
 *  - MapFilters floating panel (top-left overlay)
 *  - "Centre on my location" button
 *  - Heatmap-style circle overlays (radius ∝ SRPS score, low opacity)
 *  - Auto-fit bounds to all visible markers
 *  - Selected marker panel (bottom drawer / sidebar on desktop)
 *
 * All filter state is owned here and passed down to MapFilters.
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import { Locate, Layers, ChevronUp, ChevronDown, X } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import DamageMarker from './DamageMarker'
import IssuePopup   from './IssuePopup'
import MapLegend    from './MapLegend'
import MapFilters   from './MapFilters'
import { SEVERITY_COLOR } from './DamageMarker'
import { useToast } from '../../contexts/ToastContext'

// ─── Pune city center ─────────────────────────────────────────────────────────
const PUNE_CENTER = [18.5204, 73.8567]
const DEFAULT_ZOOM = 12

// ─── Sub-component: auto-fit bounds when filtered markers change ──────────────

function AutoFitBounds({ positions }) {
  const map = useMap()
  const fitted = useRef(false)

  useEffect(() => {
    if (!positions || positions.length === 0) return
    if (fitted.current) return
    fitted.current = true
    const bounds = L.latLngBounds(positions)
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
    }
  }, [positions, map])

  return null
}

// ─── Sub-component: "locate me" button inside map ────────────────────────────

function LocateMeControl({ onLocate }) {
  const map = useMap()
  const toast = useToast()

  const handleClick = useCallback(() => {
    if (!navigator.geolocation) {
      toast.warning('Geolocation is not supported by your browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        map.flyTo([latitude, longitude], 15, { duration: 1.2 })
        toast.info('Map centered on your current location.')
        if (onLocate) onLocate([latitude, longitude])
      },
      () => toast.warning('Could not retrieve your location. Please allow location access in your browser.')
    )
  }, [map, onLocate, toast])

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: 80 }}>
      <div className="leaflet-control">
        <button
          id="locate-me-btn"
          onClick={handleClick}
          title="Centre on my location"
          aria-label="Centre map on my location"
          className="flex items-center justify-center w-9 h-9 bg-white border border-slate-300 rounded-lg shadow-md hover:bg-blue-50 hover:border-blue-400 transition-colors text-slate-700 hover:text-blue-600"
        >
          <Locate size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── Sub-component: heatmap circles ──────────────────────────────────────────

function HeatmapLayer({ complaints, visible }) {
  if (!visible) return null
  return complaints.map((c) => {
    if (!c.coordinates || c.coordinates.length !== 2) return null
    const isResolved = (c.status ?? '').toLowerCase().includes('resolved')
    const sev = isResolved ? 'resolved' : (c.severity ?? 'medium').toLowerCase()
    const color = SEVERITY_COLOR[sev] ?? '#3b82f6'
    const radius = 150 + (c.priority ?? 50) * 3   // 150m – 450m radius

    return (
      <Circle
        key={`heat-${c.id}`}
        center={c.coordinates}
        radius={radius}
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity: 0.08,
          weight: 0,
        }}
      />
    )
  })
}

// ─── Main RoadDamageMap ───────────────────────────────────────────────────────

export default function RoadDamageMap({ complaints = [] }) {
  // Filter state
  const [search,     setSearch]     = useState('')
  const [severity,   setSeverity]   = useState('All')
  const [damageType, setDamageType] = useState('All')
  const [status,     setStatus]     = useState('All')

  // UI state
  const [selectedId,   setSelectedId]   = useState(null)
  const [heatmap,      setHeatmap]      = useState(true)
  const [showFilters,  setShowFilters]  = useState(true)
  const [userLocation, setUserLocation] = useState(null)

  const resetFilters = useCallback(() => {
    setSearch('')
    setSeverity('All')
    setDamageType('All')
    setStatus('All')
  }, [])

  // ── Filtered complaints ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = [...complaints]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      data = data.filter(
        (c) =>
          c.id?.toLowerCase().includes(q) ||
          c.location?.toLowerCase().includes(q) ||
          c.damageType?.toLowerCase().includes(q) ||
          c.ward?.toLowerCase().includes(q)
      )
    }

    if (severity !== 'All')
      data = data.filter((c) => c.severity?.toLowerCase() === severity.toLowerCase())

    if (damageType !== 'All')
      data = data.filter((c) => c.damageType?.toLowerCase() === damageType.toLowerCase())

    if (status !== 'All')
      data = data.filter((c) => c.status?.toLowerCase() === status.toLowerCase())

    return data
  }, [complaints, search, severity, damageType, status])

  const selectedComplaint = useMemo(
    () => complaints.find((c) => c.id === selectedId) ?? null,
    [complaints, selectedId]
  )

  const validPositions = useMemo(
    () => filtered.filter((c) => c.coordinates?.length === 2).map((c) => c.coordinates),
    [filtered]
  )

  // ── Severity badge color ──────────────────────────────────────────────────
  const sevColor = (sev) =>
    ({ critical: 'text-red-600 bg-red-50', high: 'text-orange-600 bg-orange-50', medium: 'text-yellow-600 bg-yellow-50', low: 'text-green-600 bg-green-50', resolved: 'text-emerald-600 bg-emerald-50' })[sev?.toLowerCase()] ?? 'text-slate-600 bg-slate-100'

  return (
    <div className="relative flex flex-col h-full">

      {/* ── Map container ────────────────────────────────────────────────── */}
      <div className="relative flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ minHeight: 500 }}>

        <MapContainer
          center={PUNE_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom
          className="h-full w-full"
          style={{ zIndex: 0 }}
        >
          {/* OSM tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Heatmap circles */}
          <HeatmapLayer complaints={filtered} visible={heatmap} />

          {/* Damage markers */}
          {filtered.map((complaint) => (
            <DamageMarker
              key={complaint.id}
              complaint={complaint}
              isSelected={complaint.id === selectedId}
              onClick={() => setSelectedId(complaint.id === selectedId ? null : complaint.id)}
            >
              <IssuePopup complaint={complaint} />
            </DamageMarker>
          ))}

          {/* Map controls */}
          <MapLegend />
          <LocateMeControl onLocate={setUserLocation} />
          <AutoFitBounds positions={validPositions} />
        </MapContainer>

        {/* ── Floating filter panel (top-left) ───────────────────────────── */}
        <div
          className="absolute top-3 left-3 z-[1000] w-[280px] max-w-[calc(100vw-24px)]"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="flex items-center justify-between mb-2">
            <button
              id="toggle-map-filters"
              onClick={() => setShowFilters((p) => !p)}
              aria-expanded={showFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/97 border border-slate-200 rounded-xl shadow-md text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              {showFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            {/* Heatmap toggle */}
            <button
              id="toggle-heatmap"
              onClick={() => setHeatmap((p) => !p)}
              title="Toggle heatmap overlay"
              aria-pressed={heatmap}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-md text-xs font-semibold transition-colors ${
                heatmap
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white/97 border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              <Layers size={13} />
              Heat
            </button>
          </div>

          {showFilters && (
            <MapFilters
              search={search}              onSearchChange={setSearch}
              severity={severity}          onSeverityChange={setSeverity}
              damageType={damageType}      onDamageTypeChange={setDamageType}
              status={status}             onStatusChange={setStatus}
              resultCount={filtered.length}
              totalCount={complaints.length}
              onReset={resetFilters}
            />
          )}
        </div>
      </div>

      {/* ── Selected complaint drawer (below map) ────────────────────────── */}
      {selectedComplaint && (
        <div className="mt-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 animate-[slideUp_0.2s_ease]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-blue-600">{selectedComplaint.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sevColor(selectedComplaint.severity)}`}>
                  {selectedComplaint.severity}
                </span>
                <span className="text-xs text-slate-500">{selectedComplaint.status}</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 mt-1">{selectedComplaint.damageType}</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">📍 {selectedComplaint.location}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                to={`/citizen/reports/${selectedComplaint.id}`}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                View Report
              </Link>
              <button
                onClick={() => setSelectedId(null)}
                aria-label="Dismiss selected marker"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            {[
              { label: 'SRPS Score', value: `${selectedComplaint.priority}/100` },
              { label: 'AI Confidence', value: selectedComplaint.aiConfidence ?? '—' },
              { label: 'Reported', value: selectedComplaint.date },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-xl px-3 py-2">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">{item.value}</div>
              </div>
            ))}
          </div>
          {selectedComplaint.description && (
            <p className="text-xs text-slate-600 mt-3 leading-relaxed border-t border-slate-100 pt-3">
              {selectedComplaint.description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
