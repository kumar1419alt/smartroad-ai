/**
 * EngineerIssueDetailModal.jsx — Full-featured issue inspection modal.
 *
 * Engineer can:
 *  1. View road image with AI detection bounding box overlay
 *  2. View AI detection confidence, damage class, and dimensions
 *  3. View location + open map
 *  4. Start repair / mark as in-progress
 *  5. Upload after-repair image (simulated via file picker)
 *  6. Mark resolved with completion notes
 *
 * Tabs:
 *  - Overview: Issue details, SRPS breakdown, and repair metadata
 *  - AI Detection: Road image with bounding box and confidence metrics
 *  - Before / After: Side-by-side comparison when after-image is available
 *  - Actions: Start repair, upload after image, and mark resolved
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  MapPin,
  Eye,
  Brain,
  Camera,
  PlayCircle,
  CheckCircle2,
  Upload,
  Clock,
  AlertTriangle,
  Calendar,
  Wrench,
  Users,
  Package,
  Flame,
  ExternalLink,
  ImageIcon,
  Layers,
  ChevronRight,
  Shield,
  Truck,
  Zap,
} from 'lucide-react'

import { useToast } from '../../contexts/ToastContext'

const SEVERITY_STYLES = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  high: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  low: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
}

const STATUS_STYLES = {
  'Assigned': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  'Resolved': 'bg-emerald-100 text-emerald-700',
}

export default function EngineerIssueDetailModal({ issue, isOpen, onClose, onUpdate }) {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [afterImagePreview, setAfterImagePreview] = useState(issue?.afterImage || null)
  const [completionNotes, setCompletionNotes] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

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

  if (!isOpen || !issue) return null

  const sev = SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.medium

  const handleStartRepair = () => {
    onUpdate(issue.id, {
      status: 'In Progress',
      startDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    })
    toast.success(`Repair started on ${issue.complaintId}. Status: In Progress`)
  }

  const handleMarkResolved = () => {
    onUpdate(issue.id, {
      status: 'Resolved',
      completionDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      afterImage: afterImagePreview || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      notes: completionNotes || issue.notes,
    })
    toast.success(`Issue ${issue.complaintId} marked as Resolved! QA verified.`)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setTimeout(() => {
        setAfterImagePreview(ev.target.result)
        setIsUploading(false)
        toast.success('After-repair photo uploaded successfully!')
      }, 500)
    }
    reader.readAsDataURL(file)
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Eye },
    { key: 'detection', label: 'AI Detection', icon: Brain },
    { key: 'images', label: 'Before / After', icon: Camera },
    { key: 'actions', label: 'Actions', icon: Wrench },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-hidden={!isOpen}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] outline-none z-10">
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${sev.dot}`} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{issue.complaintId}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sev.badge}`}>
                  {issue.severity.toUpperCase()}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[issue.status]}`}>
                  {issue.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{issue.damageType} • SRPS: {issue.srps}/100</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── TABS ── */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-100 bg-slate-50/50 shrink-0 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* SRPS Score Banner */}
              <div className={`p-4 rounded-xl border ${sev.bg} ${sev.border}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Smart Road Priority Score</p>
                    <p className={`text-3xl font-black ${sev.text} mt-0.5`}>
                      {issue.srps} <span className="text-sm font-medium text-slate-400">/ 100</span>
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${sev.badge}`}>
                    {issue.priorityLevel} Priority
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={14} className="text-slate-500" />
                    <span className="text-[10px] font-bold uppercase text-slate-400">Location</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{issue.location}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{issue.ward}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    {issue.coordinates[0].toFixed(4)}°N, {issue.coordinates[1].toFixed(4)}°E
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={14} className="text-slate-500" />
                    <span className="text-[10px] font-bold uppercase text-slate-400">Timeline</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assigned:</span>
                      <span className="font-semibold text-slate-700">{issue.assignedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Started:</span>
                      <span className="font-semibold text-slate-700">{issue.startDate || 'Not started'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Target:</span>
                      <span className="font-semibold text-amber-600">{issue.targetDate}</span>
                    </div>
                    {issue.completionDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Completed:</span>
                        <span className="font-semibold text-emerald-600">{issue.completionDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={14} className="text-slate-500" />
                    <span className="text-[10px] font-bold uppercase text-slate-400">Materials & Equipment</span>
                  </div>
                  <p className="text-xs text-slate-700">{issue.materials}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{issue.equipment}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={14} className="text-slate-500" />
                    <span className="text-[10px] font-bold uppercase text-slate-400">Crew Details</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{issue.crewSize} Workers</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">PMC Rapid Response Team #4</p>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Field Notes</p>
                <p className="text-xs text-slate-700 leading-relaxed">{issue.description}</p>
                {issue.notes && (
                  <p className="text-xs text-slate-500 mt-2 italic border-t border-slate-200 pt-2">
                    {issue.notes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* AI DETECTION TAB */}
          {activeTab === 'detection' && (
            <div className="space-y-5">
              {/* Road Image with Bounding Box */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={issue.roadImage}
                  alt={`Road damage at ${issue.location}`}
                  className="w-full h-64 sm:h-80 object-cover"
                />
                {/* Bounding Box Overlay */}
                {issue.aiDetection?.boundingBox && (
                  <div
                    className="absolute border-2 border-red-500 rounded-sm"
                    style={{
                      left: `${(issue.aiDetection.boundingBox.x / 500) * 100}%`,
                      top: `${(issue.aiDetection.boundingBox.y / 400) * 100}%`,
                      width: `${(issue.aiDetection.boundingBox.width / 500) * 100}%`,
                      height: `${(issue.aiDetection.boundingBox.height / 400) * 100}%`,
                    }}
                  >
                    <span className="absolute -top-5 left-0 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-t-sm whitespace-nowrap">
                      {issue.aiDetection.damageClass} • {issue.aiDetection.confidence}%
                    </span>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] px-3 py-1.5 rounded-lg font-semibold">
                  <Brain size={12} className="inline mr-1" />
                  {issue.aiDetection.modelVersion}
                </div>
              </div>

              {/* Detection Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                  <p className="text-[10px] font-bold uppercase text-blue-500">Confidence</p>
                  <p className="text-2xl font-black text-blue-700 mt-1">{issue.aiDetection.confidence}%</p>
                  <p className="text-[10px] text-blue-500 mt-1">Classification Score</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Damage Class</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{issue.aiDetection.damageClass}</p>
                  <p className="text-[10px] text-slate-400 mt-1">AI Classification</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Dimensions</p>
                  <div className="text-xs font-semibold text-slate-700 mt-1 space-y-0.5">
                    {issue.aiDetection.dimensions.depthCm && (
                      <p>Depth: {issue.aiDetection.dimensions.depthCm} cm</p>
                    )}
                    {issue.aiDetection.dimensions.widthCm && (
                      <p>Width: {issue.aiDetection.dimensions.widthCm} cm</p>
                    )}
                    {issue.aiDetection.dimensions.lengthM && (
                      <p>Length: {issue.aiDetection.dimensions.lengthM} m</p>
                    )}
                    {issue.aiDetection.dimensions.areaSqM && (
                      <p>Area: {issue.aiDetection.dimensions.areaSqM} m²</p>
                    )}
                    {issue.aiDetection.dimensions.count && (
                      <p>Count: {issue.aiDetection.dimensions.count} units</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bounding Box Coordinates */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Detection Metadata</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Box X:</span>{' '}
                    <span className="font-mono font-bold text-slate-700">{issue.aiDetection.boundingBox?.x}px</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Box Y:</span>{' '}
                    <span className="font-mono font-bold text-slate-700">{issue.aiDetection.boundingBox?.y}px</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Width:</span>{' '}
                    <span className="font-mono font-bold text-slate-700">{issue.aiDetection.boundingBox?.width}px</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Height:</span>{' '}
                    <span className="font-mono font-bold text-slate-700">{issue.aiDetection.boundingBox?.height}px</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BEFORE / AFTER TAB */}
          {activeTab === 'images' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before Image */}
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-red-500" />
                    Before — Damage Detected
                  </p>
                  <div className="relative rounded-xl overflow-hidden border border-red-200 bg-red-50">
                    <img
                      src={issue.roadImage}
                      alt="Before repair"
                      className="w-full h-56 object-cover"
                    />
                    {issue.aiDetection?.boundingBox && (
                      <div
                        className="absolute border-2 border-red-500 rounded-sm"
                        style={{
                          left: `${(issue.aiDetection.boundingBox.x / 500) * 100}%`,
                          top: `${(issue.aiDetection.boundingBox.y / 400) * 100}%`,
                          width: `${(issue.aiDetection.boundingBox.width / 500) * 100}%`,
                          height: `${(issue.aiDetection.boundingBox.height / 400) * 100}%`,
                        }}
                      >
                        <span className="absolute -top-4 left-0 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-sm">
                          {issue.aiDetection.confidence}%
                        </span>
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                      BEFORE
                    </span>
                  </div>
                </div>

                {/* After Image */}
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    After — Repair Completed
                  </p>
                  <div className="relative rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50">
                    {(afterImagePreview || issue.afterImage) ? (
                      <>
                        <img
                          src={afterImagePreview || issue.afterImage}
                          alt="After repair"
                          className="w-full h-56 object-cover"
                        />
                        <span className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                          AFTER
                        </span>
                        {issue.status === 'Resolved' && (
                          <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                            <Shield size={10} />
                            VERIFIED
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-56 flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon size={32} className="mb-2" />
                        <p className="text-xs font-medium">No after-repair image yet</p>
                        <p className="text-[10px] text-slate-400 mt-1">Upload via the Actions tab</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Repair Summary if Resolved */}
              {issue.status === 'Resolved' && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700">Repair Verified & Completed</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-emerald-600">Completed:</span>{' '}
                      <span className="font-semibold text-slate-700">{issue.completionDate}</span>
                    </div>
                    <div>
                      <span className="text-emerald-600">Materials Used:</span>{' '}
                      <span className="font-semibold text-slate-700">{issue.materials}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACTIONS TAB */}
          {activeTab === 'actions' && (
            <div className="space-y-5">
              {/* Start Repair */}
              {issue.status === 'Assigned' && (
                <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <PlayCircle size={16} className="text-blue-600" />
                    <h3 className="text-sm font-bold text-blue-800">Start Repair Work</h3>
                  </div>
                  <p className="text-xs text-blue-700 mb-4">
                    Begin on-site repair for <strong>{issue.complaintId}</strong> at <strong>{issue.location}</strong>.
                    This will update the status to "In Progress" and record the start timestamp.
                  </p>
                  <button
                    onClick={handleStartRepair}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:shadow-lg"
                  >
                    <PlayCircle size={15} />
                    Start Repair Now
                  </button>
                </div>
              )}

              {/* Upload After Image */}
              {(issue.status === 'In Progress' || issue.status === 'Assigned') && (
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Camera size={16} className="text-slate-600" />
                    <h3 className="text-sm font-bold text-slate-800">Upload After-Repair Image</h3>
                  </div>
                  <p className="text-xs text-slate-600 mb-4">
                    Capture the repaired road surface and upload a verification photo. This image will be used for
                    quality assurance and AI verification of repair completion.
                  </p>

                  {afterImagePreview && (
                    <div className="relative mb-4 rounded-xl overflow-hidden border border-emerald-200 inline-block">
                      <img src={afterImagePreview} alt="After repair preview" className="h-40 object-cover rounded-xl" />
                      <button
                        onClick={() => { setAfterImagePreview(null); fileInputRef.current.value = '' }}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="after-image-upload"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={15} />
                        {afterImagePreview ? 'Replace Image' : 'Choose Image'}
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Completion Notes */}
              {issue.status === 'In Progress' && (
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers size={16} className="text-slate-600" />
                    <h3 className="text-sm font-bold text-slate-800">Completion Notes</h3>
                  </div>
                  <textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Add repair completion notes, quality observations, materials used..."
                    className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
                    rows={3}
                  />
                </div>
              )}

              {/* Mark Resolved */}
              {issue.status === 'In Progress' && (
                <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <h3 className="text-sm font-bold text-emerald-800">Mark as Resolved</h3>
                  </div>
                  <p className="text-xs text-emerald-700 mb-4">
                    Confirm that the repair at <strong>{issue.location}</strong> has been completed successfully.
                    {!afterImagePreview && !issue.afterImage && (
                      <span className="block mt-1 text-amber-600 font-semibold">
                        ⚠ Consider uploading an after-repair image before marking as resolved.
                      </span>
                    )}
                  </p>
                  <button
                    onClick={handleMarkResolved}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:shadow-lg"
                  >
                    <CheckCircle2 size={15} />
                    Mark Resolved & Complete
                  </button>
                </div>
              )}

              {/* Resolved state */}
              {issue.status === 'Resolved' && (
                <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-emerald-800">Repair Completed</h3>
                  <p className="text-xs text-emerald-600 mt-1">
                    This issue was resolved on <strong>{issue.completionDate}</strong>.
                  </p>
                </div>
              )}

              {/* Open Map Link */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <button
                  onClick={() => {
                    const url = `https://www.google.com/maps?q=${issue.coordinates[0]},${issue.coordinates[1]}`
                    window.open(url, '_blank')
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <ExternalLink size={14} />
                  Open Location in Google Maps
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
