/**
 * AdminMapPage.jsx — Route: /admin/map
 *
 * Full-screen GIS Road Damage Command Map for Administrators.
 * Features:
 *  - Full-screen spatial map with all road damage reports
 *  - Severity-coded markers & pulsing rings on critical issues
 *  - SRPS influence heatmap overlay
 *  - 6 Multi-filters: Damage type, Severity, Priority tier, Status, Date range, Ward
 *  - Real-time search
 *  - Selected issue side panel (<AdminMapSidePanel>)
 *  - Functional Actions: Assign Engineer, Change Status, View Complaint
 */

import React, { useState, useEffect } from 'react'
import AdminGisMap from '../../components/admin/map/AdminGisMap'
import { getSavedComplaints } from '../../services/complaintService'

export default function AdminMapPage() {
  const [complaints, setComplaints] = useState([])

  useEffect(() => {
    setComplaints(getSavedComplaints())
  }, [])

  const handleUpdateComplaint = (id, updatedFields) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    )
  }

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-100">
      <AdminGisMap
        complaints={complaints}
        onUpdateComplaint={handleUpdateComplaint}
      />
    </div>
  )
}
