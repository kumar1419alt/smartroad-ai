/**
 * RepairKanbanBoard.jsx — Visual Kanban Board for Admin Repair Management.
 *
 * Columns:
 *  1. Assigned
 *  2. In Progress
 *  3. Resolved
 *
 * Cards show:
 *  - Complaint ID
 *  - Damage
 *  - Location
 *  - SRPS
 *  - Engineer
 */

import React, { useState, useMemo } from 'react'
import {
  Flame,
  AlertTriangle,
  HardHat,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Layers,
  Search,
  Filter,
} from 'lucide-react'

export default function RepairKanbanBoard({
  repairs = [],
  onSelectRepair,
  onMoveStage,
}) {
  const [search, setSearch] = useState('')

  // Filter repairs
  const filtered = useMemo(() => {
    if (!search.trim()) return repairs
    const q = search.trim().toLowerCase()
    return repairs.filter(
      (r) =>
        r.complaintId?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q) ||
        r.damageType?.toLowerCase().includes(q) ||
        r.engineer?.toLowerCase().includes(q) ||
        r.squad?.toLowerCase().includes(q)
    )
  }, [repairs, search])

  // Group by Kanban columns
  const assignedList   = filtered.filter((r) => r.status === 'Assigned')
  const inProgressList = filtered.filter((r) => r.status === 'In Progress')
  const resolvedList   = filtered.filter((r) => r.status === 'Resolved')

  const columns = [
    {
      id: 'Assigned',
      title: 'Assigned',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      headerBg: 'bg-amber-50/70 border-amber-200',
      items: assignedList,
      icon: Clock,
      nextStage: 'In Progress',
      nextLabel: 'Start Work',
    },
    {
      id: 'In Progress',
      title: 'In Progress',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      headerBg: 'bg-blue-50/70 border-blue-200',
      items: inProgressList,
      icon: HardHat,
      prevStage: 'Assigned',
      prevLabel: 'Revert',
      nextStage: 'Resolved',
      nextLabel: 'Resolve',
    },
    {
      id: 'Resolved',
      title: 'Resolved',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      headerBg: 'bg-emerald-50/70 border-emerald-200',
      items: resolvedList,
      icon: CheckCircle2,
      prevStage: 'In Progress',
      prevLabel: 'Reopen',
    },
  ]

  // Severity color tokens
  const getSeverityPill = (sev) => {
    const s = (sev || 'medium').toLowerCase()
    if (s === 'critical') return 'bg-red-50 text-red-700 border-red-200'
    if (s === 'high') return 'bg-orange-50 text-orange-700 border-orange-200'
    if (s === 'medium') return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter Kanban cards by ID, street, engineer..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <span>{filtered.length} Work Orders Across 3 Stages</span>
        </div>
      </div>

      {/* ── Kanban Columns Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {columns.map((col) => {
          const HeaderIcon = col.icon
          return (
            <div
              key={col.id}
              className="bg-slate-100/80 rounded-3xl border border-slate-200/90 p-4 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className={`p-3.5 rounded-2xl border ${col.headerBg} flex items-center justify-between mb-4 shadow-xs`}>
                <div className="flex items-center gap-2">
                  <HeaderIcon size={16} className="text-slate-700" />
                  <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">{col.title}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${col.badgeClass}`}>
                  {col.items.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3.5 flex-1">
                {col.items.length === 0 ? (
                  <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-xs">
                    <span className="font-semibold">No work orders in {col.title}</span>
                  </div>
                ) : (
                  col.items.map((card) => {
                    const score = card.srps || 75
                    return (
                      <div
                        key={card.id}
                        onClick={() => onSelectRepair?.(card)}
                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-150 cursor-pointer space-y-3 group"
                      >
                        {/* 1. Header: Complaint ID & Damage */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {card.complaintId}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {card.id}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="inline-block px-2 py-0.5 bg-slate-100 rounded-md text-[11px] font-bold text-slate-800">
                              {card.damageType}
                            </span>
                          </div>
                        </div>

                        {/* 2. Location */}
                        <div className="space-y-0.5">
                          <p className="font-bold text-xs text-slate-900 line-clamp-1 flex items-start gap-1" title={card.location}>
                            <MapPin size={12} className="text-blue-600 shrink-0 mt-0.5" />
                            <span>{card.location}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 pl-4">{card.ward}</p>
                        </div>

                        {/* 3. SRPS Urgency Score */}
                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <Flame size={12} className="text-red-500" />
                            SRPS Score:
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-sm text-slate-900">{score}</span>
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-sm border ${getSeverityPill(card.severity)}`}>
                              {card.severity}
                            </span>
                          </div>
                        </div>

                        {/* 4. Engineer */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <HardHat size={13} className="text-blue-600 shrink-0" />
                            <div className="truncate">
                              <span className="font-extrabold text-slate-800 block text-[11px] truncate">{card.engineer}</span>
                              <span className="text-[10px] text-slate-400 block truncate">{card.squad}</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick stage move buttons */}
                        <div
                          className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {col.prevStage && (
                            <button
                              onClick={() => onMoveStage?.(card.id, col.prevStage)}
                              className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center gap-0.5"
                              title={`Move back to ${col.prevStage}`}
                            >
                              <ArrowLeft size={10} />
                              {col.prevLabel}
                            </button>
                          )}

                          {col.nextStage && (
                            <button
                              onClick={() => onMoveStage?.(card.id, col.nextStage)}
                              className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-0.5"
                              title={`Advance to ${col.nextStage}`}
                            >
                              <span>{col.nextLabel}</span>
                              <ArrowRight size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
