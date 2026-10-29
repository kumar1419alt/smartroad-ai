/**
 * EngineerDashboard.jsx — Route: /engineer/dashboard
 *
 * Engineer / Repair Officer command center with:
 *  - Summary KPI cards: Assigned Issues, In Progress, Completed, Critical
 *  - Assigned issue cards showing: complaint ID, damage, image, location, SRPS,
 *    priority, assigned date
 *  - Click any card to open the full issue detail modal
 *  - Persist state in localStorage for demo continuity
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardList,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Flame,
  Calendar,
  ChevronRight,
  Clock,
  Eye,
  HardHat,
  TrendingUp,
  Zap,
  Star,
  Shield,
  PlayCircle,
} from 'lucide-react'
import { ENGINEER_PROFILE, MOCK_ENGINEER_ISSUES } from '../../data/mockEngineerData'
import EngineerIssueDetailModal from '../../components/engineer/EngineerIssueDetailModal'
import { FALLBACK_ROAD_IMAGE } from '../../utils/helpers'

const STORAGE_KEY = 'rds_engineer_issues'

const SEVERITY_STYLES = {
  critical: { badge: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', glow: 'ring-red-500/20' },
  high: { badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', glow: 'ring-amber-500/20' },
  medium: { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500', glow: 'ring-yellow-500/20' },
  low: { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', glow: 'ring-emerald-500/20' },
}

const STATUS_STYLES = {
  'Assigned': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  'Resolved': 'bg-emerald-100 text-emerald-700',
}

export default function EngineerDashboardPage() {
  const [issues, setIssues] = useState([])
  const [selectedIssue, setSelectedIssue] = useState(null)

  // Load from localStorage or default mock
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

  // Stats
  const assigned = issues.filter((i) => i.status === 'Assigned')
  const inProgress = issues.filter((i) => i.status === 'In Progress')
  const resolved = issues.filter((i) => i.status === 'Resolved')
  const critical = issues.filter((i) => i.severity === 'critical' && i.status !== 'Resolved')
  const activeIssues = [...assigned, ...inProgress].sort((a, b) => b.srps - a.srps)

  const kpiCards = [
    {
      label: 'Assigned Issues',
      value: assigned.length,
      icon: ClipboardList,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      subtitle: 'Awaiting repair start',
    },
    {
      label: 'In Progress',
      value: inProgress.length,
      icon: Wrench,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      subtitle: 'Active on-site repairs',
    },
    {
      label: 'Completed',
      value: resolved.length,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      subtitle: 'This assignment cycle',
    },
    {
      label: 'Critical',
      value: critical.length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
      subtitle: 'Immediate attention',
    },
  ]

  return (
    <>
      {/* ── HERO BANNER ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <HardHat size={12} />
                {ENGINEER_PROFILE.squad}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <MapPin size={12} />
                {ENGINEER_PROFILE.zone}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Field Operations Dashboard
            </h1>
            <p className="text-slate-300 text-sm mt-1.5 max-w-xl">
              Active repair assignments prioritized by Smart Road Priority Score (SRPS).
              Complete high-priority issues first to maximize road safety impact.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/engineer/issues"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:shadow-lg"
            >
              All Assignments
              <ChevronRight size={14} />
            </Link>
            <Link
              to="/engineer/map"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all"
            >
              <MapPin size={14} />
              Field Map
            </Link>
          </div>
        </div>
      </div>

      {/* ── KPI SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={`relative p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{card.label}</p>
                  <p className={`text-3xl font-black mt-1.5 ${card.color}`}>{card.value}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{card.subtitle}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${card.bg} border ${card.border}`}>
                  <Icon size={18} className={card.color} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── ACTIVE ISSUE CARDS ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Active Assignments</h2>
            <p className="text-xs text-slate-500">Sorted by SRPS priority — complete highest-scoring issues first</p>
          </div>
          <Link
            to="/engineer/issues"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View All <ChevronRight size={14} />
          </Link>
        </div>

        {activeIssues.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
            <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">All Caught Up!</h3>
            <p className="text-xs text-slate-500 mt-1">No active assignments. Check back for new work orders.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeIssues.map((issue) => {
              const sev = SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.medium
              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all cursor-pointer group overflow-hidden ring-1 ${sev.glow} hover:ring-2`}
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={issue.roadImage || FALLBACK_ROAD_IMAGE}
                      alt={`Road damage at ${issue.location}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_ROAD_IMAGE
                      }}
                    />
                    {/* Severity Badge */}
                    <span className={`absolute top-3 left-3 text-[10px] font-black px-2 py-1 rounded-lg border ${sev.badge}`}>
                      {issue.severity.toUpperCase()}
                    </span>
                    {/* SRPS Badge */}
                    <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Flame size={11} className="text-amber-400" />
                      SRPS: {issue.srps}
                    </span>
                    {/* Status Badge */}
                    <span className={`absolute bottom-3 left-3 text-[10px] font-bold px-2 py-1 rounded-lg ${STATUS_STYLES[issue.status]}`}>
                      {issue.status}
                    </span>
                    {/* AI Confidence */}
                    <span className="absolute bottom-3 right-3 bg-blue-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                      AI: {issue.aiDetection.confidence}%
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {issue.complaintId}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {issue.damageType}
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5">
                      <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">{issue.location}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Calendar size={12} />
                        {issue.assignedDate}
                      </div>
                      <button className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors group-hover:gap-1.5">
                        <Eye size={12} />
                        Open
                        <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── PERFORMANCE SNAPSHOT ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Engineer Performance Snapshot</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-xl">
            <p className="text-2xl font-black text-slate-900">{ENGINEER_PROFILE.totalRepairs}</p>
            <p className="text-[10px] text-slate-500 mt-1">Total Lifetime Repairs</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-xl">
            <p className="text-2xl font-black text-emerald-600">{ENGINEER_PROFILE.completedThisMonth}</p>
            <p className="text-[10px] text-slate-500 mt-1">Completed This Month</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-center gap-1">
              <p className="text-2xl font-black text-amber-600">{ENGINEER_PROFILE.rating}</p>
              <Star size={16} className="text-amber-500 fill-amber-500" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Quality Rating</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-xl">
            <p className="text-2xl font-black text-blue-600">{ENGINEER_PROFILE.activeRepairs}</p>
            <p className="text-[10px] text-slate-500 mt-1">Active This Week</p>
          </div>
        </div>
      </div>

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
