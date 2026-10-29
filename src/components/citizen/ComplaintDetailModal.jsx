/**
 * ComplaintDetailModal.jsx — Detailed modal inspect view for a selected complaint.
 */

import React from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ThumbsUp,
  Brain,
  Truck,
  Shield,
  Clock,
} from 'lucide-react'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'

export default function ComplaintDetailModal({ complaint, onClose, onUpvote }) {
  if (!complaint) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {complaint.id}
              </span>
              <StatusBadge status={complaint.status} size="xs" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {complaint.damageType}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Location & Details */}
        <div className="space-y-3.5 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-start gap-2">
              <MapPin size={15} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">{complaint.location}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{complaint.ward}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block mb-1">Smart Priority (SRPS)</span>
              <PriorityBadge priority={complaint.priority} />
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block mb-1">AI Detection Confidence</span>
              <span className="font-bold text-slate-800 text-sm">{complaint.aiConfidence || '94.2%'}</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Issue Description
            </span>
            <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
              {complaint.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-[11px] text-slate-400 block">Reported On</span>
              <span className="font-semibold text-slate-800">{complaint.date}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Target Resolution</span>
              <span className="font-semibold text-emerald-700">{complaint.estimatedFix || 'Under PMC Review'}</span>
            </div>
          </div>

          {complaint.assignedSquad && (
            <div className="flex items-center gap-2 p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-blue-900">
              <Truck size={15} className="text-blue-600 shrink-0" />
              <span className="text-[11px]">Assigned to: <strong>{complaint.assignedSquad}</strong></span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => onUpvote && onUpvote(complaint.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            <ThumbsUp size={13} className="text-blue-600" />
            <span>Endorse ({complaint.upvotes || 0})</span>
          </button>

          <div className="flex items-center gap-2">
            <Link
              to={`/citizen/reports/${complaint.id}`}
              onClick={onClose}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              Full Lifecycle View →
            </Link>

            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
