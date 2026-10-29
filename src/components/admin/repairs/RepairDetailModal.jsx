/**
 * RepairDetailModal.jsx — Comprehensive Repair Detail View for Admins.
 *
 * Capabilities:
 *  - Assign engineer & squad unit
 *  - Change repair status (Assigned → In Progress → Resolved)
 *  - View BEFORE image (road defect with damage annotation)
 *  - View AFTER image (resurfaced asphalt & quality verification)
 *  - Material allocations & equipment specifications
 */

import React, { useState, useEffect } from 'react'
import {
  X,
  HardHat,
  RefreshCw,
  Calendar,
  Wrench,
  Truck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Flame,
  Send,
  Eye,
  ArrowRight,
  ShieldCheck,
  Maximize2,
  Users,
} from 'lucide-react'

const ENGINEERS_AND_SQUADS = [
  { squad: 'PMC Rapid Response Team #4', lead: 'Vikram Joshi', phone: '+91 98230 11442', zone: 'Shivajinagar - Deccan (Ward 14)' },
  { squad: 'Ward 10 Pavement Unit', lead: 'Ramesh Kumar', phone: '+91 98111 54321', zone: 'SB Road / Model Colony' },
  { squad: 'MIDC / PMC Joint Repair Crew', lead: 'Ananya Deshmukh', phone: '+91 98901 33221', zone: 'Hinjewadi IT Corridor' },
  { squad: 'Zone-3 Maintenance Wing', lead: 'Sunil Shinde', phone: '+91 98224 88771', zone: 'Aundh - Baner (Ward 8)' },
  { squad: 'Central City Highways Wing', lead: 'Prakash Patil', phone: '+91 98450 66554', zone: 'Swargate - Tilak Road' },
  { squad: 'Hadapsar Ward Division', lead: 'Amit Kulkarni', phone: '+91 98670 99881', zone: 'Hadapsar - Mundhwa' },
]

