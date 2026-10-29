/**
 * ComplaintDetailDrawer.jsx — Complete Inspection & Action Drawer/Modal for Admins.
 *
 * Capabilities:
 *  - Review complaint details (description, citizen reporter, upvotes, timestamps)
 *  - Assign engineer / squad (PMC Rapid Response Team #4, etc.)
 *  - Change status (Pending, In Progress, Scheduled, Resolved)
 *  - View location (interactive Leaflet mini-map preview + coordinates)
 *  - View AI detection (YOLOv8 frame, bounding box, defect dimensions, confidence)
 *  - View priority score (SRPS score, tier gauge, 5-factor breakdown)
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  MapPin,
  Flame,
  AlertTriangle,
  HardHat,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Send,
  User,
  Phone,
  ThumbsUp,
  CheckCircle2,
  Clock,
  Compass,
  Scale,
  Maximize2,
  Activity,
} from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import PriorityScoreBreakdown from '../priority/PriorityScoreBreakdown'

const ENGINEERS_AND_SQUADS = [
  { squad: 'PMC Rapid Response Team #4', lead: 'Vikram Joshi', phone: '+91 98230 11442', zone: 'Shivajinagar - Deccan (Ward 14)' },
  { squad: 'Ward 10 Pavement Unit', lead: 'Ramesh Kumar', phone: '+91 98111 54321', zone: 'SB Road / Model Colony' },
  { squad: 'MIDC / PMC Joint Repair Crew', lead: 'Ananya Deshmukh', phone: '+91 98901 33221', zone: 'Hinjewadi IT Corridor' },
  { squad: 'Zone-3 Maintenance Wing', lead: 'Sunil Shinde', phone: '+91 98224 88771', zone: 'Aundh - Baner (Ward 8)' },
  { squad: 'Central City Highways Wing', lead: 'Prakash Patil', phone: '+91 98450 66554', zone: 'Swargate - Tilak Road' },
  { squad: 'Hadapsar Ward Division', lead: 'Amit Kulkarni', phone: '+91 98670 99881', zone: 'Hadapsar - Mundhwa' },
]

export default function ComplaintDetailDrawer({
  complaint,
  isOpen,
  onClose,
  onUpdateStatus,
  onAssignEngineer,
}) {
  if (!isOpen || !complaint) return null

  // Tab navigation inside drawer
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'location' | 'ai' | 'priority' | 'actions'

  // Form states
  const [selectedStatus, setSelectedStatus] = useState(complaint.status || 'Pending')
  const [selectedSquadIdx, setSelectedSquadIdx] = useState(0)
  const [targetDate, setTargetDate] = useState('2026-10-18')
  const [dispatchNote, setDispatchNote] = useState('Inspect surface deformation and coordinate traffic management.')
  const [isUpdating, setIsUpdating] = useState(false)
  const [statusSuccess, setStatusSuccess] = useState(false)
  const [assignSuccess, setAssignSuccess] = useState(false)

  // Leaflet map container ref
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)

  const coords = complaint.coordinates?.length === 2 ? complaint.coordinates : [18.5186, 73.8415]
  const score = complaint.priority ?? complaint.priorityScore ?? 75

  // Initialize mini-map when 'location' tab is active
  useEffect(() => {
    if (activeTab !== 'location' || !mapContainerRef.current) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const map = L.map(mapContainerRef.current, {
      center: coords,
      zoom: 15,
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: false,
    })
    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)

    // Pin icon
    const icon = L.divIcon({
      html: `
        <div style="width:26px;height:26px;background:#ef4444;border:3px solid #fff;border-radius:50%;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
          <div style="width:8px;height:8px;background:#fff;border-radius:50%;"></div>
        </div>
      `,
      className: '',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    })

    L.marker(coords, { icon }).addTo(map)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [activeTab, coords])

  // Status update submit
  const handleStatusSubmit = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    await onUpdateStatus?.(complaint.id, selectedStatus)
    setIsUpdating(false)
    setStatusSuccess(true)
    setTimeout(() => setStatusSuccess(false), 2000)
  }

  // Assign engineer submit
  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    const unit = ENGINEERS_AND_SQUADS[selectedSquadIdx]
    await onAssignEngineer?.(complaint.id, {
      assignedSquad: unit.squad,
      assignedEngineer: `${unit.lead} (${unit.squad})`,
      targetDate,
      note: dispatchNote,
    })
    setIsUpdating(false)
    setAssignSuccess(true)
    setTimeout(() => setAssignSuccess(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[1500] overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200"
        aria-label="Complaint Details Drawer"
      >
        {/* ── Top Header ──────────────────────────────────────────────────── */}
        <div className="p-5 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {complaint.id}
              </span>
              <span className="text-xs font-bold text-slate-400">
                Municipal Complaint Review
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white">
              {complaint.damageType} — {complaint.location}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <MapPin size={12} className="text-blue-400" />
              {complaint.ward || 'Central Municipal Ward'} • Submitted: {complaint.date || 'Recent'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Navigation Tabs ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-200 bg-slate-50 text-xs shrink-0 overflow-x-auto">
          {[
            { id: 'overview', label: '1. Review Details' },
            { id: 'location', label: '2. Location & Map' },
            { id: 'ai',       label: '3. AI Detection' },
            { id: 'priority', label: '4. Priority Score' },
            { id: 'actions',  label: '5. Dispatch & Status' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 font-bold rounded-t-xl transition-colors whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Scrollable Body ─────────────────────────────────────────────── */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
          {/* TAB 1: REVIEW COMPLAINT */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-100">
              {/* Core Badges Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Severity</span>
                  <span className="font-extrabold text-sm text-red-600 capitalize">{complaint.severity}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">SRPS Score</span>
                  <span className="font-extrabold text-sm text-blue-600">{score}/100</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
                  <span className="font-extrabold text-sm text-slate-800 capitalize">{complaint.status}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Upvotes</span>
                  <span className="font-extrabold text-sm text-emerald-600 flex items-center gap-1">
                    <ThumbsUp size={12} />
                    {complaint.upvotes || 24}
                  </span>
                </div>
              </div>

              {/* Citizen Information */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Citizen Reporter Details
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">{complaint.citizenName || 'Resident Reporter'}</p>
                      <p className="text-[11px] text-slate-500">Verified Citizen Mobile ID</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-blue-600 font-semibold flex items-center gap-1">
                    <Phone size={12} />
                    {complaint.citizenPhone || '+91 98765 43210'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1.5 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Citizen Problem Description
                </span>
                <p className="text-slate-800 leading-relaxed text-xs">
                  {complaint.description || 'Pavement defect detected near busy intersection causing vehicular slowing.'}
                </p>
              </div>

              {/* Assigned Crew Info */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <HardHat size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-900 uppercase">Assigned Unit</span>
                    <p className="font-extrabold text-blue-950 text-xs">
                      {complaint.assignedEngineer || complaint.assignedSquad || 'Unassigned — Pending Crew Dispatch'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('actions')}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700"
                >
                  Manage
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VIEW LOCATION */}
          {activeTab === 'location' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Geospatial GIS Location</h4>
                <p className="text-slate-500 text-xs">{complaint.location} • {complaint.ward}</p>
                <p className="font-mono text-[11px] text-slate-400">GPS: [{coords.join(', ')}]</p>
              </div>

              {/* Leaflet Mini Map Container */}
              <div
                ref={mapContainerRef}
                className="w-full h-64 rounded-2xl border border-slate-300 overflow-hidden shadow-inner relative z-0"
              />

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <p className="font-bold text-slate-800">Geographic Context:</p>
                <p className="text-slate-600">Arterial corridor transit zone with peak hourly traffic density.</p>
              </div>
            </div>
          )}

          {/* TAB 3: VIEW AI DETECTION */}
          {activeTab === 'ai' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Sparkles size={16} className="text-blue-600" />
                    YOLOv8 Automated Defect Analysis
                  </h4>
                  <p className="text-slate-500 text-xs">Computer Vision object detection & pavement metrics</p>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Confidence: {complaint.aiConfidence || '96.2%'}
                </span>
              </div>

              {/* Vision Inspection Frame */}
              <div className="h-56 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden flex items-center justify-center text-white">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-900/60 to-black/80 pointer-events-none" />
                <div className="text-center z-10 p-4 space-y-1">
                  <AlertTriangle size={32} className="text-amber-400 mx-auto" />
                  <p className="font-bold text-sm text-slate-200">
                    Defect Ingestion Frame: {complaint.damageType}
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-sm">
                    {complaint.description || 'Pothole depression detected from vehicle vision stream'}
                  </p>
                </div>

                {/* Bounding box simulation */}
                <div
                  className="absolute border-2 border-red-500 bg-red-500/20 rounded-md flex flex-col justify-between p-1 pointer-events-none animate-pulse"
                  style={{ top: '22%', left: '26%', width: '48%', height: '56%' }}
                >
                  <span className="text-[9px] font-mono bg-red-600 text-white px-1 py-0.2 rounded-xs w-fit font-bold">
                    {complaint.damageType.toUpperCase()} [{complaint.aiConfidence || '96%'}]
                  </span>
                </div>
              </div>

              {/* Estimated Physical Dimensions */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Est. Depth</span>
                  <span className="font-extrabold text-sm text-slate-900">12.5 cm</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Est. Width</span>
                  <span className="font-extrabold text-sm text-slate-900">48 cm</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Surface Area</span>
                  <span className="font-extrabold text-sm text-slate-900">0.52 m²</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VIEW PRIORITY SCORE */}
          {activeTab === 'priority' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <PriorityScoreBreakdown complaint={complaint} showFormulaHeader={true} />
            </div>
          )}

          {/* TAB 5: ASSIGN ENGINEER & CHANGE STATUS */}
          {activeTab === 'actions' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              {/* Section 1: Change Status */}
              <form onSubmit={handleStatusSubmit} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <RefreshCw size={14} className="text-blue-600" />
                    Change Complaint Status
                  </h4>
                  {statusSuccess && (
                    <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      Updated!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Pending', 'In Progress', 'Scheduled', 'Resolved'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedStatus(s)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                        selectedStatus.toLowerCase() === s.toLowerCase()
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Save Status
                  </button>
                </div>
              </form>

              {/* Section 2: Assign Engineer */}
              <form onSubmit={handleAssignSubmit} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <HardHat size={14} className="text-blue-600" />
                    Assign Municipal Engineer / Squad
                  </h4>
                  {assignSuccess && (
                    <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      Squad Assigned!
                    </span>
                  )}
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {ENGINEERS_AND_SQUADS.map((unit, idx) => (
                    <div
                      key={unit.squad}
                      onClick={() => setSelectedSquadIdx(idx)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                        selectedSquadIdx === idx
                          ? 'border-blue-600 bg-blue-50/80 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <p className="font-extrabold text-slate-900">{unit.squad}</p>
                        <p className="text-[11px] text-slate-500">Lead: {unit.lead} • {unit.zone}</p>
                      </div>
                      <span className="font-mono text-[10px] text-blue-600">{unit.phone}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Target Date</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Directives</label>
                    <input
                      type="text"
                      value={dispatchNote}
                      onChange={(e) => setDispatchNote(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Send size={13} />
                    Confirm Crew Assignment
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ── Drawer Footer ───────────────────────────────────────────────── */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close Drawer
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('actions')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send size={13} />
              Take Action
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
