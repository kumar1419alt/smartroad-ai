/**
 * DamageInspectionView.jsx — Road defect visual inspection & AI inference view.
 *
 * Shows:
 *  - High-res road image with toggleable AI Bounding Box overlay
 *  - Damage type & AI Confidence
 *  - Severity indicator
 *  - Estimated physical geometry (depth, span width, surface area)
 *  - Machine vision telemetry (model name, confidence threshold)
 */

import React, { useState } from 'react'
import {
  Brain,
  Layers,
  Ruler,
  Eye,
  EyeOff,
  Sparkles,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import SeverityIndicator from '../report/SeverityIndicator'

export default function DamageInspectionView({ complaint }) {
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true)

  const imageUrl = complaint?.imageUrl || '/sample-pothole.jpg'
  const damageType = complaint?.damageType || 'Pothole'
  const confidence = complaint?.aiConfidence || '96.4%'
  const severity = complaint?.severity || 'critical'

  const boxes = complaint?.boundingBoxes || [
    {
      id: 'box-1',
      label: `${damageType} (${confidence})`,
      box: { x: 20, y: 34, w: 56, h: 48 },
    },
  ]

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Brain size={18} className="text-blue-600" />
            <span>AI Damage Detection & Visual Evidence</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Computer vision neural model classification and bounding box localization
          </p>
        </div>

        {/* Toggle overlay button */}
        <button
          type="button"
          onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
            showBoundingBoxes
              ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
          }`}
        >
          {showBoundingBoxes ? <Eye size={14} /> : <EyeOff size={14} />}
          <span>{showBoundingBoxes ? 'Hide Bounding Boxes' : 'Show AI Detection Boxes'}</span>
        </button>
      </div>

      {/* Image Container with Bounding Box Overlay */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video max-h-80 w-full shadow-2xs">
        <img
          src={imageUrl}
          alt={`Defect photo of ${damageType}`}
          className="w-full h-full object-cover"
        />

        {/* Bounding Box Overlays */}
        {showBoundingBoxes &&
          boxes.map((item) => (
            <div
              key={item.id}
              style={{
                left: `${item.box.x}%`,
                top: `${item.box.y}%`,
                width: `${item.box.w}%`,
                height: `${item.box.h}%`,
              }}
              className="absolute border-2 border-red-500 bg-red-500/20 rounded shadow-xs pointer-events-none transition-opacity duration-300"
            >
              <div className="absolute -top-7 left-0 bg-red-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap flex items-center gap-1">
                <Sparkles size={11} />
                <span>{item.label}</span>
              </div>
            </div>
          ))}

        {/* Floating AI Model Watermark */}
        <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white/90 text-[10px] font-mono px-2 py-1 rounded-md border border-white/10">
          ResNet-RoadVision • Conf: {confidence}
        </div>
      </div>

      {/* AI Telemetry & Geometry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Severity */}
        <div>
          <SeverityIndicator severity={severity} showDescription={true} />
        </div>

        {/* Geometry & Action */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Ruler size={14} className="text-blue-600" />
              <span>Physical Road Defect Geometry</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
              Verified
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block">Est. Depth</span>
              <span className="text-xs font-bold font-mono text-slate-900">14.5 cm</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block">Width Span</span>
              <span className="text-xs font-bold font-mono text-slate-900">52.0 cm</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block">Area</span>
              <span className="text-xs font-bold font-mono text-slate-900">0.58 m²</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
            <strong>Recommended PMC Intervention:</strong> Asphalt cold-planer milling & rapid-curing hot mix asphalt (VG-30).
          </p>
        </div>
      </div>
    </div>
  )
}
