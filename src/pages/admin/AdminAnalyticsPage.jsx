/**
 * AdminAnalyticsPage.jsx — Route: /admin/analytics
 *
 * Comprehensive Municipal Road Infrastructure & Defect Intelligence Analytics.
 * Built with Recharts.
 *
 * Professional Visualizations:
 *  1. Damage Type Distribution (Interactive Donut Chart with custom legend & percentage)
 *  2. Monthly Complaint Trend (Dual-gradient Area Chart: Detected vs Repaired)
 *  3. Severity Distribution (Severity-coded Bar Chart with resolution velocity)
 *  4. Priority Distribution (SRPS Tiers: Critical 85+, High 70-84, Medium 50-69, Low <50)
 *  5. Complaint Resolution Status (Donut Chart: Resolved, In Progress, Scheduled, Pending)
 *  6. Average Resolution Time (Bar Chart by defect type with municipal SLA target line)
 *  7. Location / Ward-wise Complaints (Grouped Bar Chart: Incidents vs Resolved by Ward)
 *
 * Additional Features:
 *  - Date Range Selector: 7 Days, 30 Days, 3 Months, 6 Months, 1 Year
 *  - Dynamic KPI summaries that adjust with the selected date range
 *  - Interactive tooltips with sleek dark glassmorphism
 *  - Transparent disclaimer: "Simulated Analytical Model — Research & Demonstration Data"
 *  - Mock data sourced from mockData.js
 */

import React, { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Calendar,
  Download,
  ShieldAlert,
  Info,
  Layers,
  MapPin,
  Sparkles,
  Zap,
  Target,
  RefreshCw,
} from 'lucide-react'
import AnalyticsCard from '../../components/admin/AnalyticsCard'
import {
  mockDashboardSummary,
  mockMonthlyTrend,
  mockDamageTypeDistribution,
  mockZones,
} from '../../data/mockData'

// ─── DATE RANGE MULTIPLIERS & SLICES ─────────────────────────────────────────
const DATE_RANGES = [
  { id: '7d', label: '7 Days', factor: 0.08, trendCount: 2, labelPrefix: 'Past 7 Days' },
  { id: '30d', label: '30 Days', factor: 0.25, trendCount: 3, labelPrefix: 'Past 30 Days' },
  { id: '3m', label: '3 Months', factor: 0.55, trendCount: 4, labelPrefix: 'Past Quarter' },
  { id: '6m', label: '6 Months', factor: 1.0, trendCount: 6, labelPrefix: 'Past 6 Months' },
  { id: '1y', label: '1 Year', factor: 1.85, trendCount: 6, labelPrefix: 'Past 12 Months' },
]

// ─── COLOR PALETTES ──────────────────────────────────────────────────────────
const SEVERITY_COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#10b981',
}

const STATUS_COLORS = {
  'Resolved': '#10b981',
  'In Progress': '#3b82f6',
  'Scheduled': '#8b5cf6',
  'Pending Review': '#f59e0b',
}

const DAMAGE_COLORS = [
  '#ef4444', // Pothole
  '#f97316', // Crack
  '#eab308', // Rutting
  '#8b5cf6', // Subsidence
  '#06b6d4', // Edge Damage
  '#64748b', // Surface Deterioration
]

