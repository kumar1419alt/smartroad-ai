/**
 * AdminLayout.jsx — Dedicated layout for Administrator Command Center (/admin/*).
 *
 * Sidebar items specified by requirements:
 *  1. Overview           (/admin/dashboard)
 *  2. Complaints         (/admin/complaints)
 *  3. Priority Queue     (/admin/priority-queue)
 *  4. GIS Map            (/admin/map)
 *  5. Analytics          (/admin/analytics)
 *  6. Repair Management  (/admin/repairs)
 *  7. Engineers          (/admin/engineers)
 *  8. Settings           (/admin/settings)
 */

import React, { useState } from 'react'
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  AlertTriangle,
  Flame,
  MapPin,
  BarChart3,
  Wrench,
  HardHat,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Layers,
  Radio,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { APP_NAME } from '../../constants'

const ADMIN_NAV_ITEMS = [
  { label: 'Overview',          to: '/admin/dashboard',      icon: LayoutDashboard, end: true },
  { label: 'Complaints',        to: '/admin/complaints',     icon: AlertTriangle },
  { label: 'Priority Queue',    to: '/admin/priority',       icon: Flame },
  { label: 'GIS Map',           to: '/admin/map',            icon: MapPin },
  { label: 'Analytics',         to: '/admin/analytics',      icon: BarChart3 },
  { label: 'Repair Management', to: '/admin/repairs',        icon: Wrench },
  { label: 'Engineers',         to: '/admin/engineers',      icon: HardHat },
  { label: 'Settings',          to: '/admin/settings',       icon: Settings },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Active page title
  const currentItem = ADMIN_NAV_ITEMS.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  )
  const pageTitle = currentItem?.label || 'Command Center'

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row text-slate-800 antialiased font-sans">
      {/* ─── DESKTOP SIDEBAR ──────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0a1128] text-white shrink-0 border-r border-slate-800 z-20 shadow-xl">
        {/* Brand */}
        <div className="h-16 flex items-center px-5 border-b border-white/10 gap-2.5 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:bg-blue-500 transition-colors">
              <MapPin size={17} />
            </span>
            <div className="flex flex-col">
              <span className="font-extrabold text-base leading-tight tracking-tight text-white">
                SmartRoad <span className="text-blue-400">Command</span>
              </span>
              <span className="text-[10px] text-blue-300 font-semibold uppercase tracking-wider">
                Municipal Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Live Status indicator */}
        <div className="px-4 py-2.5 border-b border-white/5 bg-white/5">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">AI Vision: Online</span>
            </div>
            <span className="text-[10px] text-blue-300 font-mono">v2.4 Live</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Admin sidebar navigation">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 select-none">
            Infrastructure Ops
          </p>
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md font-bold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon size={16} className="shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.label === 'Priority Queue' && (
                  <span className="px-1.5 py-0.2 rounded-md bg-red-500 text-white text-[10px] font-black">
                    HOT
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom Profile Bar */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {user?.avatarInitials || 'AD'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Dr. Neha Sharma'}</p>
              <p className="text-[10px] text-blue-300 truncate">Chief Infrastructure Admin</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MOBILE DRAWER (Slide-over) ────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-[#0a1128] text-white flex flex-col z-10 shadow-2xl">
            <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
              <span className="font-bold text-sm text-white">SmartRoad Command</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {ADMIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-white/10'
                      }`
                    }
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>

            <div className="p-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-red-600/20 text-red-300 border border-red-500/30"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN COLUMN ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── TOP HEADER ── */}
        <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-10 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-xs">
          {/* Mobile hamburger + Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-blue-600" />
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  {pageTitle}
                </h1>
                <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  <ShieldCheck size={11} className="text-emerald-600" />
                  Admin Authority
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Pune Municipal Corporation • Command & Control Centre
              </p>
            </div>
          </div>

          {/* Quick Search & User Actions */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Search */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search incident, squad, ward..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
              />
            </div>

            {/* Portal Switch Links */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs">
              <Link
                to="/citizen/dashboard"
                className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Citizen View
              </Link>
              <Link
                to="/engineer/dashboard"
                className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Engineer View
              </Link>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell size={17} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              {notificationOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-bold text-xs text-slate-900">Alert Center</span>
                      <span className="text-[10px] text-blue-600 font-semibold">3 New</span>
                    </div>
                    <div className="py-2 space-y-2 text-xs">
                      <div className="p-2 bg-red-50 rounded-xl border border-red-100">
                        <p className="font-bold text-red-800">Critical Pothole detected</p>
                        <p className="text-[10px] text-red-600">FC Road near Goodluck Chowk • SRPS: 94</p>
                      </div>
                      <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="font-bold text-blue-800">Squad Dispatched</p>
                        <p className="text-[10px] text-blue-600">Team #4 en route to Senapati Bapat Road</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {user?.avatarInitials || 'NS'}
                </span>
                <span className="hidden sm:inline font-bold text-xs text-slate-800">
                  {user?.name || 'Dr. Neha'}
                </span>
              </button>

              {userDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2.5 border-b border-slate-100">
                    <p className="font-bold text-xs text-slate-900">{user?.name || 'Dr. Neha Sharma'}</p>
                    <p className="text-[10px] text-slate-500">{user?.email || 'admin@smartroad.gov'}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded-sm">
                      MUNICIPAL ADMINISTRATOR
                    </span>
                  </div>
                  <div className="py-1 text-xs">
                    <Link
                      to="/citizen/dashboard"
                      className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      Citizen Portal
                    </Link>
                    <Link
                      to="/engineer/dashboard"
                      className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      Engineer Portal
                    </Link>
                  </div>
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5"
                    >
                      <LogOut size={13} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
