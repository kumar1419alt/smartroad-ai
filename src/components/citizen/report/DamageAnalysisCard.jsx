/**
 * DamageAnalysisCard.jsx — AI Damage Analysis Preview Card.
 *
 * Displays real YOLOv8m-RDD2022 inference results from the FastAPI backend.
 * Shows:
 *  - Actual model name from API response
 *  - Real confidence score from YOLO detection
 *  - Detected damage class (D00/D10/D20/D40) and severity
 *  - Bounding boxes at API-reported percentage coordinates
 *  - Inference time in milliseconds
 *
 * Physical dimensions (depth, width, area) are NOT shown because they
 * cannot be reliably measured from a single uncalibrated 2-D image.
 *
 * If the backend is unavailable the card shows a clear offline notice
 * without fabricating predictions.
 */

import React from 'react'
import {
  Brain,
  Scan,
  AlertTriangle,
  Wifi,
  WifiOff,
  Clock,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react'
import SeverityIndicator from './SeverityIndicator'

// RDD2022 damage code colours matching detectionService.js
const DAMAGE_COLORS = {
  D00: '#f97316', // Orange — Longitudinal Crack
  D10: '#eab308', // Yellow — Transverse Crack
  D20: '#ef4444', // Red    — Alligator Crack
  D40: '#dc2626', // DarkRed — Pothole
}

function damageColor(code) {
  return DAMAGE_COLORS[code] || '#64748b'
}

export default function DamageAnalysisCard({
  analysis,
  imagePreview,
  isAnalyzing = false,
}) {
  // ── Loading state ────────────────────────────────────────────────────
  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
          <Scan size={24} className="animate-spin" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">
          YOLOv8m Scanning Image…
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Sending frame to FastAPI backend — detecting RDD2022 road damage classes.
        </p>
      </div>
    )
  }

  // ── Empty state ──────────────────────────────────────────────────────
  if (!analysis) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-2">
        <Brain size={24} className="text-slate-400 mx-auto" />
        <h3 className="text-xs font-bold text-slate-700">AI Damage Analysis Preview</h3>
        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
          Upload or select a road image to trigger YOLOv8m-RDD2022 inference via the backend API.
        </p>
      </div>
    )
  }

  const {
    damageType = 'Unknown',
    damageCode = null,
    confidence = 0,
    severity = 'medium',
    model = 'YOLOv8m-RDD2022',
    inferenceTimeMs = 0,
    status = 'success',
    boundingBoxes = [],
    detectionCount = 0,
    backendUnavailable = false,
  } = analysis

  const confidencePct = confidence > 0 ? `${Math.round(confidence * 1000) / 10}%` : '—'
  const isNoDetection = detectionCount === 0 && status === 'success'
  const isBackendIssue = backendUnavailable || status === 'backend_unavailable'
  const isModelMissing = status === 'model_not_configured'

  // ── Backend offline notice ───────────────────────────────────────────
  if (isBackendIssue) {
    return (
      <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-amber-700">
          <WifiOff size={18} />
          <h3 className="text-sm font-bold">Backend Unavailable</h3>
        </div>
        <p className="text-xs text-slate-500">
          Could not reach the FastAPI inference backend at{' '}
          <code className="bg-slate-100 px-1 rounded">http://127.0.0.1:8000</code>.
          Start the backend with:
        </p>
        <pre className="text-[10px] bg-slate-100 rounded-lg p-2 text-slate-700 overflow-x-auto">
          python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
        </pre>
        <p className="text-[11px] text-slate-400">
          No predictions are shown — this system does not fabricate detections.
        </p>
      </div>
    )
  }

  // ── Model not configured notice ──────────────────────────────────────
  if (isModelMissing) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-600">
          <Info size={18} />
          <h3 className="text-sm font-bold">Model Weights Not Loaded</h3>
        </div>
        <p className="text-xs text-slate-500">
          The backend is running but <code>YOLO_MODEL_PATH</code> is not configured.
          Copy <code>best.pt</code> to <code>backend/weights/</code> and restart the server.
        </p>
      </div>
    )
  }

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
              {model}
            </span>
          </div>
        </div>

        {confidence > 0 ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <Sparkles size={12} />
            {confidencePct}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            No detection
          </span>
        )}
      </div>

      {/* Inference time badge */}
      {inferenceTimeMs > 0 && (
        <div className="flex items-center gap-1 text-[10px] text-slate-400 -mt-2">
          <Clock size={10} />
          <span>Inference: {inferenceTimeMs} ms</span>
        </div>
      )}

      {/* Image with Real Bounding Box Overlay */}
      {imagePreview && (
        <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-black aspect-video max-h-56">
          <img
            src={imagePreview}
            alt="AI analyzed road defect"
            className="w-full h-full object-cover"
          />

          {/* Render real YOLO bounding boxes */}
          {boundingBoxes.map((item) => {
            const color = damageColor(item.damageCode)
            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  left: `${item.box.x}%`,
                  top: `${item.box.y}%`,
                  width: `${item.box.w}%`,
                  height: `${item.box.h}%`,
                  borderColor: color,
                  backgroundColor: `${color}25`,
                  border: '2px solid',
                  borderRadius: '4px',
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-22px',
                    left: 0,
                    backgroundColor: color,
                    color: 'white',
                    fontFamily: 'monospace',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }}
                >
                  {item.label} · {Math.round(item.confidence * 1000) / 10}%
                </div>
              </div>
            )
          })}

          {/* No detection overlay */}
          {isNoDetection && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1.5 rounded-full">
                No damage detected at threshold 70%
              </span>
            </div>
          )}
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
            {damageCode && (
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${damageColor(damageCode)}20`, color: damageColor(damageCode) }}
              >
                {damageCode}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {detectionCount} detection{detectionCount !== 1 ? 's' : ''} found
          </span>
        </div>

        <div>
          <SeverityIndicator severity={severity} showDescription={false} />
        </div>
      </div>

      {/* Physical Dimensions — NOT shown (not measurable from 2D image) */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
        <Info size={14} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-[11px] text-amber-700 leading-snug">
          <strong>Physical dimensions not measured.</strong>{' '}
          Depth, width, and surface area cannot be reliably estimated from a
          single uncalibrated photograph. Severity is classified from the YOLO
          detection confidence score only.
        </p>
      </div>

      {/* All detections list */}
      {boundingBoxes.length > 1 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
            All Detections ({boundingBoxes.length})
          </span>
          {boundingBoxes.map((b, i) => (
            <div
              key={b.id}
              className="flex items-center justify-between text-[11px] bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200"
            >
              <span className="font-medium text-slate-700">
                #{i + 1} {b.label}
              </span>
              <span className="font-mono font-bold" style={{ color: damageColor(b.damageCode) }}>
                {Math.round(b.confidence * 1000) / 10}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
