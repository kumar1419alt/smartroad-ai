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

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Topbar />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
          aria-label="Main content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
