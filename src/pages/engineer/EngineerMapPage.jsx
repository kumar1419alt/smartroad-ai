/**
 * EngineerMapPage.jsx — Route: /engineer/map
 *
 * Dedicated Field Operations GIS Map for Repair Officers.
 * Features:
 *  - Interactive OpenStreetMap view of Pune with assigned repair sites
 *  - Color-coded severity markers (Red=Critical, Amber=High, Yellow=Medium, Emerald=Low)
 *  - Status badges & pulsing rings on active/critical assignments
 *  - "My GPS Location" live beacon (Pune Zone-4 Field Ops HQ)
 *  - Real-time search by complaint ID, defect class, or street name
 *  - Status filter tabs (All, Assigned, In Progress, Resolved)
 *  - Selected site bottom/side sheet with instant field actions:
 *     * Start Repair
 *     * Mark Resolved
 *     * Deep link to /engineer/issues/:id
 *  - Synchronized with localStorage ('rds_engineer_issues')
 */

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin,
  Search,
  Filter,
  Navigation,
  PlayCircle,
  CheckCircle2,
  ExternalLink,
  Flame,
  AlertTriangle,
  X,
  Radio,
  Layers,
  Wrench,
  ChevronRight,
} from 'lucide-react'
import { MOCK_ENGINEER_ISSUES } from '../../data/mockEngineerData'
import { useToast } from '../../contexts/ToastContext'

const STORAGE_KEY = 'rds_engineer_issues'
const PUNE_ZONE4_CENTER = [18.5186, 73.8415]
const FIELD_HQ_COORDS = [18.5204, 73.8567]

const SEVERITY_PIN_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#10b981',
}

function createCustomPin(severity, status) {
  const color = SEVERITY_PIN_COLORS[severity] || '#3b82f6'
  const isResolved = status === 'Resolved'
  const isCritical = severity === 'critical' && !isResolved

  return L.divIcon({
    className: 'custom-pin-icon',
    html: `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        ${
          isCritical
            ? `<div style="position: absolute; inset: -4px; border-radius: 9999px; background-color: ${color}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
            : ''
        }
        <div style="width: 30px; height: 30px; border-radius: 50%; background-color: ${
          isResolved ? '#059669' : color
        }; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: 800;">
          ${isResolved ? '✓' : '!'}
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  })
}

// Controller component to smoothly pan/zoom map
function MapFlyTo({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 14, { duration: 1.2 })
    }
  }, [center, zoom, map])
  return null
}

