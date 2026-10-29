/**
 * AdminPriorityQueuePage.jsx — /admin/priority-queue
 *
 * Dedicated Smart Road Repair Prioritization Queue.
 */

import React, { useState, useEffect } from 'react'
import { Flame, Sliders, Info, ShieldAlert } from 'lucide-react'
import PriorityTable from '../../components/admin/PriorityTable'
import AdminIssueDetailModal from '../../components/admin/AdminIssueDetailModal'
import AdminDispatchModal from '../../components/admin/AdminDispatchModal'
import { getSavedComplaints } from '../../services/complaintService'

export default function AdminPriorityQueuePage() {
  const [complaints, setComplaints] = useState([])
  const [inspectIssue, setInspectIssue] = useState(null)
  const [dispatchIssue, setDispatchIssue] = useState(null)

  useEffect(() => {
    // Only pending or in progress
    const data = getSavedComplaints().filter(
      (c) => !(c.status || '').toLowerCase().includes('resolved')
    )
    setComplaints(data)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Flame size={24} className="text-red-500" />
            Smart Priority Repair Queue (SRPS)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time algorithmic dispatch queue prioritizing critical damage on high-volume municipal routes
          </p>
        </div>
      </div>

      {/* Model Weights Info Box */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
            Active SRPS Scoring Formula
          </span>
          <p className="text-sm font-semibold text-white">
            SRPS = (0.35 × Severity) + (0.25 × Traffic) + (0.15 × Criticality) + (0.15 × Road Class) + (0.10 × Citizen Reports)
          </p>
          <p className="text-xs text-slate-400">
            Automated re-computation triggers upon new image ingestion or citizen cluster upvotes.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-white/10 text-white font-mono text-xs font-bold border border-white/20">
            Algorithm: Active (v2.4)
          </span>
        </div>
      </div>

      <PriorityTable
        title="Unresolved Issues Awaiting Repair Execution"
        issues={complaints}
        limit={25}
        onInspect={(issue) => setInspectIssue(issue)}
        onAssignSquad={(issue) => setDispatchIssue(issue)}
      />

      <AdminIssueDetailModal
        isOpen={Boolean(inspectIssue)}
        issue={inspectIssue}
        onClose={() => setInspectIssue(null)}
        onStatusChange={(id, status) => {
          setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
        }}
        onDispatch={(issue) => setDispatchIssue(issue)}
      />

      <AdminDispatchModal
        isOpen={Boolean(dispatchIssue)}
        issue={dispatchIssue}
        onClose={() => setDispatchIssue(null)}
        onConfirmDispatch={(id, data) => {
          setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
        }}
      />
    </div>
  )
}
