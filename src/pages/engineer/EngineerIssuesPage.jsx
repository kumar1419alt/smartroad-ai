/**
 * EngineerIssuesPage.jsx — Route: /engineer/issues
 *
 * Full listing of all assigned issues with filtering by status,
 * severity, and search. Issue cards with image preview.
 */

import React, { useState, useEffect } from 'react'
import {
  ClipboardList,
  Search,
  Filter,
  MapPin,
  Flame,
  Calendar,
  Eye,
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  SlidersHorizontal,
} from 'lucide-react'
import { MOCK_ENGINEER_ISSUES } from '../../data/mockEngineerData'
import EngineerIssueDetailModal from '../../components/engineer/EngineerIssueDetailModal'
import { FALLBACK_ROAD_IMAGE } from '../../utils/helpers'

const STORAGE_KEY = 'rds_engineer_issues'

const SEVERITY_STYLES = {
  critical: { badge: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
  high: { badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  medium: { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  low: { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
}

const STATUS_STYLES = {
  'Assigned': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  'Resolved': 'bg-emerald-100 text-emerald-700',
}

export default function EngineerIssuesPage() {
  const [issues, setIssues] = useState([])
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('srps') // 'srps' | 'date' | 'severity'

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setIssues(JSON.parse(stored))
      } else {
        setIssues(MOCK_ENGINEER_ISSUES)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ENGINEER_ISSUES))
      }
    } catch {
      setIssues(MOCK_ENGINEER_ISSUES)
    }
  }, [])

  const saveIssues = (updated) => {
    setIssues(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const handleUpdateIssue = (id, patch) => {
    const updated = issues.map((issue) => (issue.id === id ? { ...issue, ...patch } : issue))
    saveIssues(updated)
    if (selectedIssue?.id === id) {
      setSelectedIssue((prev) => ({ ...prev, ...patch }))
    }
  }

  // Filter & Sort
  const filtered = issues
    .filter((i) => {
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
    .sort((a, b) => {
      if (sortBy === 'srps') return b.srps - a.srps
      if (sortBy === 'severity') {
        const order = { critical: 0, high: 1, medium: 2, low: 3 }
        return (order[a.severity] ?? 4) - (order[b.severity] ?? 4)
      }
      return 0 // date: keep original order (already by assignedDate)
    })

  const counts = {
    all: issues.length,
    Assigned: issues.filter((i) => i.status === 'Assigned').length,
    'In Progress': issues.filter((i) => i.status === 'In Progress').length,
    Resolved: issues.filter((i) => i.status === 'Resolved').length,
  }

  return (
    <>
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Assigned Issues</h1>
          <p className="text-xs text-slate-500">All repair assignments for your squad and zone</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            Showing {filtered.length} of {issues.length}
          </span>
        </div>
      </div>

      {/* ── STATUS TABS ── */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {['all', 'Assigned', 'In Progress', 'Resolved'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === status
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {status === 'all' ? 'All Issues' : status} ({counts[status]})
          </button>
        ))}
      </div>

      {/* ── FILTERS ROW ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by complaint ID, damage type, location..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
        >
          <option value="srps">Sort: SRPS (Highest)</option>
          <option value="severity">Sort: Severity</option>
          <option value="date">Sort: Assigned Date</option>
        </select>
      </div>

      {/* ── ISSUE CARDS ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <ClipboardList size={40} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Issues Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((issue) => {
            const sev = SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.medium
            return (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={issue.roadImage || FALLBACK_ROAD_IMAGE}
                    alt={`Road damage - ${issue.complaintId}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_ROAD_IMAGE
                    }}
                  />
                  <span className={`absolute top-2.5 left-2.5 text-[10px] font-black px-2 py-0.5 rounded-lg border ${sev.badge}`}>
                    {issue.severity.toUpperCase()}
                  </span>
                  <span className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Flame size={10} className="text-amber-400" />
                    {issue.srps}
                  </span>
                  <span className={`absolute bottom-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-lg ${STATUS_STYLES[issue.status]}`}>
                    {issue.status}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {issue.complaintId}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">{issue.damageType}</span>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 line-clamp-2">{issue.location}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Calendar size={11} />
                      {issue.assignedDate}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 group-hover:gap-1.5 transition-all">
                      <Eye size={12} />
                      Open
                      <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── ISSUE DETAIL MODAL ── */}
      <EngineerIssueDetailModal
        issue={selectedIssue}
        isOpen={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onUpdate={handleUpdateIssue}
      />
    </>
  )
}
