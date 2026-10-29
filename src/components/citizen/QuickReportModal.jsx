/**
 * QuickReportModal.jsx — Modal form to quickly log a new road damage issue in Pune.
 */

import React, { useState } from 'react'
import {
  X,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Sparkles,
} from 'lucide-react'
import Button from '../ui/Button'

const PUNE_DAMAGE_TYPES = [
  'Pothole',
  'Deep Crater',
  'Longitudinal Crack',
  'Manhole Subsidence',
  'Edge Erosion',
  'Waterlogged Depression',
  'Surface Rutting',
]

const PUNE_WARDS = [
  'Ward 14 (Shivajinagar - Deccan Gymkhana)',
  'Ward 10 (Gokhale Nagar - Senapati Bapat Road)',
  'Ward 8 (Aundh - Baner - Balewadi)',
  'Ward 12 (Kothrud - Bavdhan)',
  'Ward 3 (Viman Nagar - Wadgaon Sheri)',
  'Ward 18 (Swargate - Tilak Road)',
  'Wakad - Hinjewadi IT Corridor',
  'Ward 21 (Hadapsar - Magarpatta)',
]

export default function QuickReportModal({ isOpen, onClose, onSubmitSuccess }) {
  const [damageType, setDamageType] = useState('Pothole')
  const [locationName, setLocationName] = useState('')
  const [ward, setWard] = useState(PUNE_WARDS[0])
  const [description, setDescription] = useState('')
  const [hasPhoto, setHasPhoto] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      const newComplaint = {
        id: `PMC-2026-0${Math.floor(430 + Math.random() * 60)}`,
        incidentId: `INC-2026-00${Math.floor(920 + Math.random() * 50)}`,
        damageType,
        location: locationName.trim() || 'FC Road, Deccan Gymkhana, Pune',
        ward,
        severity: damageType.includes('Crater') || damageType.includes('Subsidence') ? 'critical' : 'high',
        priority: Math.floor(75 + Math.random() * 20),
        status: 'Pending',
        date: 'Today, 13 Oct 2026',
        timestamp: new Date().toISOString(),
        coordinates: [18.5204 + (Math.random() - 0.5) * 0.04, 73.8567 + (Math.random() - 0.5) * 0.04],
        aiConfidence: '95.2%',
        description: description.trim() || 'Citizen road hazard reported via portal.',
        estimatedFix: 'Under PMC Inspection',
        upvotes: 1,
        assignedSquad: 'PMC Rapid Response Team',
      }

      setIsSubmitting(false)
      setSuccess(true)

      setTimeout(() => {
        setSuccess(false)
        onSubmitSuccess && onSubmitSuccess(newComplaint)
        onClose()
      }, 1200)
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Report Road Damage</h3>
            <p className="text-xs text-slate-500">
              Submit location & details for Pune Municipal Corporation (PMC) inspection
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 size={42} className="text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-900">Complaint Successfully Registered!</h4>
            <p className="text-xs text-slate-500">
              AI Vision pipeline is calculating the SRPS priority score.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Damage Type
              </label>
              <select
                value={damageType}
                onChange={(e) => setDamageType(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {PUNE_DAMAGE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pune Ward / Area
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {PUNE_WARDS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Road Name & Landmark
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. FC Road, near Goodluck Chowk"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Photo Evidence
              </label>
              <button
                type="button"
                onClick={() => setHasPhoto(!hasPhoto)}
                className={`w-full border-2 border-dashed rounded-xl p-3 flex items-center justify-center gap-2 text-xs transition-colors ${
                  hasPhoto
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700'
                    : 'border-slate-300 hover:border-slate-400 text-slate-600'
                }`}
              >
                <Camera size={16} />
                <span>{hasPhoto ? 'Photo Attached (road_sample.jpg)' : 'Click to Upload Photo / Capture'}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description / Additional Notes
              </label>
              <textarea
                rows={2}
                placeholder="Mention traffic risk, depth, or nearby landmarks…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
                Submit Complaint
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
