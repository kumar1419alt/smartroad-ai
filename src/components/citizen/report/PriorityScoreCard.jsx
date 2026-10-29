/**
 * PriorityScoreCard.jsx — Reusable SRPS (Smart Road Priority Score) preview card.
 *
 * Shows:
 *  - Overall SRPS score (0-100) and Priority Tier (Critical, High, Medium, Low)
 *  - Breakdown of the 5 multi-factor algorithm components:
 *     1. Damage Severity (35%)
 *     2. Traffic Importance (25%)
 *     3. Location Criticality (15%)
 *     4. Road Importance (15%)
 *     5. Citizen Report Frequency (10%)
 *  - Visual progress bar per component with weight contribution
 */

import React from 'react'
import {
  Flame,
  AlertTriangle,
  Layers,
  BarChart2,
  TrendingUp,
  Info,
  Car,
  MapPin,
  Users,
} from 'lucide-react'

const FACTOR_ICONS = {
  'Damage Severity': AlertTriangle,
  'Traffic Importance': Car,
  'Location Criticality': MapPin,
  'Road Importance': Layers,
  'Citizen Report Frequency': Users,
}

export default function PriorityScoreCard({ srpsData }) {
  if (!srpsData) return null

  const { totalScore = 92, priorityLevel = 'Critical', components = [] } = srpsData

  let tierColor = 'text-red-700 bg-red-50 border-red-200'
  let gaugeColor = 'bg-red-500'
  if (priorityLevel === 'High') {
    tierColor = 'text-orange-700 bg-orange-50 border-orange-200'
    gaugeColor = 'bg-orange-500'
  } else if (priorityLevel === 'Medium') {
    tierColor = 'text-amber-700 bg-amber-50 border-amber-200'
    gaugeColor = 'bg-amber-500'
  } else if (priorityLevel === 'Low') {
    tierColor = 'text-emerald-700 bg-emerald-50 border-emerald-200'
    gaugeColor = 'bg-emerald-500'
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">
            Smart Road Priority Score (SRPS)
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Multi-criteria prioritization algorithm
          </p>
        </div>

        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${tierColor}`}>
          Priority: {priorityLevel}
        </span>
      </div>

      {/* Main Score Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-[#1e3a5f] text-white p-4 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold block">
            Computed Urgency Index
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl font-extrabold font-mono text-white">
              {totalScore}
            </span>
            <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
        </div>

        <div className="text-right max-w-xs">
          <span className="text-[11px] text-slate-300 block">
            Ranked for immediate repair dispatch
          </span>
          <span className="text-[10px] text-blue-300 font-semibold block mt-0.5">
            Ward 14 Emergency Response List
          </span>
        </div>
      </div>

      {/* 5 Components Breakdown */}
      <div className="space-y-3 pt-1">
        <span className="text-xs font-bold text-slate-700 block">
          Factor Breakdown:
        </span>

        {components.map((comp) => {
          const Icon = FACTOR_ICONS[comp.name] || Layers
          return (
            <div key={comp.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Icon size={13} className="text-blue-600" />
                  {comp.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    weight ~{comp.weight}%
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    +{comp.weightedScore} pts
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${(comp.score / 100) * 100}%` }}
                />
              </div>

              <p className="text-[10px] text-slate-400 leading-tight">
                {comp.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
