/**
 * PriorityScoreCard.jsx — SRPS (Smart Road Priority Score) preview card.
 *
 * Shows the computed SRPS score and its 5-factor breakdown.
 * Each factor displays its data source label so users can see
 * which values come from YOLO inference vs location heuristics.
 */

import React from 'react'
import {
  AlertTriangle,
  Layers,
  Car,
  MapPin,
  Users,
  Info,
} from 'lucide-react'

const FACTOR_ICONS = {
  'Damage Severity': AlertTriangle,
  'Traffic Importance': Car,
  'Location Criticality': MapPin,
  'Road Importance': Layers,
  'Citizen Reports': Users,
}

export default function PriorityScoreCard({ srpsData }) {
  if (!srpsData) return null

  const { totalScore = 0, priorityLevel = 'Low', components = [] } = srpsData

  let tierColor = 'text-emerald-700 bg-emerald-50 border-emerald-200'
  let gaugeColor = 'bg-emerald-500'
  if (priorityLevel === 'Critical') {
    tierColor = 'text-red-700 bg-red-50 border-red-200'
    gaugeColor = 'bg-red-500'
  } else if (priorityLevel === 'High') {
    tierColor = 'text-orange-700 bg-orange-50 border-orange-200'
    gaugeColor = 'bg-orange-500'
  } else if (priorityLevel === 'Medium') {
    tierColor = 'text-amber-700 bg-amber-50 border-amber-200'
    gaugeColor = 'bg-amber-500'
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
            Multi-criteria prioritisation algorithm
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${tierColor}`}>
          {priorityLevel}
        </span>
      </div>

      {/* Main Score Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-[#1e3a5f] text-white p-4 rounded-xl">
        <span className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold block">
          Computed Urgency Index
        </span>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-3xl font-extrabold font-mono text-white">
            {totalScore}
          </span>
          <span className="text-xs text-slate-400 font-normal">/ 100</span>
        </div>
        {/* Score bar */}
        <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className={`h-full ${gaugeColor} rounded-full transition-all duration-700`}
            style={{ width: `${totalScore}%` }}
          />
        </div>
      </div>

      {/* Data source disclaimer */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <Info size={13} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-[10px] text-blue-700 leading-snug">
          <strong>Severity</strong> is from the real YOLO model result.
          Traffic, location, and road factors are <strong>heuristic estimates</strong> based
          on the address text — not live sensor data.
        </p>
      </div>

      {/* Factor Breakdown */}
      <div className="space-y-3 pt-1">
        <span className="text-xs font-bold text-slate-700 block">
          Factor Breakdown:
        </span>

        {components.map((comp) => {
          const Icon = FACTOR_ICONS[comp.name] || Layers
          const isHeuristic = comp.source && comp.source.toLowerCase().includes('heuristic')
          return (
            <div key={comp.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Icon size={13} className="text-blue-600" />
                  {comp.name}
                  {isHeuristic && (
                    <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 ml-1">
                      estimate
                    </span>
                  )}
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

