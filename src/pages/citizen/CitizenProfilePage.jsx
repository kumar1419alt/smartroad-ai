/**
 * CitizenProfilePage.jsx — Citizen Profile & Ward settings (/citizen/profile).
 */

import React, { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Award,
  Bell,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'

export default function CitizenProfilePage() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [preferredWard, setPreferredWard] = useState('Ward 14 (Shivajinagar - Deccan Gymkhana)')
  const [smsAlerts, setSmsAlerts] = useState(true)

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Citizen Profile & Ward Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your residential jurisdiction and complaint status alert preferences
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            {user?.avatarInitials || 'PV'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.name || 'Priya Verma'}</h3>
            <p className="text-xs text-slate-500">{user?.email || 'citizen@example.com'}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Verified Resident
              </span>
              <span className="text-[11px] text-slate-400">
                8 Reports Contributed
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              readOnly
              value={user?.name || 'Priya Verma'}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              readOnly
              value={user?.email || 'citizen@example.com'}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="text"
              readOnly
              value={user?.phone || '+91 98765 43210'}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Primary Residential Ward (Pune Municipal Corp)
            </label>
            <select
              value={preferredWard}
              onChange={(e) => setPreferredWard(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option>Ward 14 (Shivajinagar - Deccan Gymkhana)</option>
              <option>Ward 10 (Gokhale Nagar - Senapati Bapat Road)</option>
              <option>Ward 8 (Aundh - Baner - Balewadi)</option>
              <option>Ward 12 (Kothrud - Bavdhan)</option>
              <option>Ward 3 (Viman Nagar - Wadgaon Sheri)</option>
              <option>Wakad - Hinjewadi IT Corridor</option>
            </select>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span className="text-slate-700 font-medium">
                Receive SMS updates when PMC repair crews resolve reported potholes
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {saved ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 size={15} /> Preferences saved!
              </span>
            ) : <span />}

            <Button type="submit" variant="primary" size="sm">
              Save Preferences
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