// ─── CUSTOM DARK GLASS TOOLTIP ───────────────────────────────────────────────
function CustomChartTooltip({ active, payload, label, unit = '' }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs rounded-xl p-3 shadow-2xl border border-slate-700/80 min-w-[170px] pointer-events-none z-50">
        <p className="font-extrabold text-slate-200 border-b border-slate-800 pb-1.5 mb-1.5">
          {label || payload[0]?.name || 'Metric'}
        </p>
        <div className="space-y-1">
          {payload.map((entry, idx) => (
            <div key={`tip-${idx}`} className="flex items-center justify-between gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color || entry.fill || '#60a5fa' }}
                />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white">
                {entry.value.toLocaleString()} {unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export default function AdminAnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState('6m')
  const [hoveredPieIndex, setHoveredPieIndex] = useState(null)

  const currentRange = DATE_RANGES.find((r) => r.id === selectedRange) || DATE_RANGES[3]
  const factor = currentRange.factor

  // ── 1. DYNAMIC SUMMARY KPIS ────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = Math.round(mockDashboardSummary.totalIncidents * factor)
    const critical = Math.max(2, Math.round(mockDashboardSummary.criticalCount * factor))
    const resolved = Math.round(824 * factor)
    const active = Math.max(12, Math.round((mockDashboardSummary.repairsScheduled + mockDashboardSummary.repairsInProgress) * factor))
    const avgTime = selectedRange === '7d' ? '3.4 Days' : selectedRange === '30d' ? '3.8 Days' : '4.2 Days'
    const slaRate = selectedRange === '7d' ? '94.2%' : selectedRange === '30d' ? '92.8%' : '91.4%'

    return { total, critical, resolved, active, avgTime, slaRate }
  }, [factor, selectedRange])

  // ── 2. CHART 1: DAMAGE TYPE DISTRIBUTION ───────────────────────────────────
  const damageTypeData = useMemo(() => {
    return mockDamageTypeDistribution.map((item, idx) => ({
      name: item.type,
      value: Math.max(10, Math.round(item.count * factor)),
      color: DAMAGE_COLORS[idx % DAMAGE_COLORS.length],
    }))
  }, [factor])

  const totalDamageCount = useMemo(() => {
    return damageTypeData.reduce((acc, curr) => acc + curr.value, 0)
  }, [damageTypeData])

  // ── 3. CHART 2: MONTHLY COMPLAINT TREND ────────────────────────────────────
  const monthlyTrendData = useMemo(() => {
    const base = [
      { month: 'May 26', detected: 98, repaired: 72 },
      { month: 'Jun 26', detected: 124, repaired: 89 },
      { month: 'Jul 26', detected: 187, repaired: 101 },
      { month: 'Aug 26', detected: 231, repaired: 148 },
      { month: 'Sep 26', detected: 196, repaired: 172 },
      { month: 'Oct 26', detected: 143, repaired: 204 },
    ]
    if (selectedRange === '7d') {
      return [
        { month: '07 Oct', detected: 18, repaired: 24 },
        { month: '09 Oct', detected: 24, repaired: 29 },
        { month: '11 Oct', detected: 19, repaired: 31 },
        { month: '13 Oct', detected: 15, repaired: 26 },
      ]
    }
    if (selectedRange === '30d') {
      return [
        { month: 'W1 Sep', detected: 48, repaired: 42 },
        { month: 'W2 Sep', detected: 52, repaired: 45 },
        { month: 'W3 Sep', detected: 44, repaired: 49 },
        { month: 'W4 Sep', detected: 52, repaired: 58 },
      ]
    }
    if (selectedRange === '3m') {
      return base.slice(2).map((item) => ({
        month: item.month,
        detected: Math.round(item.detected * 1.1),
        repaired: Math.round(item.repaired * 1.1),
      }))
    }
    if (selectedRange === '1y') {
      return [
        { month: 'Nov 25', detected: 85, repaired: 68 },
        { month: 'Jan 26', detected: 92, repaired: 80 },
        { month: 'Mar 26', detected: 110, repaired: 95 },
        { month: 'May 26', detected: 135, repaired: 112 },
        { month: 'Jul 26', detected: 210, repaired: 145 },
        { month: 'Sep 26', detected: 190, repaired: 188 },
      ]
    }
    return base
  }, [selectedRange])

  // ── 4. CHART 3: SEVERITY DISTRIBUTION ──────────────────────────────────────
  const severityData = useMemo(() => {
    return [
      {
        severity: 'Critical',
        count: Math.round(47 * factor),
        avgDays: 1.8,
        color: SEVERITY_COLORS.Critical,
      },
      {
        severity: 'High',
        count: Math.round(213 * factor),
        avgDays: 3.2,
        color: SEVERITY_COLORS.High,
      },
      {
        severity: 'Medium',
        count: Math.round(589 * factor),
        avgDays: 5.1,
        color: SEVERITY_COLORS.Medium,
      },
      {
        severity: 'Low',
        count: Math.round(435 * factor),
        avgDays: 8.4,
        color: SEVERITY_COLORS.Low,
      },
    ]
  }, [factor])

  // ── 5. CHART 4: PRIORITY DISTRIBUTION (SRPS TIERS) ─────────────────────────
  const priorityData = useMemo(() => {
    return [
      { tier: 'Critical (85+)', range: '85-100 SRPS', count: Math.round(112 * factor), dispatchHrs: 4, color: '#ef4444' },
      { tier: 'High (70-84)', range: '70-84 SRPS', count: Math.round(324 * factor), dispatchHrs: 12, color: '#f97316' },
      { tier: 'Medium (50-69)', range: '50-69 SRPS', count: Math.round(518 * factor), dispatchHrs: 36, color: '#eab308' },
      { tier: 'Low (<50)', range: '0-49 SRPS', count: Math.round(330 * factor), dispatchHrs: 72, color: '#10b981' },
    ]
  }, [factor])

  // ── 6. CHART 5: COMPLAINT RESOLUTION STATUS ────────────────────────────────
  const statusData = useMemo(() => {
    return [
      { name: 'Resolved', value: Math.round(824 * factor), color: STATUS_COLORS['Resolved'] },
      { name: 'In Progress', value: Math.max(5, Math.round(61 * factor)), color: STATUS_COLORS['In Progress'] },
      { name: 'Scheduled', value: Math.max(10, Math.round(138 * factor)), color: STATUS_COLORS['Scheduled'] },
      { name: 'Pending Review', value: Math.max(20, Math.round(261 * factor)), color: STATUS_COLORS['Pending Review'] },
    ]
  }, [factor])

  // ── 7. CHART 6: AVERAGE RESOLUTION TIME BY DEFECT TYPE ─────────────────────
  const resolutionTimeData = [
    { type: 'Pothole', actualDays: 2.1, slaTarget: 2.0 },
    { type: 'Subsidence', actualDays: 3.2, slaTarget: 3.0 },
    { type: 'Rutting', actualDays: 4.8, slaTarget: 5.0 },
    { type: 'Crack', actualDays: 5.4, slaTarget: 7.0 },
    { type: 'Edge Damage', actualDays: 6.1, slaTarget: 8.0 },
    { type: 'Surface Det.', actualDays: 7.5, slaTarget: 10.0 },
  ]

  // ── 8. CHART 7: LOCATION / WARD-WISE COMPLAINTS ────────────────────────────
  const wardData = useMemo(() => {
    return [
      { ward: 'Shivajinagar (W-14)', incidents: Math.round(312 * factor), resolved: Math.round(240 * factor), efficiency: '76.9%' },
      { ward: 'Hinjewadi Corridor', incidents: Math.round(243 * factor), resolved: Math.round(182 * factor), efficiency: '74.9%' },
      { ward: 'Aundh - Baner (W-8)', incidents: Math.round(201 * factor), resolved: Math.round(165 * factor), efficiency: '82.1%' },
      { ward: 'Kothrud (W-12)', incidents: Math.round(198 * factor), resolved: Math.round(154 * factor), efficiency: '77.8%' },
      { ward: 'Viman Nagar (W-3)', incidents: Math.round(187 * factor), resolved: Math.round(142 * factor), efficiency: '75.9%' },
      { ward: 'Swargate (W-18)', incidents: Math.round(143 * factor), resolved: Math.round(128 * factor), efficiency: '89.5%' },
    ]
  }, [factor])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── TOP HEADER & CONTROLS ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <BarChart3 size={18} />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Infrastructure Analytics & Defect Intelligence
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Cross-sectional performance analytics, AI defect classification, and municipal SLA turnaround metrics
            </p>
          </div>

          {/* Date Range Selector Pill Tabs */}
          <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              {DATE_RANGES.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setSelectedRange(range.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedRange === range.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors"
              title="Export report summary"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* ── MANDATORY RESEARCH / DEMO DISCLAIMER BANNER ─────────────────── */}
        <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
          <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-extrabold text-amber-950">Analytical Model Notice: </span>
            The statistical visualizations and figures presented on this portal are{' '}
            <strong className="underline decoration-amber-400">simulated research benchmarks</strong> generated
            from municipal simulation datasets (Pune / NCR demo records). They demonstrate platform analytical
            capabilities and should not be construed as verified ground-truth measurements.
          </div>
        </div>
      </div>

      {/* ── SUMMARY KPIS (DYNAMICALLY LINKED TO DATE RANGE) ────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Complaints</span>
            <Layers size={15} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{kpis.total.toLocaleString()}</p>
          <p className="text-[10px] text-blue-600 font-bold mt-1">{currentRange.labelPrefix}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Critical Hazards</span>
            <AlertTriangle size={15} className="text-red-500" />
          </div>
          <p className="text-2xl font-black text-red-600 mt-2">{kpis.critical.toLocaleString()}</p>
          <p className="text-[10px] text-red-600 font-bold mt-1">Requires Priority 1 Dispatch</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg. Turnaround</span>
            <Clock size={15} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{kpis.avgTime}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">-0.6d vs Historical Baseline</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">SLA Compliance</span>
            <Target size={15} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{kpis.slaRate}</p>
          <p className="text-[10px] text-slate-500 font-bold mt-1">Target benchmark: 90.0%</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Field Works</span>
            <Zap size={15} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{kpis.active.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500 font-bold mt-1">Underway / Scheduled</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Resolved</span>
            <CheckCircle2 size={15} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">{kpis.resolved.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">Closed & QA Verified</p>
        </div>
      </div>

      {/* ── ROW 1: PRIMARY TRENDS & DEFECT CLASSIFICATION ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Monthly Complaint Trend (7 cols) */}
        <div className="lg:col-span-7">
          <AnalyticsCard
            title="Monthly Incident Detection vs Repair Output"
            subtitle="AI vision detections compared against municipal repair sign-offs"
            badge={currentRange.label}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDetected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRepaired" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomChartTooltip unit="issues" />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area
                  type="monotone"
                  dataKey="detected"
                  name="Detected Incidents"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDetected)"
                />
                <Area
                  type="monotone"
                  dataKey="repaired"
                  name="Completed Repairs"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRepaired)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </AnalyticsCard>
        </div>

        {/* 2. Damage Type Distribution (5 cols) */}
        <div className="lg:col-span-5">
          <AnalyticsCard
            title="Damage Type Distribution"
            subtitle="Breakdown of road defects recognized by the classification engine"
            badge="AI Classified"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-full">
              <div className="relative w-full sm:w-1/2 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={damageTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      onMouseEnter={(_, index) => setHoveredPieIndex(index)}
                      onMouseLeave={() => setHoveredPieIndex(null)}
                    >
                      {damageTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke={hoveredPieIndex === index ? '#0f172a' : '#ffffff'}
                          strokeWidth={hoveredPieIndex === index ? 3 : 1.5}
                          style={{ transition: 'all 0.2s ease' }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip unit="cases" />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Total Count */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-900">{totalDamageCount.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
                </div>
              </div>

              {/* Custom Legend with Percentages */}
              <div className="w-full sm:w-1/2 space-y-1.5 text-xs">
                {damageTypeData.map((item, idx) => {
                  const pct = totalDamageCount > 0 ? ((item.value / totalDamageCount) * 100).toFixed(1) : 0
                  return (
                    <div
                      key={item.name}
                      onMouseEnter={() => setHoveredPieIndex(idx)}
                      onMouseLeave={() => setHoveredPieIndex(null)}
                      className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                        hoveredPieIndex === idx ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-700 truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-slate-900 font-bold">{item.value}</span>
                        <span className="text-[10px] text-slate-400 font-mono w-9 text-right">({pct}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </AnalyticsCard>
        </div>
      </div>

      {/* ── ROW 2: SEVERITY & PRIORITY DISTRIBUTION ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Severity Distribution (Bar Chart) */}
        <AnalyticsCard
          title="Defect Severity Distribution"
          subtitle="Volume of incidents grouped by structural severity level"
          badge="Safety Tiers"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={severityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="severity" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomChartTooltip unit="complaints" />} />
              <Bar dataKey="count" name="Complaints" radius={[6, 6, 0, 0]}>
                {severityData.map((entry, index) => (
                  <Cell key={`sev-cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-4 gap-2 text-center text-xs">
            {severityData.map((s) => (
              <div key={s.severity} className="p-1 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.severity}</span>
                <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">{s.count}</p>
                <p className="text-[10px] text-slate-400 font-semibold">{s.avgDays}d TAT</p>
              </div>
            ))}
          </div>
        </AnalyticsCard>

        {/* 4. Priority Distribution (SRPS Tiers) */}
        <AnalyticsCard
          title="Smart Road Priority Score (SRPS) Distribution"
          subtitle="Issues ranked according to multi-factor repair priority formula"
          badge="SRPS Formula"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="tier" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomChartTooltip unit="issues" />} />
              <Bar dataKey="count" name="Issues Ranked" radius={[6, 6, 0, 0]}>
                {priorityData.map((entry, index) => (
                  <Cell key={`prio-cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-4 gap-2 text-center text-xs">
            {priorityData.map((p) => (
              <div key={p.tier} className="p-1 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold" style={{ color: p.color }}>{p.range}</span>
                <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">{p.count}</p>
                <p className="text-[10px] text-slate-400 font-semibold">&lt;{p.dispatchHrs}h dispatch</p>
              </div>
            ))}
          </div>
        </AnalyticsCard>
      </div>

      {/* ── ROW 3: RESOLUTION STATUS & AVERAGE RESOLUTION TIME ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 5. Complaint Resolution Status (5 cols) */}
        <div className="lg:col-span-5">
          <AnalyticsCard
            title="Complaint Resolution Lifecycle"
            subtitle="Status distribution of all reported road damage complaints"
            badge="Municipal Pipeline"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-full">
              <div className="w-full sm:w-1/2 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`stat-cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip unit="complaints" />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full sm:w-1/2 space-y-2 text-xs">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-mono font-extrabold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnalyticsCard>
        </div>

        {/* 6. Average Resolution Time vs SLA Target (7 cols) */}
        <div className="lg:col-span-7">
          <AnalyticsCard
            title="Average Resolution Turnaround Time (TAT)"
            subtitle="Actual days to complete repair vs municipal SLA service standard"
            badge="SLA Benchmark"
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={resolutionTimeData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" unit="d" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomChartTooltip unit="days" />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" iconSize={8} />
                <Bar dataKey="actualDays" name="Actual Turnaround" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                <Bar dataKey="slaTarget" name="SLA Benchmark" fill="#cbd5e1" radius={[0, 6, 6, 0]} />
                <ReferenceLine x={5.0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Target 5d', fill: '#ef4444', fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </AnalyticsCard>
        </div>
      </div>

      {/* ── ROW 4: LOCATION / WARD-WISE DISTRIBUTION ───────────────────────── */}
      <AnalyticsCard
        title="Location & Ward-Wise Defect Distribution"
        subtitle="Reported incidents compared with completed restorations across Pune municipal wards and key IT transit corridors"
        badge="Spatial Distribution"
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={wardData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="ward" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomChartTooltip unit="issues" />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" iconSize={8} />
            <Bar dataKey="incidents" name="Total Incidents Reported" fill="#f97316" radius={[6, 6, 0, 0]} />
            <Bar dataKey="resolved" name="Repairs Completed" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {wardData.map((w) => (
            <div key={w.ward} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <p className="text-[11px] font-bold text-slate-800 truncate" title={w.ward}>{w.ward.split('(')[0]}</p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="text-xs font-mono font-bold text-slate-700">{w.resolved}</span>
                <span className="text-[10px] text-slate-400">/ {w.incidents}</span>
              </div>
              <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                {w.efficiency} Closed
              </span>
            </div>
          ))}
        </div>
      </AnalyticsCard>
    </div>
  )
}
