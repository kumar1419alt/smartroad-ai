/**
 * CitizenDashboard.jsx — Main Citizen Dashboard page (/citizen/dashboard).
 *
 * Implements:
 *  1. Welcome Header:
 *     - "Good morning, Citizen"
 *     - "Help us identify and resolve road issues in your area."
 *  2. Summary Cards:
 *     - My Reports, Pending, In Progress, Resolved (using reusable SummaryCard)
 *  3. Quick Action:
 *     - "Report Road Damage" action card & modal
 *  4. Mini Road Map:
 *     - Sample reported road issues in Pune (using reusable MiniRoadMap)
 *  5. Recent Activity Timeline:
 *     - Real-time updates from Pune road repairs (using reusable RecentActivity)
 *  6. Recent Reports:
 *     - Complaint ID, damage type, location, severity, priority, status, date (using reusable ComplaintTable)
 */

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PlusCircle,
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  Sparkles,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import {
  mockPuneCitizenStats,
  mockPuneComplaints,
  mockPuneActivities,
} from '../../data/mockData'

// Reusable components
import SummaryCard from '../../components/citizen/SummaryCard'
import ComplaintTable from '../../components/citizen/ComplaintTable'
import MiniRoadMap from '../../components/citizen/MiniRoadMap'
import RecentActivity from '../../components/citizen/RecentActivity'
import ComplaintDetailModal from '../../components/citizen/ComplaintDetailModal'
import QuickReportModal from '../../components/citizen/QuickReportModal'
import { getSavedComplaints } from '../../services/complaintService'

