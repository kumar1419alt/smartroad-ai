/**
 * AdminComplaintsPage.jsx — Route: /admin/complaints
 *
 * Full Complaints Management Registry for Municipal Administrators.
 *
 * Features:
 *  - Searchable complaints table
 *  - Multi-attribute filters (Status, Severity, Damage Type, Ward)
 *  - Sorting (ID, Submitted Date, Severity, SRPS, Status)
 *  - Pagination (page size, prev/next, page numbering)
 *  - Status badges, Severity badges, Priority badges
 *
 * Columns:
 *  1. ID
 *  2. Image
 *  3. Damage
 *  4. Location
 *  5. Severity
 *  6. SRPS
 *  7. Citizen
 *  8. Submitted
 *  9. Status
 *  10. Assigned Engineer
 *  11. Action
 *
 * Clicking a complaint opens <ComplaintDetailDrawer> where Admin can:
 *  - review complaint
 *  - assign engineer
 *  - change status
 *  - view location on GIS map
 *  - view AI detection
 *  - view priority score
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  AlertTriangle,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Send,
  HardHat,
  RefreshCw,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  Flame,
  MapPin,
  Calendar,
  User,
  ThumbsUp,
  Layers,
} from 'lucide-react'

import { adminService } from '../../services/adminService'
import ComplaintDetailDrawer from '../../components/admin/complaints/ComplaintDetailDrawer'
import { StatusBadge, PriorityBadge } from '../../components/ui'
import { useToast } from '../../contexts/ToastContext'

export default function AdminComplaintsPage() {
  const toast = useToast()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [damageFilter, setDamageFilter] = useState('all')
  const [wardFilter, setWardFilter] = useState('all')

  // Sorting state
  const [sortField, setSortField] = useState('date') // 'date' | 'srps' | 'id' | 'severity' | 'status'
  const [sortAsc, setSortAsc] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)

  // Selected complaint for drawer
  const [selectedComplaint, setSelectedComplaint] = useState(null)

  // Load complaints
  const loadData = async () => {
    setLoading(true)
    const data = await adminService.getComplaints()
    setComplaints(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Unique wards & damage types
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

  // Filter & Sort
  const filteredAndSorted = useMemo(() => {
    let result = [...complaints]

    // Search query
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (c) =>
          c.id?.toLowerCase().includes(q) ||
          c.location?.toLowerCase().includes(q) ||
          c.ward?.toLowerCase().includes(q) ||
          c.damageType?.toLowerCase().includes(q) ||
          c.citizenName?.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((c) => (c.status || '').toLowerCase().includes(statusFilter.toLowerCase()))
    }

    // Severity filter
    if (severityFilter !== 'all') {
      result = result.filter((c) => (c.severity || '').toLowerCase() === severityFilter.toLowerCase())
    }

    // Damage filter
    if (damageFilter !== 'all') {
      result = result.filter((c) => (c.damageType || '').toLowerCase().includes(damageFilter.toLowerCase()))
    }

    // Ward filter
    if (wardFilter !== 'all') {
      result = result.filter((c) => c.ward === wardFilter)
    }

    // Sort
    result.sort((a, b) => {
      let valA, valB
      switch (sortField) {
        case 'srps':
          valA = a.srps || a.priority || 0
          valB = b.srps || b.priority || 0
          break
        case 'id':
          valA = a.id
          valB = b.id
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
        case 'severity': {
          const rank = { critical: 4, high: 3, medium: 2, low: 1 }
          valA = rank[(a.severity || '').toLowerCase()] || 0
          valB = rank[(b.severity || '').toLowerCase()] || 0
          break
        }
        case 'status':
          valA = a.status || ''
          valB = b.status || ''
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
        case 'date':
        default:
          valA = new Date(a.timestamp || a.submittedAt || a.date).getTime() || 0
          valB = new Date(b.timestamp || b.submittedAt || b.date).getTime() || 0
          break
      }
      return sortAsc ? valA - valB : valB - valA
    })

    return result
  }, [complaints, search, statusFilter, severityFilter, damageFilter, wardFilter, sortField, sortAsc])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize))
  const paginatedComplaints = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredAndSorted.slice(startIndex, startIndex + pageSize)
  }, [filteredAndSorted, currentPage, pageSize])

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, severityFilter, damageFilter, wardFilter])

  // Sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  // Update Status action
  const handleUpdateStatus = async (id, newStatus) => {
    await adminService.updateStatus(id, newStatus)
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    )
    if (selectedComplaint?.id === id) {
      setSelectedComplaint((prev) => ({ ...prev, status: newStatus }))
    }
    toast.success(`Complaint ${id} status updated to "${newStatus}"`)
  }

  // Assign Engineer action
  const handleAssignEngineer = async (id, payload) => {
    await adminService.assignEngineer(id, payload)
    const squadName = payload.assignedSquad || payload.assignedEngineer || 'Field Squad'
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              assignedSquad: payload.assignedSquad,
              assignedEngineer: payload.assignedEngineer,
              estimatedFix: payload.targetDate,
              status: 'In Progress',
            }
          : c
      )
    )
    if (selectedComplaint?.id === id) {
      setSelectedComplaint((prev) => ({
        ...prev,
        assignedSquad: payload.assignedSquad,
        assignedEngineer: payload.assignedEngineer,
        estimatedFix: payload.targetDate,
        status: 'In Progress',
      }))
    }
    toast.success(`Dispatched ${squadName} to complaint ${id}`)
  }

  // Badges helpers
  const getSeverityBadge = (sev) => {
    const s = (sev || 'medium').toLowerCase()
    if (s === 'critical') return 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-400/20'
    if (s === 'high') return 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-400/20'
    if (s === 'medium') return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-400/20'
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-400/20'
  }

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase()
    if (s.includes('resolved')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (s.includes('progress')) return 'bg-blue-50 text-blue-700 border-blue-200'
    if (s.includes('scheduled')) return 'bg-purple-50 text-purple-700 border-purple-200'
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }

  const getPriorityBadge = (lvl) => {
    if (lvl === 'Critical') return 'bg-red-100 text-red-800 border-red-200 font-extrabold'
    if (lvl === 'High') return 'bg-orange-100 text-orange-800 border-orange-200 font-extrabold'
    if (lvl === 'Medium') return 'bg-amber-100 text-amber-800 border-amber-200 font-bold'
    return 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold'
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle size={28} className="text-blue-600" />
              Complaints Management Registry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              FastAPI Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete administrative control over citizen road damage complaints, triage, engineer dispatches, and SLA monitoring
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filter Controls ─────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Complaint ID, citizen, street address, ward..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
            />
          </div>

          {/* Quick Clear */}
          {(search || statusFilter !== 'all' || severityFilter !== 'all' || damageFilter !== 'all' || wardFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
                setSeverityFilter('all')
                setDamageFilter('all')
                setWardFilter('all')
              }}
              className="text-xs font-semibold text-red-600 hover:underline px-2"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-slate-100">
          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="scheduled">Scheduled</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Damage Type */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Damage Type</label>
            <select
              value={damageFilter}
              onChange={(e) => setDamageFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Damage Types</option>
              {availableDamageTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Ward */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Ward Area</label>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:ring-2 focus:ring-blue-500 truncate"
            >
              <option value="all">All Pune Wards</option>
              {availableWards.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── 11-Column Complaints Table ────────────────────────────────────── */}
      <section aria-label="Complaints Data Registry" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900">Registered Road Issues</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {filteredAndSorted.length} Total
            </span>
          </div>

          {/* Page size picker */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
            >
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" aria-label="Municipal complaints table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 select-none">
                {/* 1. ID */}
                <th
                  onClick={() => handleSort('id')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>

                {/* 2. Image */}
                <th className="py-3.5 px-3">Image</th>

                {/* 3. Damage */}
                <th className="py-3.5 px-3">Damage</th>

                {/* 4. Location */}
                <th className="py-3.5 px-4">Location</th>

                {/* 5. Severity */}
                <th
                  onClick={() => handleSort('severity')}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Severity</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>

                {/* 6. SRPS */}
                <th
                  onClick={() => handleSort('srps')}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1 text-slate-900 font-extrabold">
                    <Flame size={12} className="text-red-500" />
                    <span>SRPS</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>

                {/* 7. Citizen */}
                <th className="py-3.5 px-3">Citizen</th>

                {/* 8. Submitted */}
                <th
                  onClick={() => handleSort('date')}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Submitted</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>

                {/* 9. Status */}
                <th
                  onClick={() => handleSort('status')}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>

                {/* 10. Assigned Engineer */}
                <th className="py-3.5 px-4">Assigned Engineer</th>

                {/* 11. Action */}
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedComplaints.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Filter size={24} className="text-slate-300" />
                      <p className="font-bold text-slate-700">No matching complaints found</p>
                      <p className="text-[11px]">Adjust your search query or reset filter dropdowns.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedComplaints.map((item) => {
                  const score = item.srps || item.priority || 70
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedComplaint(item)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors duration-150 group"
                    >
                      {/* 1. ID */}
                      <td className="py-3 px-4 font-mono font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.id}
                      </td>

                      {/* 2. Image */}
                      <td className="py-3 px-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center text-amber-400 shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.damageType} className="w-full h-full object-cover" />
                          ) : (
                            <AlertTriangle size={16} />
                          )}
                        </div>
                      </td>

                      {/* 3. Damage */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md inline-block whitespace-nowrap">
                          {item.damageType}
                        </span>
                      </td>

                      {/* 4. Location */}
                      <td className="py-3 px-4">
                        <div className="max-w-[190px]">
                          <p className="font-medium text-slate-900 line-clamp-1" title={item.location}>
                            {item.location}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                            <MapPin size={9} className="text-slate-400 shrink-0" />
                            {item.ward || 'Central Ward'}
                          </p>
                        </div>
                      </td>

                      {/* 5. Severity */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getSeverityBadge(
                            item.severity
                          )}`}
                        >
                          {item.severity}
                        </span>
                      </td>

                      {/* 6. SRPS */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <span className="font-black text-slate-900 text-xs">{score}</span>
                          <span className={`block text-[9px] uppercase px-1 py-0.2 rounded-xs border w-fit ${getPriorityBadge(item.priorityLevel || (score >= 85 ? 'Critical' : score >= 70 ? 'High' : 'Medium'))}`}>
                            {item.priorityLevel || (score >= 85 ? 'Critical' : 'High')}
                          </span>
                        </div>
                      </td>

                      {/* 7. Citizen */}
                      <td className="py-3 px-3">
                        <div>
                          <p className="font-bold text-slate-800 flex items-center gap-1">
                            <User size={11} className="text-blue-500" />
                            {item.citizenName || 'Priya Verma'}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">{item.citizenPhone || '+91 98...42'}</p>
                        </div>
                      </td>

                      {/* 8. Submitted */}
                      <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-slate-400" />
                          {item.date || '12 Oct 2026'}
                        </span>
                      </td>

                      {/* 9. Status */}
                      <td className="py-3 px-3">
                        <StatusBadge status={item.status || 'Pending'} size="xs" />
                      </td>

                      {/* 10. Assigned Engineer */}
                      <td className="py-3 px-4">
                        <div className="max-w-[170px]">
                          {item.assignedSquad || item.assignedEngineer ? (
                            <span className="font-bold text-blue-900 text-[11px] line-clamp-1 flex items-center gap-1">
                              <HardHat size={11} className="text-blue-600 shrink-0" />
                              {item.assignedSquad || item.assignedEngineer}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                              Unassigned
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 11. Action */}
                      <td className="py-3 px-4 text-right">
                        <div
                          className="inline-flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setSelectedComplaint(item)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 transition-colors inline-flex items-center gap-1"
                            title="Review complaint details"
                          >
                            <Eye size={12} />
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer & Pagination ────────────────────────────────────── */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{paginatedComplaints.length}</strong> of{' '}
            <strong className="text-slate-800">{filteredAndSorted.length}</strong> records (Page{' '}
            <strong className="text-slate-800">{currentPage}</strong> of{' '}
            <strong className="text-slate-800">{totalPages}</strong>)
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Drawer Component ──────────────────────────────────────────────── */}
      <ComplaintDetailDrawer
        isOpen={Boolean(selectedComplaint)}
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onUpdateStatus={handleUpdateStatus}
        onAssignEngineer={handleAssignEngineer}
      />
    </div>
  )
}
