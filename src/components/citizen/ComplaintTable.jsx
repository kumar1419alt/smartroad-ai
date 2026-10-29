/**
 * ComplaintTable.jsx — Reusable complaints table and responsive card view.
 *
 * Shows:
 *  - Complaint ID
 *  - Damage type
 *  - Location (Pune municipal locations)
 *  - Severity
 *  - Priority (SRPS score)
 *  - Status
 *  - Date
 *  - Interactive detail expansion / modal callback
 */

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Calendar,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  ChevronRight,
  ThumbsUp,
  SlidersHorizontal,
} from 'lucide-react'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'

const SEVERITY_PILLS = {
  critical: 'bg-red-50 text-red-700 border-red-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export default function ComplaintTable({
  complaints = [],
  onSelectComplaint,
  title = 'Recent Reports',
  description = 'Your submitted road hazard complaints and PMC repair status',
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = complaints.filter((c) => {
    // Status filter
    if (statusFilter !== 'all') {
      const norm = (c.status || '').toLowerCase()
      if (statusFilter === 'pending' && !norm.includes('pending')) return false
      if (statusFilter === 'in_progress' && !norm.includes('progress')) return false
      if (statusFilter === 'resolved' && !norm.includes('resolved') && !norm.includes('completed')) return false
    }

    // Search filter
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      c.id.toLowerCase().includes(term) ||
      c.location.toLowerCase().includes(term) ||
      c.damageType.toLowerCase().includes(term) ||
      (c.ward && c.ward.toLowerCase().includes(term))
    )
  })

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header bar with filters */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filtered.length}
            </span>
          </div>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search by road or ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'resolved', label: 'Resolved' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table content (Desktop / Tablet) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/70 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">Complaint ID</th>
              <th className="py-3 px-4">Damage Type</th>
              <th className="py-3 px-4">Pune Location</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">SRPS Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <AlertTriangle size={24} className="mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-slate-600">No complaints found</p>
                  <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search query or filter</p>
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const sevClass = SEVERITY_PILLS[item.severity] || 'bg-slate-50 text-slate-700 border-slate-200'
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => onSelectComplaint && onSelectComplaint(item)}
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      <Link
                        to={`/citizen/reports/${item.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {item.id}
                      </Link>
                    </td>

                    {/* Damage Type */}
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {item.damageType}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-start gap-1.5">
                        <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-800 leading-tight">{item.location}</p>
                          {item.ward && (
                            <p className="text-[10px] text-slate-400 leading-none mt-0.5">{item.ward}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${sevClass}`}>
                        {item.severity}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={item.priority} size="xs" />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} size="xs" />
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {item.date}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/citizen/reports/${item.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                      >
                        <Eye size={12} />
                        <span>Lifecycle</span>
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (Screens < 768px) */}
      <div className="md:hidden divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <AlertTriangle size={24} className="mx-auto mb-2 text-slate-300" />
            <p className="font-medium text-slate-600">No complaints found</p>
          </div>
        ) : (
          filtered.map((item) => (
            <Link
              key={item.id}
              to={`/citizen/reports/${item.id}`}
              className="block p-4 hover:bg-slate-50/80 transition-colors active:bg-slate-100"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600">{item.id}</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{item.damageType}</h3>
                </div>
                <StatusBadge status={item.status} size="xs" />
              </div>

              <div className="flex items-start gap-1.5 text-xs text-slate-600 mb-3">
                <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                <span>{item.location}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={item.priority} size="xs" />
                  <span className="text-[11px] text-slate-400">{item.date}</span>
                </div>
                <span className="inline-flex items-center text-xs font-semibold text-blue-600 gap-0.5">
                  View Lifecycle <ChevronRight size={13} />
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
