/**
 * App.jsx — Root component with React Router configuration and AuthProvider.
 *
 * Route structure:
 *   /                     → LandingPage  (public)
 *   /login                → LoginPage (public)
 *   /register             → RegisterPage (public)
 *   /forgot-password      → ForgotPasswordPage (public)
 *
 *   Role-Based Protected Portals:
 *   /citizen/dashboard    → CitizenDashboard (Citizen role)
 *   /engineer/dashboard   → EngineerDashboard (Engineer/Admin role)
 *   /admin/dashboard      → Redirects to /app/dashboard
 *
 *   Platform app (Admin & Engineer):
 *   /app                  → AppLayout (Protected)
 *     /app/dashboard      → Dashboard
 *     /app/map            → Incident Map
 *     /app/incidents      → Incidents list
 *     /app/repairs        → Repair queue
 *     /app/work-orders    → Work orders
 *     /app/reports        → Reports
 *     /app/analytics      → Analytics
 *     /app/settings       → Settings
 *   *                     → 404
 */

import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import RoleRoute from './components/auth/RoleRoute'
import AppLayout from './components/layout/AppLayout'
import LoadingSpinner from './components/ui/LoadingSpinner'
import { USER_ROLES } from './constants'

// Lazy-load page components for code splitting
const LandingPage        = lazy(() => import('./pages/LandingPage'))
const LoginPage          = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage       = lazy(() => import('./pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))

const CitizenLayout      = lazy(() => import('./components/layout/CitizenLayout'))
const CitizenDashboard   = lazy(() => import('./pages/citizen/CitizenDashboard'))
const CitizenDashcamPage = lazy(() => import('./pages/citizen/CitizenDashcamPage'))
const CitizenReportDamagePage = lazy(() => import('./pages/citizen/CitizenReportDamagePage'))
const CitizenReportsPage = lazy(() => import('./pages/citizen/CitizenReportsPage'))
const CitizenComplaintDetailPage = lazy(() => import('./pages/citizen/CitizenComplaintDetailPage'))
const CitizenMapPage     = lazy(() => import('./pages/citizen/CitizenMapPage'))
const CitizenProfilePage = lazy(() => import('./pages/citizen/CitizenProfilePage'))
const EngineerLayout             = lazy(() => import('./components/layout/EngineerLayout'))
const EngineerDashboard          = lazy(() => import('./pages/engineer/EngineerDashboard'))
const EngineerIssuesPage         = lazy(() => import('./pages/engineer/EngineerIssuesPage'))
const EngineerIssuePage          = lazy(() => import('./pages/engineer/EngineerIssuePage'))
const EngineerMapPage            = lazy(() => import('./pages/engineer/EngineerMapPage'))
const EngineerCompletedRepairsPage = lazy(() => import('./pages/engineer/EngineerCompletedRepairsPage'))
const EngineerProfilePage        = lazy(() => import('./pages/engineer/EngineerProfilePage'))

const AdminLayout            = lazy(() => import('./components/layout/AdminLayout'))
const AdminDashboard         = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminComplaintsPage    = lazy(() => import('./pages/admin/AdminComplaintsPage'))
const AdminPriorityPage      = lazy(() => import('./pages/admin/AdminPriorityPage'))
const AdminPriorityQueuePage = lazy(() => import('./pages/admin/AdminPriorityPage'))
const AdminMapPage           = lazy(() => import('./pages/admin/AdminMapPage'))
const AdminAnalyticsPage     = lazy(() => import('./pages/admin/AdminAnalyticsPage'))
const AdminRepairsPage       = lazy(() => import('./pages/admin/AdminRepairsPage'))
const AdminEngineersPage     = lazy(() => import('./pages/admin/AdminEngineersPage'))
const AdminSettingsPage      = lazy(() => import('./pages/admin/AdminSettingsPage'))

const DashboardPage      = lazy(() => import('./pages/DashboardPage'))
const MapPage            = lazy(() => import('./pages/MapPage'))
const IncidentsPage      = lazy(() => import('./pages/IncidentsPage'))
const RepairQueuePage    = lazy(() => import('./pages/RepairQueuePage'))
const WorkOrdersPage     = lazy(() => import('./pages/WorkOrdersPage'))
const ReportsPage        = lazy(() => import('./pages/ReportsPage'))
const AnalyticsPage      = lazy(() => import('./pages/AnalyticsPage'))
const SettingsPage       = lazy(() => import('./pages/SettingsPage'))
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage'))

/** Full-screen suspense fallback */
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <LoadingSpinner size="lg" label="Loading…" showLabel centered />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public landing page */}
            <Route index element={<LandingPage />} />

            {/* Public authentication pages */}
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />

            {/* Citizen Protected Portal */}
            <Route
              path="citizen"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={[USER_ROLES.CITIZEN, USER_ROLES.ADMIN]}>
                    <CitizenLayout />
                  </RoleRoute>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<CitizenDashboard />} />
              <Route path="dashcam" element={<CitizenDashcamPage />} />
              <Route path="report" element={<CitizenReportDamagePage />} />
              <Route path="reports" element={<CitizenReportsPage />} />
              <Route path="reports/:id" element={<CitizenComplaintDetailPage />} />
              <Route path="map" element={<CitizenMapPage />} />
              <Route path="profile" element={<CitizenProfilePage />} />
            </Route>

            {/* Engineer Protected Portal */}
            <Route
              path="engineer"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={[USER_ROLES.ENGINEER, USER_ROLES.ADMIN]}>
                    <EngineerLayout />
                  </RoleRoute>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<EngineerDashboard />} />
              <Route path="issues" element={<EngineerIssuesPage />} />
              <Route path="issues/:id" element={<EngineerIssuePage />} />
              <Route path="map" element={<EngineerMapPage />} />
              <Route path="completed" element={<EngineerCompletedRepairsPage />} />
              <Route path="profile" element={<EngineerProfilePage />} />
            </Route>

            {/* Administrator Protected Portal */}
            <Route
              path="admin"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={[USER_ROLES.ADMIN]}>
                    <AdminLayout />
                  </RoleRoute>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="complaints" element={<AdminComplaintsPage />} />
              <Route path="priority" element={<AdminPriorityPage />} />
              <Route path="priority-queue" element={<AdminPriorityPage />} />
              <Route path="map" element={<AdminMapPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="repairs" element={<AdminRepairsPage />} />
              <Route path="engineers" element={<AdminEngineersPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Platform app — wrapped in ProtectedRoute + RoleRoute + AppLayout */}
            <Route
              path="app"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.ENGINEER]}>
                    <AppLayout />
                  </RoleRoute>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="map" element={<MapPage />} />
              <Route path="incidents" element={<IncidentsPage />} />
              <Route path="incidents/:id" element={<IncidentsPage />} />
              <Route path="repairs" element={<RepairQueuePage />} />
              <Route path="work-orders" element={<WorkOrdersPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* 404 */}
            <Route path="404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
