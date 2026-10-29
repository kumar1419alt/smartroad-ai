/**
 * AdminGisMap.jsx — Full-Screen GIS Command Map for Administrators.
 *
 * Core Features:
 *  - Full-screen React Leaflet map with OpenStreetMap tiles
 *  - Severity markers (Red=Critical, Orange=High, Yellow=Medium, Green=Low)
 *  - Pulsing animation on Critical markers
 *  - SRPS influence heatmap overlay circles
 *  - Comprehensive multi-filter bar:
 *      1. Damage Type
 *      2. Severity
 *      3. Priority Tier
 *      4. Status
 *      5. Date Range
 *      6. Ward / Location
 *  - Real-time search by ID, address, or defect
 *  - Selected issue side panel (<AdminMapSidePanel>)
 *  - Full action workflows:
 *      - "Assign Engineer" -> opens <AssignEngineerModal>
 *      - "Change Status" -> opens <ChangeStatusModal>
 *      - "View Complaint" -> opens <PriorityAnalysisModal>
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Circle, useMap, useMapEvents } from 'react-leaflet'
import {
  MapPin,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  Locate,
  X,
  Flame,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import DamageMarker, { SEVERITY_COLOR } from '../../map/DamageMarker'
import IssuePopup from '../../map/IssuePopup'
import MapLegend from '../../map/MapLegend'
import AdminMapSidePanel from './AdminMapSidePanel'
import AssignEngineerModal from './AssignEngineerModal'
import ChangeStatusModal from './ChangeStatusModal'
import PriorityAnalysisModal from '../priority/PriorityAnalysisModal'
import { useToast } from '../../../contexts/ToastContext'

const PUNE_CENTER = [18.5204, 73.8567]
const DEFAULT_ZOOM = 12

// Auto fit map bounds when filtered markers change
function AutoFitBounds({ positions }) {
  const map = useMap()
  const fitted = useRef(false)

  useEffect(() => {
    if (!positions || positions.length === 0) return
    if (fitted.current) return
    fitted.current = true
    const bounds = L.latLngBounds(positions)
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
    }
  }, [positions, map])

  return null
}

// Locate Me button control
function LocateMeControl() {
  const map = useMap()
  const toast = useToast()

  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast.warning('Geolocation is not supported by your browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        map.flyTo([latitude, longitude], 15, { duration: 1.2 })
        toast.info('Map centered on your current location.')
      },
      () => toast.warning('Could not access current location. Please verify location permissions.')
    )
  }

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: 70 }}>
      <div className="leaflet-control">
        <button
          onClick={handleLocate}
          title="Center on my location"
          className="flex items-center justify-center w-9 h-9 bg-white border border-slate-300 rounded-xl shadow-md hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors"
        >
          <Locate size={16} />
        </button>
      </div>
    </div>
  )
}

// Heatmap circles layer
function HeatmapLayer({ complaints, visible }) {
  if (!visible) return null
  return complaints.map((c) => {
    if (!c.coordinates || c.coordinates.length !== 2) return null
    const isResolved = (c.status ?? '').toLowerCase().includes('resolved')
    const sev = isResolved ? 'resolved' : (c.severity ?? 'medium').toLowerCase()
    const color = SEVERITY_COLOR[sev] ?? '#3b82f6'
    const radius = 180 + (c.priority ?? 50) * 3.5 // 180m – 530m

    return (
      <Circle
        key={`heat-${c.id}`}
        center={c.coordinates}
        radius={radius}
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity: 0.1,
          weight: 0,
        }}
      />
    )
  })
}

// Fly to selected marker
function MapFocusController({ targetCoord }) {
  const map = useMap()
  useEffect(() => {
    if (targetCoord && targetCoord.length === 2) {
      map.flyTo(targetCoord, 15, { duration: 0.8 })
    }
  }, [targetCoord, map])
  return null
}

export default function AdminGisMap({
  complaints = [],
  onUpdateComplaint,
}) {
  const toast = useToast()
  // ── Filters State ────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [damageType, setDamageType] = useState('All')
  const [severity, setSeverity] = useState('All')
  const [priorityTier, setPriorityTier] = useState('All')
  const [status, setStatus] = useState('All')
  const [dateRange, setDateRange] = useState('All')
  const [ward, setWard] = useState('All')

  // UI state
  const [heatmap, setHeatmap] = useState(true)
  const [filterPanelOpen, setFilterPanelOpen] = useState(true)
  const [selectedId, setSelectedId] = useState(null)

  // Modals state
  const [assignModalIssue, setAssignModalIssue] = useState(null)
  const [statusModalIssue, setStatusModalIssue] = useState(null)
  const [viewComplaintModalIssue, setViewComplaintModalIssue] = useState(null)

  // Unique lists for dropdowns
  const availableWards = useMemo(() => {
    const set = new Set()
    complaints.forEach((c) => {
      if (c.ward) set.add(c.ward)
    })
    return Array.from(set).sort()
  }, [complaints])

  const availableDamageTypes = useMemo(() => {
    const set = new Set()
    complaints.forEach((c) => {
      if (c.damageType) set.add(c.damageType)
    })
    return Array.from(set).sort()
  }, [complaints])

  // Filter logic
  const filtered = useMemo(() => {
    let data = [...complaints]

    // 1. Search
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      data = data.filter(
        (c) =>
          c.id?.toLowerCase().includes(q) ||
          c.location?.toLowerCase().includes(q) ||
          c.ward?.toLowerCase().includes(q) ||
          c.damageType?.toLowerCase().includes(q)
      )
    }

    // 2. Damage Type
    if (damageType !== 'All') {
      data = data.filter((c) => c.damageType?.toLowerCase() === damageType.toLowerCase())
    }

    // 3. Severity
    if (severity !== 'All') {
      data = data.filter((c) => c.severity?.toLowerCase() === severity.toLowerCase())
    }

    // 4. Priority Tier
    if (priorityTier !== 'All') {
      data = data.filter((c) => {
        const score = c.priority ?? c.priorityScore ?? 0
        if (priorityTier === 'Critical') return score >= 85
        if (priorityTier === 'High') return score >= 70 && score < 85
        if (priorityTier === 'Medium') return score >= 50 && score < 70
        if (priorityTier === 'Low') return score < 50
        return true
      })
    }

    // 5. Status
    if (status !== 'All') {
      data = data.filter((c) => (c.status || '').toLowerCase().includes(status.toLowerCase()))
    }

    // 6. Ward
    if (ward !== 'All') {
      data = data.filter((c) => c.ward === ward)
    }

    // 7. Date Range
    if (dateRange !== 'All') {
      // Mock demo data date range filtering
      if (dateRange === 'today') {
        data = data.filter((c) => (c.date || '').toLowerCase().includes('12 oct') || (c.date || '').toLowerCase().includes('today'))
      } else if (dateRange === '7d') {
        data = data.filter((c) => (c.date || '').toLowerCase().includes('oct'))
      } else if (dateRange === '30d') {
        data = data.filter((c) => (c.date || '').toLowerCase().includes('oct') || (c.date || '').toLowerCase().includes('sep'))
      }
    }

    return data
  }, [complaints, search, damageType, severity, priorityTier, status, ward, dateRange])

  const selectedComplaint = useMemo(
    () => complaints.find((c) => c.id === selectedId) ?? null,
    [complaints, selectedId]
  )

  const validPositions = useMemo(
    () => filtered.filter((c) => c.coordinates?.length === 2).map((c) => c.coordinates),
    [filtered]
  )

  const resetAllFilters = () => {
    setSearch('')
    setDamageType('All')
    setSeverity('All')
    setPriorityTier('All')
    setStatus('All')
    setDateRange('All')
    setWard('All')
  }

  // Handle marker selection
  const handleMarkerClick = (c) => {
    setSelectedId(c.id)
  }

  // Handle modal assignments
  const handleConfirmAssignment = (id, data) => {
    onUpdateComplaint?.(id, data)
    toast.success(`Engineer squad assigned to complaint ${id}`)
  }

  const handleConfirmStatusChange = (id, newStatus) => {
    onUpdateComplaint?.(id, { status: newStatus })
    toast.success(`Complaint ${id} status changed to "${newStatus}"`)
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden select-none">
      {/* ── Top Bar: Search & Filter Trigger ──────────────────────────────── */}
      <div className="p-3 bg-white/95 backdrop-blur-xs border-b border-slate-200 z-10 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Complaint ID, location, ward..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
          />
        </div>

        {/* Quick Filter Toggle & Heatmap Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterPanelOpen(!filterPanelOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition-colors ${
              filterPanelOpen
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter size={13} />
            <span>Filters</span>
            {filterPanelOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          <button
            onClick={() => setHeatmap(!heatmap)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition-colors ${
              heatmap
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Layers size={13} />
            <span>Heatmap {heatmap ? 'ON' : 'OFF'}</span>
          </button>

          {/* Quick Stats Chips */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs">
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200">
              {filtered.length} Visible
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-red-50 text-red-700 font-bold border border-red-200">
              {filtered.filter((c) => (c.severity || '').toLowerCase() === 'critical').length} Critical
            </span>
          </div>
        </div>
      </div>

      {/* ── Collapsible Multi-Filter Panel ─────────────────────────────────── */}
      {filterPanelOpen && (
        <div className="p-3 bg-slate-50 border-b border-slate-200 z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs shadow-xs animate-in slide-in-from-top-2 duration-150">
          {/* 1. Damage Type */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Damage Type</label>
            <select
              value={damageType}
              onChange={(e) => setDamageType(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              {availableDamageTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* 2. Severity */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* 3. Priority Tier */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Priority Tier</label>
            <select
              value={priorityTier}
              onChange={(e) => setPriorityTier(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Tiers</option>
              <option value="Critical">Critical (&ge; 85)</option>
              <option value="High">High (70 - 84)</option>
              <option value="Medium">Medium (50 - 69)</option>
              <option value="Low">Low (&lt; 50)</option>
            </select>
          </div>

          {/* 4. Status */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Repair Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* 5. Date Range */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Time</option>
              <option value="today">Today (12 Oct)</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {/* 6. Ward / Location */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="block text-[10px] font-bold uppercase text-slate-500">Ward / Area</label>
              <button
                onClick={resetAllFilters}
                className="text-[10px] text-blue-600 hover:underline font-semibold"
              >
                Reset
              </button>
            </div>
            <select
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold focus:ring-1 focus:ring-blue-500 truncate"
            >
              <option value="All">All Wards (Pune)</option>
              {availableWards.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── Main Map Canvas Container ────────────────────────────────────── */}
      <div className="relative flex-1 w-full h-full">
        <MapContainer
          center={PUNE_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom
          className="h-full w-full"
          style={{ zIndex: 0 }}
        >
          {/* Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Heatmap Layer */}
          <HeatmapLayer complaints={filtered} visible={heatmap} />

          {/* Damage Markers */}
          {filtered.map((complaint) => (
            <DamageMarker
              key={complaint.id}
              complaint={complaint}
              isSelected={complaint.id === selectedId}
              onClick={() => handleMarkerClick(complaint)}
            >
              <IssuePopup complaint={complaint} />
            </DamageMarker>
          ))}

          {/* Controls */}
          <MapLegend />
          <LocateMeControl />
          <AutoFitBounds positions={validPositions} />
          {selectedComplaint && (
            <MapFocusController targetCoord={selectedComplaint.coordinates} />
          )}
        </MapContainer>

        {/* ── Selected Issue Side Panel ───────────────────────────────────── */}
        {selectedComplaint && (
          <AdminMapSidePanel
            complaint={selectedComplaint}
            onClose={() => setSelectedId(null)}
            onAssignEngineer={(c) => setAssignModalIssue(c)}
            onChangeStatus={(c) => setStatusModalIssue(c)}
            onViewComplaint={(c) => setViewComplaintModalIssue(c)}
          />
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {/* 1. Assign Engineer Modal */}
      <AssignEngineerModal
        isOpen={Boolean(assignModalIssue)}
        complaint={assignModalIssue}
        onClose={() => setAssignModalIssue(null)}
        onAssign={handleConfirmAssignment}
      />

      {/* 2. Change Status Modal */}
      <ChangeStatusModal
        isOpen={Boolean(statusModalIssue)}
        complaint={statusModalIssue}
        onClose={() => setStatusModalIssue(null)}
        onStatusChange={handleConfirmStatusChange}
      />

      {/* 3. View Complaint Detailed Analysis Modal */}
      <PriorityAnalysisModal
        isOpen={Boolean(viewComplaintModalIssue)}
        complaint={viewComplaintModalIssue}
        onClose={() => setViewComplaintModalIssue(null)}
        onDispatch={(c) => setAssignModalIssue(c)}
      />
    </div>
  )
}