export default function RepairDetailModal({
  repair,
  isOpen,
  onClose,
  onUpdateRepair,
}) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen || !repair) return null

  // Tab: 'overview' | 'before_after' | 'assign' | 'status'
  const [activeTab, setActiveTab] = useState('overview')
  const [imageComparisonMode, setImageComparisonMode] = useState('side_by_side') // 'side_by_side' | 'before' | 'after'

  // Editable fields
  const [currentStatus, setCurrentStatus] = useState(repair.status || 'Assigned')
  const [selectedSquad, setSelectedSquad] = useState(repair.squad || ENGINEERS_AND_SQUADS[0].squad)
  const [selectedEngineer, setSelectedEngineer] = useState(repair.engineer || ENGINEERS_AND_SQUADS[0].lead)
  const [targetCompletionDate, setTargetCompletionDate] = useState(
    repair.completionDate?.replace(' (Target)', '').replace(' (Completed)', '') || '2026-10-18'
  )
  const [repairNotes, setRepairNotes] = useState(repair.notes || '')
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Handle engineer selection change
  const handleSquadSelect = (unit) => {
    setSelectedSquad(unit.squad)
    setSelectedEngineer(unit.lead)
  }

  // Handle Save
  const handleSaveAll = (e) => {
    e.preventDefault()
    onUpdateRepair?.(repair.id, {
      status: currentStatus,
      squad: selectedSquad,
      engineer: selectedEngineer,
      completionDate:
        currentStatus === 'Resolved'
          ? `${targetCompletionDate} (Completed)`
          : `${targetCompletionDate} (Target)`,
      notes: repairNotes,
    })
    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      onClose()
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-[2000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* ── Top Header ──────────────────────────────────────────────────── */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {repair.id}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                Ref: {repair.complaintId}
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                  repair.status === 'Resolved'
                    ? 'bg-emerald-500 text-white'
                    : repair.status === 'In Progress'
                    ? 'bg-blue-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                {currentStatus}
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white">
              {repair.damageType} — {repair.location}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <MapPin size={12} className="text-blue-400" />
              {repair.ward} • Assigned Date: {repair.assignedDate}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Tabs Bar ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-200 bg-slate-50 text-xs shrink-0 overflow-x-auto">
          {[
            { id: 'overview',     label: 'Work Order Details' },
            { id: 'before_after', label: 'Before & After Images' },
            { id: 'assign',       label: 'Assign Engineer & Squad' },
            { id: 'status',       label: 'Change Status' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 font-bold rounded-t-xl transition-colors whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Body Content ────────────────────────────────────────────────── */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-100">
              {/* Quick KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">SRPS Urgency</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-black text-slate-900">{repair.srps}</span>
                    <span className="text-slate-400 text-xs">/100</span>
                  </div>
                  <span className="text-[10px] font-bold text-red-600 uppercase">{repair.priorityLevel} Tier</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Status</span>
                  <span className="text-sm font-extrabold text-blue-600 mt-1 block">{currentStatus}</span>
                  <span className="text-[10px] text-slate-500">{repair.qualityCheck || 'On Schedule'}</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Supervising Lead</span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block truncate">{selectedEngineer}</span>
                  <span className="text-[10px] text-slate-500 truncate block">{selectedSquad}</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Completion</span>
                  <span className="text-xs font-extrabold text-emerald-700 mt-1 block">{repair.completionDate}</span>
                  <span className="text-[10px] text-slate-500">Crew Size: {repair.crewSize || 6}</span>
                </div>
              </div>

              {/* Material Allocation & Equipment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center gap-1">
                    <Wrench size={12} className="text-blue-600" />
                    Allocated Asphalt & Materials
                  </span>
                  <p className="font-extrabold text-slate-900 text-xs">
                    {repair.materials || 'Hot Mix Asphalt (2.5 tonnes) + Bitumen Primer'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center gap-1">
                    <Truck size={12} className="text-blue-600" />
                    Deployed Heavy Equipment
                  </span>
                  <p className="font-extrabold text-slate-900 text-xs">
                    {repair.equipment || 'Cold Planer, Vibratory Roller'}
                  </p>
                </div>
              </div>

              {/* Engineering Directives */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1.5 shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Repair Execution Directives
                </span>
                <p className="text-slate-800 leading-relaxed text-xs">
                  {repair.notes || 'Cold-plane damaged surface course, spray bitumen emulsion tack coat, and compact hot mix asphalt in two lifts.'}
                </p>
              </div>

              {/* Quick Jump to Before/After */}
              <div
                onClick={() => setActiveTab('before_after')}
                className="p-3.5 bg-blue-50/70 hover:bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Eye size={16} />
                  </span>
                  <div>
                    <p className="font-extrabold text-blue-950 text-xs">View Before & After Quality Imagery</p>
                    <p className="text-[11px] text-blue-700">Inspect road surface condition comparison and quality certificate</p>
                  </div>
                </div>
                <ArrowRight size={15} className="text-blue-600" />
              </div>
            </div>
          )}

          {/* TAB 2: BEFORE & AFTER IMAGES */}
          {activeTab === 'before_after' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Road Surface Pavement Inspection</h4>
                  <p className="text-slate-500 text-xs">High-resolution photographic evidence before and after repair execution</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {['side_by_side', 'before', 'after'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setImageComparisonMode(mode)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg capitalize transition-colors ${
                        imageComparisonMode === mode
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {mode.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Imagery Layout */}
              <div className={`grid gap-4 ${imageComparisonMode === 'side_by_side' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {/* Before Image Card */}
                {(imageComparisonMode === 'side_by_side' || imageComparisonMode === 'before') && (
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden text-white flex flex-col shadow-md">
                    <div className="p-3 bg-red-950/80 border-b border-red-900/60 flex items-center justify-between">
                      <span className="font-bold text-red-200 text-xs flex items-center gap-1.5">
                        <AlertTriangle size={13} className="text-red-400" />
                        BEFORE REPAIR — Reported Damage
                      </span>
                      <span className="font-mono text-[10px] text-red-300">
                        Recorded: {repair.assignedDate}
                      </span>
                    </div>

                    <div className="h-56 relative bg-slate-950 flex items-center justify-center overflow-hidden">
                      {repair.beforeImage ? (
                        <img
                          src={repair.beforeImage}
                          alt="Before repair defect"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <AlertTriangle size={32} className="text-amber-400 mx-auto" />
                          <p className="text-xs font-bold text-slate-300 mt-2">{repair.damageType}</p>
                          <p className="text-[10px] text-slate-500">Physical depth: 14cm crater</p>
                        </div>
                      )}

                      {/* Simulated Defect Bounding Annotation */}
                      <div
                        className="absolute border-2 border-red-500 bg-red-500/20 rounded-md p-1 pointer-events-none animate-pulse"
                        style={{ top: '22%', left: '26%', width: '48%', height: '54%' }}
                      >
                        <span className="text-[9px] font-mono bg-red-600 text-white px-1 py-0.2 rounded-xs font-black">
                          DEFECT ZONE: {repair.damageType.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 text-[11px] text-slate-300 bg-slate-950/90 border-t border-slate-800">
                      Structural crack perimeter & asphalt disintegration detected. High skidding hazard.
                    </div>
                  </div>
                )}

                {/* After Image Card */}
                {(imageComparisonMode === 'side_by_side' || imageComparisonMode === 'after') && (
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden text-white flex flex-col shadow-md">
                    <div className="p-3 bg-emerald-950/80 border-b border-emerald-900/60 flex items-center justify-between">
                      <span className="font-bold text-emerald-200 text-xs flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        AFTER REPAIR — Resurfaced & Verified
                      </span>
                      <span className="font-mono text-[10px] text-emerald-300">
                        {repair.status === 'Resolved' ? 'Verified 100%' : 'Target Quality Preview'}
                      </span>
                    </div>

                    <div className="h-56 relative bg-slate-950 flex items-center justify-center overflow-hidden">
                      {repair.afterImage ? (
                        <img
                          src={repair.afterImage}
                          alt="After repair asphalt"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
                          <p className="text-xs font-bold text-slate-300 mt-2">Smooth Asphalt Wearing Course</p>
                          <p className="text-[10px] text-slate-500">Compaction verified</p>
                        </div>
                      )}

                      {/* Verification Stamp Overlay */}
                      <div className="absolute bottom-3 right-3 bg-emerald-900/90 backdrop-blur-xs border border-emerald-500/50 text-emerald-200 px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-lg">
                        <ShieldCheck size={12} className="text-emerald-400" />
                        <span>Compaction Density Passed (98.2%)</span>
                      </div>
                    </div>

                    <div className="p-3 text-[11px] text-slate-300 bg-slate-950/90 border-t border-slate-800">
                      Hot mix overlay compacted flush with surrounding pavement. Reopened to full traffic flow.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ASSIGN ENGINEER & SQUAD */}
          {activeTab === 'assign' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Assign Supervising Officer & Squad</h4>
                <p className="text-slate-500 text-xs">Select municipal repair division and assign crew resource parameters</p>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {ENGINEERS_AND_SQUADS.map((unit) => (
                  <div
                    key={unit.squad}
                    onClick={() => handleSquadSelect(unit)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                      selectedSquad === unit.squad
                        ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600/30'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">{unit.squad}</p>
                      <p className="text-[11px] text-slate-500">
                        Lead: <span className="font-bold text-slate-800">{unit.lead}</span> • Zone: {unit.zone}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-blue-600 font-bold">{unit.phone}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Scheduled Completion Date
                  </label>
                  <input
                    type="date"
                    value={targetCompletionDate}
                    onChange={(e) => setTargetCompletionDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Supervising Engineer
                  </label>
                  <input
                    type="text"
                    value={selectedEngineer}
                    onChange={(e) => setSelectedEngineer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHANGE STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Update Repair Lifecycle Status</h4>
                <p className="text-slate-500 text-xs">
                  Transition this work order between the Kanban stages: Assigned &rarr; In Progress &rarr; Resolved
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    value: 'Assigned',
                    title: '1. Assigned',
                    desc: 'Work order issued, squad and equipment dispatched to schedule',
                    color: 'border-amber-200 bg-amber-50/60 text-amber-900',
                  },
                  {
                    value: 'In Progress',
                    title: '2. In Progress',
                    desc: 'Repair squad on-site, milling or asphalt compaction active',
                    color: 'border-blue-200 bg-blue-50/60 text-blue-900',
                  },
                  {
                    value: 'Resolved',
                    title: '3. Resolved',
                    desc: 'Resurfacing completed, compaction verified, road fully reopened',
                    color: 'border-emerald-200 bg-emerald-50/60 text-emerald-900',
                  },
                ].map((s) => (
                  <div
                    key={s.value}
                    onClick={() => setCurrentStatus(s.value)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      currentStatus === s.value
                        ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 block">{s.title}</span>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
                    </div>

                    {currentStatus === s.value && (
                      <span className="inline-block mt-3 px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px] w-fit">
                        Current Active State
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Status Transition Notes
                </label>
                <textarea
                  rows={2}
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  placeholder="Add notes about on-site execution or compaction results..."
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer ────────────────────────────────────────────────── */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={14} />
                Updated!
              </span>
            )}
            <button
              onClick={handleSaveAll}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send size={13} />
              Save Repair Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
