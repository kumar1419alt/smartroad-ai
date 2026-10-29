/**
 * ForgotPasswordPage.jsx — Password recovery request page.
 *
 * Provides:
 *  - Email submission form
 *  - Simulated password reset link delivery
 *  - Success state with instructions and quick return to /login
 */

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Mail,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await forgotPassword(email)
      setSuccessMessage(res.message)
    } catch (err) {
      setError(err.message || 'Failed to process request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4 sm:px-0">
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
          Reset your password
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Enter your registered email address and we will send you a reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200/80 rounded-2xl">
          {successMessage ? (
            /* Success State */
            <div className="text-center py-3 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={26} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Check your inbox</h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {successMessage}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-700">Demo Testing Tip:</p>
                <p>
                  You can sign in immediately using any of the three demo credentials on the login page (Admin, Repair Officer, or Citizen).
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
                >
                  Return to Sign In
                  <ArrowRight size={16} className="ml-1.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : (
            /* Form State */
            <>
              {error && (
                <div
                  role="alert"
                  className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-700"
                >
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} aria-hidden="true" />
                    </div>
                    <input
                      id="reset-email"
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

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  className="w-full justify-center shadow-sm"
                >
                  Send Reset Link
                  <ArrowRight size={16} className="ml-1" aria-hidden="true" />
                </Button>
              </form>
            </>
          )}

          {/* Back to login */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
