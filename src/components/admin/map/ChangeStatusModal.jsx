/**
 * ChangeStatusModal.jsx — Modal to update complaint repair lifecycle status.
 */

import React, { useState, useEffect } from 'react'
import { X, CheckCircle2, Clock, AlertTriangle, RefreshCw, Check } from 'lucide-react'

const STATUSES = [
  { value: 'Pending', label: 'Pending Verification', desc: 'Report logged, awaiting AI confirmation or triage', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { value: 'In Progress', label: 'In Progress', desc: 'Field repair squad on-site, milling or patching underway', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { value: 'Scheduled', label: 'Scheduled for Repair', desc: 'Work order generated and assigned to squad calendar', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { value: 'Resolved', label: 'Resolved / Repaired', desc: 'Resurfacing completed, compaction verified, road open', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
]

export default function ChangeStatusModal({
  complaint,
  isOpen,
  onClose,
  onStatusChange,
}) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen || !complaint) return null

  const [selectedStatus, setSelectedStatus] = useState(complaint.status || 'Pending')

  const handleSave = () => {
    onStatusChange?.(complaint.id, selectedStatus)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[2000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base leading-tight">Update Repair Lifecycle Status</h3>
            <p className="text-xs text-slate-400 mt-0.5">{complaint.id} • {complaint.damageType}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500">
            Select the current operational state of this road pavement issue. Changes immediately update the GIS map and citizen tracking.
          </p>

          <div className="space-y-2.5">
            {STATUSES.map((s) => (
              <div
                key={s.value}
                onClick={() => setSelectedStatus(s.value)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                  selectedStatus.toLowerCase().includes(s.value.toLowerCase())
                    ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900">{s.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm border ${s.color}`}>
                      {s.value}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{s.desc}</p>
                </div>

                {selectedStatus.toLowerCase().includes(s.value.toLowerCase()) && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Check size={12} />
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
