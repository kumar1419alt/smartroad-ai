/**
 * AnalyticsPage — advanced analytics and insights.
 * Full implementation in Phase 2.
 */

import React from 'react'
import { BarChart3 } from 'lucide-react'
import { Card } from '../components/ui'

export default function AnalyticsPage() {
  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Advanced insights — zone performance, prediction trends, cost analysis
        </p>
      </div>
      <Card>
        <div className="flex items-center justify-center py-16 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
          <span className="flex flex-col items-center gap-3">
            <span className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <BarChart3 size={20} className="text-slate-400" />
            </span>
            Analytics module — Phase 2
          </span>
        </div>
      </Card>
    </div>
  )
}
