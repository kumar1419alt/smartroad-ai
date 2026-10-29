/**
 * AdminIssueDetailModal.jsx — Modal for deep inspection of road damage issues.
 *
 * Shows:
 *  - AI Vision bounding box simulation
 *  - GPS location & ward coordinates
 *  - SRPS 5-factor breakdown (Severity, Traffic, Criticality, Road Class, Reports)
 *  - Assigned repair team and timeline
 *  - Status update & dispatch actions
 */

import React, { useState } from 'react'
import {
  X,
  MapPin,
  Sparkles,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
  HardHat,
  Send,
  Navigation,
  Activity,
} from 'lucide-react'

export default function AdminIssueDetailModal({
  issue,
  isOpen,
  onClose,
  onStatusChange,
  onDispatch,
}) {
  if (!isOpen || !issue) return null

  const [selectedStatus, setSelectedStatus] = useState(issue.status || 'Pending')
  const score = issue.priority ?? issue.priorityScore ?? 50

  const handleSaveStatus = () => {
    onStatusChange?.(issue.id, selectedStatus)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* ── Modal Header ────────────────────────────────────────────────── */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {issue.id}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Detected on {issue.date || 'Recent Scan'}
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white">
              {issue.damageType} — {issue.location}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <MapPin size={12} className="text-blue-400" />
              {issue.ward || 'Municipal Ward Area'} • Coordinates: [
              {issue.coordinates ? issue.coordinates.join(', ') : '18.5204, 73.8567'}]
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Modal Body ──────────────────────────────────────────────────── */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top banner: SRPS Score & AI Vision */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* SRPS Metric */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>SRPS PRIORITY</span>
                <Flame size={15} className="text-red-500" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-black text-slate-900">{score}</span>
                <span className="text-slate-400 text-sm"> / 100</span>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block w-fit ${
                  score >= 85
                    ? 'bg-red-100 text-red-700'
                    : score >= 70
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {score >= 85 ? 'High Urgency Tier' : 'Standard Queue'}
              </span>
            </div>

            {/* AI Vision Confidence */}
            <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-indigo-700 font-semibold">
                <span>AI VISION CONFIDENCE</span>
                <Sparkles size={15} className="text-indigo-600" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-black text-indigo-900">
                  {issue.aiConfidence || '94.2%'}
                </span>
              </div>
              <span className="text-[10px] text-indigo-700 font-medium">
                YOLOv8 Road Defect Model v2.4
              </span>
            </div>

            {/* Severity & Upvotes */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>PUBLIC ESCALATION</span>
                <Activity size={15} className="text-emerald-600" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-black text-slate-900">{issue.upvotes || 18}</span>
                <span className="text-slate-500 text-xs ml-1">Citizen Confirmations</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-600">
                Status: {issue.status}
              </span>
            </div>
          </div>

          {/* AI Bounding Box & Damage Visual Simulation */}
          <div className="bg-slate-900 rounded-2xl p-4 text-white overflow-hidden relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers size={13} className="text-blue-400" />
                Computer Vision Inspection Frame
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                CLASS: {issue.damageType.toUpperCase()} (CONF: {issue.aiConfidence || '0.94'})
              </span>
            </div>

            <div className="h-44 bg-slate-800 rounded-xl relative border border-slate-700 flex items-center justify-center overflow-hidden">
              {/* Simulated road background texture */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-slate-800/40 to-black/60 pointer-events-none" />
              <div className="text-center z-10 space-y-1">
                <AlertTriangle size={32} className="text-amber-400 mx-auto" />
                <p className="text-xs font-bold text-slate-200">
                  {issue.damageType} — Visual Detection Artifact
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm px-4">
                  {issue.description || 'Pavement depression requiring bitumen compaction'}
                </p>
              </div>

              {/* Bounding box overlay simulation */}
              <div
                className="absolute border-2 border-red-500 bg-red-500/20 rounded-md flex flex-col justify-between p-1 pointer-events-none animate-pulse"
                style={{ top: '22%', left: '26%', width: '48%', height: '56%' }}
              >
                <span className="text-[9px] font-mono bg-red-600 text-white px-1 py-0.2 rounded-xs w-fit font-bold">
                  {issue.damageType} [{issue.aiConfidence || '94%'}]
                </span>
              </div>
            </div>
          </div>

          {/* SRPS 5-Factor Weighted Criteria Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              SRPS Multi-Factor Criteria Weights
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {[
                { label: 'Damage Severity', weight: '35%', score: score >= 90 ? '98/100' : '82/100', desc: 'Structural depth and accident risk' },
                { label: 'Traffic Importance', weight: '25%', score: '90/100', desc: 'Major arterial corridor volume' },
                { label: 'Location Criticality', weight: '15%', score: '88/100', desc: 'Proximity to hospitals & schools' },
                { label: 'Road Class', weight: '15%', score: '85/100', desc: 'Category-A municipal road' },
                { label: 'Citizen Frequency', weight: '10%', score: `${issue.upvotes || 24} reports`, desc: 'Community verification volume' },
              ].map((factor) => (
                <div
                  key={factor.label}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <div>
                    <p className="font-bold text-slate-800">{factor.label}</p>
                    <p className="text-[10px] text-slate-500">{factor.desc}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-600">{factor.score}</span>
                    <p className="text-[10px] text-slate-400">Weight: {factor.weight}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Squad & Execution Controls */}
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                <HardHat size={14} className="text-blue-600" />
                Assigned Squad:
              </div>
              <p className="text-sm font-extrabold text-blue-950 mt-0.5">
                {issue.assignedSquad || 'Unassigned — Pending Dispatch'}
              </p>
              <p className="text-[11px] text-blue-700">
                Target Resolution: {issue.estimatedFix || 'Within 48 hours'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs px-3 py-2 bg-white border border-blue-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pending">Status: Pending</option>
                <option value="In Progress">Status: In Progress</option>
                <option value="Resolved">Status: Resolved</option>
              </select>

              <button
                onClick={handleSaveStatus}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>

        {/* ── Modal Footer ────────────────────────────────────────────────── */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose()
              onDispatch?.(issue)
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Send size={13} />
            Dispatch Squad Now
          </button>
        </div>
      </div>
    </div>
  )
}
