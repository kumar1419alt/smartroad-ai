/**
 * ReportsPage — generate and export infrastructure reports.
 * Full implementation in Phase 2.
 */

import React from 'react'
import { FileBarChart2 } from 'lucide-react'
import { Card } from '../components/ui'

export default function ReportsPage() {
  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Generate, schedule and export infrastructure assessment reports
        </p>
      </div>
      <Card>
        <div className="flex items-center justify-center py-16 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
          <span className="flex flex-col items-center gap-3">
            <span className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <FileBarChart2 size={20} className="text-slate-400" />
            </span>
            Reports module — Phase 2
          </span>
        </div>
      </Card>
    </div>
  )
}
