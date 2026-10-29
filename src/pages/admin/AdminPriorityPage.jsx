/**
 * AdminPriorityPage.jsx — Route: /admin/priority
 *
 * Dedicated Smart Road Repair Prioritization Queue page.
 *
 * Purpose:
 *  Show road damage issues ranked according to Smart Road Repair Priority Score (SRPS).
 *
 * Core Features:
 *  1. Prominent Explanation Panel:
 *     - Formula: SRPS = w1·S + w2·T + w3·L + w4·R + w5·C
 *     - Current DEMO weights: S = 0.35, T = 0.25, L = 0.20, R = 0.15, C = 0.05
 *     - Clearly labeled as initial/demo weights
 *     - Explicit disclaimer: SRPS is not claimed to be experimentally proven yet
 *  2. Priority Table:
 *     - Columns: Rank, Complaint ID, Damage Type, Severity, Traffic, Location Criticality,
 *       Road Importance, Reports, SRPS, Priority, Action
 *     - Interactive sorting, filtering, and search
 *  3. Clicking an issue opens detailed PriorityScoreBreakdown modal
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  Flame,
  Scale,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Send,
  AlertTriangle,
  Info,
  Car,
  MapPin,
  GitBranch,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  RefreshCw,
  Layers,
} from 'lucide-react'

import { getSavedComplaints } from '../../services/complaintService'
import {
  SRPS_DEMO_WEIGHTS,
  FACTOR_METADATA,
  deriveFactorsForComplaint,
} from '../../utils/srpsCalculator'
import PriorityScoreBreakdown from '../../components/admin/priority/PriorityScoreBreakdown'
import PriorityAnalysisModal from '../../components/admin/priority/PriorityAnalysisModal'
import AdminDispatchModal from '../../components/admin/AdminDispatchModal'
import { useToast } from '../../contexts/ToastContext'

export default function AdminPriorityPage() {
  const toast = useToast()
  const [complaints, setComplaints] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [damageTypeFilter, setDamageTypeFilter] = useState('all')
  const [sortField, setSortField] = useState('srps') // 'srps' | 'rank' | 'traffic' | 'criticality' | 'reports' | 'severity'
  const [sortAsc, setSortAsc] = useState(false)

  // Modals state
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [dispatchIssue, setDispatchIssue] = useState(null)

  // Load complaints and enrich with SRPS factors
  useEffect(() => {
    const raw = getSavedComplaints()
    setComplaints(raw)
  }, [])

  // Enriched list with derived factors
  const enrichedComplaints = useMemo(() => {
    return complaints.map((c) => {
      const factors = deriveFactorsForComplaint(c)
      return {
        ...c,
        ...factors,
      }
    })
  }, [complaints])

  // Filter and sort
  const filteredAndSorted = useMemo(() => {
    let result = [...enrichedComplaints]

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      result = result.filter(
        (item) =>
          item.id?.toLowerCase().includes(q) ||
          item.location?.toLowerCase().includes(q) ||
          item.ward?.toLowerCase().includes(q) ||
          item.damageType?.toLowerCase().includes(q)
      )
    }

    // Severity filter
    if (severityFilter !== 'all') {
      result = result.filter(
        (item) => item.severity?.toLowerCase() === severityFilter.toLowerCase()
      )
    }

    // Priority Tier filter
    if (priorityFilter !== 'all') {
      result = result.filter(
        (item) => item.priorityLevel?.toLowerCase() === priorityFilter.toLowerCase()
      )
    }

    // Damage type filter
    if (damageTypeFilter !== 'all') {
      result = result.filter(
        (item) => item.damageType?.toLowerCase().includes(damageTypeFilter.toLowerCase())
      )
    }

    // Sort
    result.sort((a, b) => {
      let valA, valB
      switch (sortField) {
        case 'traffic':
          valA = a.T
          valB = b.T
          break
        case 'criticality':
          valA = a.L
          valB = b.L
          break
        case 'road':
          valA = a.R
          valB = b.R
          break
        case 'reports':
          valA = a.C
          valB = b.C
          break
        case 'id':
          valA = a.id
          valB = b.id
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
        case 'srps':
        default:
          valA = a.srps
          valB = b.srps
          break
      }
      return sortAsc ? valA - valB : valB - valA
    })

    return result
  }, [
    enrichedComplaints,
    searchTerm,
    severityFilter,
    priorityFilter,
    damageTypeFilter,
    sortField,
    sortAsc,
  ])

  // Sort toggle handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  // Handle status update / dispatch
  const handleConfirmDispatch = (id, updateData) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updateData } : c))
    )
    toast.success(`Complaint ${id} dispatched to repair unit. Priority queue updated.`)
  }

  // Badges helpers
  const getSeverityBadge = (sev) => {
    const s = (sev || 'medium').toLowerCase()
    if (s === 'critical') return 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-400/20'
    if (s === 'high') return 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-400/20'
    if (s === 'medium') return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-400/20'
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-400/20'
  }

  const getPriorityBadge = (lvl) => {
    if (lvl === 'Critical') return 'bg-red-100 text-red-800 border-red-300 font-extrabold'
    if (lvl === 'High') return 'bg-orange-100 text-orange-800 border-orange-300 font-extrabold'
    if (lvl === 'Medium') return 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
    return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Flame size={28} className="text-red-500" />
              Smart Road Repair Priority Queue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
              SRPS Ranked
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dynamic municipal repair scheduling based on Computer Vision damage classification & GIS contextual layers
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs">
            {filteredAndSorted.length} Active Records
          </span>
        </div>
      </div>

      {/* ── 1. PROMINENT EXPLANATION PANEL ────────────────────────────────── */}
      <section
        aria-label="SRPS Explanation Panel"
        className="bg-white rounded-3xl border-2 border-slate-900/10 p-6 sm:p-8 shadow-sm space-y-6"
      >
        {/* Header and Tag */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Scale size={20} />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Smart Road Repair Priority Score (SRPS) Framework
              </h2>
              <p className="text-xs text-slate-500">
                Multi-criteria decision formulation combining AI vision defect data with municipal spatial attributes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs flex items-center gap-1.5">
              <Info size={13} />
              Initial / Demonstration Weights
            </span>
          </div>
        </div>

        {/* Central Mathematical Formula Display */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 text-center space-y-2">
          <span className="text-[11px] font-mono tracking-widest uppercase text-blue-300 font-bold">
            MATHEMATICAL FORMULATION
          </span>
          <div className="text-xl sm:text-3xl font-black font-mono tracking-wide text-white py-1">
            SRPS = w₁S + w₂T + w₃L + w₄R + w₅C
          </div>
          <p className="text-xs text-slate-300 max-w-xl mx-auto font-sans">
            Score = (0.35 × Severity) + (0.25 × Traffic) + (0.20 × Loc. Criticality) + (0.15 × Road Class) + (0.05 × Citizen Reports)
          </p>
        </div>

        {/* Five Factor Weights Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active Initial Heuristic Weights (Sum = 1.00 / 100%)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Demo Configuration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {[
              {
                symbol: 'S',
                weight: '0.35',
                pct: '35%',
                title: 'Damage Severity',
                desc: 'Defect depth, structural area & accident hazard',
                color: 'border-red-200 bg-red-50/60 text-red-900',
                badge: 'bg-red-600 text-white',
                icon: AlertTriangle,
              },
              {
                symbol: 'T',
                weight: '0.25',
                pct: '25%',
                title: 'Traffic Importance',
                desc: 'Daily passenger volume & bus transit density',
                color: 'border-orange-200 bg-orange-50/60 text-orange-900',
                badge: 'bg-orange-500 text-white',
                icon: Car,
              },
              {
                symbol: 'L',
                weight: '0.20',
                pct: '20%',
                title: 'Location Criticality',
                desc: 'Proximity to hospitals, schools & fire stations',
                color: 'border-blue-200 bg-blue-50/60 text-blue-900',
                badge: 'bg-blue-600 text-white',
                icon: MapPin,
              },
              {
                symbol: 'R',
                weight: '0.15',
                pct: '15%',
                title: 'Road Importance',
                desc: 'Arterial / National Highway vs Local street',
                color: 'border-purple-200 bg-purple-50/60 text-purple-900',
                badge: 'bg-purple-600 text-white',
                icon: GitBranch,
              },
              {
                symbol: 'C',
                weight: '0.05',
                pct: '5%',
                title: 'Citizen Reports',
                desc: 'Duplicate complaint volume & crowd confirmations',
                color: 'border-emerald-200 bg-emerald-50/60 text-emerald-900',
                badge: 'bg-emerald-600 text-white',
                icon: Users,
              },
            ].map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.symbol}
                  className={`rounded-2xl border p-4 flex flex-col justify-between ${card.color} transition-all`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="w-8 h-8 rounded-lg bg-white/80 shadow-xs flex items-center justify-center font-bold">
                      <Icon size={16} />
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-black ${card.badge}`}>
                      w = {card.weight}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-extrabold">{card.title}</span>
                      <span className="text-xs font-mono font-bold opacity-75">({card.symbol})</span>
                    </div>
                    <p className="text-[11px] opacity-80 mt-0.5 line-clamp-2 leading-tight">
                      {card.desc}
                    </p>
                    <span className="inline-block mt-2 font-mono text-xs font-bold text-slate-800">
                      Share: {card.pct}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Academic Notice / Not Experimentally Proven Disclaimer */}
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
          <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-amber-950">
              Notice: Research Prototype & Initial Weight Configuration
            </p>
            <p className="text-[11px] leading-relaxed text-amber-800">
              The SRPS weighting coefficients displayed above (w₁=0.35, w₂=0.25, w₃=0.20, w₄=0.15, w₅=0.05)
              represent <strong>initial baseline demonstration parameters</strong> selected to model practical municipal decision-making.
              <strong> SRPS is not claimed to be experimentally proven yet</strong>. Ongoing work includes calibrating these weights
              against empirical pavement condition indexes (PCI) and physical road degradation test datasets in municipal field trials.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. SEARCH, FILTERS & CONTROLS ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Complaint ID, location, ward, damage..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Severity: All</option>
            <option value="critical">Severity: Critical</option>
            <option value="high">Severity: High</option>
            <option value="medium">Severity: Medium</option>
            <option value="low">Severity: Low</option>
          </select>

          {/* Priority Tier Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tier: All</option>
            <option value="critical">Tier: Critical (&ge; 85)</option>
            <option value="high">Tier: High (70 - 84)</option>
            <option value="medium">Tier: Medium (50 - 69)</option>
            <option value="low">Tier: Low (&lt; 50)</option>
          </select>

          {/* Damage Type Filter */}
          <select
            value={damageTypeFilter}
            onChange={(e) => setDamageTypeFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Damage: All</option>
            <option value="pothole">Pothole</option>
            <option value="crack">Crack</option>
            <option value="subsidence">Subsidence</option>
            <option value="rutting">Rutting</option>
            <option value="edge">Edge Erosion</option>
          </select>

          {/* Reset Filters */}
          {(searchTerm || severityFilter !== 'all' || priorityFilter !== 'all' || damageTypeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSeverityFilter('all')
                setPriorityFilter('all')
                setDamageTypeFilter('all')
              }}
              className="text-xs font-semibold px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── 3. PRIORITY TABLE ─────────────────────────────────────────────── */}
      <section aria-label="Priority Queue Table" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Prioritized Road Damage Queue</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Sorted by {sortField.toUpperCase()} ({sortAsc ? 'Ascending' : 'Descending'})
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click on any row or 'Inspect' to open the detailed multi-factor priority score breakdown
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" aria-label="SRPS priority table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 select-none">
                {/* 1. Rank */}
                <th
                  onClick={() => handleSort('srps')}
                  className="py-3.5 px-4 w-14 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Rank</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>

                {/* 2. Complaint ID */}
                <th
                  onClick={() => handleSort('id')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Complaint ID</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>

                {/* 3. Damage Type */}
                <th className="py-3.5 px-4">Damage Type</th>

                {/* 4. Severity */}
                <th className="py-3.5 px-4">Severity</th>

                {/* 5. Traffic (T) */}
                <th
                  onClick={() => handleSort('traffic')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  title="Traffic volume factor (Weight: 25%)"
                >
                  <div className="flex items-center gap-1">
                    <span>Traffic (T)</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>

                {/* 6. Location Criticality (L) */}
                <th
                  onClick={() => handleSort('criticality')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  title="Location criticality factor (Weight: 20%)"
                >
                  <div className="flex items-center gap-1">
                    <span>Loc. Crit. (L)</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>

                {/* 7. Road Importance (R) */}
                <th
                  onClick={() => handleSort('road')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  title="Road classification factor (Weight: 15%)"
                >
                  <div className="flex items-center gap-1">
                    <span>Road Imp. (R)</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>

                {/* 8. Reports (C) */}
                <th
                  onClick={() => handleSort('reports')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  title="Citizen reports frequency factor (Weight: 5%)"
                >
                  <div className="flex items-center gap-1">
                    <span>Reports (C)</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>

                {/* 9. SRPS */}
                <th
                  onClick={() => handleSort('srps')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1 text-slate-900 font-extrabold">
                    <Flame size={13} className="text-red-500" />
                    <span>SRPS</span>
                    <ArrowUpDown size={11} className="text-slate-500" />
                  </div>
                </th>

                {/* 10. Priority Level */}
                <th className="py-3.5 px-4">Priority Tier</th>

                {/* 11. Action */}
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Filter size={24} className="text-slate-300" />
                      <p className="font-bold text-slate-700">No matching issues in priority queue</p>
                      <p className="text-[11px]">Try clearing search parameters or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((item, index) => {
                  const isTop3 = index < 3
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedIssue(item)}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors duration-150 group"
                    >
                      {/* 1. Rank */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-bold ${
                            index === 0
                              ? 'bg-red-600 text-white shadow-xs font-black'
                              : index === 1
                              ? 'bg-orange-500 text-white shadow-xs font-black'
                              : index === 2
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 font-semibold'
                          }`}
                        >
                          #{index + 1}
                        </span>
                      </td>

                      {/* 2. Complaint ID */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {item.id}
                          </span>
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{item.location}</p>
                        </div>
                      </td>

                      {/* 3. Damage Type */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                          {item.damageType}
                        </span>
                      </td>

                      {/* 4. Severity */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getSeverityBadge(
                            item.severity
                          )}`}
                        >
                          {item.severity}
                        </span>
                      </td>

                      {/* 5. Traffic (T) */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        <span className="text-orange-600">{item.T}</span>
                        <span className="text-slate-400 text-[10px] font-normal"> /100</span>
                      </td>

                      {/* 6. Location Criticality (L) */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        <span className="text-blue-600">{item.L}</span>
                        <span className="text-slate-400 text-[10px] font-normal"> /100</span>
                      </td>

                      {/* 7. Road Importance (R) */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        <span className="text-purple-600">{item.R}</span>
                        <span className="text-slate-400 text-[10px] font-normal"> /100</span>
                      </td>

                      {/* 8. Reports (C) */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        <span className="text-emerald-600">{item.C}</span>
                        <span className="text-slate-400 text-[10px] font-normal"> ({item.upvotes || 18})</span>
                      </td>

                      {/* 9. SRPS */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-black text-slate-900">{item.srps}</span>
                          <span className="text-slate-400 text-[10px]">pts</span>
                        </div>
                      </td>

                      {/* 10. Priority Level */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider border ${getPriorityBadge(
                            item.priorityLevel
                          )}`}
                        >
                          {item.priorityLevel}
                        </span>
                      </td>

                      {/* 11. Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className="inline-flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setSelectedIssue(item)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 transition-colors inline-flex items-center gap-1"
                            title="Inspect Detailed Priority Breakdown"
                          >
                            <Eye size={12} />
                            Analysis
                          </button>
                          <button
                            onClick={() => setDispatchIssue(item)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors inline-flex items-center gap-1"
                            title="Dispatch Repair Squad"
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

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Displaying <strong className="text-slate-800">{filteredAndSorted.length}</strong> prioritized road issues
          </span>
          <span className="text-[11px] text-slate-400">
            Formulation: SRPS = 0.35·S + 0.25·T + 0.20·L + 0.15·R + 0.05·C
          </span>
        </div>
      </section>

      {/* ── MODALS ────────────────────────────────────────────────────────── */}
      <PriorityAnalysisModal
        isOpen={Boolean(selectedIssue)}
        complaint={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onDispatch={(issue) => setDispatchIssue(issue)}
      />

      <AdminDispatchModal
        isOpen={Boolean(dispatchIssue)}
        issue={dispatchIssue}
        onClose={() => setDispatchIssue(null)}
        onConfirmDispatch={handleConfirmDispatch}
      />
    </div>
  )
}
