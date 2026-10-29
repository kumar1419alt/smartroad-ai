/**
 * LoginPage.jsx — Authentication sign-in page.
 *
 * Provides:
 *  - Email & password sign-in
 *  - Password visibility toggle
 *  - One-click demo account selector (Citizen, Engineer, Admin)
 *  - Automatic role-based redirect post-login:
 *      Citizen  → /citizen/dashboard
 *      Admin    → /admin/dashboard
 *      Engineer → /engineer/dashboard
 *  - Error feedback and loading states
 */

import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  MapPin,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Shield,
  Wrench,
  UserCheck,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import { USER_ROLES } from '../../constants'

const DEMO_PRESETS = [
  {
    role: USER_ROLES.ADMIN,
    label: 'Administrator',
    email: 'admin@smartroad.gov',
    password: 'admin123',
    icon: Shield,
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    desc: 'Municipal Oversight & SRPS Control',
  },
  {
    role: USER_ROLES.ENGINEER,
    label: 'Repair Officer',
    email: 'engineer@smartroad.gov',
    password: 'eng123',
    icon: Wrench,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    desc: 'Work Orders & Field Queue',
  },
  {
    role: USER_ROLES.CITIZEN,
    label: 'Citizen',
    email: 'citizen@example.com',
    password: 'citizen123',
    icon: UserCheck,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    desc: 'Damage Reporting & Status Tracking',
  },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, getRoleDashboard } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Quick fill helper for demo accounts
  const applyPreset = (preset) => {
    setEmail(preset.email)
    setPassword(preset.password)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    setIsSubmitting(true)

    try {
      const { user } = await login(email, password)

      // Determine redirect destination:
      // If user came from a role-authorized route, redirect back; otherwise use role dashboard
      let destination = getRoleDashboard(user.role)
      const intended = location.state?.from?.pathname
      if (intended) {
        if (user.role === USER_ROLES.ADMIN) {
          destination = intended
        } else if (user.role === USER_ROLES.ENGINEER && (intended.startsWith('/engineer') || intended.startsWith('/app'))) {
          destination = intended
        } else if (user.role === USER_ROLES.CITIZEN && intended.startsWith('/citizen')) {
          destination = intended
        }
      }

      navigate(destination, { replace: true })
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Please verify your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 group transition-transform duration-150 hover:scale-[1.02]"
          aria-label="SmartRoad AI Home"
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
            <MapPin size={20} aria-hidden="true" />
          </span>
          <span className="font-bold text-2xl text-slate-900 tracking-tight">
            SmartRoad<span className="text-blue-600"> AI</span>
          </span>
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          AI & GIS-Based Smart Road Damage Management System
        </p>
      </div>

      {/* Main card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200/80 rounded-2xl">
          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-700"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email input */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-900 bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError('')
                  }}
                  className="block w-full pl-10 pr-10 py-2.5 text-sm text-slate-900 bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 cursor-pointer">
                Keep me signed in on this device
              </label>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="w-full justify-center shadow-sm"
            >
              Sign In to Platform
              <ArrowRight size={16} className="ml-1" aria-hidden="true" />
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-7 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
              Quick Demo Fill (Mock Accounts)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_PRESETS.map((preset) => {
                const IconComponent = preset.icon
                const isActive = email === preset.email
                return (
                  <button
                    key={preset.role}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50/50 text-blue-700 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <IconComponent size={16} className="mb-1 text-slate-600" aria-hidden="true" />
                    <span className="text-xs font-medium leading-tight">{preset.label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 capitalize">{preset.role}</span>
                  </button>
                )
              })}
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-2">
              Select any role to autofill credentials and test role-based redirection.
            </p>
          </div>
        </div>

        {/* Footer link to register */}
        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account yet?{' '}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Create an account
          </Link>
        </p>

        {/* Return to landing page */}
        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors inline-flex items-center gap-1"
          >
            ← Return to SmartRoad AI Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
