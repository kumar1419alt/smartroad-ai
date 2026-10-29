/**
 * EngineerIssuePage.jsx — Route: /engineer/issues/:id
 *
 * Dedicated standalone inspection and repair execution page for a specific issue.
 * Supports:
 *  - Road image with interactive AI Detection bounding box overlay toggle
 *  - AI metrics: model confidence, damage class, physical dimensions
 *  - GIS coordinates with link to field map
 *  - Workflow actions:
 *     1. Start Repair (transitions to In Progress)
 *     2. Upload After-Repair Photo (local file picker simulation)
 *     3. Completion notes and materials log
 *     4. Mark Resolved & QA Sign-off
 *  - Before vs After comparison
 *  - Synchronized with localStorage (STORAGE_KEY: 'rds_engineer_issues')
 */

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Flame,
  Clock,
  Calendar,
  AlertTriangle,
  PlayCircle,
  CheckCircle2,
  Upload,
  Camera,
  Layers,
  Wrench,
  Users,
  Shield,
  Eye,
  Zap,
  ExternalLink,
  ChevronRight,
  Package,
  FileText,
  Sparkles,
  Info,
} from 'lucide-react'
import { MOCK_ENGINEER_ISSUES } from '../../data/mockEngineerData'
import { useToast } from '../../contexts/ToastContext'

const STORAGE_KEY = 'rds_engineer_issues'

