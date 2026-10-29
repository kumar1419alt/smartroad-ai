/**
 * NotFoundPage — 404 page for unmatched routes.
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPinOff, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-5">
        <MapPinOff size={28} className="text-slate-400" aria-hidden="true" />
      </span>
      <h1 className="text-3xl font-bold text-slate-800 mb-2">404</h1>
      <p className="text-base font-medium text-slate-600 mb-1">Page not found</p>
      <p className="text-sm text-slate-400 max-w-sm mb-8">
        The route you are looking for does not exist in this platform.
      </p>
      <Button icon={ArrowLeft} onClick={() => navigate('/')}>
        Return to Dashboard
      </Button>
    </div>
  )
}
