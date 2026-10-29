/**
 * CitizenComplaintDetailPage.jsx — Complaint Details & Lifecycle Tracking page (/citizen/reports/:id).
 *
 * Implements:
 *  1. Complaint ID & current status badge
 *  2. Submitted date & timestamp
 *  3. Road image with AI detection bounding box visualization
 *  4. AI detection telemetry & physical dimensions
 *  5. Damage type & confidence score
 *  6. Severity rating & visual meter
 *  7. Location details & ward jurisdiction
 *  8. Interactive GIS Leaflet map
 *  9. SRPS score (0-100) and priority level
 *  10. Visual status timeline (Submitted → AI Detected → Prioritized → Assigned → In Progress → Resolved)
 *  11. Description of the hazard
 *  12. Designated repair officer & squad work order
 *  13. Estimated / recorded resolution information
 */

import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Sparkles,
  ShieldAlert,
  ThumbsUp,
  Share2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Flame,
  Wrench,
  FileText,
  User,
} from 'lucide-react'

import StatusBadge from '../../components/citizen/StatusBadge'
import PriorityBadge from '../../components/citizen/PriorityBadge'
import PriorityScoreCard from '../../components/citizen/report/PriorityScoreCard'
import StatusTimeline from '../../components/citizen/details/StatusTimeline'
import DamageInspectionView from '../../components/citizen/details/DamageInspectionView'
import OfficerAssignmentCard from '../../components/citizen/details/OfficerAssignmentCard'
import LocationMapCard from '../../components/citizen/details/LocationMapCard'
import complaintService from '../../services/complaintService'

export default function CitizenComplaintDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [complaint, setComplaint] = useState(null)
  const [upvoted, setUpvoted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const data = complaintService.getComplaintById(id)
    if (data) {
      setComplaint(data)
    } else {
      // Fallback: use first mock complaint if direct id match fails
      const fallback = complaintService.getComplaintById('PMC-2026-0421')
      if (fallback) {
        setComplaint({
          ...fallback,
          id: id || fallback.id,
        })
      }
    }
  }, [id])

  if (!complaint) {
    return (
      <div className="py-20 text-center space-y-3">
        <Clock size={36} className="text-slate-400 mx-auto animate-spin" />
        <h2 className="text-base font-bold text-slate-800">Loading Complaint Details…</h2>
        <p className="text-xs text-slate-500">Querying Pune Municipal Grievance database</p>
      </div>
    )
  }

  // Calculate SRPS breakdown for priority card
  const srpsData = complaintService.calculateSRPS({
    severity: complaint.severity || 'critical',
    trafficImportance: complaint.priority > 85 ? 92 : 75,
    locationCriticality: 88,
    roadImportance: 85,
    reportFrequency: complaint.upvotes > 20 ? 85 : 60,
  })

  const handleUpvote = () => {
    if (!upvoted) {
      setUpvoted(true)
      setComplaint((prev) => ({
        ...prev,
        upvotes: (prev.upvotes || 0) + 1,
      }))
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ─── BREADCRUMB & TOP CONTROLS ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/citizen/reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to My Reports</span>
        </Link>

        {/* Action Pills */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleUpvote}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              upvoted
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ThumbsUp size={13} className={upvoted ? 'text-blue-600' : 'text-slate-400'} />
            <span>{upvoted ? 'Endorsed' : 'Endorse Hazard'} ({complaint.upvotes || 0})</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Share2 size={13} className="text-slate-400" />
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Printer size={13} className="text-slate-400" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* ─── MAIN HERO HEADER ─────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-[#10243e] to-[#1e3a5f] text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-lg bg-blue-500 text-white shadow-2xs">
                {complaint.id}
              </span>
              <StatusBadge status={complaint.status} size="sm" />
              <PriorityBadge priority={complaint.priority} size="sm" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {complaint.damageType} on {complaint.location.split(',')[0]}
            </h1>

            <p className="text-slate-300 text-xs flex items-center gap-2">
              <MapPin size={14} className="text-blue-400 shrink-0" />
              <span>{complaint.location}</span>
              <span>•</span>
              <Calendar size={14} className="text-blue-400 shrink-0" />
              <span>Reported on {complaint.date}</span>
            </p>
          </div>

          {/* SRPS Quick Dial */}
          <div className="shrink-0 bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/15 text-center min-w-[140px]">
            <span className="text-[10px] text-blue-200 uppercase tracking-widest font-bold block">
              Urgency Score
            </span>
            <div className="text-3xl font-extrabold font-mono text-white mt-0.5">
              {complaint.priority}
              <span className="text-xs text-slate-300 font-normal">/100</span>
            </div>
            <span className="text-[11px] font-bold text-red-300 uppercase tracking-wider block mt-0.5">
              {complaint.severity} Hazard
            </span>
          </div>
        </div>
      </div>

      {/* ─── 1. VISUAL STATUS TIMELINE (6 STAGES) ─────────────────────────── */}
      <StatusTimeline status={complaint.status} complaint={complaint} />

      {/* ─── 2. TWO-COLUMN DETAILS GRID ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Visual Damage Inspection & Location Map */}
        <div className="lg:col-span-7 space-y-6">
          {/* Road Image with Bounding Boxes */}
          <DamageInspectionView complaint={complaint} />

          {/* Citizen Description Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              <span>Citizen Grievance Description</span>
            </h2>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              "{complaint.description}"
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Submitted by Verified Resident</span>
              <span>Pune Municipal Grievance Redressal</span>
            </div>
          </div>

          {/* Interactive GIS Map */}
          <LocationMapCard complaint={complaint} />
        </div>

        {/* Right Column (5 cols): Officer Assignment & SRPS Score */}
        <div className="lg:col-span-5 space-y-6">
          {/* Designated Repair Officer & Squad */}
          <OfficerAssignmentCard complaint={complaint} />

          {/* SRPS 5-Factor Score Breakdown */}
          <PriorityScoreCard srpsData={srpsData} />
        </div>
      </div>
    </div>
  )
}