const SEVERITY_STYLES = {
  critical: { badge: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', bar: 'bg-red-500' },
  high: { badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', bar: 'bg-amber-500' },
  medium: { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500', bar: 'bg-yellow-500' },
  low: { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
}

const STATUS_CONFIG = {
  'Assigned': {
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    step: 1,
    desc: 'Work order dispatched. Awaiting engineer deployment.',
  },
  'In Progress': {
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    step: 2,
    desc: 'Repair crew on-site. Milling, compaction, or patching active.',
  },
  'Resolved': {
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    step: 3,
    desc: 'Repair certified & verified. Quality assurance approved.',
  },
}

export default function EngineerIssuePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [issues, setIssues] = useState([])
  const [issue, setIssue] = useState(null)
  const [showAiOverlay, setShowAiOverlay] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'ai' | 'comparison' | 'logistics'
  const [afterImagePreview, setAfterImagePreview] = useState(null)
  const [completionNotes, setCompletionNotes] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [actionFeedback, setActionFeedback] = useState(null)
  const fileInputRef = useRef(null)

  // Load issues and find target
  useEffect(() => {
    let list = []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      list = stored ? JSON.parse(stored) : MOCK_ENGINEER_ISSUES
    } catch {
      list = MOCK_ENGINEER_ISSUES
    }
    setIssues(list)

    const found = list.find((i) => i.id === id || i.complaintId === id)
    if (found) {
      setIssue(found)
      if (found.afterImage) {
        setAfterImagePreview(found.afterImage)
      }
    }
  }, [id])

  if (!issue) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">Issue Not Found</h2>
        <p className="text-sm text-slate-500">
          The repair issue <span className="font-mono text-slate-700 font-bold">{id}</span> could not be found in your assigned work queue.
        </p>
        <div className="pt-2">
          <Link
            to="/engineer/issues"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Assigned Issues
          </Link>
        </div>
      </div>
    )
  }

  const saveUpdatedIssue = (patch) => {
    const updated = issues.map((i) => (i.id === issue.id ? { ...i, ...patch } : i))
    setIssues(updated)
    setIssue((prev) => ({ ...prev, ...patch }))
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.warn('LocalStorage save failed', e)
    }
  }

  const handleStartRepair = () => {
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    saveUpdatedIssue({
      status: 'In Progress',
      startDate: dateStr,
    })
    setActionFeedback('Repair marked as In Progress. Crew timer started.')
    toast.success(`Repair marked as In Progress. Crew timer started.`)
    setTimeout(() => setActionFeedback(null), 4000)
  }

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = () => {
      setAfterImagePreview(reader.result)
      setIsUploading(false)
      saveUpdatedIssue({ afterImage: reader.result })
      setActionFeedback('After-repair photo attached successfully!')
      toast.success('After-repair photo attached successfully!')
      setTimeout(() => setActionFeedback(null), 4000)
    }
    reader.readAsDataURL(file)
  }

  const handleMarkResolved = () => {
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const resolvedImage =
      afterImagePreview ||
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'

    saveUpdatedIssue({
      status: 'Resolved',
      completionDate: dateStr,
      afterImage: resolvedImage,
      notes: completionNotes ? `${issue.notes || ''} | Engineer Sign-off: ${completionNotes}` : issue.notes,
    })
    setActionFeedback('Issue successfully marked as Resolved with QA approval!')
    toast.success('Issue successfully marked as Resolved with QA approval!')
    setTimeout(() => setActionFeedback(null), 4000)
  }

  const sevStyle = SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.medium
  const statusCfg = STATUS_CONFIG[issue.status] || STATUS_CONFIG['Assigned']

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── TOP NAV & BREADCRUMB ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/engineer/issues')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            title="Back to Issues"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-400">
                {issue.complaintId}
              </span>
              <span className="text-slate-300">•</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${sevStyle.badge}`}>
                {issue.severity.toUpperCase()}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${statusCfg.badge}`}>
                {issue.status}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              {issue.damageType} — {issue.location}
            </h1>
          </div>
        </div>

        {/* Action button toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/engineer/map"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <MapPin size={14} className="text-emerald-600" />
            Field Map
          </Link>
          {issue.status === 'Assigned' && (
            <button
              onClick={handleStartRepair}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm"
            >
              <PlayCircle size={15} />
              Start Repair
            </button>
          )}
          {issue.status === 'In Progress' && (
            <button
              onClick={handleMarkResolved}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <CheckCircle2 size={15} />
              Mark Resolved
            </button>
          )}
        </div>
      </div>

      {/* ── ACTION FEEDBACK BANNER ────────────────────────────────────────── */}
      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── WORKFLOW STEPPER ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              step: 1,
              title: '1. Work Dispatched',
              desc: `Assigned: ${issue.assignedDate || '12 Oct 2026'}`,
              status: issue.status === 'Assigned' ? 'current' : 'done',
            },
            {
              step: 2,
              title: '2. Repair Underway',
              desc: issue.startDate ? `Started: ${issue.startDate}` : 'Target: Ready to commence',
              status: issue.status === 'In Progress' ? 'current' : issue.status === 'Resolved' ? 'done' : 'upcoming',
            },
            {
              step: 3,
              title: '3. QA Sign-Off & Resolved',
              desc: issue.completionDate ? `Completed: ${issue.completionDate}` : 'Pending photo verification',
              status: issue.status === 'Resolved' ? 'done' : 'upcoming',
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`p-3.5 rounded-xl border transition-all ${
                item.status === 'current'
                  ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20'
                  : item.status === 'done'
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                    item.status === 'done'
                      ? 'bg-emerald-600 text-white'
                      : item.status === 'current'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {item.status === 'done' ? '✓' : item.step}
                </span>
                <span className="text-xs font-bold text-slate-900">{item.title}</span>
              </div>
              <p className="text-[11px] text-slate-600 pl-7">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visuals & AI Overlay (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Visual Display Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera size={16} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-800">
                  Site Road Damage Capture
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAiOverlay(!showAiOverlay)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    showAiOverlay
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Layers size={13} />
                  AI Bounding Box {showAiOverlay ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Image Canvas with Overlay */}
            <div className="relative aspect-video bg-slate-900 overflow-hidden">
              <img
                src={issue.roadImage}
                alt={issue.damageType}
                className="w-full h-full object-cover"
              />

              {/* Bounding Box overlay */}
              {showAiOverlay && issue.aiDetection && (
                <div
                  className="absolute border-2 border-red-500 bg-red-500/15 rounded-sm transition-all"
                  style={{
                    left: `${(issue.aiDetection.boundingBox.x / 600) * 100}%`,
                    top: `${(issue.aiDetection.boundingBox.y / 400) * 100}%`,
                    width: `${(issue.aiDetection.boundingBox.width / 600) * 100}%`,
                    height: `${(issue.aiDetection.boundingBox.height / 400) * 100}%`,
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-red-600 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap flex items-center gap-1">
                    <span>{issue.aiDetection.damageClass}</span>
                    <span className="opacity-90">• {issue.aiDetection.confidence}%</span>
                  </div>
                </div>
              )}

              {/* Tag indicator in corner */}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-1 rounded-md">
                Geo-tagged: {issue.coordinates ? `${issue.coordinates[0].toFixed(4)}, ${issue.coordinates[1].toFixed(4)}` : 'Pune Zone-4'}
              </div>
            </div>

            {/* AI Diagnostics Bar */}
            {issue.aiDetection && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400">AI Confidence</p>
                  <p className="text-sm font-black text-emerald-700">{issue.aiDetection.confidence}%</p>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Damage Class</p>
                  <p className="text-xs font-black text-slate-800 truncate" title={issue.aiDetection.damageClass}>
                    {issue.aiDetection.damageClass.split('—')[0]}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Est. Area / Depth</p>
                  <p className="text-xs font-black text-slate-800">
                    {issue.aiDetection.dimensions.depthCm
                      ? `${issue.aiDetection.dimensions.depthCm} cm depth`
                      : `${issue.aiDetection.dimensions.areaSqM} m²`}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Model Engine</p>
                  <p className="text-xs font-mono font-bold text-slate-600 truncate">{issue.aiDetection.modelVersion}</p>
                </div>
              </div>
            )}
          </div>

          {/* Before & After Comparison section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera size={17} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Before & After Repair Verification</h3>
              </div>
              {issue.status === 'Resolved' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  QA Signed Off
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Before (Reported Damage)</span>
                  <span className="text-[10px] font-mono text-slate-400">{issue.assignedDate}</span>
                </div>
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                  <img src={issue.roadImage} alt="Before repair" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* After */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">After (Repaired Surface)</span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">
                    {issue.completionDate || 'Pending upload'}
                  </span>
                </div>
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center relative">
                  {afterImagePreview ? (
                    <img src={afterImagePreview} alt="After repair" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <Camera size={28} className="mx-auto text-slate-300 mb-1.5" />
                      <p className="text-xs font-semibold text-slate-400">No completion photo yet</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 px-3 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                      >
                        Upload Photo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Specifications, Logistics & Field Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Priority & SRPS Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Priority Rating
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Flame size={20} className="text-red-500" />
                  <span className="text-2xl font-black text-slate-900">{issue.srps}</span>
                  <span className="text-xs text-slate-400 font-bold">/ 100 SRPS</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${sevStyle.badge}`}>
                {issue.priorityLevel || issue.severity} Priority
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                <span>Priority Index</span>
                <span>{issue.srps}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full rounded-full ${sevStyle.bar}`} style={{ width: `${issue.srps}%` }} />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800">Issue Notes: </span>
              {issue.description}
            </div>
          </div>

          {/* Location & GIS Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={17} className="text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900">GIS & Location</h3>
              </div>
              <Link
                to="/engineer/map"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>View on Map</span>
                <ExternalLink size={12} />
              </Link>
            </div>

            <div className="text-xs space-y-1.5 text-slate-600">
              <p>
                <strong className="text-slate-800">Road: </strong> {issue.location}
              </p>
              <p>
                <strong className="text-slate-800">Ward: </strong> {issue.ward}
              </p>
              <p className="font-mono text-[11px] text-slate-500">
                <strong className="text-slate-800 font-sans">GPS: </strong>
                {issue.coordinates ? `${issue.coordinates[0].toFixed(5)}°N, ${issue.coordinates[1].toFixed(5)}°E` : '18.5204° N, 73.8567° E'}
              </p>
            </div>
          </div>

          {/* Crew & Logistics Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Wrench size={17} className="text-amber-600" />
              <h3 className="text-xs font-bold text-slate-900">Repair Logistics</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Materials Prescribed</p>
                <p className="font-semibold text-slate-800 mt-0.5">{issue.materials || 'Hot-Mix Bitumen, Aggregate Grade 2'}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Required Machinery</p>
                <p className="font-semibold text-slate-800 mt-0.5">{issue.equipment || 'Vibratory Trench Roller, Road Cutter'}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Users size={14} className="text-slate-400" />
                  Crew Assigned:
                </span>
                <span className="font-bold text-slate-900">{issue.crewSize || 5} Field Workers</span>
              </div>
            </div>
          </div>

          {/* Field Execution & Sign-Off Actions */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={17} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white">Field Operations Actions</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Zone-4 Protocol</span>
            </div>

            {/* Hidden file input for after-image upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />

            {/* Action 1: Start repair if still assigned */}
            {issue.status === 'Assigned' && (
              <button
                onClick={handleStartRepair}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-sm"
              >
                <PlayCircle size={16} />
                Start Repair Work on Site
              </button>
            )}

            {/* Action 2: Upload After-Repair Photo */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition-colors"
            >
              <Upload size={14} />
              {isUploading ? 'Processing Photo...' : afterImagePreview ? 'Replace After-Repair Photo' : 'Upload After-Repair Photo'}
            </button>

            {/* Optional Completion Notes */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">
                Officer Completion Notes:
              </label>
              <textarea
                rows={2}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="E.g., 2.5 tonnes asphalt applied, compacted to IRC standard."
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-400"
              />
            </div>

            {/* Action 3: Mark Resolved */}
            <button
              onClick={handleMarkResolved}
              disabled={issue.status === 'Resolved'}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-xs transition-colors shadow-sm ${
                issue.status === 'Resolved'
                  ? 'bg-emerald-600/50 text-emerald-200 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <CheckCircle2 size={16} />
              {issue.status === 'Resolved' ? 'Repairs Complete & Signed Off' : 'Mark Resolved & Complete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
