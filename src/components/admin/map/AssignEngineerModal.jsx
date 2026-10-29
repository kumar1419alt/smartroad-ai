/**
 * AssignEngineerModal.jsx — Modal to assign field engineer/squad from the Admin GIS Map.
 */

import React, { useState, useEffect } from 'react'
import { X, HardHat, UserCheck, Calendar, Wrench, Send, AlertTriangle } from 'lucide-react'

const ENGINEERS_AND_SQUADS = [
  { squad: 'PMC Rapid Response Team #4', lead: 'Vikram Joshi', phone: '+91 98230 11442', zone: 'Shivajinagar - Deccan (Ward 14)' },
  { squad: 'Ward 10 Pavement Unit', lead: 'Ramesh Kumar', phone: '+91 98111 54321', zone: 'SB Road / Model Colony' },
  { squad: 'MIDC / PMC Joint Repair Crew', lead: 'Ananya Deshmukh', phone: '+91 98901 33221', zone: 'Hinjewadi IT Corridor' },
  { squad: 'Zone-3 Maintenance Wing', lead: 'Sunil Shinde', phone: '+91 98224 88771', zone: 'Aundh - Baner (Ward 8)' },
  { squad: 'Central City Highways Wing', lead: 'Prakash Patil', phone: '+91 98450 66554', zone: 'Swargate - Tilak Road' },
  { squad: 'Hadapsar Ward Division', lead: 'Amit Kulkarni', phone: '+91 98670 99881', zone: 'Hadapsar - Mundhwa' },
]

export default function AssignEngineerModal({
  complaint,
  isOpen,
  onClose,
  onAssign,
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

  const [selectedIdx, setSelectedIdx] = useState(0)
  const [targetDate, setTargetDate] = useState('2026-10-16')
  const [urgencyNote, setUrgencyNote] = useState('Inspect surface deformation and coordinate traffic cones with local ward police.')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    const selected = ENGINEERS_AND_SQUADS[selectedIdx]
    setTimeout(() => {
      onAssign?.(complaint.id, {
        assignedSquad: selected.squad,
        assignedEngineer: `${selected.lead} (${selected.squad})`,
        status: 'In Progress',
        estimatedFix: targetDate,
      })
      setSubmitting(false)
      onClose()
    }, 350)
  }

  return (
    <div className="fixed inset-0 z-[2000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-blue-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <HardHat size={18} />
            </span>
            <div>
              <h3 className="font-bold text-base leading-tight">Assign Field Engineer & Squad</h3>
              <p className="text-xs text-blue-100 mt-0.5">{complaint.id} • {complaint.damageType}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <p className="font-extrabold text-slate-800">{complaint.location}</p>
            <p className="text-slate-500">{complaint.ward}</p>
            <div className="flex items-center gap-2 pt-1">
              <span className="font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-sm">
                SRPS: {complaint.priority ?? complaint.priorityScore ?? 90}
              </span>
              <span className="text-[11px] text-slate-400">Severity: {complaint.severity}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Municipal Engineering Unit
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {ENGINEERS_AND_SQUADS.map((unit, idx) => (
                <div
                  key={unit.squad}
                  onClick={() => setSelectedIdx(idx)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between ${
                    selectedIdx === idx
                      ? 'border-blue-500 bg-blue-50/70 text-blue-950 font-semibold ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-extrabold">{unit.squad}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Lead: <span className="font-bold text-slate-700">{unit.lead}</span> • Zone: {unit.zone}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-blue-600">{unit.phone}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Resolution Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dispatch Priority
              </label>
              <select className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500">
                <option>Urgent (Within 24 Hours)</option>
                <option>Scheduled (Within 48 Hours)</option>
                <option>Routine Queue (Within 7 Days)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Field Dispatch Directives
            </label>
            <textarea
              rows={2}
              value={urgencyNote}
              onChange={(e) => setUrgencyNote(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
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
              <Send size={13} />
              {submitting ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
