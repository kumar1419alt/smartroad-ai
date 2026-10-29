/**
 * ImageUploader.jsx — Reusable image uploader component for road damage reporting.
 *
 * Features:
 *  - Drag and drop with visual dropzone state
 *  - Click to browse file selection
 *  - Image preview with aspect ratio preservation
 *  - Remove image and Replace image controls
 *  - Accepted formats display (JPG, PNG, WEBP)
 *  - File size validation (Max 10MB)
 *  - Quick 1-click sample image option for instant demonstration
 */

import React, { useState, useRef } from 'react'
import {
  Upload,
  Camera,
  X,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const SAMPLE_IMAGE_URL = '/sample-pothole.jpg'

export default function ImageUploader({
  imagePreview,
  onImageSelected,
  onImageRemoved,
  error,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [internalError, setInternalError] = useState('')
  const fileInputRef = useRef(null)

  const handleFiles = (file) => {
    setInternalError('')

    if (!file) return

    // Type validation
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setInternalError('Unsupported format. Please upload a JPG, PNG, or WEBP image.')
      return
    }

    // Size validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setInternalError('File is too large. Maximum allowed size is 10 MB.')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    onImageSelected({ file, previewUrl, isSample: false })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0])
    }
  }

  const handleSelectSample = () => {
    setInternalError('')
    onImageSelected({
      file: null,
      previewUrl: SAMPLE_IMAGE_URL,
      isSample: true,
    })
  }

  const displayError = error || internalError

  return (
    <div className="space-y-3">
      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="sr-only"
        aria-label="Upload road damage photo"
      />

      {/* Upload Dropzone / Preview */}
      {!imagePreview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-blue-600 bg-blue-50/60 ring-4 ring-blue-500/10 scale-[1.01]'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-white'
          }`}
        >
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
              <Upload size={26} aria-hidden="true" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                Drag and drop your road photo here, or{' '}
                <span className="text-blue-600 hover:underline">browse</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Take a clear photo showing the pothole, crack, or road surface condition
              </p>
            </div>

            {/* Formats and Size Notice */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-400">
              <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">
                JPG, PNG, WEBP
              </span>
              <span>•</span>
              <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">
                Max 10 MB
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Image Preview State */
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group">
          <div className="relative aspect-video max-h-80 w-full overflow-hidden flex items-center justify-center bg-black/40">
            <img
              src={imagePreview}
              alt="Uploaded road damage preview"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Action overlay bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>Image loaded & ready for AI vision analysis</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <RefreshCw size={13} />
                <span>Replace</span>
              </button>

              <button
                type="button"
                onClick={onImageRemoved}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                <X size={14} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo helper button */}
      {!imagePreview && (
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleSelectSample}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <Sparkles size={14} />
            <span>Use Sample Pothole Photo (1-Click Demo)</span>
          </button>
          <span className="text-[11px] text-slate-400">High-resolution civil inspection test image</span>
        </div>
      )}

      {/* Validation Error Banner */}
      {displayError && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700"
        >
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  )
}
