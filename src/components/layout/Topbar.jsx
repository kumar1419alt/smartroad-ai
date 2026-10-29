/**
 * Topbar — horizontal header bar with breadcrumb, search, and user menu.
 */

import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, User, ChevronRight, LogOut, Shield, Wrench, UserCheck } from 'lucide-react'
import { cx } from '../../utils/helpers'
import { APP_NAME, ROLE_LABELS } from '../../constants'
import { useAuth } from '../../contexts/AuthContext'

const ROUTE_LABELS = {
  '/app/dashboard': 'Dashboard',
  '/app/map': 'Incident Map',
  '/app/incidents': 'Incidents',
  '/app/repairs': 'Repair Queue',
  '/app/work-orders': 'Work Orders',
  '/app/reports': 'Reports',
  '/app/analytics': 'Analytics',
  '/app/settings': 'Settings',
  '/admin/dashboard': 'Municipal Administration',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const currentPage = ROUTE_LABELS[pathname] ?? 'Page'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleLabel = user?.role ? (ROLE_LABELS[user.role] || user.role) : 'User'

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-5 gap-4 shrink-0 z-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mr-auto">
        <span className="text-slate-400 hidden sm:block">{APP_NAME}</span>
        <ChevronRight size={13} className="text-slate-300 hidden sm:block" aria-hidden="true" />
        <span className="font-medium text-slate-700">{currentPage}</span>
      </nav>

      {/* Search */}
      <div className="relative hidden md:block">
        <label htmlFor="global-search" className="sr-only">Search incidents</label>
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          id="global-search"
          type="search"
          placeholder="Search incidents…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cx(
            'h-8 pl-9 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-lg w-56',
            'placeholder:text-slate-400 text-slate-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400',
            'transition-colors duration-150',
          )}
        />
      </div>

      {/* Notification bell */}
      <button
        aria-label="Notifications (3 unread)"
        className={cx(
          'relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100',
          'transition-colors duration-150',
        )}
      >
        <Bell size={17} aria-hidden="true" />
        <span
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"
          aria-hidden="true"
        />
      </button>

      {/* User avatar and dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          aria-label="Open user menu"
          className={cx(
            'flex items-center gap-2 px-2 py-1.5 rounded-lg border border-transparent',
            'hover:bg-slate-100 hover:border-slate-200 transition-colors duration-150',
          )}
        >
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#1e3a5f] text-white text-xs font-semibold">
            {user?.avatarInitials || 'US'}
          </span>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-semibold text-slate-800 leading-tight">
              {user?.name || 'Administrator'}
            </span>
            <span className="block text-[10px] text-slate-400 leading-none">
              {roleLabel}
            </span>
          </div>
        </button>

        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-900">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              <span className="inline-block mt-1 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {roleLabel}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
