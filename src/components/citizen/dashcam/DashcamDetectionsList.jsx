/**
 * DashcamDetectionsList.jsx — Live Feed of Road Damage Detection Events.
 */

import React from 'react'
import { Link } from 'react-router-dom'
import {
  Flame,
  MapPin,
  Clock,
  CheckCircle2,
  CopyX,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Map,
  Eye,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react'
import { ROAD_DAMAGE_CLASSES } from '../../../services/detectionService'
import Button from '../../ui/Button'
import EmptyState from '../../ui/EmptyState'

export default function DashcamDetectionsList({
  events = [],
  onSelectEvent,
  onRetrySubmit,
  isSessionActive,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Live Detection Feed
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {events.length} Event{events.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time feed of road defects, computer vision classifications, and municipal filing statuses
          </p>
        </div>

        {isSessionActive && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Ingest Active
          </span>
        )}
      </div>

      {/* ── Feed List ──────────────────────────────────────────────────────── */}
      {events.length === 0 ? (
        <div className="p-8">
          <EmptyState
            icon={Layers}
            title="No Road Hazards Detected Yet"
            message={
              isSessionActive
                ? 'Camera stream is actively scanning pavement. Detections exceeding the confidence threshold will appear here in real time.'
                : 'Start the Live Dashcam to begin automated road surface inspection.'
            }
            compact
          />
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
          {events.map((evt) => {
            const classMeta = ROAD_DAMAGE_CLASSES[evt.damage_class] || {
              name: evt.damage_label,
              color: '#3b82f6',
              bgLight: 'bg-blue-50 text-blue-700 border-blue-200',
            }

            const formattedTime = new Date(evt.captured_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })

            return (
              <div
                key={evt.event_id}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Frame Snapshot */}
                  <div
                    onClick={() => onSelectEvent(evt)}
                    className="relative w-20 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 shadow-xs cursor-pointer group"
                    title="Click to inspect detection frame"
                  >
                    <img
                      src={evt.image_reference || '/sample-pothole.jpg'}
                      alt={evt.damage_label}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center text-white opacity-0 group-hover:opacity-100">
                      <Eye size={16} />
                    </div>
                    {evt.box && (
                      <span
                        className="absolute border border-red-500 bg-red-500/20 rounded-xs pointer-events-none"
                        style={{
                          left: `${evt.box.x}%`,
                          top: `${evt.box.y}%`,
                          width: `${evt.box.w}%`,
                          height: `${evt.box.h}%`,
                        }}
                      />
                    )}
                  </div>

                  {/* Text details */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${classMeta.bgLight}`}>
                        {evt.damage_class}: {evt.damage_label}
                      </span>

                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                        {Math.round(evt.confidence * 1000) / 10}% Conf
                      </span>

                      {evt.is_simulated && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                          <Sparkles size={10} />
                          Simulated
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{evt.location_name || 'Pune Municipal Corridor'}</span>
                    </div>

                    {/* Coordinates & Timestamp */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>{formattedTime}</span>
                      {evt.latitude && evt.longitude && (
                        <span>
                          [{evt.latitude.toFixed(4)}, {evt.longitude.toFixed(4)}]
                        </span>
                      )}
                      {evt.priority_score && (
                        <span className="text-slate-600 font-bold">
                          SRPS: {evt.priority_score}/100
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status Badges & Action Buttons */}
                <div className="flex items-center gap-2.5 sm:self-center shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  {/* Status Badge */}
                  <div>
                    {evt.complaint_status === 'created' ? (
                      <div className="flex flex-col items-start sm:items-end">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={13} />
                          <span>Filed: {evt.complaint_id}</span>
                        </span>
                        <span className="text-[10px] text-emerald-600 mt-0.5 font-semibold">
                          Active in Citizen Reports
                        </span>
                      </div>
                    ) : evt.detection_status === 'duplicate_skipped' ? (
                      <div className="flex flex-col items-start sm:items-end">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <CopyX size={13} />
                          <span>Duplicate Filtered</span>
                        </span>
                        <span className="text-[10px] text-purple-600 mt-0.5">
                          Within 35m spatial window
                        </span>
                      </div>
                    ) : evt.complaint_status === 'demo_only' ? (
                      <div className="flex flex-col items-start sm:items-end">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <Sparkles size={12} className="text-amber-500" />
                          <span>Demo Event</span>
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Not filed to live queue
                        </span>
                      </div>
                    ) : evt.complaint_status === 'failed' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                        <AlertTriangle size={13} />
                        <span>Filing Error</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock size={13} />
                        <span>Review Queue</span>
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {/* View Details modal */}
                    <button
                      onClick={() => onSelectEvent(evt)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Inspect AI Vision Frame & SRPS Breakdown"
                      aria-label="Inspect AI Vision Frame"
                    >
                      <Eye size={16} />
                    </button>

                    {/* View on Map */}
                    {evt.latitude && evt.longitude && (
                      <Link
                        to="/citizen/map"
                        className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View Location on City Map"
                        aria-label="View Location on City Map"
                      >
                        <Map size={16} />
                      </Link>
                    )}

                    {/* Retry button for failed or demo submissions */}
                    {(evt.complaint_status === 'failed' || evt.complaint_status === 'demo_only') && onRetrySubmit && (
                      <button
                        onClick={() => onRetrySubmit(evt)}
                        className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Submit to Official Complaints"
                        aria-label="Submit to Official Complaints"
                      >
                        <RotateCcw size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
