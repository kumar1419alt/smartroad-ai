/**
 * Dashboard page — KPI overview, charts, activity feed.
 * Full implementation in Phase 2.
 */

import React from 'react'
import { LayoutDashboard, AlertTriangle, CheckCircle2, Clock, TrendingUp } from 'lucide-react'
import { Card, Badge } from '../components/ui'

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Operations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time road damage detection and repair progress overview
          </p>
        </div>
        <Badge variant="outline" size="sm">
          Last updated: 13 Oct 2026, 13:45
        </Badge>
      </div>

      {/* KPI row placeholder */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Incidents', value: '1,284', icon: AlertTriangle, color: 'text-slate-600' },
          { label: 'Critical', value: '47', icon: AlertTriangle, color: 'text-red-600' },
          { label: 'In Progress', value: '61', icon: Clock, color: 'text-indigo-600' },
          { label: 'Completed (Oct)', value: '204', icon: CheckCircle2, color: 'text-green-600' },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{kpi.label}</p>
                <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
              </div>
              <span className="p-2 rounded-lg bg-slate-50 shrink-0">
                <kpi.icon size={18} className={kpi.color} aria-hidden="true" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts and map coming in Phase 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <Card.Header>
            <h2 className="text-sm font-semibold text-slate-700">Monthly Incident Trend</h2>
            <Badge variant="outline" size="sm">May — Oct 2026</Badge>
          </Card.Header>
          <Card.Body>
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
              <span className="flex items-center gap-2">
                <TrendingUp size={18} />
                Chart panel — Phase 2
              </span>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Header>
            <h2 className="text-sm font-semibold text-slate-700">Damage Types</h2>
          </Card.Header>
          <Card.Body>
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
              Donut chart — Phase 2
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}
