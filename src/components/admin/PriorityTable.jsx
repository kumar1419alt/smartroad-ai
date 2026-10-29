/**
 * PriorityTable.jsx — Reusable Priority Table for Administrator Dashboard.
 *
 * Displays prioritized road damage issues ranked by their Smart Road Repair
 * Prioritization Score (SRPS: 0 - 100).
 *
 * Columns:
 *  1. Rank
 *  2. Issue (ID & AI metadata)
 *  3. Damage Type
 *  4. Location & Ward
 *  5. Severity
 *  6. SRPS (Score & visual meter)
 *  7. Status
 *  8. Action (Inspect & Dispatch buttons)
 */

import React, { useState, useMemo } from 'react'
import {
  AlertTriangle,
  MapPin,
  Flame,
  Search,
  Filter,
  Eye,
  Send,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react'

// Severity color tokens
const SEVERITY_BADGE = {
  critical: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-400/20',
  high:     'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-400/20',
  medium:   'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-400/20',
  low:      'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-400/20',
}

// Status badge tokens
const STATUS_BADGE = {
  'pending':     'bg-amber-50 text-amber-700 border-amber-200',
  'in progress': 'bg-blue-50 text-blue-700 border-blue-200',
  'resolved':    'bg-emerald-50 text-emerald-700 border-emerald-200',
  'scheduled':   'bg-purple-50 text-purple-700 border-purple-200',
}

export default function PriorityTable({
  issues = [],
  onInspect,
  onAssignSquad,
  limit = 10,
  showSearch = true,
  title = 'Top Priority Road Incidents (SRPS Ranked)',
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [displayCount, setDisplayCount] = useState(limit)

  // Sort by SRPS descending by default
  const sortedAndFiltered = useMemo(() => {
    let result = [...issues]

    // Sort by SRPS descending
    result.sort((a, b) => (b.priority ?? b.priorityScore ?? 0) - (a.priority ?? a.priorityScore ?? 0))

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      result = result.filter(
        (item) =>
          item.id?.toLowerCase().includes(q) ||
          item.location?.toLowerCase().includes(q) ||
          item.ward?.toLowerCase().includes(q) ||
          item.damageType?.toLowerCase().includes(q)
      )
    }

    if (severityFilter !== 'all') {
      result = result.filter((item) => item.severity?.toLowerCase() === severityFilter.toLowerCase())
    }

    if (statusFilter !== 'all') {
      result = result.filter((item) => item.status?.toLowerCase().includes(statusFilter.toLowerCase()))
    }

    return result
  }, [issues, searchTerm, severityFilter, statusFilter])

  const visibleIssues = sortedAndFiltered.slice(0, displayCount)

  // SRPS Score color helpers
  const getScoreColor = (score) => {
    if (score >= 90) return { bar: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' }
    if (score >= 75) return { bar: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' }
    if (score >= 50) return { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' }
    return { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' }
  }

  const getRankBadge = (index) => {
    if (index === 0) return 'bg-red-600 text-white shadow-xs font-black'
    if (index === 1) return 'bg-orange-500 text-white shadow-xs font-black'
    if (index === 2) return 'bg-amber-500 text-white shadow-xs font-bold'
    return 'bg-slate-100 text-slate-700 font-semibold'
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* ── Table Header / Controls ───────────────────────────────────────── */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
              {sortedAndFiltered.length} Active Items
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked using multi-factor algorithm: Severity (35%), Traffic (25%), Criticality (15%), Road Class (15%), Reports (10%)
          </p>
        </div>

        {/* Search & Filters */}
        {showSearch && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ID, ward, road..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Severity filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Only</option>
              <option value="medium">Medium Only</option>
              <option value="low">Low Only</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        )}
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Priority road issues table">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
              <th className="py-3 px-4 w-14 text-center">Rank</th>
              <th className="py-3 px-4">Issue Details</th>
              <th className="py-3 px-4">Damage Type</th>
              <th className="py-3 px-4">Location / Ward</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">SRPS Score</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {visibleIssues.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <Filter size={24} className="text-slate-300" />
                    <p className="font-semibold text-slate-600">No matching issues found</p>
                    <p className="text-[11px]">Try adjusting your search query or severity filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              visibleIssues.map((issue, index) => {
                const score = issue.priority ?? issue.priorityScore ?? 50
                const sc = getScoreColor(score)
                const sevKey = (issue.severity || 'medium').toLowerCase()
                const statusKey = (issue.status || 'pending').toLowerCase()

                return (
                  <tr
                    key={issue.id}
                    className="hover:bg-blue-50/40 transition-colors duration-150 group"
                  >
                    {/* 1. Rank */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs ${getRankBadge(
                          index
                        )}`}
                      >
                        #{index + 1}
                      </span>
                    </td>

                    {/* 2. Issue */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {issue.id}
                          </span>
                          {issue.aiConfidence && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded-sm border border-indigo-200">
                              <Sparkles size={9} />
                              {issue.aiConfidence}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-[240px]">
                          {issue.description || 'Pavement damage detected by vision sensor'}
                        </p>
                      </div>
                    </td>

                    {/* 3. Damage Type */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 bg-slate-100/80 px-2 py-1 rounded-md">
                        <AlertTriangle size={12} className={sevKey === 'critical' ? 'text-red-500' : 'text-amber-500'} />
                        {issue.damageType}
                      </span>
                    </td>

                    {/* 4. Location */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-medium text-slate-800 line-clamp-1 max-w-[200px]" title={issue.location}>
                          {issue.location}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin size={10} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[190px]">{issue.ward || 'Central Ward'}</span>
                        </p>
                      </div>
                    </td>

                    {/* 5. Severity */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${
                          SEVERITY_BADGE[sevKey] || SEVERITY_BADGE.medium
                        }`}
                      >
                        {issue.severity || 'Medium'}
                      </span>
                    </td>

                    {/* 6. SRPS */}
                    <td className="py-3.5 px-4">
                      <div className="w-28 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            {score >= 85 && <Flame size={12} className="text-red-500 shrink-0" />}
                            {score}
                            <span className="text-slate-400 font-normal">/100</span>
                          </span>
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-sm ${sc.bg} ${sc.text} border ${sc.border}`}>
                            {score >= 90 ? 'CRITICAL' : score >= 75 ? 'HIGH' : score >= 50 ? 'MED' : 'LOW'}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${sc.bar}`}
                            style={{ width: `${Math.min(score, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* 7. Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${
                          STATUS_BADGE[statusKey] || 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {statusKey.includes('resolved') ? (
                          <CheckCircle2 size={11} className="text-emerald-600" />
                        ) : statusKey.includes('progress') ? (
                          <Clock size={11} className="text-blue-600" />
                        ) : (
                          <AlertTriangle size={11} className="text-amber-600" />
                        )}
                        {issue.status}
                      </span>
                    </td>

                    {/* 8. Action */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onInspect?.(issue)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 transition-colors inline-flex items-center gap-1"
                          title="Inspect AI Vision and GPS details"
                        >
                          <Eye size={12} />
                          Inspect
                        </button>
                        <button
                          onClick={() => onAssignSquad?.(issue)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors inline-flex items-center gap-1"
                          title="Assign Repair Crew Squad"
                        >
                          <Send size={11} />
                          Dispatch
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

      {/* ── Table Footer ─────────────────────────────────────────────────── */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-800">{visibleIssues.length}</strong> of{' '}
          <strong className="text-slate-800">{sortedAndFiltered.length}</strong> prioritized road issues
        </span>

        <div className="flex items-center gap-2">
          {sortedAndFiltered.length > limit && (
            <button
              onClick={() => setDisplayCount(displayCount === limit ? sortedAndFiltered.length : limit)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              {displayCount === limit ? `View All (${sortedAndFiltered.length})` : `Show Top ${limit} Only`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
