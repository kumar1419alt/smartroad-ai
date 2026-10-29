/**
 * AdminRepairsPage.jsx — Route: /admin/repairs
 *
 * Admin Repair Management Portal.
 *
 * Features:
 *  - Visual Kanban Board with 3 stages: Assigned, In Progress, Resolved
 *  - Cards displaying: Complaint ID, Damage, Location, SRPS, Engineer
 *  - Full Table / List view showing: Assigned repairs, engineer, road location,
 *    damage, priority, status, assignment date, completion date
 *  - Repair Detail View (<RepairDetailModal>) allowing Admin to:
 *      1. Assign engineer / squad
 *      2. Change status
 *      3. View Before image (defect annotation & structural dimensions)
 *      4. View After image (resurfaced asphalt & quality certificate)
 *  - State persistence in localStorage
 */

import React, { useState, useEffect } from 'react'
import {
  Wrench,
  Kanban,
  Table as TableIcon,
  HardHat,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  Clock,
  Flame,
  MapPin,
  Calendar,
  Eye,
  Filter,
  Download,
  AlertTriangle,
} from 'lucide-react'

import { initialMockRepairs } from '../../data/mockRepairs'
import RepairKanbanBoard from '../../components/admin/repairs/RepairKanbanBoard'
import RepairDetailModal from '../../components/admin/repairs/RepairDetailModal'
import { useToast } from '../../contexts/ToastContext'

const REPAIRS_STORAGE_KEY = 'rds_admin_repairs_data'

export default function AdminRepairsPage() {
  const toast = useToast()
  const [repairs, setRepairs] = useState([])
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' | 'table'
  const [selectedRepair, setSelectedRepair] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load from storage or default mock
  const loadData = () => {
    setIsRefreshing(true)
    try {
      const raw = localStorage.getItem(REPAIRS_STORAGE_KEY)
      if (raw) {
        setRepairs(JSON.parse(raw))
      } else {
        setRepairs(initialMockRepairs)
        localStorage.setItem(REPAIRS_STORAGE_KEY, JSON.stringify(initialMockRepairs))
      }
    } catch (err) {
      setRepairs(initialMockRepairs)
    }
    setTimeout(() => setIsRefreshing(false), 300)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Persist updates
  const saveRepairs = (updatedList) => {
    setRepairs(updatedList)
    localStorage.setItem(REPAIRS_STORAGE_KEY, JSON.stringify(updatedList))
  }

  // Update repair item
  const handleUpdateRepair = (id, patch) => {
    const updated = repairs.map((r) => (r.id === id ? { ...r, ...patch } : r))
    saveRepairs(updated)
    if (selectedRepair?.id === id) {
      setSelectedRepair((prev) => ({ ...prev, ...patch }))
    }
  }

  // Move stage directly from Kanban card
  const handleMoveStage = (id, newStage) => {
    const dateStamp =
      newStage === 'Resolved'
        ? new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : newStage === 'In Progress'
        ? 'Active Today'
        : 'Scheduled Target'

    const updated = repairs.map((r) =>
      r.id === id ? { ...r, status: newStage, completionDate: dateStamp } : r
    )
    saveRepairs(updated)
    if (selectedRepair?.id === id) {
      setSelectedRepair((prev) => ({ ...prev, status: newStage, completionDate: dateStamp }))
    }
    toast.success(`Moved repair ${id} to "${newStage}"`)
  }

  // Summary counts
  const counts = {
    total: repairs.length,
    assigned: repairs.filter((r) => r.status === 'Assigned').length,
    inProgress: repairs.filter((r) => r.status === 'In Progress').length,
    resolved: repairs.filter((r) => r.status === 'Resolved').length,
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Wrench size={28} className="text-emerald-600" />
              Repair Management & Field Work Orders
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Kanban Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track pavement repair stages from crew dispatch to hot-mix asphalt compaction and quality verification
          </p>
        </div>

        {/* View Switcher and Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Kanban vs Table Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban size={13} />
              <span>Kanban Board</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon size={13} />
              <span>Table View</span>
            </button>
          </div>

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs"
            title="Reload repairs"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Summary Counters Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Work Orders</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{counts.total}</p>
          <span className="text-[11px] text-slate-500">Across 6 Municipal Squads</span>
        </div>

        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Assigned / Queued</span>
          <p className="text-2xl font-black text-amber-900 mt-1">{counts.assigned}</p>
          <span className="text-[11px] text-amber-700">Scheduled for Repair</span>
        </div>

        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">In Progress</span>
          <p className="text-2xl font-black text-blue-900 mt-1">{counts.inProgress}</p>
          <span className="text-[11px] text-blue-700">Active On-Site Crews</span>
        </div>

        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Resolved</span>
          <p className="text-2xl font-black text-emerald-900 mt-1">{counts.resolved}</p>
          <span className="text-[11px] text-emerald-700">Verified & Reopened</span>
        </div>
      </div>

      {/* ── Main View: Kanban vs Table ────────────────────────────────────── */}
      {viewMode === 'kanban' ? (
        <RepairKanbanBoard
          repairs={repairs}
          onSelectRepair={(r) => setSelectedRepair(r)}
          onMoveStage={handleMoveStage}
        />
      ) : (
        /* ── Table View ── */
        <section aria-label="Repairs Table View" className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" aria-label="Assigned repairs table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 select-none">
                  <th className="py-3.5 px-4">Complaint ID / Order</th>
                  <th className="py-3.5 px-3">Damage</th>
                  <th className="py-3.5 px-4">Road Location</th>
                  <th className="py-3.5 px-3">Priority (SRPS)</th>
                  <th className="py-3.5 px-4">Supervising Engineer</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Assignment Date</th>
                  <th className="py-3.5 px-3">Completion Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {repairs.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedRepair(item)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors duration-150"
                  >
                    {/* Order & ID */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-extrabold text-slate-900 block">{item.complaintId}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.id}</span>
                    </td>

                    {/* Damage */}
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md inline-block whitespace-nowrap">
                        {item.damageType}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      <div className="max-w-[200px]">
                        <p className="font-medium text-slate-900 line-clamp-1">{item.location}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.ward}</p>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Flame size={12} className="text-red-500" />
                        <span className="font-black text-slate-900">{item.srps}</span>
                        <span className="text-[10px] text-slate-400">({item.priorityLevel})</span>
                      </div>
                    </td>

                    {/* Engineer */}
                    <td className="py-3.5 px-4">
                      <div className="max-w-[180px]">
                        <p className="font-extrabold text-slate-900 flex items-center gap-1">
                          <HardHat size={12} className="text-blue-600 shrink-0" />
                          <span className="truncate">{item.engineer}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{item.squad}</p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                          item.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Assignment Date */}
                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap font-medium">
                      {item.assignedDate}
                    </td>

                    {/* Completion Date */}
                    <td className="py-3.5 px-3 text-slate-800 font-bold whitespace-nowrap">
                      {item.completionDate}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRepair(item)
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye size={12} />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Repair Detail Modal ───────────────────────────────────────────── */}
      <RepairDetailModal
        isOpen={Boolean(selectedRepair)}
        repair={selectedRepair}
        onClose={() => setSelectedRepair(null)}
        onUpdateRepair={handleUpdateRepair}
      />
    </div>
  )
}
