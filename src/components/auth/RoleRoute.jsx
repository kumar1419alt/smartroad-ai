/**
 * RoleRoute.jsx — Route wrapper restricting access based on user role.
 *
 * If the user's role is not included in `allowedRoles`, they are redirected
 * to their respective role's default dashboard instead of seeing an error or unauthorized page.
 */

import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function RoleRoute({ allowedRoles = [], children }) {
  const { user, isAuthenticated, isLoading, getRoleDashboard } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" label="Checking permissions…" showLabel centered />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role authorization
  if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
    const fallbackUrl = getRoleDashboard(user?.role)
    return <Navigate to={fallbackUrl} replace />
  }

  return children ? children : <Outlet />
}
