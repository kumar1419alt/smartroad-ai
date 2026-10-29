/**
 * DashcamSessionSummaryModal.jsx — Debriefing dialog displayed after stopping a dashcam session.
 */

import React from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  FileCheck,
  Filter,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Modal from '../../ui/Modal'
import Button from '../../ui/Button'
import { ROAD_DAMAGE_CLASSES } from '../../../services/detectionService'

export default function DashcamSessionSummaryModal({
  isOpen,
  onClose,
  stats,
  durationSeconds = 0,
  events = [],
  isDemoMode = false,
}) {
  if (!isOpen) return null

  // Format duration into mm:ss or hh:mm:ss
  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
  }

  // Count detections by RDD2022 damage class
  const classBreakdown = {
    D00: 0,
    D10: 0,
    D20: 0,
    D40: 0,
  }

  events.forEach((evt) => {
    if (classBreakdown[evt.damage_class] != null) {
      classBreakdown[evt.damage_class]++
    }
  })

  const complaintsCount = events.filter((e) => e.complaint_id).length

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dashcam Session Debrief & Summary"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <ShieldCheck size={16} />
            <span>Camera & GPS tracks successfully stopped</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/citizen/reports">
              <Button variant="secondary" size="sm" icon={ExternalLink}>
                My Reports
              </Button>
            </Link>
            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-blue-300">
              Civic Patrol Completed
            </span>
            {isDemoMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles size={11} />
                Demo Mode Simulation
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 border-t border-white/10">
            <div>
              <p className="text-[11px] text-slate-400">Total Duration</p>
              <p className="text-lg font-bold font-mono text-white mt-0.5">
                {formatDuration(durationSeconds)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Frames Sampled</p>
              <p className="text-lg font-bold font-mono text-blue-300 mt-0.5">
                {stats?.framesAnalyzed || 0}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Defects Detected</p>
              <p className="text-lg font-bold font-mono text-amber-300 mt-0.5">
                {stats?.damageEventsDetected || 0}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Complaints Filed</p>
              <p className="text-lg font-bold font-mono text-emerald-300 mt-0.5">
                {complaintsCount}
              </p>
            </div>
          </div>
        </div>

        {/* Damage Class Breakdown */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Detected Damage Distribution (RDD2022)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(ROAD_DAMAGE_CLASSES).map(([code, def]) => {
              const count = classBreakdown[code] || 0
              return (
                <div
                  key={code}
                  className="rounded-xl border border-slate-200/90 p-3 bg-slate-50/70"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${def.color}18`,
                        color: def.color,
                        border: `1px solid ${def.color}35`,
                      }}
                    >
                      {code}
                    </span>
                    <span className="text-lg font-black text-slate-800">{count}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 truncate" title={def.name}>
                    {def.name}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{def.category}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Deduplication Efficiency Callout */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Filter size={18} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900">
                Spatial & Temporal Deduplication
              </h5>
              <p className="text-[11px] text-slate-500">
                Prevented spamming multiple municipal tickets for the same roadway issue.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-black text-purple-700 font-mono">
              {stats?.duplicateEventsSkipped || 0}
            </span>
            <span className="text-[10px] text-slate-400 block">redundant frames filtered</span>
          </div>
        </div>

        {/* Civic Transparency Notice */}
        <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="font-semibold text-slate-700">Notice: </span>
          All complaints generated during this session are now permanently recorded in your{' '}
          <Link to="/citizen/reports" className="text-blue-600 underline font-semibold">
            My Reports
          </Link>{' '}
          dashboard and indexed into the Pune Municipal Corporation GIS priority queue. Municipal engineers have been notified according to calculated Smart Road Repair Priority Scores (SRPS).
        </div>
      </div>
    </Modal>
  )
}
