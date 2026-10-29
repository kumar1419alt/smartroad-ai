/**
 * RegisterPage.jsx — User registration page with role selection.
 *
 * Provides:
 *  - Interactive role selection (Citizen, Engineer, Administrator)
 *  - Clean form with Name, Email, Password, Confirm Password
 *  - Role-specific contextual metadata fields
 *  - Immediate login and role-based redirect upon registration:
 *      Citizen  → /citizen/dashboard
 *      Admin    → /admin/dashboard
 *      Engineer → /engineer/dashboard
 */

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Shield,
  Wrench,
  UserCheck,
  CheckCircle2,
  Building2,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import { USER_ROLES } from '../../constants'

const ROLE_OPTIONS = [
  {
    id: USER_ROLES.CITIZEN,
    title: 'Citizen',
    subtitle: 'Public Road User',
    description: 'Report potholes, upload street photos, track repair progress, and follow community safety updates.',
    icon: UserCheck,
    tag: 'Recommended for Residents',
  },
  {
    id: USER_ROLES.ENGINEER,
    title: 'Engineer / Repair Officer',
    subtitle: 'Field Operations',
    description: 'Access assigned work orders, update repair status, dispatch equipment, and manage road materials.',
    icon: Wrench,
    tag: 'Field Operations',
  },
  {
    id: USER_ROLES.ADMIN,
    title: 'Administrator',
    subtitle: 'Municipal Authority',
    description: 'Oversee citywide road health, calibrate SRPS priority algorithms, and allocate municipal repair budgets.',
    icon: Shield,
    tag: 'Governance',
  },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, getRoleDashboard } = useAuth()

  const [role, setRole] = useState(USER_ROLES.CITIZEN)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [department, setDepartment] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(true)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please provide your full name.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.')
      return
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.')
      return
    }

    setIsSubmitting(true)

    try {
      const { user } = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        department: department.trim() || null,
      })

      // Redirect to designated dashboard
      const targetDashboard = getRoleDashboard(user.role)
      navigate(targetDashboard, { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      {/* Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center px-4 sm:px-0">
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
        <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto">
          Join the smart municipal road monitoring network. Select your primary role to customize your workspace.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                1. Select Account Role
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {ROLE_OPTIONS.map((opt) => {
                  const IconComponent = opt.icon
                  const isSelected = role === opt.id
                  return (
                    <label
                      key={opt.id}
                      className={`relative flex items-start p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="account-role"
                        value={opt.id}
                        checked={isSelected}
                        onChange={() => setRole(opt.id)}
                        className="sr-only"
                      />
                      <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mr-3 mt-0.5 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <IconComponent size={18} aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                            {opt.title}
                          </span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                            isSelected ? 'bg-blue-200/60 text-blue-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {opt.tag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                      <div className="ml-3 shrink-0 self-center">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                2. Account Details
              </label>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="full-name"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} aria-hidden="true" />
                  </div>
                  <input
                    id="full-name"
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (error) setError('')
                    }}
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-900 bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="register-email"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} aria-hidden="true" />
                  </div>
                  <input
                    id="register-email"
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

              {/* Contextual department/zone for engineer or admin */}
              {role !== USER_ROLES.CITIZEN && (
                <div>
                  <label
                    htmlFor="department"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    {role === USER_ROLES.ENGINEER ? 'Assigned Ward or Maintenance Unit' : 'Department / Authority Name'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 size={16} aria-hidden="true" />
                    </div>
                    <input
                      id="department"
                      name="department"
                      type="text"
                      placeholder={role === USER_ROLES.ENGINEER ? 'e.g. Zone-C Rapid Pavement Unit' : 'e.g. Municipal Works Dept.'}
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-900 bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Password and Confirm Password in two columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Password */}
                <div>
                  <label
                    htmlFor="reg-password"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Password (min 6)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={15} aria-hidden="true" />
                    </div>
                    <input
                      id="reg-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (error) setError('')
                      }}
                      className="block w-full pl-9 pr-8 py-2.5 text-sm text-slate-900 bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="reg-confirm-password"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={15} aria-hidden="true" />
                    </div>
                    <input
                      id="reg-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (error) setError('')
                      }}
                      className="block w-full pl-9 pr-8 py-2.5 text-sm text-slate-900 bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-xs text-slate-600 cursor-pointer">
                I agree to the SmartRoad AI Municipal Open Data Policy and road reporting guidelines.
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
              Create Account & Enter Portal
              <ArrowRight size={16} className="ml-1" aria-hidden="true" />
            </Button>
          </form>
        </div>

        {/* Existing user link */}
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Sign in here
          </Link>
        </p>

        {/* Return to landing */}
        <div className="mt-3 text-center">
          <Link
            to="/"
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
