/**
 * StatusTimeline.jsx — Visual 6-Stage Lifecycle Timeline for a road damage complaint.
 *
 * Stages:
 *  1. Submitted    (Citizen logged hazard)
 *  2. AI Detected  (Computer vision inference)
 *  3. Prioritized  (SRPS computed score)
 *  4. Assigned     (Field repair crew & officer designated)
 *  5. In Progress  (Work order underway on-site)
 *  6. Resolved     (Pavement patch completed & verified)
 *
 * Highlights the current active stage with animated pulse and rich status metadata.
 */

import React from 'react'
import {
  FileText,
  Brain,
  TrendingUp,
  UserCheck,
  Wrench,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react'

const STAGES = [
  {
    id: 'submitted',
    name: 'Submitted',
    icon: FileText,
    subtitle: 'Citizen grievance intake',
  },
  {
    id: 'ai_detected',
    name: 'AI Detected',
    icon: Brain,
    subtitle: 'Vision bounding box & depth',
  },
  {
    id: 'prioritized',
    name: 'Prioritized',
    icon: TrendingUp,
    subtitle: 'Multi-factor SRPS calculated',
  },
  {
    id: 'assigned',
    name: 'Assigned',
    icon: UserCheck,
    subtitle: 'Repair crew & officer dispatched',
  },
  {
    id: 'in_progress',
    name: 'In Progress',
    icon: Wrench,
    subtitle: 'Road milling & compaction',
  },
  {
    id: 'resolved',
    name: 'Resolved',
    icon: CheckCircle2,
    subtitle: 'QC inspected & road opened',
  },
]

export default function StatusTimeline({ status = 'Pending', complaint }) {
  const normStatus = (status || '').toLowerCase()

  // Determine active stage index (0 to 5)
  let activeIndex = 2 // Default: Prioritized
  if (normStatus.includes('resolved') || normStatus.includes('completed')) {
    activeIndex = 5
  } else if (normStatus.includes('progress')) {
    activeIndex = 4
  } else if (normStatus.includes('scheduled') || normStatus.includes('assigned')) {
    activeIndex = 3
  } else if (normStatus.includes('verified') || normStatus.includes('detected')) {
    activeIndex = 1
  } else if (normStatus.includes('submitted')) {
    activeIndex = 0
  }

  // Generate realistic timeline metadata per stage
  const submittedDate = complaint?.date || '12 Oct 2026'
  const time = complaint?.timestamp
    ? new Date(complaint.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '08:15 AM'

  const stageDetails = [
    {
      time: `${submittedDate}, ${time}`,
      detail: 'Submitted via Citizen Mobile Web Portal with photo and GPS landmark',
    },
    {
      time: 'Inference latency: 420ms',
      detail: `ResNet-RoadVision model classified as ${complaint?.damageType || 'Pothole'} with ${complaint?.aiConfidence || '96.4%'} confidence`,
    },
    {
      time: 'Automated ranking',
      detail: `SRPS Urgency computed at ${complaint?.priority || 92}/100 (${complaint?.severity || 'critical'} tier)`,
    },
    {
      time: activeIndex >= 3 ? 'Assigned to Zone-C Unit' : 'Awaiting squad availability',
      detail: activeIndex >= 3
        ? `${complaint?.assignedSquad || 'PMC Rapid Squad #4'} (${complaint?.repairOfficer?.name || 'Ramesh Kumar'})`
        : 'In municipal repair prioritization queue',
    },
    {
      time: activeIndex >= 4 ? 'Crews active on-site' : 'Pending start date',
      detail: activeIndex >= 4
        ? 'Traffic diverted; hot-mix asphalt laid and compacted'
        : `Target execution window: ${complaint?.estimatedFix || 'Under review'}`,
    },
    {
      time: activeIndex === 5 ? 'Verified by PMC Engineer' : 'Pending completion',
      detail: activeIndex === 5
        ? 'Cold-planed patch levelled with pavement; safety audit approved'
        : 'Final inspection upon completion',
    },
  ]

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            <span>Complaint Lifecycle Timeline</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time track of grievance progression from citizen intake to municipal resolution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Current Status:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            {STAGES[activeIndex].name}
          </span>
        </div>
      </div>

      {/* ─── DESKTOP HORIZONTAL STEPPER ──────────────────────────────────── */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Progress bar background line */}
          <div className="absolute top-5 left-8 right-8 h-1 bg-slate-100 -translate-y-1/2 z-0" />

          {/* Progress bar active filled line */}
          <div
            className="absolute top-5 left-8 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-700"
            style={{ width: `${(activeIndex / (STAGES.length - 1)) * 88}%` }}
          />

          {/* Stepper nodes */}
          <div className="relative z-10 grid grid-cols-6 gap-2">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon
              const isCompleted = idx < activeIndex
              const isCurrent = idx === activeIndex
              const isUpcoming = idx > activeIndex

              let circleStyles = 'bg-slate-100 text-slate-400 border-slate-200'
              if (isCompleted) {
                circleStyles = 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              } else if (isCurrent) {
                circleStyles = 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-500/20 shadow-md scale-110'
              }

              return (
                <div key={stage.id} className="flex flex-col items-center text-center">
                  {/* Step circle */}
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${circleStyles}`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <Icon size={17} />
                    )}
                  </div>

                  {/* Stage title */}
                  <div className="mt-3 space-y-0.5">
                    <p
                      className={`text-xs font-bold leading-tight ${
                        isCurrent
                          ? 'text-blue-600 font-extrabold'
                          : isCompleted
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {stage.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium leading-tight">
                      {stage.subtitle}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detailed stage notes card below */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-3 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              1. Intake
            </span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">{stageDetails[0].time}</p>
            <p className="text-[11px] text-slate-500 mt-1">{stageDetails[0].detail}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              2. AI & SRPS
            </span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">{stageDetails[2].time}</p>
            <p className="text-[11px] text-slate-500 mt-1">{stageDetails[2].detail}</p>
          </div>

          <div className={`p-3 rounded-xl border ${
            activeIndex >= 4 ? 'bg-blue-50/60 border-blue-200' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
              3. Current Stage Details
            </span>
            <p className="text-xs font-bold text-slate-900 mt-0.5">{stageDetails[activeIndex].time}</p>
            <p className="text-[11px] text-slate-600 mt-1">{stageDetails[activeIndex].detail}</p>
          </div>
        </div>
      </div>

      {/* ─── MOBILE VERTICAL STEPPER ────────────────────────────────────── */}
      <div className="lg:hidden relative pl-8 space-y-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon
          const isCompleted = idx < activeIndex
          const isCurrent = idx === activeIndex
          const isUpcoming = idx > activeIndex

          let circleStyles = 'bg-slate-100 text-slate-400 border-slate-200'
          if (isCompleted) {
            circleStyles = 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
          } else if (isCurrent) {
            circleStyles = 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-500/20 shadow-md'
          }

          return (
            <div key={stage.id} className="relative">
              {/* Node */}
              <div
                className={`absolute -left-8 top-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs transition-all ${circleStyles}`}
              >
                {isCompleted ? <CheckCircle2 size={13} /> : <Icon size={13} />}
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-blue-600 text-sm'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.name}
                  </h3>
                  {isCurrent && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {stageDetails[idx].detail}
                </p>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {stageDetails[idx].time}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
