/**
 * OfficerAssignmentCard.jsx — Displays designated municipal field repair officer & crew status.
 *
 * Shows:
 *  - Repair Officer profile (Ramesh Kumar)
 *  - Assigned PMC repair unit
 *  - Work Order ID & equipment dispatched
 *  - Resolution timeline & completion estimates
 */

import React from 'react'
import {
  HardHat,
  User,
  Truck,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  Wrench,
} from 'lucide-react'

export default function OfficerAssignmentCard({ complaint }) {
  const assignedName = complaint?.assignedEngineer || 'Er. Rajesh Kulkarni'
  const isAssigned = Boolean(complaint?.assignedEngineer)
  const initials = assignedName.split(' ').filter(p => !p.startsWith('Er.')).map(p => p[0]).join('').slice(0, 2) || 'RK'

  const officer = {
    name: assignedName,
    title: isAssigned ? 'Assigned Field Engineer / Repair Officer' : 'Supervising Field Officer (PMC)',
    department: complaint?.assignedSquad || 'Zone-C Rapid Pavement Unit, PMC',
    phone: '+91 98111 54321',
    email: 'engineer@smartroad.gov',
    badgeId: isAssigned ? 'PMC-ENG-082' : 'PMC-PENDING',
  }

  const workOrder = complaint?.workOrder || {
    id: `WO-PN-2026-${complaint?.id ? complaint.id.slice(-4) : '084'}`,
    crewSize: 6,
    equipment: 'Milling machine, Bitumen sprayer, 3-ton vibratory roller',
    materials: '1.8 tonnes Hot Mix Asphalt (VG-30 grade)',
    scheduledDate: complaint?.estimatedFix || 'Scheduled within 48 hrs',
  }

  const isResolved = (complaint?.status || '').toLowerCase().includes('resolved')
  const inProgress = (complaint?.status || '').toLowerCase().includes('progress')
  const progressPct = complaint?.repairProgress ?? (isResolved ? 100 : inProgress ? 40 : 0)

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HardHat size={18} className="text-emerald-600" />
            <span>Assigned Field Repair Team & Officer</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pune Municipal Corporation dispatch & resource allocation
          </p>
        </div>

        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
          {workOrder.id}
        </span>
      </div>

      {/* Live Repair Progress Bar */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-blue-900 flex items-center gap-1.5">
            <Wrench size={14} className="text-blue-600" />
            Live Repair Execution Progress
          </span>
          <span className="font-mono font-extrabold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
            {progressPct}%
          </span>
        </div>
        <div className="w-full bg-blue-200/60 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${progressPct >= 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          />
        </div>
        {complaint?.statusNote && (
          <p className="text-[11px] text-blue-800 font-medium pt-1">
            <strong>Latest Engineer Note:</strong> {complaint.statusNote}
          </p>
        )}
      </div>

      {/* Officer Profile Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">{officer.name}</h3>
              <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                {officer.badgeId}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">{officer.title}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{officer.department}</p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-2 text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <Phone size={12} className="text-slate-400" />
            {officer.phone}
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <Mail size={12} className="text-slate-400" />
            {officer.email}
          </span>
        </div>
      </div>

      {/* Dispatch Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Assigned Squad
          </span>
          <span className="font-bold text-slate-800 block text-xs">
            {complaint?.assignedSquad || 'PMC Rapid Response Team #4'}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Crew: {workOrder.crewSize} civil workers
          </span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Allocated Materials
          </span>
          <span className="font-bold text-slate-800 block text-xs truncate">
            {workOrder.materials}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5 truncate">
            {workOrder.equipment}
          </span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Resolution Milestone
          </span>
          <span className={`font-bold block text-xs ${isResolved ? 'text-emerald-700' : 'text-blue-700'}`}>
            {isResolved ? 'Completed & QC Verified' : `Target: ${workOrder.scheduledDate}`}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {isResolved ? 'Road opened to traffic' : inProgress ? 'Crews currently active' : 'Work order queued'}
          </span>
        </div>
      </div>
    </div>
  )
}
