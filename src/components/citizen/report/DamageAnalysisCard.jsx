/**
 * DamageAnalysisCard.jsx — Reusable AI Damage Analysis Preview Card.
 *
 * Shows:
 *  - AI Computer Vision prediction output (POST /predict simulation)
 *  - Bounding Box visualization over the road image
 *  - Damage type & classification confidence percentage
 *  - Severity indicator
 *  - Estimated physical dimensions (depth, width, surface area)
 */

import React from 'react'
import {
  Brain,
  Scan,
  ShieldCheck,
  AlertTriangle,
  Ruler,
  Layers,
  Sparkles,
} from 'lucide-react'
import SeverityIndicator from './SeverityIndicator'

export default function DamageAnalysisCard({
  analysis,
  imagePreview,
  isAnalyzing = false,
}) {
  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
          <Scan size={24} className="animate-spin" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">
          AI Vision Model Scanning Image…
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Executing convolutional neural network inference: detecting road damage boundaries, depth profile, and severity.
        </p>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-2">
        <Brain size={24} className="text-slate-400 mx-auto" />
        <h3 className="text-xs font-bold text-slate-700">AI Damage Analysis Preview</h3>
        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
          Upload or select a road image to trigger instant AI vision classification & bounding box overlay.
        </p>
      </div>
    )
  }

  const {
    damageType = 'Pothole',
    confidence = 0.964,
    severity = 'critical',
    boundingBoxes = [],
    dimensions = { depthCm: 14.5, widthCm: 52, areaSqM: 0.58 },
    recommendedAction = 'Hot-mix asphalt patching within 48h',
  } = analysis

  const confidencePct = Math.round(confidence * 1000) / 10

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Brain size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              AI Vision Analysis Result
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Model: ResNet-RoadVision-v2.3 (POST /predict)
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <Sparkles size={12} />
          {confidencePct}% Confidence
        </span>
      </div>

      {/* Image with Bounding Box Overlay */}
      {imagePreview && (
        <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-black aspect-video max-h-56">
          <img
            src={imagePreview}
            alt="AI analyzed road defect"
            className="w-full h-full object-cover"
          />

          {/* Render Bounding Boxes */}
          {boundingBoxes.map((item) => (
            <div
              key={item.id}
              style={{
                left: `${item.box.x}%`,
                top: `${item.box.y}%`,
                width: `${item.box.w}%`,
                height: `${item.box.h}%`,
              }}
              className="absolute border-2 border-red-500 bg-red-500/20 rounded shadow-xs pointer-events-none transition-all"
            >
              <div className="absolute -top-6 left-0 bg-red-600 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                {item.label} ({confidencePct}%)
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Damage Type & Severity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Detected Damage
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-slate-900">
              {damageType}
            </span>
            <span className="text-xs text-blue-600 font-semibold">
              Primary Class
            </span>
          </div>
        </div>

        <div>
          <SeverityIndicator severity={severity} showDescription={false} />
        </div>
      </div>

      {/* Estimated Dimensions */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
          <Ruler size={14} className="text-blue-600" />
          <span>Estimated Physical Geometry</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 block">Estimated Depth</span>
            <span className="text-xs font-bold font-mono text-slate-800">{dimensions.depthCm} cm</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 block">Span Width</span>
            <span className="text-xs font-bold font-mono text-slate-800">{dimensions.widthCm} cm</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 block">Surface Area</span>
            <span className="text-xs font-bold font-mono text-slate-800">{dimensions.areaSqM} m²</span>
          </div>
        </div>
      </div>
    </div>
  )
}
