/**
 * AdminSettingsPage.jsx — /admin/settings
 *
 * System Configuration & SRPS Weight Tuning.
 */

import React, { useState } from 'react'
import { Settings, Sliders, Shield, Database, Save, CheckCircle2 } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'

export default function AdminSettingsPage() {
  const toast = useToast()
  const [weights, setWeights] = useState({
    severity: 35,
    traffic: 25,
    criticality: 15,
    roadClass: 15,
    citizenReports: 10,
  })
  const [saved, setSaved] = useState(false)

  const total = Object.values(weights).reduce((a, b) => a + Number(b), 0)

  const handleSave = (e) => {
    e.preventDefault()
    if (total !== 100) {
      toast.error(`Weights must total 100% (currently ${total}%). Please adjust coefficients.`)
      return
    }
    setSaved(true)
    toast.success('SRPS algorithm coefficients updated and saved to municipal configuration!')
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings size={24} className="text-slate-700" />
            System & Algorithm Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure SRPS weighting coefficients, AI vision thresholds, and municipal GIS layers
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SRPS Weights */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">SRPS Multi-Factor Criteria Weights</h3>
              <p className="text-xs text-slate-500">Total weight must equal 100%</p>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                total === 100
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              Total: {total}%
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {[
              { key: 'severity', label: 'Damage Severity Weight (%)', desc: 'Structural depth and pavement deformation risk' },
              { key: 'traffic', label: 'Traffic Importance Weight (%)', desc: 'Peak passenger car units (PCU) on road link' },
              { key: 'criticality', label: 'Location Criticality Weight (%)', desc: 'Proximity to hospitals, schools, and fire stations' },
              { key: 'roadClass', label: 'Road Classification Weight (%)', desc: 'National Highway / Arterial vs Local municipal road' },
              { key: 'citizenReports', label: 'Citizen Frequency Weight (%)', desc: 'Public complaint volume & duplicate cluster upvotes' },
            ].map((item) => (
              <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="font-bold text-slate-800">{item.label}</label>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights[item.key]}
                    onChange={(e) => setWeights({ ...weights, [item.key]: Number(e.target.value) })}
                    className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-slate-400 font-bold">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI & GIS Config */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900">AI Vision & Geolocation Server</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">FastAPI Backend URL</label>
              <input
                type="text"
                defaultValue="http://localhost:8000/api/v1"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">YOLOv8 Confidence Threshold</label>
              <input
                type="text"
                defaultValue="0.75 (75% Minimum Detection Certainty)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 size={14} />
              Settings Saved!
            </span>
          )}
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Save size={14} />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  )
}
