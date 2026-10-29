/**
 * AdminDashboard.jsx — /admin/dashboard
 *
 * Road Infrastructure Command Center.
 *
 * Core Sections:
 *  1. Header: "Road Infrastructure Command Center"
 *  2. Summary cards:
 *      - Total Complaints
 *      - Critical Issues
 *      - Pending Issues
 *      - Resolved Issues
 *  3. Priority section:
 *      - PriorityTable showing top priority road issues ranked by SRPS
 *  4. GIS section:
 *      - Interactive GIS Map showing all issues with heatmap and severity markers
 *  5. Analytics section (Recharts):
 *      - Damage type distribution
 *      - Complaints by month
 *      - Complaints by severity
 *      - Resolution status
 *      - Ward / location distribution
 *  6. Modals for Inspecting & Dispatching work orders
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  MapPin,
  TrendingUp,
  Download,
  RefreshCw,
  HardHat,
  ShieldAlert,
  Send,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react'

import AdminStatCard from '../../components/admin/AdminStatCard'
import PriorityTable from '../../components/admin/PriorityTable'
import AdminAnalyticsCharts from '../../components/admin/AdminAnalyticsCharts'
import AdminIssueDetailModal from '../../components/admin/AdminIssueDetailModal'
import AdminDispatchModal from '../../components/admin/AdminDispatchModal'
import RoadDamageMap from '../../components/map/RoadDamageMap'

import { getSavedComplaints } from '../../services/complaintService'
import { mockDashboardSummary } from '../../data/mockData'
import { useToast } from '../../contexts/ToastContext'

export default function AdminDashboard() {
  const toast = useToast()
  const [complaints, setComplaints] = useState([])
  const [inspectIssue, setInspectIssue] = useState(null)
  const [dispatchIssue, setDispatchIssue] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState('Just now')

  // Load complaints (built-in + local storage reports)
  const loadData = (showToast = false) => {
    setIsRefreshing(true)
    const data = getSavedComplaints()
    setComplaints(data)
    setTimeout(() => {
      setIsRefreshing(false)
      const now = new Date()
      setLastSyncTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      if (showToast) {
        toast.info('Road infrastructure telemetry synchronized.')
      }
    }, 400)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Dynamic calculations based on active dataset
  const stats = useMemo(() => {
    const total = complaints.length
    const critical = complaints.filter(
      (c) => (c.severity || '').toLowerCase() === 'critical'
    ).length
    const pending = complaints.filter(
      (c) => (c.status || '').toLowerCase().includes('pending')
    ).length
    const resolved = complaints.filter(
      (c) => (c.status || '').toLowerCase().includes('resolved')
    ).length

    return {
      // Scale up by realistic municipal multiplier for high-level command view
      totalComplaints: 1240 + total,
      criticalIssues: 42 + critical,
      pendingIssues: 254 + pending,
      resolvedIssues: 810 + resolved,
    }
  }, [complaints])

  // Handle status update from modal
  const handleStatusChange = (id, newStatus) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    )
  }

  // Handle squad dispatch confirmation
  const handleConfirmDispatch = (id, updateData) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updateData } : c))
    )
  }

  // Export report demo
  const handleExportReport = () => {
    const jsonStr = JSON.stringify(complaints, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Pune_Road_Damage_Report_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Municipal road damage dataset exported successfully.')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ── 1. HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Road Infrastructure Command Center
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
              Live GIS Feed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            AI-driven road surface intelligence, automated defect severity classification, and multi-factor repair prioritization
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-colors cursor-pointer"
            title="Refresh telemetry"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Sync ({lastSyncTime})</span>
          </button>

          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <Download size={13} />
            Export Data
          </button>
        </div>
      </div>

      {/* ── 2. SUMMARY CARDS ──────────────────────────────────────────────── */}
      <section aria-label="Summary KPIs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Complaints */}
          <AdminStatCard
            title="Total Complaints"
            value={stats.totalComplaints.toLocaleString()}
            icon={AlertTriangle}
            color="blue"
            trend="+12.4% vs last month"
            trendType="up"
            badge="Municipal Total"
            subtitle="Across 24 Wards"
          />

          {/* Critical Issues */}
          <AdminStatCard
            title="Critical Issues"
            value={stats.criticalIssues.toLocaleString()}
            icon={ShieldAlert}
            color="red"
            trend="Requires immediate 24h action"
            trendType="danger"
            badge="SLA Level 1"
            subtitle="Immediate Dispatch"
          />

          {/* Pending Issues */}
          <AdminStatCard
            title="Pending Issues"
            value={stats.pendingIssues.toLocaleString()}
            icon={Clock}
            color="amber"
            trend="Awaiting field verification"
            trendType="neutral"
            badge="In Queue"
            subtitle="Avg wait: 1.4 days"
          />

          {/* Resolved Issues */}
          <AdminStatCard
            title="Resolved Issues"
            value={stats.resolvedIssues.toLocaleString()}
            icon={CheckCircle2}
            color="emerald"
            trend="94.2% within municipal SLA"
            trendType="up"
            badge="Completed"
            subtitle="98% Quality Check"
          />
        </div>
      </section>

      {/* ── 3. PRIORITY SECTION ───────────────────────────────────────────── */}
      <section aria-label="SRPS Priority Queue">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Flame size={20} className="text-red-500" />
              Top Priority Road Issues
            </h2>
            <p className="text-xs text-slate-500">
              Autonomously scored using the Smart Road Prioritization Score (SRPS: 0 - 100)
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
            <Info size={12} className="text-blue-500" />
            Sorted by SRPS descending
          </span>
        </div>

        <PriorityTable
          issues={complaints}
          limit={7}
          onInspect={(issue) => setInspectIssue(issue)}
          onAssignSquad={(issue) => setDispatchIssue(issue)}
        />
      </section>

      {/* ── 4. GIS MAP SECTION ────────────────────────────────────────────── */}
      <section aria-label="Interactive GIS Pavement Map" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              GIS Road Damage Spatial Intelligence
            </h2>
            <p className="text-xs text-slate-500">
              Interactive geographic visualization of road damage clusters, heatmaps, and field crew status
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>OpenStreetMap & Leaflet Integration Active</span>
          </div>
        </div>

        <div
          className="rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs bg-white"
          style={{ height: '620px' }}
        >
          <RoadDamageMap complaints={complaints} />
        </div>
      </section>

      {/* ── 5. ANALYTICS SECTION (RECHARTS) ───────────────────────────────── */}
      <section aria-label="Analytics & Trends" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" />
              Municipal Road Health Analytics
            </h2>
            <p className="text-xs text-slate-500">
              Aggregated insights across defect categories, monthly repair velocity, and ward density
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
            Recharts v3 Engine
          </span>
        </div>

        <AdminAnalyticsCharts />
      </section>

      {/* ── MODALS ────────────────────────────────────────────────────────── */}
      <AdminIssueDetailModal
        isOpen={Boolean(inspectIssue)}
        issue={inspectIssue}
        onClose={() => setInspectIssue(null)}
        onStatusChange={handleStatusChange}
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
