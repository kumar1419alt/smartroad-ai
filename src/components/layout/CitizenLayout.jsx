/**
 * CitizenLayout.jsx — Dedicated layout for the Citizen Portal.
 *
 * Includes:
 *  - Persistent Sidebar on desktop
 *  - Responsive Mobile Navigation (slide-over drawer + bottom nav bar)
 *  - Top Bar with Pune municipality status, search, and notification bell
 *  - User Profile Menu with avatar, role badge, and sign-out
 *  - Sidebar links:
 *      1. Dashboard     (/citizen/dashboard)
 *      2. Report Damage (/citizen/report)
 *      3. My Reports    (/citizen/reports)
 *      4. Road Map      (/citizen/map)
 *      5. Profile       (/citizen/profile)
 */

import React, { useState } from 'react'
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Video,
  PlusCircle,
  ClipboardList,
  Map,
  User,
  MapPin,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { APP_NAME } from '../../constants'

const CITIZEN_NAV_ITEMS = [
  { label: 'Dashboard', shortLabel: 'Dashboard', to: '/citizen/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Live Dashcam', shortLabel: 'Dashcam', to: '/citizen/dashcam', icon: Video, badge: 'AI Live' },
  { label: 'Report Damage', shortLabel: 'Report', to: '/citizen/report', icon: PlusCircle },
  { label: 'My Reports', shortLabel: 'Reports', to: '/citizen/reports', icon: ClipboardList },
  { label: 'Road Map', shortLabel: 'Map', to: '/citizen/map', icon: Map },
  { label: 'Profile', shortLabel: 'Profile', to: '/citizen/profile', icon: User },
]

export default function CitizenLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Get current section label
  const currentItem = CITIZEN_NAV_ITEMS.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
  )
  const pageTitle = currentItem?.label || 'Citizen Portal'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* ─── DESKTOP SIDEBAR ──────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0a192f] text-white shrink-0 border-r border-white/10 z-20">
        {/* Brand */}
        <div className="h-16 flex items-center px-5 border-b border-white/10 gap-2.5 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-500 transition-colors">
              <MapPin size={17} />
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-base leading-tight tracking-tight text-white">
                SmartRoad<span className="text-blue-400"> AI</span>
              </span>
              <span className="text-[10px] text-blue-300 font-semibold uppercase tracking-wider">
                Citizen Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Pune Municipal Jurisdiction Tag */}
        <div className="px-4 py-2.5 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-1.5 text-xs text-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold truncate">Pune Municipal Corp (PMC)</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Citizen portal sections">
          {CITIZEN_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-[10px] bg-emerald-500/25 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-400/30">
                        {item.badge}
                      </span>
                    )}
                    {item.label === 'Report Damage' && (
                      <span className="ml-auto text-[10px] bg-blue-500/40 text-blue-200 font-bold px-1.5 py-0.5 rounded">
                        NEW
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Helpline & Civic Assistance Card */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1">
              <PhoneCall size={13} />
              <span>Pune Road Helpline</span>
            </div>
            <p className="text-[11px] text-slate-300 mb-2">
              For emergency cave-ins or waterlogging:
            </p>
            <div className="font-mono text-xs font-bold text-white bg-black/30 px-2 py-1 rounded text-center">
              1800-11-ROADS (7623)
            </div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA & TOPBAR ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-2xs">
          {/* Mobile hamburger + Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                {pageTitle}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Pune Smart Road Network • Ward 14 (Shivajinagar - Deccan)
              </p>
            </div>
          </div>

          {/* Top Bar Actions */}
          <div className="flex items-center gap-3">
            {/* Quick action button */}
            <Link
              to="/citizen/report"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
            >
              <PlusCircle size={14} />
              <span>Report Damage</span>
            </Link>

            {/* Notification bell */}
            <button
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="User profile menu"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {user?.avatarInitials || 'PV'}
                </div>
                <div className="hidden lg:block text-left">
                  <span className="block text-xs font-bold text-slate-800 leading-tight">
                    {user?.name || 'Priya Verma'}
                  </span>
                  <span className="block text-[10px] text-slate-400 leading-none">
                    Citizen Reporter
                  </span>
                </div>
              </button>

              {userDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user?.name || 'Priya Verma'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email || 'citizen@example.com'}</p>
                      <span className="inline-block mt-1.5 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Verified Citizen • Pune
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/citizen/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <User size={14} className="text-slate-400" />
                        <span>My Profile & Ward</span>
                      </Link>
                      <Link
                        to="/citizen/reports"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <ClipboardList size={14} className="text-slate-400" />
                        <span>My Reports List</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Routed child page */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* ─── MOBILE DRAWER (Slide-over navigation) ────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-full bg-[#0a192f] text-white flex flex-col z-10 shadow-2xl">
            {/* Drawer Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <MapPin size={17} />
                </span>
                <span className="font-bold text-base text-white">
                  SmartRoad<span className="text-blue-400"> AI</span>
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Nav links */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {CITIZEN_NAV_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-[10px] bg-emerald-500/25 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-400/30">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </nav>

            {/* Drawer Logout */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-red-400 hover:bg-white/10 rounded-xl"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MOBILE BOTTOM NAVIGATION BAR ─────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 flex items-center justify-around h-16 shadow-lg px-2"
        aria-label="Mobile bottom navigation"
      >
        {CITIZEN_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon size={19} className="mb-0.5" />
              <span>{item.shortLabel || item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
