/**
 * AppLayout — root layout wrapper.
 * Renders Sidebar + Topbar + main <Outlet>.
 */

import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="app-shell flex h-[100dvh] overflow-hidden bg-slate-50">
      {mobileMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm md:hidden"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 bg-[radial-gradient(circle_at_top_right,_rgb(219_234_254_/_0.42),_transparent_30rem)]">
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto overscroll-contain"
          aria-label="Main content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
