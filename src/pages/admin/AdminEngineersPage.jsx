/**
 * AdminEngineersPage.jsx — /admin/engineers
 *
 * Engineer & Field Squad Management for Municipal Administrators.
 */

import React from 'react'
import { HardHat, Users, Phone, MapPin, CheckCircle2, AlertCircle } from 'lucide-react'
import { mockRepairTeams } from '../../data/mockData'

export default function AdminEngineersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <HardHat size={24} className="text-blue-600" />
            Field Engineering Squads & Crew Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered municipal pavement engineers, rapid response units, and active assignments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockRepairTeams.map((team) => (
          <div key={team.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-sm transition-all space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <HardHat size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{team.name}</h3>
                  <p className="text-xs text-slate-500">{team.members} Registered Technicians</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Active Jobs</span>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">{team.activeJobs}</p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Completed (Oct)</span>
                <p className="text-lg font-extrabold text-emerald-600 mt-0.5">{team.completedThisMonth}</p>
              </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
              <span>Supervising Officer: Ramesh Kumar</span>
              <span className="font-mono text-[11px] text-blue-600">+91 98111 54321</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
