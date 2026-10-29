/**
 * Sidebar — persistent left navigation for the platform.
 * Collapses to icon-only mode on smaller screens.
 */

import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  MapPin,
  ClipboardList,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Wrench,
  FileBarChart2,
} from 'lucide-react'
import { cx } from '../../utils/helpers'
import { APP_NAME } from '../../constants'

const NAV_ITEMS = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard, end: true },
      { label: 'Incident Map', to: '/app/map', icon: MapPin },
    ],
  },
  {
    group: 'Management',
    items: [
      { label: 'Incidents', to: '/app/incidents', icon: AlertTriangle },
      { label: 'Repair Queue', to: '/app/repairs', icon: Wrench },
      { label: 'Work Orders', to: '/app/work-orders', icon: ClipboardList },
    ],
  },
  {
    group: 'Analytics',
    items: [
      { label: 'Reports', to: '/app/reports', icon: FileBarChart2 },
      { label: 'Analytics', to: '/app/analytics', icon: BarChart3 },
    ],
  },
  {
    group: 'System',
    items: [
      { label: 'Settings', to: '/app/settings', icon: Settings },
    ],
  },
]

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={cx(
        'flex flex-col h-screen bg-[#0f2444] text-white transition-all duration-300 ease-in-out shrink-0',
        collapsed ? 'w-16' : 'w-60',
      )}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-white/10 shrink-0">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500 shrink-0">
          <MapPin size={14} className="text-white" aria-hidden="true" />
        </span>
        {!collapsed && (
          <span className="ml-2.5 font-semibold text-sm tracking-wide truncate">
            {APP_NAME}
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5" aria-label="Platform sections">
        {NAV_ITEMS.map((section) => (
          <div key={section.group}>
            {!collapsed && (
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/35 select-none">
                {section.group}
              </p>
            )}
            <ul className="space-y-0.5" role="list">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    aria-label={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cx(
                        'flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors duration-150',
                        isActive
                          ? 'bg-white/15 text-white font-medium'
                          : 'text-white/60 hover:bg-white/10 hover:text-white',
                        collapsed && 'justify-center',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          size={17}
                          className={cx('shrink-0', isActive ? 'text-blue-300' : '')}
                          aria-hidden="true"
                        />
                        {!collapsed && <span>{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User profile & Collapse toggle */}
      <div className="shrink-0 border-t border-white/10 p-2 space-y-1">
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cx(
            'w-full flex items-center px-2 py-1.5 rounded-lg text-white/50',
            'hover:text-white hover:bg-white/10 transition-colors duration-150',
            collapsed ? 'justify-center' : 'justify-end',
          )}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          {!collapsed && (
            <span className="ml-1.5 text-xs">Collapse</span>
          )}
        </button>
      </div>
    </aside>
  )
}
