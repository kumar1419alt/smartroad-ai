/**
 * ReportForm.jsx — Master form component for Road Damage Reporting.
 *
 * Implements:
 *  - Section 1: Upload Road Image (ImageUploader)
 *  - Section 2: Location (LocationPicker)
 *  - Section 3: Description (Textarea)
 *  - Section 4: Damage preview (DamageAnalysisCard with bounding boxes)
 *  - Section 5: Priority preview (PriorityScoreCard with 5 SRPS factors)
 *  - Section 6: Submit Report (Complaint registration & success confirmation)
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  MapPin,
  FileText,
  Brain,
  BarChart3,
  CheckCircle2,
  Send,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Eye,
} from 'lucide-react'

import ImageUploader from './ImageUploader'
import LocationPicker from './LocationPicker'
import DamageAnalysisCard from './DamageAnalysisCard'
import PriorityScoreCard from './PriorityScoreCard'
import Button from '../../ui/Button'
import complaintService from '../../../services/complaintService'
import { useToast } from '../../../contexts/ToastContext'

export default function ReportForm({ onReportSubmitted }) {
  const navigate = useNavigate()
  const toast = useToast()

  // Form state
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('/sample-pothole.jpg')
  const [isSample, setIsSample] = useState(true)

  const [latitude, setLatitude] = useState(18.5186)
  const [longitude, setLongitude] = useState(73.8415)
  const [locationName, setLocationName] = useState('FC Road, near Goodluck Chowk, Deccan Gymkhana')
  const [ward, setWard] = useState('Ward 14 (Shivajinagar - Deccan)')

  const [description, setDescription] = useState(
    'Deep road crater on southbound carriage near Goodluck Chowk. High risk of 2-wheeler skidding in evening traffic.',
  )

  // AI & SRPS calculation state
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [srpsResult, setSrpsResult] = useState(null)

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState(null) // holds new complaint
  const [formError, setFormError] = useState('')

  // Trigger AI prediction whenever an image is selected
  useEffect(() => {
    if (imagePreview) {
      runPrediction(imageFile || imagePreview)
    }
  }, [imagePreview])

  const runPrediction = async (fileOrUrl) => {
    setIsAnalyzing(true)
    try {
      const pred = await complaintService.predictDamage(fileOrUrl)
      setAnalysisResult(pred)

      // Calculate SRPS score based on predicted severity
      const srps = complaintService.calculateSRPS({
        severity: pred.severity,
        trafficImportance: 92,
        locationCriticality: 88,
        roadImportance: 85,
        reportFrequency: 75,
      })
      setSrpsResult(srps)
    } catch (err) {
      console.error('Prediction failed', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleImageSelected = ({ file, previewUrl, isSample: isSampleImg }) => {
    setImageFile(file)
    setImagePreview(previewUrl)
    setIsSample(isSampleImg)
    setFormError('')
  }

  const handleImageRemoved = () => {
    setImageFile(null)
    setImagePreview(null)
    setAnalysisResult(null)
    setSrpsResult(null)
  }

  const handleLocationChange = (loc) => {
    setLatitude(loc.latitude)
    setLongitude(loc.longitude)
    if (loc.locationName) setLocationName(loc.locationName)
    if (loc.ward) setWard(loc.ward)
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!imagePreview) {
      setFormError('Please upload or select a road damage photo before submitting.')
      return
    }

    if (!description.trim()) {
      setFormError('Please enter a brief description of the road damage.')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        damageType: analysisResult?.damageType || 'Pothole',
        severity: analysisResult?.severity || 'critical',
        priorityScore: srpsResult?.totalScore || 92,
        location: locationName,
        ward: ward,
        coordinates: [latitude, longitude],
        description: description.trim(),
        imageUrl: imagePreview,
        aiConfidence: `${Math.round((analysisResult?.confidence || 0.96) * 1000) / 10}%`,
        srpsBreakdown: srpsResult,
      }

      const res = await complaintService.submitComplaint(payload)

      setSubmissionSuccess(res.complaint)
      toast.success(`Complaint ${res.complaint.id} registered with PMC!`)
      if (onReportSubmitted) {
        onReportSubmitted(res.complaint)
      }
    } catch (err) {
      setFormError(err.message || 'Failed to submit complaint. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success view post-submission
  if (submissionSuccess) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs max-w-2xl mx-auto text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 size={36} aria-hidden="true" />
        </div>

        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Registered with Pune Municipal Corporation
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">
            Complaint Logged Successfully!
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Your road defect report has been assigned a grievance tracking ID and routed to the PMC Ward 14 rapid repair squad.
          </p>
        </div>

        {/* Complaint Summary Card */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 block">Complaint Tracking ID</span>
              <span className="font-mono text-base font-bold text-blue-600">
                {submissionSuccess.id}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Assigned SRPS Urgency</span>
              <span className="text-sm font-bold text-red-600">
                {submissionSuccess.priority}/100 (Critical)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Road Defect</span>
              <span className="font-semibold text-slate-800">{submissionSuccess.damageType}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">AI Confidence</span>
              <span className="font-semibold text-emerald-700">{submissionSuccess.aiConfidence}</span>
            </div>
          </div>

          <div className="text-xs">
            <span className="text-[10px] text-slate-400 block">Location</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <MapPin size={13} className="text-slate-400 shrink-0" />
              {submissionSuccess.location}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/citizen/dashboard')}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Return to Dashboard
          </button>
          <button
            onClick={() => navigate('/citizen/reports')}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors"
          >
            View in My Reports
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Form Error Banner */}
      {formError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-xs text-red-700"
        >
          <AlertCircle size={18} className="shrink-0 text-red-500" />
          <span>{formError}</span>
        </div>
      )}

      {/* ─── SECTION 1: UPLOAD ROAD IMAGE ─────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Upload Road Image
            </h2>
            <p className="text-xs text-slate-500">
              Provide a clear visual of the pothole or road surface defect
            </p>
          </div>
        </div>

        <ImageUploader
          imagePreview={imagePreview}
          onImageSelected={handleImageSelected}
          onImageRemoved={handleImageRemoved}
        />
      </section>

      {/* ─── SECTION 2: LOCATION ──────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Location & GIS Coordinates
            </h2>
            <p className="text-xs text-slate-500">
              Pinpoint the exact street location using GPS or the interactive map
            </p>
          </div>
        </div>

        <LocationPicker
          latitude={latitude}
          longitude={longitude}
          locationName={locationName}
          onLocationChange={handleLocationChange}
        />

        {/* Text location name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Street Address / Nearby Landmark
          </label>
          <input
            type="text"
            required
            placeholder="e.g. FC Road, near Goodluck Chowk, Deccan Gymkhana"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>
      </section>

      {/* ─── SECTION 3: DESCRIPTION ───────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Hazard Description
            </h2>
            <p className="text-xs text-slate-500">
              Provide context for the municipal inspection and road maintenance team
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="road-description" className="sr-only">
            Describe the road damage...
          </label>
          <textarea
            id="road-description"
            rows={3}
            required
            placeholder="Describe the road damage... (e.g. depth, width, waterlogging risk, traffic blockage)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs p-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>
      </section>

      {/* ─── SECTION 4 & 5: AI DAMAGE PREVIEW & SRPS PRIORITY ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 4: Damage preview */}
        <div>
          <DamageAnalysisCard
            analysis={analysisResult}
            imagePreview={imagePreview}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {/* Section 5: Priority preview */}
        <div>
          <PriorityScoreCard srpsData={srpsResult} />
        </div>
      </div>

      {/* ─── SECTION 6: SUBMIT REPORT ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Ready to lodge this road hazard?
          </h3>
          <p className="text-xs text-slate-500">
            All reports are assigned an immediate grievance token and tracked live.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => navigate('/citizen/dashboard')}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="w-full sm:w-auto shadow-sm"
          >
            <Send size={15} className="mr-1.5" />
            Submit Complaint
          </Button>
        </div>
      </div>
    </form>
  )
}