export default function EngineerMapPage() {
  const toast = useToast()
  const [issues, setIssues] = useState([])
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'Assigned' | 'In Progress' | 'Resolved'
  const [severityFilter, setSeverityFilter] = useState('all')
  const [centerTarget, setCenterTarget] = useState(PUNE_ZONE4_CENTER)
  const [zoomTarget, setZoomTarget] = useState(13)
  const [gpsActive, setGpsActive] = useState(false)

  // Load issues
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      setIssues(stored ? JSON.parse(stored) : MOCK_ENGINEER_ISSUES)
    } catch {
      setIssues(MOCK_ENGINEER_ISSUES)
    }
  }, [])

  const saveUpdatedIssue = (id, patch) => {
    const updated = issues.map((i) => (i.id === id ? { ...i, ...patch } : i))
    setIssues(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.warn('LocalStorage save failed', e)
    }
    if (selectedIssue?.id === id) {
      setSelectedIssue((prev) => ({ ...prev, ...patch }))
    }
  }

  const handleStartRepair = (id) => {
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    saveUpdatedIssue(id, {
      status: 'In Progress',
      startDate: dateStr,
    })
    toast.info(`Work order ${id} marked In Progress. Field crew dispatched.`)
  }

  const handleMarkResolved = (id) => {
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    saveUpdatedIssue(id, {
      status: 'Resolved',
      completionDate: dateStr,
      afterImage:
        selectedIssue?.afterImage ||
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    })
    toast.success(`Work order ${id} successfully marked Resolved!`)
  }

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return issues.filter((i) => {
      if (statusFilter !== 'all' && i.status !== statusFilter) return false
      if (severityFilter !== 'all' && i.severity !== severityFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          i.complaintId.toLowerCase().includes(q) ||
          i.damageType.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [issues, statusFilter, severityFilter, search])

  const handleLocateMe = () => {
    setGpsActive(true)
    setCenterTarget(FIELD_HQ_COORDS)
    setZoomTarget(15)
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-900">
      {/* ── TOP CONTROL OVERLAY ───────────────────────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-xl z-20 space-y-2 pointer-events-auto">
        {/* Search & GPS card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 p-2.5 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search complaint ID, road or damage..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-emerald-500 font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            onClick={handleLocateMe}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              gpsActive
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Locate my position in Zone-4"
          >
            <Navigation size={13} className={gpsActive ? 'animate-pulse' : ''} />
            <span>GPS Pos</span>
          </button>
        </div>

        {/* Quick Filter Pill Bar */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/80 p-1.5 flex items-center gap-1 overflow-x-auto scrollbar-none text-[11px]">
          {['all', 'Assigned', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-bold capitalize whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'all' ? `All (${issues.length})` : st}
            </button>
          ))}

          <span className="text-slate-300">|</span>

          {['all', 'critical', 'high'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-lg font-semibold uppercase text-[10px] whitespace-nowrap transition-colors ${
                severityFilter === sev
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAP CANVAS ────────────────────────────────────────────────────── */}
      <div className="flex-1 w-full h-full z-10">
        <MapContainer
          center={PUNE_ZONE4_CENTER}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapFlyTo center={centerTarget} zoom={zoomTarget} />

          {/* Simulated GPS Beacon */}
          {gpsActive && (
            <>
              <Circle
                center={FIELD_HQ_COORDS}
                radius={250}
                pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.18 }}
              />
              <Marker
                position={FIELD_HQ_COORDS}
                icon={L.divIcon({
                  className: 'gps-marker',
                  html: `
                    <div style="width: 22px; height: 22px; border-radius: 50%; background-color: #10b981; border: 3px solid white; box-shadow: 0 0 12px rgba(16,185,129,0.8);"></div>
                  `,
                  iconSize: [22, 22],
                  iconAnchor: [11, 11],
                })}
              >
                <Popup>
                  <div className="text-xs font-sans">
                    <strong className="text-emerald-700">Er. Vikram Joshi (You)</strong>
                    <p className="text-slate-500 text-[10px]">Zone-4 Field Unit #4 • Live GPS</p>
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* Issue Markers */}
          {filteredIssues.map((issue) => {
            const coords = issue.coordinates || PUNE_ZONE4_CENTER
            return (
              <Marker
                key={issue.id}
                position={coords}
                icon={createCustomPin(issue.severity, issue.status)}
                eventHandlers={{
                  click: () => {
                    setSelectedIssue(issue)
                    setCenterTarget(coords)
                    setZoomTarget(14)
                  },
                }}
              >
                <Popup>
                  <div className="p-1 max-w-[220px] font-sans">
                    <div className="flex items-center justify-between text-[10px] font-bold pb-1 border-b border-slate-100">
                      <span className="font-mono text-slate-500">{issue.complaintId}</span>
                      <span
                        className="px-1.5 py-0.2 rounded-full font-bold uppercase"
                        style={{
                          backgroundColor: `${SEVERITY_PIN_COLORS[issue.severity]}20`,
                          color: SEVERITY_PIN_COLORS[issue.severity],
                        }}
                      >
                        {issue.severity}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-slate-800 mt-1">{issue.damageType}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{issue.location}</p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-black text-amber-600">{issue.srps} SRPS</span>
                      <button
                        onClick={() => setSelectedIssue(issue)}
                        className="text-[10px] font-bold text-emerald-700 hover:underline"
                      >
                        Inspect Issue →
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* ── MAP LEGEND (Bottom Left) ──────────────────────────────────────── */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-slate-200/80 text-[11px] pointer-events-auto hidden sm:block">
        <p className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500 mb-1.5">
          Map Legend
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-slate-700">Critical (SRPS 80+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-700">High (SRPS 60-79)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="text-slate-700">Medium (SRPS 40-59)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-700">Resolved / Low</span>
          </div>
        </div>
      </div>

      {/* ── FLOATING ISSUE INSPECTION DRAWER (Bottom Right) ───────────────── */}
      {selectedIssue && (
        <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-30 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-4 duration-200">
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {selectedIssue.complaintId}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      selectedIssue.severity === 'critical'
                        ? 'bg-red-100 text-red-700'
                        : selectedIssue.severity === 'high'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {selectedIssue.severity}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {selectedIssue.status}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                  {selectedIssue.damageType}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-500 line-clamp-2">{selectedIssue.location}</p>

            {/* Photo preview */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900">
              <img
                src={selectedIssue.roadImage}
                alt={selectedIssue.damageType}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                SRPS: {selectedIssue.srps} / 100
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-1">
              {selectedIssue.status === 'Assigned' && (
                <button
                  onClick={() => handleStartRepair(selectedIssue.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <PlayCircle size={14} />
                  Start Repair
                </button>
              )}

              {selectedIssue.status === 'In Progress' && (
                <button
                  onClick={() => handleMarkResolved(selectedIssue.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <CheckCircle2 size={14} />
                  Mark Resolved
                </button>
              )}

              <Link
                to={`/engineer/issues/${selectedIssue.id}`}
                className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs"
              >
                <span>Full Details</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
