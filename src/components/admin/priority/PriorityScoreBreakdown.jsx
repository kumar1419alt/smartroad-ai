/**
 * PriorityScoreBreakdown.jsx — Reusable Visual Breakdown of the 5 SRPS Factors.
 *
 * Formula:
 *   SRPS = w1·S + w2·T + w3·L + w4·R + w5·C
 *
 * Demo Weights:
 *   S = 0.35 | T = 0.25 | L = 0.20 | R = 0.15 | C = 0.05
 *
 * Important Note:
 *   Includes clear labeling as initial demonstration weights and explicit
 *   statement that the SRPS formulation is an exploratory decision-support model
 *   and has not yet been experimentally proven.
 */

import React from 'react'
import {
  Flame,
  AlertTriangle,
  Car,
  MapPin,
  GitBranch,
  Users,
  Info,
  Scale,
  Sparkles,
  ShieldAlert,
} from 'lucide-react'
import {
  SRPS_DEMO_WEIGHTS,
  FACTOR_METADATA,
  deriveFactorsForComplaint,
} from '../../../utils/srpsCalculator'

export default function PriorityScoreBreakdown({
  complaint,
  showFormulaHeader = true,
  className = '',
}) {
  if (!complaint) return null

  const factorData = deriveFactorsForComplaint(complaint)
  const { S, T, L, R, C, contributions, srps, displaySRPS, priorityLevel } = factorData

  const factorsList = [
    {
      ...FACTOR_METADATA.S,
      score: S,
      contrib: contributions.w1S,
      icon: AlertTriangle,
    },
    {
      ...FACTOR_METADATA.T,
      score: T,
      contrib: contributions.w2T,
      icon: Car,
    },
    {
      ...FACTOR_METADATA.L,
      score: L,
      contrib: contributions.w3L,
      icon: MapPin,
    },
    {
      ...FACTOR_METADATA.R,
      score: R,
      contrib: contributions.w4R,
      icon: GitBranch,
    },
    {
      ...FACTOR_METADATA.C,
      score: C,
      contrib: contributions.w5C,
      icon: Users,
    },
  ]

  // Priority color theme
  const getPriorityTheme = (lvl) => {
    if (lvl === 'Critical') return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', bar: 'bg-red-600' }
    if (lvl === 'High') return { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', bar: 'bg-orange-500' }
    if (lvl === 'Medium') return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500' }
    return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500' }
  }

  const pTheme = getPriorityTheme(priorityLevel)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── 1. Total Score Overview Banner ─────────────────────────────────── */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
        {/* Soft background ambient glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Multi-Factor Algorithmic Evaluation
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                Demo Weights v2.4
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              Smart Road Repair Priority Score (SRPS)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cumulative weighted urgency score for {complaint.id} ({complaint.damageType})
            </p>
          </div>

          <div className="flex items-baseline gap-2 bg-white/10 backdrop-blur-xs px-5 py-3 rounded-2xl border border-white/10 shrink-0">
            <Flame size={24} className="text-red-400 self-center" />
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{srps}</span>
                <span className="text-slate-400 text-sm">/ 100</span>
              </div>
              <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mt-0.5 ${pTheme.bg} ${pTheme.text}`}>
                Tier: {priorityLevel}
              </span>
            </div>
          </div>
        </div>

        {/* ── Segmented Weighted Contribution Visual Bar ─────────────────── */}
        <div className="mt-6 pt-5 border-t border-slate-800 space-y-2 relative z-10">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold">Factor Contribution to Final SRPS ({srps} pts)</span>
            <span className="text-[11px] text-slate-400 font-mono">
              {contributions.w1S} + {contributions.w2T} + {contributions.w3L} + {contributions.w4R} + {contributions.w5C}
            </span>
          </div>

          {/* Stacked Contribution Progress Bar */}
          <div className="w-full h-4 rounded-full bg-slate-800 p-0.5 flex overflow-hidden ring-1 ring-white/10">
            <div
              title={`Severity: ${contributions.w1S} pts`}
              style={{ width: `${(contributions.w1S / 100) * 100}%` }}
              className="h-full bg-red-500 rounded-l-full transition-all duration-300"
            />
            <div
              title={`Traffic: ${contributions.w2T} pts`}
              style={{ width: `${(contributions.w2T / 100) * 100}%` }}
              className="h-full bg-orange-500 transition-all duration-300"
            />
            <div
              title={`Location Criticality: ${contributions.w3L} pts`}
              style={{ width: `${(contributions.w3L / 100) * 100}%` }}
              className="h-full bg-blue-500 transition-all duration-300"
            />
            <div
              title={`Road Importance: ${contributions.w4R} pts`}
              style={{ width: `${(contributions.w4R / 100) * 100}%` }}
              className="h-full bg-purple-500 transition-all duration-300"
            />
            <div
              title={`Citizen Reports: ${contributions.w5C} pts`}
              style={{ width: `${(contributions.w5C / 100) * 100}%` }}
              className="h-full bg-emerald-500 rounded-r-full transition-all duration-300"
            />
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              S: Severity ({contributions.w1S})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              T: Traffic ({contributions.w2T})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              L: Loc. Criticality ({contributions.w3L})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              R: Road Importance ({contributions.w4R})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              C: Reports ({contributions.w5C})
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Formula Breakdown Card ────────────────────────────────────── */}
      {showFormulaHeader && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Scale size={14} className="text-blue-600" />
              Mathematical Formulation
            </span>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Initial / Demo Weights
            </span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs sm:text-sm text-slate-800 text-center font-bold tracking-wide">
            SRPS = (0.35 × S) + (0.25 × T) + (0.20 × L) + (0.15 × R) + (0.05 × C)
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs text-blue-700 text-center font-bold">
            = ({contributions.w1S}) + ({contributions.w2T}) + ({contributions.w3L}) + ({contributions.w4R}) + ({contributions.w5C}) = <span className="text-slate-900 font-extrabold text-sm">{srps}</span>
          </div>
        </div>
      )}

      {/* ── 3. Five Factor Detail Cards ──────────────────────────────────── */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <Sparkles size={14} className="text-blue-600" />
          Component Factor Weights & Normalized Values
        </h4>

        <div className="grid grid-cols-1 gap-3">
          {factorsList.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.key}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Identity and description */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span
                    style={{ backgroundColor: `${f.color}15`, color: f.color }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold"
                  >
                    <Icon size={18} />
                  </span>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{f.name}</span>
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700">
                        Symbol: {f.symbol}
                      </span>
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        Weight: {f.weightPct} (w = {f.weight})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Source: {f.source}</p>
                  </div>
                </div>

                {/* Right: Scores and weighted contribution */}
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 shrink-0 self-end sm:self-auto">
                  {/* Raw Score */}
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Raw Factor</span>
                    <span className="text-base font-extrabold text-slate-900">{f.score}</span>
                    <span className="text-[10px] text-slate-400"> /100</span>
                  </div>

                  <span className="text-slate-300 font-bold">×</span>

                  {/* Weight */}
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Weight</span>
                    <span className="text-xs font-mono font-bold text-blue-700">{f.weight}</span>
                  </div>

                  <span className="text-slate-300 font-bold">=</span>

                  {/* Weighted Points */}
                  <div className="text-center min-w-[60px]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Contribution</span>
                    <span
                      style={{ color: f.color }}
                      className="text-base font-black"
                    >
                      +{f.contrib}
                    </span>
                    <span className="text-[10px] text-slate-400 block">pts</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 4. Academic / Research Disclaimer Notice ──────────────────────── */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
        <Info size={17} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-950">
            Important Framework Notice & Simulation Status
          </p>
          <p className="text-[11px] leading-relaxed text-amber-800">
            The Smart Road Repair Priority Score (SRPS) is a proposed multi-criteria decision-support heuristic
            designed to combine Computer Vision road inspection with municipal GIS contextual layers.
            <strong> The current coefficients (S=0.35, T=0.25, L=0.20, R=0.15, C=0.05) are initial demonstration weights</strong> configured
            for system prototyping and municipal workflow illustration.
            <strong> SRPS is not claimed to be experimentally proven</strong> or empirically calibrated via longitudinal
            pavement life-cycle degradation trials at this stage. Field trials and statistical validation will be conducted
            in subsequent phases.
          </p>
        </div>
      </div>
    </div>
  )
}
