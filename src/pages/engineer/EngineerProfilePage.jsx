/**
 * EngineerProfilePage.jsx — Route: /engineer/profile
 *
 * Engineer Officer Dossier & Field Squad Configuration.
 * Displays:
 *  - Officer bio & credential overview (Er. Vikram Joshi)
 *  - Operational squad assignment (PMC Rapid Response Team #4, Zone-4)
 *  - Key performance statistics & safety records
 *  - Professional IRC / NHAI certifications
 *  - Assigned machinery & field equipment inventory
 *  - Squad duty status toggle
 */

import React, { useState } from 'react'
import {
  UserCircle,
  HardHat,
  Award,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  Truck,
  Wrench,
  Radio,
  FileText,
  Sparkles,
  Zap,
} from 'lucide-react'
import { ENGINEER_PROFILE } from '../../data/mockEngineerData'

export default function EngineerProfilePage() {
  const [profile, setProfile] = useState(ENGINEER_PROFILE)
  const [isOnDuty, setIsOnDuty] = useState(true)

  const equipmentList = [
    { name: 'Wacker Neuson Trench Roller (RTX-SC3)', serial: 'EQ-TR-092', status: 'Operational', lastService: '02 Oct 2026' },
    { name: 'Mini Cold Planer (Wirtgen W 35 Ri)', serial: 'EQ-CP-014', status: 'Operational', lastService: '28 Sep 2026' },
    { name: 'Bitumen Tack-Coat Emulsion Sprayer', serial: 'EQ-BS-081', status: 'Operational', lastService: '05 Oct 2026' },
    { name: 'Husqvarna FS 400 LV Asphalt Floor Saw', serial: 'EQ-AS-119', status: 'Operational', lastService: '01 Oct 2026' },
  ]

  const vehicles = [
    { model: 'Tata Xenon Heavy Duty Crew Utility', plate: 'MH 12 QZ 4421', type: 'Rapid Response Unit #4' },
    { model: 'Mahindra Bolero Camper Material Hauler', plate: 'MH 12 BX 8810', type: 'Support Transport' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── HEADER & DUTY STATUS ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-md">
              {profile.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {profile.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {profile.id}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-emerald-700 mt-0.5">
                {profile.designation}
              </p>
              <p className="text-xs text-slate-500">
                {profile.department} • {profile.zone}
              </p>
            </div>
          </div>

          {/* On-Duty Status Switcher */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 self-start md:self-auto">
            <div className="text-right">
              <p className="text-[11px] font-bold text-slate-500 uppercase">Field Shift Status</p>
              <p className="text-xs font-extrabold text-slate-800">
                {isOnDuty ? 'On-Duty • Dispatched' : 'Off-Duty • Standby'}
              </p>
            </div>
            <button
              onClick={() => setIsOnDuty(!isOnDuty)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                isOnDuty ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  isOnDuty ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS ROW ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Career Repairs</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{profile.totalRepairs}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Since {profile.joinedDate}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Restored This Month</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{profile.completedThisMonth}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Top 5% in Municipal Corp</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Field QA Score</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{profile.rating} / 5.0</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Audited by CRRI Inspectors</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Safety Streak</p>
          <p className="text-2xl font-black text-slate-900 mt-1">420 Days</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Zero Lost-Time Incidents</p>
        </div>
      </div>

      {/* ── DETAILS & EQUIPMENT GRID ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Officer Information & Certifications (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Contact & Assignment */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <UserCircle size={17} className="text-emerald-600" />
              Officer Contact & Field Assignment
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-500 flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  Official Phone:
                </span>
                <span className="font-bold text-slate-800">{profile.phone}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-500 flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  Government Email:
                </span>
                <span className="font-mono font-bold text-slate-800">{profile.email}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-500 flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" />
                  Field Squad:
                </span>
                <span className="font-bold text-slate-800">{profile.squad}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-500 flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  Commissioning Date:
                </span>
                <span className="font-bold text-slate-800">{profile.joinedDate}</span>
              </div>
            </div>
          </div>

          {/* Professional Certifications */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Award size={17} className="text-amber-500" />
              Civil Engineering Accreditations
            </h3>

            <div className="space-y-2">
              {profile.certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/70 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-800">{cert}</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-100 px-2 py-0.5 rounded">
                    Certified
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Fleet & Heavy Machinery Inventory (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Equipment List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Wrench size={17} className="text-emerald-600" />
              Assigned Field Machinery
            </h3>

            <div className="space-y-2">
              {equipmentList.map((eq, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{eq.name}</p>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                      Serial: {eq.serial} • Serviced: {eq.lastService}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {eq.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Vehicles */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Truck size={17} className="text-blue-600" />
              Rapid Response Fleet
            </h3>

            <div className="space-y-2">
              {vehicles.map((v, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{v.model}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{v.type}</p>
                  </div>
                  <span className="font-mono font-bold text-xs bg-slate-200 px-2.5 py-1 rounded-lg text-slate-800">
                    {v.plate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
