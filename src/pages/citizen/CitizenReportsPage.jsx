/**
 * CitizenReportsPage.jsx — /citizen/reports
 *
 * Features:
 *   • Search by ID / location / damage type
 *   • Status, damage type, and severity filters
 *   • Sort by date / priority
 *   • Responsive: table on >= md, cards on mobile
 *   • Loading skeleton state (700ms simulated delay)
 *   • Empty state illustration
 *   • Pagination (client-side, 6 per page)
 *   • All rows/cards link to /citizen/reports/:id
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  PlusCircle,
  Search,
  SlidersHorizontal,
  FileX,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Calendar,
  BarChart3,
  AlertTriangle,
  X,
  RefreshCw,
} from 'lucide-react'
import StatusBadge from '../../components/citizen/StatusBadge'
import { getSavedComplaints } from '../../services/complaintService'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 6

const STATUS_OPTIONS = ['All', 'Pending', 'In Progress', 'Resolved']
const DAMAGE_TYPE_OPTIONS = [
  'All',
  'Pothole',
  'Pothole Cluster',
  'Deep Subsidence',
  'Manhole Subsidence',
  'Longitudinal Crack',
  'Edge Erosion',
  'Surface Rutting',
]
const SEVERITY_OPTIONS = ['All', 'critical', 'high', 'medium', 'low']
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Highest Priority', value: 'priority_desc' },
  { label: 'Lowest Priority', value: 'priority_asc' },
]

// ─── Severity chip ────────────────────────────────────────────────────────────

const SEVERITY_META = {
  critical: { label: 'Critical', cls: 'text-red-600 bg-red-50 border border-red-200' },
  high:     { label: 'High',     cls: 'text-orange-600 bg-orange-50 border border-orange-200' },
  medium:   { label: 'Medium',   cls: 'text-yellow-600 bg-yellow-50 border border-yellow-200' },
  low:      { label: 'Low',      cls: 'text-green-600 bg-green-50 border border-green-200' },
}

function SeverityChip({ severity }) {
  const meta = SEVERITY_META[severity?.toLowerCase()] ?? SEVERITY_META.medium
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${meta.cls}`}>
      {meta.label}
    </span>
  )
}

// ─── SRPS ring gauge ──────────────────────────────────────────────────────────

function SrpsScore({ score }) {
  const pct = Math.min(Math.max(Number(score) || 0, 0), 100)
  const strokeColor =
    pct >= 85 ? '#ef4444' : pct >= 65 ? '#f97316' : pct >= 45 ? '#eab308' : '#22c55e'
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8">
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="14" fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeDasharray={`${(pct / 100) * 88} 88`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-700">
          {pct}
        </span>
      </div>
    </div>
  )
}

// ─── Image thumbnail placeholder ─────────────────────────────────────────────

const THUMB_COLORS = {
  'Pothole':             'from-red-500 to-rose-600',
  'Pothole Cluster':     'from-red-600 to-orange-600',
  'Deep Subsidence':     'from-purple-600 to-indigo-600',
  'Manhole Subsidence':  'from-slate-500 to-slate-600',
  'Longitudinal Crack':  'from-amber-500 to-orange-500',
  'Edge Erosion':        'from-teal-500 to-cyan-600',
  'Surface Rutting':     'from-orange-500 to-amber-600',
}

function ImageThumb({ complaint }) {
  const gradient = THUMB_COLORS[complaint.damageType] ?? 'from-blue-500 to-indigo-600'
  return (
    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
      <AlertTriangle size={20} className="text-white opacity-90" />
    </div>
  )
}

// ─── Loading skeletons ────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100 animate-pulse">
      {[80, 56, 90, 150, 70, 60, 80, 80, 60].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-slate-200 rounded-lg" style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-3">
      <div className="flex gap-3">
        <div className="w-14 h-14 rounded-xl bg-slate-200 flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 bg-slate-200 rounded w-1/2" />
          <div className="h-3 bg-slate-200 rounded w-2/3" />
          <div className="h-3 bg-slate-200 rounded w-3/4" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-slate-200 rounded-full" />
        <div className="h-5 w-14 bg-slate-200 rounded-full" />
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
        <FileX size={36} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        {hasFilters ? 'No matching reports' : 'No reports yet'}
      </h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6">
        {hasFilters
          ? "Try adjusting your search or filter criteria."
          : "You haven't submitted any road damage reports yet. Help your community by reporting the first one!"}
      </p>
      {hasFilters ? (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
        >
          <RefreshCw size={14} />
          Clear Filters
        </button>
      ) : (
        <Link
          to="/citizen/report"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors"
        >
          <PlusCircle size={15} />
          Report Road Damage
        </Link>
      )}
    </div>
  )
}

// ─── Mobile card ─────────────────────────────────────────────────────────────

function ReportCard({ complaint }) {
  const navigate = useNavigate()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/citizen/reports/${complaint.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/citizen/reports/${complaint.id}`)}
      className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md p-4 cursor-pointer transition-all duration-200 group"
    >
      <div className="flex gap-3 mb-3">
        <ImageThumb complaint={complaint} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-bold text-blue-600 font-mono">{complaint.id}</span>
            <StatusBadge status={complaint.status} />
          </div>
          <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{complaint.damageType}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-slate-400 flex-shrink-0" />
            <p className="text-xs text-slate-500 truncate">{complaint.location}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <SeverityChip severity={complaint.severity} />
          <div className="flex items-center gap-1">
            <BarChart3 size={11} className="text-slate-400" />
            <span className="text-xs text-slate-500 font-semibold">SRPS {complaint.priority}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={11} className="text-slate-400" />
          <span className="text-xs text-slate-400">{complaint.date}</span>
          <ExternalLink size={11} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
        </div>
      </div>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2
  const start = Math.max(2, page - delta)
  const end   = Math.min(totalPages - 1, page + delta)

  pages.push(1)
  if (start > 2) pages.push('…')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < totalPages - 1) pages.push('…')
  if (totalPages > 1) pages.push(totalPages)

  const from = Math.min((page - 1) * pageSize + 1, total)
  const to   = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
      <p className="text-xs text-slate-500">
        Showing <span className="font-semibold text-slate-700">{from}–{to}</span> of{' '}
        <span className="font-semibold text-slate-700">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} className="text-slate-600" />
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ell-${i}`} className="px-1 text-slate-400 text-sm select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
              className={`min-w-[32px] h-8 rounded-lg text-xs font-semibold transition-colors ${
                p === page
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} className="text-slate-600" />
        </button>
      </div>
    </div>
  )
}

// ─── Filter select ────────────────────────────────────────────────────────────

function FilterSelect({ id, label, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label htmlFor={id} className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
      >
        {options.map((o) => (
          <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
            {typeof o === 'string' ? o : o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// ─── Active filter pill ───────────────────────────────────────────────────────

function ActiveFilterPill({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-full">
      {label}
      <button onClick={onRemove} aria-label={`Remove ${label} filter`} className="hover:text-blue-900 transition-colors">
        <X size={11} />
      </button>
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CitizenReportsPage() {
  const navigate = useNavigate()

  const [loading, setLoading]             = useState(true)
  const [allComplaints, setAllComplaints] = useState([])
  const [search, setSearch]               = useState('')
  const [statusFilter, setStatusFilter]   = useState('All')
  const [damageFilter, setDamageFilter]   = useState('All')
  const [severityFilter, setSeverityFilter] = useState('All')
  const [sort, setSort]                   = useState('newest')
  const [page, setPage]                   = useState(1)
  const [showFilters, setShowFilters]     = useState(false)

  // Simulated load delay
  useEffect(() => {
    const t = setTimeout(() => {
      setAllComplaints(getSavedComplaints())
      setLoading(false)
    }, 700)
    return () => clearTimeout(t)
  }, [])

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [search, statusFilter, damageFilter, severityFilter, sort])

  // Filter + sort pipeline
  const filtered = useMemo(() => {
    let data = [...allComplaints]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      data = data.filter(
        (c) =>
          c.id?.toLowerCase().includes(q) ||
          c.damageType?.toLowerCase().includes(q) ||
          c.location?.toLowerCase().includes(q) ||
          c.ward?.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'All')
      data = data.filter((c) => c.status?.toLowerCase() === statusFilter.toLowerCase())

    if (damageFilter !== 'All')
      data = data.filter((c) => c.damageType?.toLowerCase() === damageFilter.toLowerCase())

    if (severityFilter !== 'All')
      data = data.filter((c) => c.severity?.toLowerCase() === severityFilter.toLowerCase())

    data.sort((a, b) => {
      if (sort === 'newest')        return new Date(b.timestamp) - new Date(a.timestamp)
      if (sort === 'oldest')        return new Date(a.timestamp) - new Date(b.timestamp)
      if (sort === 'priority_desc') return (b.priority ?? 0) - (a.priority ?? 0)
      if (sort === 'priority_asc')  return (a.priority ?? 0) - (b.priority ?? 0)
      return 0
    })

    return data
  }, [allComplaints, search, statusFilter, damageFilter, severityFilter, sort])

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  )

  const hasFilters = search || statusFilter !== 'All' || damageFilter !== 'All' || severityFilter !== 'All'

  const resetFilters = useCallback(() => {
    setSearch('')
    setStatusFilter('All')
    setDamageFilter('All')
    setSeverityFilter('All')
    setSort('newest')
  }, [])

  const activeFilterPills = [
    statusFilter   !== 'All' && { key: 'status',   label: `Status: ${statusFilter}`,       clear: () => setStatusFilter('All') },
    damageFilter   !== 'All' && { key: 'damage',   label: `Type: ${damageFilter}`,         clear: () => setDamageFilter('All') },
    severityFilter !== 'All' && { key: 'severity', label: `Severity: ${severityFilter}`,   clear: () => setSeverityFilter('All') },
  ].filter(Boolean)

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Road Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete history of grievances submitted to Pune Municipal Corporation
          </p>
        </div>
        <Link
          to="/citizen/report"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <PlusCircle size={15} />
          New Report
        </Link>
      </div>

      {/* Search + filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">

        {/* Row 1: search input + toggle button */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              id="reports-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, damage type, or location…"
              aria-label="Search reports"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 placeholder:text-slate-400"
            />
          </div>
          <button
            id="toggle-filters-btn"
            onClick={() => setShowFilters((p) => !p)}
            aria-expanded={showFilters}
            aria-controls="filter-panel"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-semibold rounded-xl border transition-colors ${
              showFilters
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterPills.length > 0 && (
              <span className={`ml-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${showFilters ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                {activeFilterPills.length}
              </span>
            )}
          </button>
        </div>

        {/* Row 2: expanded filter selects */}
        {showFilters && (
          <div id="filter-panel" className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            <FilterSelect id="filter-status"   label="Status"      value={statusFilter}   options={STATUS_OPTIONS}      onChange={setStatusFilter} />
            <FilterSelect id="filter-damage"   label="Damage Type" value={damageFilter}   options={DAMAGE_TYPE_OPTIONS} onChange={setDamageFilter} />
            <FilterSelect id="filter-severity" label="Severity"    value={severityFilter} options={SEVERITY_OPTIONS}    onChange={setSeverityFilter} />
            <FilterSelect id="filter-sort"     label="Sort By"     value={sort}           options={SORT_OPTIONS}        onChange={setSort} />
          </div>
        )}

        {/* Active filter pills */}
        {activeFilterPills.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Active:</span>
            {activeFilterPills.map((f) => (
              <ActiveFilterPill key={f.key} label={f.label} onRemove={f.clear} />
            ))}
            <button onClick={resetFilters} className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results count + inline sort (when filter panel is hidden) */}
      {!loading && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-slate-500">
            {filtered.length === 0
              ? 'No results'
              : `${filtered.length} report${filtered.length !== 1 ? 's' : ''} found`}
          </p>
          {!showFilters && (
            <select
              id="inline-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort reports"
              className="text-xs text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* ── Desktop table (>= md) ─────────────────────────────────────────────── */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Road damage reports">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Complaint ID', 'Image', 'Damage Type', 'Location', 'Severity', 'SRPS', 'Status', 'Date', 'Action'].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState hasFilters={!!hasFilters} onReset={resetFilters} />
                  </td>
                </tr>
              ) : (
                paginated.map((complaint) => (
                  <tr
                    key={complaint.id}
                    onClick={() => navigate(`/citizen/reports/${complaint.id}`)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-blue-600">{complaint.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <ImageThumb complaint={complaint} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800 text-xs">{complaint.damageType}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="flex items-start gap-1">
                        <MapPin size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-slate-600 line-clamp-2 leading-snug">{complaint.location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <SeverityChip severity={complaint.severity} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <SrpsScore score={complaint.priority} />
                        <span className="text-xs font-bold text-slate-700">{complaint.priority}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <Calendar size={11} className="text-slate-400" />
                        <span className="text-xs text-slate-500">{complaint.date}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/citizen/reports/${complaint.id}`) }}
                        aria-label={`View report ${complaint.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        View <ExternalLink size={11} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-4 pb-4">
            <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </div>
        )}
      </div>

      {/* ── Mobile cards (< md) ──────────────────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : paginated.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200">
            <EmptyState hasFilters={!!hasFilters} onReset={resetFilters} />
          </div>
        ) : (
          <>
            {paginated.map((c) => <ReportCard key={c.id} complaint={c} />)}
            <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </div>

    </div>
  )
}
