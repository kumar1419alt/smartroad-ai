/**
 * EngineerCompletedRepairsPage.jsx — Route: /engineer/completed
 *
 * Dedicated archive of finished road repairs for the engineer squad.
 * Features:
 *  - Interactive Before & After photo slider / side-by-side comparison
 *  - QA Sign-Off badges & audit metadata (TAT, crew hours, materials applied)
 *  - Search by complaint ID, street, or defect type
 *  - Export / Print completion certificate simulation
 *  - Synchronized with localStorage ('rds_engineer_issues')
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Search,
  Calendar,
  Clock,
  Camera,
  Layers,
  Wrench,
  Award,
  Download,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileCheck2,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { MOCK_ENGINEER_ISSUES } from '../../data/mockEngineerData'

const STORAGE_KEY = 'rds_engineer_issues'

export default function EngineerCompletedRepairsPage() {
  const [issues, setIssues] = useState([])
  const [search, setSearch] = useState('')
  const [damageFilter, setDamageFilter] = useState('all')
  const [selectedComparison, setSelectedComparison] = useState(null)
  const [sliderPosition, setSliderPosition] = useState(50) // 0-100%

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      setIssues(stored ? JSON.parse(stored) : MOCK_ENGINEER_ISSUES)
    } catch {
      setIssues(MOCK_ENGINEER_ISSUES)
    }
  }, [])

  const resolvedIssues = issues.filter((i) => i.status === 'Resolved')

  const filtered = resolvedIssues.filter((i) => {
    if (damageFilter !== 'all' && i.damageType !== damageFilter) return false
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

  const damageTypes = ['all', ...new Set(resolvedIssues.map((i) => i.damageType))]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Completed Repairs & QA Archive
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {resolvedIssues.length} Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Certified road restoration records with Before & After photographic evidence and QA sign-offs
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Download size={14} />
          Export QA Summary
        </button>
      </div>

      {/* ── KPI HIGHLIGHTS ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Total Restorations</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{resolvedIssues.length}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">100% Quality Checked</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Avg. Turnaround</span>
            <Clock size={16} className="text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">48 hrs</p>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Within SLA benchmark</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Quality Rating</span>
            <Award size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">4.9 / 5.0</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">IRC Standards Compliant</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Bitumen Deployed</span>
            <Wrench size={16} className="text-slate-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">18.4 T</p>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">This calendar month</p>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search completed repairs by ID or road name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-emerald-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs font-bold text-slate-400 shrink-0">Defect:</span>
          {damageTypes.map((t) => (
            <button
              key={t}
              onClick={() => setDamageFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                damageFilter === t
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>
      </div>

      {/* ── COMPLETED REPAIR CARDS GRID ──────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No matching completed repairs found</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search query or defect filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{item.complaintId}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      QA Verified
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">{item.damageType}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Restored On</p>
                  <p className="text-xs font-bold text-emerald-700">{item.completionDate || '13 Oct 2026'}</p>
                </div>
              </div>

              {/* Side-by-Side Images */}
              <div className="grid grid-cols-2 gap-1 p-2 bg-slate-900">
                <div className="relative aspect-video overflow-hidden rounded-lg group">
                  <img
                    src={item.roadImage}
                    alt="Before"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Before
                  </span>
                </div>
                <div className="relative aspect-video overflow-hidden rounded-lg group">
                  <img
                    src={
                      item.afterImage ||
                      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
                    }
                    alt="After"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1.5 left-1.5 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    After
                  </span>
                </div>
              </div>

              {/* Metadata */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    <strong className="text-slate-800">Location: </strong> {item.location}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    <strong className="text-slate-700">Materials: </strong> {item.materials || 'Bituminous macadam & seal coat'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    Inspection #PM-042
                  </span>
                  <Link
                    to={`/engineer/issues/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800"
                  >
                    <span>Full Case Details</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
