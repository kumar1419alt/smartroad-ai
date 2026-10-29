/**
 * AdminDispatchModal.jsx — Work Order Dispatch Modal for Administrator Dashboard.
 *
 * Allows assigning a municipal road squad, setting equipment, target repair date,
 * and dispatching work orders in real-time.
 */

import React, { useState } from 'react'
import { X, Send, HardHat, Calendar, Wrench, Truck, AlertTriangle } from 'lucide-react'

const CREWS = [
  'PMC Rapid Response Team #4',
  'Ward 10 Pavement Unit',
  'MIDC / PMC Joint Repair Crew',
  'Zone-3 Maintenance Wing',
  'Central City Highways Wing',
  'Hadapsar Ward Division',
  'PMC Drainage & Roads Dept',
]

export default function AdminDispatchModal({ issue, isOpen, onClose, onConfirmDispatch }) {
  if (!isOpen || !issue) return null

  const [squad, setSquad] = useState(issue.assignedSquad || CREWS[0])
  const [scheduledDate, setScheduledDate] = useState('2026-10-16')
  const [material, setMaterial] = useState('Hot Mix Asphalt (2.5 tonnes)')
  const [priorityNote, setPriorityNote] = useState('High traffic corridor — schedule during night window (11 PM - 5 AM).')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      onConfirmDispatch?.(issue.id, {
        assignedSquad: squad,
        status: 'In Progress',
        estimatedFix: scheduledDate,
      })
      setSubmitting(false)
      onClose()
    }, 400)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-blue-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <HardHat size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Dispatch Repair Squad</h3>
              <p className="text-xs text-blue-100 mt-0.5">{issue.id} • {issue.damageType}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
            <p className="font-bold text-slate-800">{issue.location}</p>
            <p className="text-slate-500">{issue.ward || 'Municipal Ward Area'}</p>
            <span className="inline-block mt-1 font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-sm">
              SRPS Priority Score: {issue.priority ?? issue.priorityScore ?? 90}/100
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Repair Squad / Unit
            </label>
            <select
              value={squad}
              onChange={(e) => setSquad(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
            >
              {CREWS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Material Allocated
              </label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option>Hot Mix Asphalt (2.5 tonnes)</option>
                <option>Cold Mix Bitumen (1.2 tonnes)</option>
                <option>Mastic Asphalt & Sealant</option>
                <option>Aggregate Sub-base & Milling</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Dispatch Instructions
            </label>
            <textarea
              rows={2}
              value={priorityNote}
              onChange={(e) => setPriorityNote(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send size={12} />
              {submitting ? 'Dispatching...' : 'Confirm Squad Dispatch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
