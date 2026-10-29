/**
 * AdminMapSidePanel.jsx — Dedicated GIS Issue Details Side Panel.
 *
 * Requirements:
 * When an issue is selected, open a side panel containing:
 *  - Image (AI defect inspection frame + bounding box)
 *  - Damage (Damage Type)
 *  - Severity (Badge)
 *  - SRPS (Score & tier gauge)
 *  - Location (Street address, Ward, Coordinates)
 *  - Status (Current repair lifecycle badge)
 *  - Complaint date (Reported date)
 *  - Assigned engineer (Squad / Lead)
 *  - Buttons:
 *      1. "Assign Engineer"
 *      2. "Change Status"
 *      3. "View Complaint"
 */

import React from 'react'
import {
  X,
  MapPin,
  Flame,
  AlertTriangle,
  HardHat,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Send,
  RefreshCw,
  Navigation,
  CheckCircle2,
  Clock,
  Car,
  Activity,
} from 'lucide-react'
import { FALLBACK_ROAD_IMAGE } from '../../../utils/helpers'

// Severity style mapping
const SEVERITY_THEME = {
  critical: { bg: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-400/30', border: 'border-red-500' },
  high:     { bg: 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-400/30', border: 'border-orange-500' },
  medium:   { bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-400/30', border: 'border-amber-500' },
  low:      { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-400/30', border: 'border-emerald-500' },
}

export default function AdminMapSidePanel({
  complaint,
  onClose,
  onAssignEngineer,
  onChangeStatus,
  onViewComplaint,
}) {
  if (!complaint) return null

  const score = complaint.priority ?? complaint.priorityScore ?? 75
  const sevKey = (complaint.severity || 'medium').toLowerCase()
  const sTheme = SEVERITY_THEME[sevKey] || SEVERITY_THEME.medium

  // Status theme
  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase()
    if (s.includes('resolved')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (s.includes('progress')) return 'bg-blue-50 text-blue-700 border-blue-200'
    if (s.includes('scheduled')) return 'bg-purple-50 text-purple-700 border-purple-200'
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }

  return (
    <aside
      className="absolute top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white border-l border-slate-200 shadow-2xl z-[1001] flex flex-col animate-in slide-in-from-right duration-200"
      aria-label="Selected Issue Details Side Panel"
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
            {complaint.id}
          </span>
          <span className="text-xs font-bold text-slate-300">GIS Selected Incident</span>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          aria-label="Close side panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Scrollable Body ─────────────────────────────────────────────── */}
      <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs">
        {/* 1. Road Image & AI Vision Frame */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Layers size={13} className="text-blue-600" />
              Road Damage Inspection Image
            </span>
            <span className="font-mono text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              CONF: {complaint.aiConfidence || '95.4%'}
            </span>
          </div>

          <div className="h-48 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden flex items-center justify-center text-white shadow-inner">
            {complaint.imageUrl ? (
              <img
                src={complaint.imageUrl}
                alt={complaint.damageType}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_ROAD_IMAGE
                }}
              />
            ) : (
              <>
                {/* Visual texture */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/80 pointer-events-none" />
                <div className="text-center z-10 p-4 space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-amber-400 shadow-sm">
                    <AlertTriangle size={24} />
                  </div>
                  <p className="font-bold text-sm text-white pt-1">{complaint.damageType}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-2 max-w-xs mx-auto">
                    {complaint.description || 'Pavement defect detected via mobile surveillance module'}
                  </p>
                </div>

                {/* Bounding Box Simulation */}
                <div
                  className="absolute border-2 border-red-500 bg-red-500/20 rounded-md flex flex-col justify-between p-1 pointer-events-none animate-pulse"
                  style={{ top: '20%', left: '22%', width: '56%', height: '58%' }}
                >
                  <span className="text-[9px] font-mono bg-red-600 text-white px-1 py-0.2 rounded-xs w-fit font-bold">
                    {complaint.damageType.toUpperCase()} [{complaint.aiConfidence || '95%'}]
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 2. Core Attributes: Damage & Severity */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Damage Type
            </span>
            <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
              {complaint.damageType}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Severity Level
            </span>
            <span
              className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${sTheme.bg}`}
            >
              {complaint.severity || 'Medium'}
            </span>
          </div>
        </div>

        {/* 3. SRPS Score Banner */}
        <div className="p-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
              <Flame size={14} className="text-red-400" />
              Smart Repair Priority Score (SRPS)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-white">
              Formula v2.4
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">{score}</span>
              <span className="text-slate-400 text-xs">/ 100</span>
            </div>
            <span
              className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg uppercase ${
                score >= 85
                  ? 'bg-red-500 text-white'
                  : score >= 70
                  ? 'bg-orange-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {score >= 85 ? 'Critical Tier' : score >= 70 ? 'High Urgency' : 'Standard Queue'}
            </span>
          </div>

          {/* Meter bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                score >= 85 ? 'bg-red-500' : score >= 70 ? 'bg-orange-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, score)}%` }}
            />
          </div>
        </div>

        {/* 4. Location Details */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Location & Geospatial Coordinates
          </span>

          <div className="space-y-1">
            <p className="font-bold text-slate-900 text-xs flex items-start gap-1.5">
              <MapPin size={14} className="text-blue-600 shrink-0 mt-0.5" />
              <span>{complaint.location}</span>
            </p>
            <p className="text-[11px] text-slate-500 pl-5">
              Ward: <span className="font-semibold text-slate-700">{complaint.ward || 'Central Municipal Ward'}</span>
            </p>
            <p className="text-[11px] font-mono text-slate-400 pl-5">
              GPS: [{complaint.coordinates ? complaint.coordinates.join(', ') : '18.5204, 73.8567'}]
            </p>
          </div>
        </div>

        {/* 5. Status & Complaint Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Repair Status
            </span>
            <span
              className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${getStatusBadge(
                complaint.status
              )}`}
            >
              {complaint.status || 'Pending'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Complaint Date
            </span>
            <p className="font-extrabold text-slate-900 text-xs mt-1 flex items-center gap-1">
              <Calendar size={12} className="text-slate-400" />
              {complaint.date || '12 Oct 2026'}
            </p>
          </div>
        </div>

        {/* 6. Assigned Engineer / Squad */}
        <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-start gap-2.5">
          <HardHat size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
              Assigned Repair Unit / Engineer
            </span>
            <p className="font-extrabold text-xs text-blue-950">
              {complaint.assignedEngineer || complaint.assignedSquad || 'Unassigned — Awaiting Dispatch'}
            </p>
            <p className="text-[10px] text-blue-700">
              Estimated Resolution: {complaint.estimatedFix || 'Within 48 hours'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer Action Buttons ───────────────────────────────────────── */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Button 1: Assign Engineer */}
          <button
            onClick={() => onAssignEngineer?.(complaint)}
            className="w-full px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <HardHat size={14} />
            Assign Engineer
          </button>

          {/* Button 2: Change Status */}
          <button
            onClick={() => onChangeStatus?.(complaint)}
            className="w-full px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw size={13} />
            Change Status
          </button>
        </div>

        {/* Button 3: View Complaint */}
        <button
          onClick={() => onViewComplaint?.(complaint)}
          className="w-full px-3 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
        >
          <ExternalLink size={13} />
          View Complete Complaint Analysis
        </button>
      </div>
    </aside>
  )
}
