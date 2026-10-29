/**
 * AdminAnalyticsCharts.jsx — 5 Recharts data visualizations for Admin Dashboard.
 *
 * 1. Damage Type Distribution (Donut Chart)
 * 2. Complaints by Month (Area Chart with gradient)
 * 3. Complaints by Severity (Bar Chart with color coding)
 * 4. Resolution Status (Donut Chart)
 * 5. Ward / Location Distribution (Horizontal Bar Chart)
 */

import React from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import AnalyticsCard from './AnalyticsCard'

// ─── Custom Tooltip Component ────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-lg border border-slate-700">
        <p className="font-bold text-slate-200">{label || payload[0]?.name}</p>
        {payload.map((entry, idx) => (
          <p key={`item-${idx}`} className="text-[11px] mt-0.5" style={{ color: entry.color || '#60a5fa' }}>
            {entry.name}: <span className="font-extrabold text-white">{entry.value}</span>
            {entry.unit && ` ${entry.unit}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AdminAnalyticsCharts({
  damageTypeData = [
    { name: 'Pothole', value: 421, color: '#ef4444' },
    { name: 'Crack', value: 318, color: '#f97316' },
    { name: 'Rutting', value: 187, color: '#eab308' },
    { name: 'Subsidence', value: 94, color: '#8b5cf6' },
    { name: 'Edge Damage', value: 163, color: '#06b6d4' },
  ],
  monthlyTrendData = [
    { month: 'May 26', detected: 98, repaired: 72 },
    { month: 'Jun 26', detected: 124, repaired: 89 },
    { month: 'Jul 26', detected: 187, repaired: 101 },
    { month: 'Aug 26', detected: 231, repaired: 148 },
    { month: 'Sep 26', detected: 196, repaired: 172 },
    { month: 'Oct 26', detected: 143, repaired: 204 },
  ],
  severityData = [
    { severity: 'Critical', count: 47, color: '#ef4444' },
    { severity: 'High', count: 213, color: '#f97316' },
    { severity: 'Medium', count: 589, color: '#eab308' },
    { severity: 'Low', count: 435, color: '#10b981' },
  ],
  statusData = [
    { name: 'Resolved', value: 824, color: '#10b981' },
    { name: 'In Progress', value: 61, color: '#3b82f6' },
    { name: 'Scheduled', value: 138, color: '#8b5cf6' },
    { name: 'Pending Review', value: 261, color: '#f59e0b' },
  ],
  wardData = [
    { ward: 'Shivajinagar (W-14)', incidents: 312, resolved: 240 },
    { ward: 'Hinjewadi Corridor', incidents: 243, resolved: 182 },
    { ward: 'Aundh - Baner (W-8)', incidents: 201, resolved: 165 },
    { ward: 'Kothrud (W-12)', incidents: 198, resolved: 154 },
    { ward: 'Viman Nagar (W-3)', incidents: 187, resolved: 142 },
    { ward: 'Swargate (W-18)', incidents: 143, resolved: 128 },
  ],
}) {
  return (
    <div className="space-y-6">
      {/* ── Top Row: 2 Primary Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Complaints by Month (Area Chart) */}
        <AnalyticsCard
          title="Monthly Incidents & Repair Trajectory"
          subtitle="Comparison of AI-detected road damages vs municipal repair completions"
          badge="6-Month Trend"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="detectedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="repairedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area
                type="monotone"
                dataKey="detected"
                name="New Incidents Detected"
                stroke="#ef4444"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#detectedGrad)"
              />
              <Area
                type="monotone"
                dataKey="repaired"
                name="Repairs Completed"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#repairedGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        {/* 2. Damage Type Distribution (Donut Chart) */}
        <AnalyticsCard
          title="Damage Classification Distribution"
          subtitle="Proportion of detected defects categorized by Computer Vision classifier"
          badge="Vision Model v2.4"
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={damageTypeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {damageTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </AnalyticsCard>
      </div>

      {/* ── Bottom Row: 3 Modular Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 3. Complaints by Severity (Bar Chart) */}
        <AnalyticsCard
          title="Complaints by Severity"
          subtitle="Incident severity breakdown"
          badge="Live Counts"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={severityData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="severity" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Incidents" radius={[6, 6, 0, 0]}>
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        {/* 4. Resolution Status (Donut Chart) */}
        <AnalyticsCard
          title="Repair Pipeline Status"
          subtitle="Workflow status across all wards"
          badge="Municipal SLA"
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-status-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={40} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        {/* 5. Ward / Location Distribution (Horizontal Bar Chart) */}
        <AnalyticsCard
          title="Top High-Density Wards"
          subtitle="Incidents by municipal administrative ward"
          badge="Pune PMC"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={wardData}
              layout="vertical"
              margin={{ top: 5, right: 15, left: 35, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="ward"
                tick={{ fontSize: 9, fill: '#475569' }}
                axisLine={false}
                tickLine={false}
                width={75}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="incidents" name="Reported" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsCard>
      </div>
    </div>
  )
}
