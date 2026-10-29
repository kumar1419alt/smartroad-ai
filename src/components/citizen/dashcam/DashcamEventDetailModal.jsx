/**
 * DashcamEventDetailModal.jsx — Detailed Inspection Modal for an Auto-Detected Event.
 */

import React, { useEffect } from 'react'
import {
  X,
  MapPin,
  Flame,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
  CopyX,
  Send,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Eye,
  RotateCcw,
} from 'lucide-react'
import { ROAD_DAMAGE_CLASSES } from '../../../services/detectionService'
import Button from '../../ui/Button'
import { Link } from 'react-router-dom'

export default function DashcamEventDetailModal({
  event,
  isOpen,
  onClose,
  onSubmitComplaint,
  isSubmitting = false,
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

  if (!isOpen || !event) return null

  const classMeta = ROAD_DAMAGE_CLASSES[event.damage_class] || {
    name: event.damage_label,
    category: 'Road Defect',
    color: '#3b82f6',
    bgLight: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Detected pavement surface defect',
  }

  const { box } = event

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              <Eye size={16} />
            </span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                AI Vision Detection Detail
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Event ID: {event.event_id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* 1. Captured Still Image with Bounding Box Overlay */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center shadow-inner">
            <img
              src={event.image_reference || '/sample-pothole.jpg'}
              alt={event.damage_label}
              className="w-full h-full object-cover"
            />

            {/* Bounding Box Simulation */}
            {box && (
              <div
                className="absolute border-2 rounded-md pointer-events-none"
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.w}%`,
                  height: `${box.h}%`,
                  borderColor: classMeta.color,
                  boxShadow: `0 0 16px ${classMeta.color}88, inset 0 0 10px ${classMeta.color}44`,
                }}
              >
                <span
                  className="absolute -top-6 left-0 text-[10px] font-bold text-white px-2 py-0.5 rounded shadow font-mono"
                  style={{ backgroundColor: classMeta.color }}
                >
                  {event.damage_class}: {classMeta.name} [{Math.round(event.confidence * 100)}%]
                </span>
              </div>
            )}

            {/* Simulated Tag */}
            {event.is_simulated && (
              <span className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-sm text-amber-400 font-bold px-2.5 py-1 rounded-lg text-[10px] border border-amber-500/40 flex items-center gap-1">
                <Sparkles size={11} />
                Demo Simulation
              </span>
            )}
          </div>

          {/* 2. Primary Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Damage Class</span>
              <p className="font-extrabold text-sm text-slate-900 mt-0.5">{event.damage_class}</p>
              <p className="text-[10px] text-slate-500 truncate">{classMeta.name}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Confidence</span>
              <p className="font-extrabold text-sm text-blue-600 mt-0.5">
                {Math.round(event.confidence * 1000) / 10}%
              </p>
              <p className="text-[10px] text-slate-500">YOLO Confidence</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">SRPS Score</span>
              <p className="font-extrabold text-sm text-red-600 mt-0.5">
                {event.priority_score || 88} / 100
              </p>
              <p className="text-[10px] text-slate-500">Priority Score</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">GPS Accuracy</span>
              <p className="font-extrabold text-sm text-emerald-600 mt-0.5">
                {event.gps_accuracy ? `±${event.gps_accuracy}m` : 'Unavailable'}
              </p>
              <p className="text-[10px] text-slate-500 capitalize">{event.gps_status || 'Verified'}</p>
            </div>
          </div>

          {/* 3. Location & Timestamps */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
            <div className="flex items-start gap-2">
              <MapPin size={15} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">{event.location_name || 'Pune Municipal Corridor'}</p>
                <p className="text-slate-500">{event.ward || 'Ward 14 (Shivajinagar - Deccan)'}</p>
                {event.latitude && event.longitude && (
                  <p className="font-mono text-[11px] text-slate-400 mt-1">
                    Latitude: {event.latitude.toFixed(6)} | Longitude: {event.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                Captured: {new Date(event.captured_at).toLocaleString()}
              </span>
              <span className="font-mono text-[11px]">Session: {event.session_id}</span>
            </div>
          </div>

          {/* 4. Status Description */}
          {event.complaint_id ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900">
                  Registered Municipal Complaint: {event.complaint_id}
                </p>
                <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                  This defect has been officially filed with the Pune Municipal Corporation. You can track field repair progress under &quot;My Reports&quot;.
                </p>
              </div>
            </div>
          ) : event.detection_status === 'duplicate_skipped' ? (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-3">
              <CopyX size={18} className="text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-purple-900">Duplicate Filtered</p>
                <p className="text-purple-800 text-[11px] mt-0.5 leading-relaxed">
                  {event.skip_reason || 'This defect was detected within 35 meters and 25 seconds of an existing road hazard. Suppressed to prevent duplicate tickets.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
              <Sparkles size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-900">Detection Captured in Memory</p>
                <p className="text-blue-800 text-[11px] mt-0.5 leading-relaxed">
                  {event.is_simulated
                    ? 'Generated via demo simulation. You can click "Submit Official Complaint" below to register this as an official test complaint in the municipal database.'
                    : 'Detection verified by AI. Ready for registration into the municipal work queue.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            {event.complaint_id ? (
              <Link
                to={`/citizen/reports/${event.complaint_id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
              >
                <span>View My Report</span>
                <ExternalLink size={13} />
              </Link>
            ) : (
              onSubmitComplaint && (
                <Button
                  variant="primary"
                  size="md"
                  icon={Send}
                  loading={isSubmitting}
                  onClick={() => onSubmitComplaint(event)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Submit Official Complaint
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
