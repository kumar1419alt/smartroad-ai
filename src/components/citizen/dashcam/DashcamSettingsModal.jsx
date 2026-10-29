/**
 * DashcamSettingsModal.jsx — Configurable Settings for Live Dashcam & Inference.
 */

import React, { useState, useEffect } from 'react'
import {
  Sliders,
  Cpu,
  Clock,
  Compass,
  MapPin,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react'
import Modal from '../../ui/Modal'
import Button from '../../ui/Button'
import detectionService from '../../../services/detectionService'

export default function DashcamSettingsModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) {
  const [localConfig, setLocalConfig] = useState({
    confidenceThreshold: 0.70,
    samplingIntervalMs: 1800,
    spatialDuplicateThresholdMeters: 35,
    temporalDuplicateThresholdSeconds: 25,
    yoloEndpoint: detectionService?.config?.endpoint || '/detection/infer',
    autoSubmitInDemo: false,
  })

  // Sync state on modal open
  useEffect(() => {
    if (config) {
      setLocalConfig({
        confidenceThreshold: config.confidenceThreshold ?? 0.70,
        samplingIntervalMs: config.samplingIntervalMs ?? 1800,
        spatialDuplicateThresholdMeters: config.spatialDuplicateThresholdMeters ?? 35,
        temporalDuplicateThresholdSeconds: config.temporalDuplicateThresholdSeconds ?? 25,
        yoloEndpoint: detectionService?.config?.endpoint || '/detection/infer',
        autoSubmitInDemo: config.autoSubmitInDemo ?? false,
      })
    }
  }, [config, isOpen])

  const handleResetDefaults = () => {
    setLocalConfig({
      confidenceThreshold: 0.70,
      samplingIntervalMs: 1800,
      spatialDuplicateThresholdMeters: 35,
      temporalDuplicateThresholdSeconds: 25,
      yoloEndpoint: '/detection/infer',
      autoSubmitInDemo: false,
    })
  }

  const handleSave = () => {
    // Update detectionService endpoint if modified
    detectionService.updateConfig({
      endpoint: localConfig.yoloEndpoint,
    })

    // Save dashcam session config
    onSaveConfig({
      confidenceThreshold: Number(localConfig.confidenceThreshold),
      samplingIntervalMs: Number(localConfig.samplingIntervalMs),
      spatialDuplicateThresholdMeters: Number(localConfig.spatialDuplicateThresholdMeters),
      temporalDuplicateThresholdSeconds: Number(localConfig.temporalDuplicateThresholdSeconds),
      autoSubmitInDemo: Boolean(localConfig.autoSubmitInDemo),
    })

    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Live Dashcam & AI Inference Settings"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={handleResetDefaults}
            className="text-slate-500 hover:text-slate-700"
          >
            Reset Defaults
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              onClick={handleSave}
            >
              Save Configuration
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-sm">
        {/* Notice */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 flex items-start gap-3 text-blue-900">
          <HelpCircle size={18} className="shrink-0 text-blue-600 mt-0.5" />
          <p className="text-xs leading-relaxed">
            These settings tune client-side frame sampling, YOLO model confidence gates, and spatial deduplication filters.
            Adjust conservatively to preserve smartphone battery and prevent duplicate municipal tickets.
          </p>
        </div>

        {/* Section 1: AI Confidence Gate */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-800 flex items-center gap-2">
              <Cpu size={16} className="text-blue-600" />
              Minimum AI Confidence Threshold
            </label>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {Math.round(localConfig.confidenceThreshold * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.50"
            max="0.95"
            step="0.05"
            value={localConfig.confidenceThreshold}
            onChange={(e) =>
              setLocalConfig((prev) => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))
            }
            className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>50% (Permissive / High Recall)</span>
            <span>70% (Standard Civic Gate)</span>
            <span>95% (Strict / Zero False Positives)</span>
          </div>
        </div>

        {/* Section 2: Frame Sampling Rate */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-800 flex items-center gap-2">
              <Clock size={16} className="text-indigo-600" />
              Frame Sampling Interval
            </label>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
              {(localConfig.samplingIntervalMs / 1000).toFixed(1)}s
            </span>
          </div>
          <select
            value={localConfig.samplingIntervalMs}
            onChange={(e) =>
              setLocalConfig((prev) => ({ ...prev, samplingIntervalMs: parseInt(e.target.value, 10) }))
            }
            className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1000">1.0 second — High Frequency (High battery & network load)</option>
            <option value="1500">1.5 seconds — Rapid City Driving (Recommended for &gt; 40 km/h)</option>
            <option value="1800">1.8 seconds — Balanced Civic Standard (Default)</option>
            <option value="2500">2.5 seconds — Moderate Pace / Suburban</option>
            <option value="3500">3.5 seconds — Battery Saver Mode (Low data consumption)</option>
          </select>
          <p className="text-[11px] text-slate-500">
            Rather than streaming continuous 30fps video, SmartRoad AI extracts still frames at this interval to prevent network congestion.
          </p>
        </div>

        {/* Section 3: Deduplication Radii */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-600" />
                Spatial Radius Filter
              </label>
              <span className="font-mono text-xs font-bold text-emerald-700">
                {localConfig.spatialDuplicateThresholdMeters}m
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="100"
              step="5"
              value={localConfig.spatialDuplicateThresholdMeters}
              onChange={(e) =>
                setLocalConfig((prev) => ({
                  ...prev,
                  spatialDuplicateThresholdMeters: parseInt(e.target.value, 10),
                }))
              }
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <p className="text-[10px] text-slate-500 leading-tight">
              Detections of the same defect within this distance are treated as duplicate observations.
            </p>
          </div>

          <div className="space-y-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                <Clock size={14} className="text-amber-600" />
                Temporal Cooldown
              </label>
              <span className="font-mono text-xs font-bold text-amber-700">
                {localConfig.temporalDuplicateThresholdSeconds}s
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={localConfig.temporalDuplicateThresholdSeconds}
              onChange={(e) =>
                setLocalConfig((prev) => ({
                  ...prev,
                  temporalDuplicateThresholdSeconds: parseInt(e.target.value, 10),
                }))
              }
              className="w-full accent-amber-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <p className="text-[10px] text-slate-500 leading-tight">
              Minimum seconds before filing another complaint of the same type even if the vehicle stops.
            </p>
          </div>
        </div>

        {/* Section 4: YOLO Backend Endpoint */}
        <div className="space-y-2">
          <label className="font-semibold text-slate-800 flex items-center gap-2">
            <Sliders size={16} className="text-slate-600" />
            YOLO Inference API Endpoint
          </label>
          <input
            type="text"
            value={localConfig.yoloEndpoint}
            onChange={(e) =>
              setLocalConfig((prev) => ({ ...prev, yoloEndpoint: e.target.value }))
            }
            placeholder="/detection/infer"
            className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-[11px] text-slate-500">
            Target FastAPI / TorchServe inference route. Submits POST payloads with image base64, session ID, and GPS coordinates.
          </p>
        </div>

        {/* Section 5: Demo Mode Auto-Submit */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 flex items-start gap-3">
          <input
            id="autoSubmitInDemo"
            type="checkbox"
            checked={localConfig.autoSubmitInDemo}
            onChange={(e) =>
              setLocalConfig((prev) => ({ ...prev, autoSubmitInDemo: e.target.checked }))
            }
            className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
          />
          <label htmlFor="autoSubmitInDemo" className="cursor-pointer select-none">
            <span className="font-semibold text-xs text-amber-900 block">
              Auto-generate complaints during Demo Simulation
            </span>
            <span className="text-[11px] text-amber-700 block mt-0.5">
              When checked, simulated road damage events will automatically generate local complaints in My Reports and GIS Map for testing end-to-end municipal workflows.
            </span>
          </label>
        </div>
      </div>
    </Modal>
  )
}
