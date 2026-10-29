/**
 * CitizenReportDamagePage.jsx — Road Damage Reporting Page (/citizen/report).
 *
 * Provides the complete multi-section reporting experience:
 *  - Section 1: Upload Road Image
 *  - Section 2: Location (Geolocation API + Leaflet map with draggable marker)
 *  - Section 3: Description ("Describe the road damage...")
 *  - Section 4: Damage preview (AI analysis & bounding box visualization)
 *  - Section 5: Priority preview (SRPS score & 5 factors)
 *  - Section 6: Submit Report (Generates complaint ID & confirmation)
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, MapPin, Sparkles, PhoneCall } from 'lucide-react'
import ReportForm from '../../components/citizen/report/ReportForm'

export default function CitizenReportDamagePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb & Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link
            to="/citizen/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-2 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Citizen Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Report Road Hazard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pune Municipal Corporation (PMC) Road Damage Detection & Repair Intake
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Sparkles size={14} className="text-blue-600" />
          <span>AI Vision & SRPS Active</span>
        </div>
      </div>

      {/* Main Report Form */}
      <ReportForm />
    </div>
  )
}