export default function CitizenDashboard() {
  const { user } = useAuth()
  const toast = useToast()

  // State
  const [complaints, setComplaints] = useState(() => getSavedComplaints())
  const [activities, setActivities] = useState(mockPuneActivities)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [activeStatFilter, setActiveStatFilter] = useState('all')

  // Calculate live stats
  const totalCount = complaints.length
  const pendingCount = complaints.filter((c) =>
    (c.status || '').toLowerCase().includes('pending'),
  ).length
  const inProgressCount = complaints.filter((c) =>
    (c.status || '').toLowerCase().includes('progress'),
  ).length
  const resolvedCount = complaints.filter(
    (c) =>
      (c.status || '').toLowerCase().includes('resolved') ||
      (c.status || '').toLowerCase().includes('completed'),
  ).length

  // Filter complaints if user clicks a summary card
  const displayedComplaints = complaints.filter((c) => {
    if (activeStatFilter === 'pending') return (c.status || '').toLowerCase().includes('pending')
    if (activeStatFilter === 'in_progress') return (c.status || '').toLowerCase().includes('progress')
    if (activeStatFilter === 'resolved') return (c.status || '').toLowerCase().includes('resolved')
    return true
  })

  // Dynamic time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Greeting title
  const citizenName = user?.name ? user.name.split(' ')[0] : 'Citizen'
  const greetingText = `${getGreeting()}, ${citizenName}`

  const handleNewComplaintAdded = (newComplaint) => {
    setComplaints([newComplaint, ...complaints])

    // Prepend to activity feed
    const newActivity = {
      id: `act-new-${Date.now()}`,
      type: 'pending',
      title: 'New Complaint Registered',
      description: `Report submitted for ${newComplaint.location}. Awaiting AI classification.`,
      location: newComplaint.location,
      time: 'Just now',
      complaintId: newComplaint.id,
      badge: 'Pending',
    }
    setActivities([newActivity, ...activities])
    toast.success(`Complaint ${newComplaint.id} submitted successfully!`)
  }

  const handleUpvote = (id) => {
    setComplaints(
      complaints.map((c) => (c.id === id ? { ...c, upvotes: (c.upvotes || 0) + 1 } : c)),
    )
    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint({
        ...selectedComplaint,
        upvotes: (selectedComplaint.upvotes || 0) + 1,
      })
    }
    toast.info(`Upvoted complaint ${id}`)
  }

  return (
    <div className="space-y-6">
      {/* ─── 1. WELCOME HEADER ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0f2444] via-[#1a3a60] to-[#1e3a5f] text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background circle */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-xs">
                <ShieldCheck size={13} className="text-emerald-400" />
                PMC Civic Road Safety Portal
              </span>
              <span className="text-xs text-blue-200/80 font-medium hidden sm:inline">
                Pune, Maharashtra
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {greetingText}
            </h1>

            <p className="text-slate-200 text-sm leading-relaxed">
              Help us identify and resolve road issues in your area.
              Every photo and pothole report you submit is scanned by AI vision and prioritized by the Smart Road Priority Score (SRPS).
            </p>
          </div>

          {/* Quick Action Trigger Button in Header */}
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-100"
            >
              <PlusCircle size={16} />
              <span>Report Road Damage</span>
            </button>
            <Link
              to="/citizen/map"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/20 transition-colors"
            >
              <MapPin size={15} />
              <span>Explore Road Map</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 2. SUMMARY CARDS ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* My Reports */}
        <SummaryCard
          title="My Reports"
          count={totalCount}
          subtitle="All complaints logged"
          icon={FileText}
          variant="blue"
          active={activeStatFilter === 'all'}
          onClick={() => setActiveStatFilter('all')}
        />

        {/* Pending */}
        <SummaryCard
          title="Pending"
          count={pendingCount}
          subtitle="Awaiting PMC inspection"
          icon={Clock}
          variant="amber"
          active={activeStatFilter === 'pending'}
          onClick={() => setActiveStatFilter(activeStatFilter === 'pending' ? 'all' : 'pending')}
        />

        {/* In Progress */}
        <SummaryCard
          title="In Progress"
          count={inProgressCount}
          subtitle="Repairs underway"
          icon={Wrench}
          variant="indigo"
          active={activeStatFilter === 'in_progress'}
          onClick={() => setActiveStatFilter(activeStatFilter === 'in_progress' ? 'all' : 'in_progress')}
        />

        {/* Resolved */}
        <SummaryCard
          title="Resolved"
          count={resolvedCount}
          subtitle="Fixed & verified safe"
          icon={CheckCircle2}
          variant="emerald"
          active={activeStatFilter === 'resolved'}
          onClick={() => setActiveStatFilter(activeStatFilter === 'resolved' ? 'all' : 'resolved')}
        />
      </div>

      {/* ─── 3. QUICK ACTION BANNER ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50/50 via-white to-slate-50/50">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
            <PlusCircle size={22} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              Spotted a Pothole or Road Crater in Pune?
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit photo & GPS landmark in under 60 seconds. Instant AI severity analysis.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsReportModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <span>Report Road Damage</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* ─── 4. MINI ROAD MAP & RECENT ACTIVITY TIMELINE ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Mini Road Map (7 cols) */}
        <div className="lg:col-span-7">
          <MiniRoadMap
            complaints={complaints}
            onSelectComplaint={(item) => setSelectedComplaint(item)}
          />
        </div>

        {/* Right Column: Recent Activity Timeline (5 cols) */}
        <div className="lg:col-span-5">
          <RecentActivity activities={activities} />
        </div>
      </div>

      {/* ─── 5. RECENT REPORTS TABLE ───────────────────────────────────────── */}
      <ComplaintTable
        complaints={displayedComplaints}
        onSelectComplaint={(complaint) => setSelectedComplaint(complaint)}
        title="Recent Reports"
        description="Your submitted road hazard complaints and PMC repair status"
      />

      {/* ─── MODALS ────────────────────────────────────────────────────────── */}
      {/* Detail inspect modal */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpvote={handleUpvote}
        />
      )}

      {/* Quick report modal */}
      <QuickReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitSuccess={handleNewComplaintAdded}
      />
    </div>
  )
}
