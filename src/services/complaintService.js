/**
 * complaintService.js — Isolated service for Road Damage Reporting and AI Prediction.
 *
 * Inference is delegated to the real FastAPI backend:
 *  - POST /api/v1/detection/infer  (YOLOv8m-RDD2022 inference with bounding boxes)
 *  - POST /api/v1/complaints        (Register complaint with GIS location and SRPS score)
 *  - GET  /api/v1/complaints        (Fetch citizen complaints)
 *
 * Physical dimensions (depth, width, area) CANNOT be reliably measured from a
 * single uncalibrated 2-D image.  They are NOT returned by the backend and are
 * NOT fabricated here.  The UI displays "Not measured" for those fields.
 *
 * SRPS uses only values that are actually available at report time:
 *  - Damage severity  ← from YOLO inference response
 *  - Traffic / Location / Road importance ← derived from location text heuristic
 *    (clearly documented as heuristic, not real sensor data)
 *  - Citizen reports  ← defaults to 1 (this is the first report)
 */

import apiClient from './apiClient'
import { mockPuneComplaints } from '../data/mockData'

const LOCAL_COMPLAINTS_KEY = 'rds_citizen_complaints'

/** Helper to simulate lightweight network latency on local fallbacks */
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

/** Retrieve all complaints (built-in demo + citizen submissions) */
export function getSavedComplaints() {
  try {
    const raw = localStorage.getItem(LOCAL_COMPLAINTS_KEY)
    const local = raw ? JSON.parse(raw) : []
    return [...local, ...mockPuneComplaints]
  } catch (err) {
    console.error('Failed to parse complaints from storage', err)
    return mockPuneComplaints
  }
}

/** Save a newly submitted complaint */
export function saveComplaintLocally(complaint) {
  try {
    const raw = localStorage.getItem(LOCAL_COMPLAINTS_KEY)
    const list = raw ? JSON.parse(raw) : []
    list.unshift(complaint)
    localStorage.setItem(LOCAL_COMPLAINTS_KEY, JSON.stringify(list))
  } catch (err) {
    console.error('Failed to store complaint locally', err)
  }
}

/**
 * Convert any image source to a base64 data URL string suitable for the API.
 * Handles:
 *   - File objects (from drag-drop / browse)
 *   - Blob URLs (object:// — created by URL.createObjectURL)
 *   - Absolute static paths (e.g. /sample-pothole.jpg)
 *
 * @param {File|string} source
 * @returns {Promise<string>} data URL, e.g. "data:image/jpeg;base64,..."
 */
export async function imageToBase64(source) {
  // Already a data URL
  if (typeof source === 'string' && source.startsWith('data:')) {
    return source
  }

  // File object
  if (source instanceof File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(source)
    })
  }

  // Blob URL or static path — fetch and convert
  if (typeof source === 'string') {
    const resp = await fetch(source)
    if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.status}`)
    const blob = await resp.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  throw new Error('Unsupported image source type')
}

/**
 * Map a YOLO damage_code to a human-readable damage type label.
 */
function damageCodeToLabel(code) {
  const map = {
    D00: 'Longitudinal Crack',
    D10: 'Transverse Crack',
    D20: 'Alligator Crack',
    D40: 'Pothole',
  }
  return map[code] || code || 'Road Damage'
}

export const complaintService = {
  /**
   * Run AI Vision Inference via the real YOLOv8m backend.
   *
   * POST /api/v1/detection/infer
   *
   * Accepts a File object, a blob URL, or a static path.
   * Returns a normalized result object for the UI.
   *
   * @param {File|string} imageFileOrUrl
   * @param {object} [options]
   * @param {number} [options.confidenceThreshold=0.70]
   * @param {{ latitude: number, longitude: number }|null} [options.gps=null]
   * @returns {Promise<{
   *   damageType: string,
   *   damageCode: string|null,
   *   confidence: number,
   *   severity: 'critical'|'high'|'medium'|'low',
   *   model: string,
   *   inferenceTimeMs: number,
   *   status: string,
   *   boundingBoxes: Array<{ id: string, label: string, confidence: number, box: { x,y,w,h } }>,
   *   detectionCount: number,
   *   isBackendResult: boolean,
   *   backendUnavailable: boolean,
   * }>}
   */
  async predictDamage(imageFileOrUrl, options = {}) {
    const { confidenceThreshold = 0.70, gps = null } = options

    // Convert image to base64 (required by API)
    let imageB64
    try {
      imageB64 = await imageToBase64(imageFileOrUrl)
    } catch (convErr) {
      console.error('[complaintService] Image conversion failed:', convErr)
      return this._backendUnavailableResult()
    }

    // Build request payload matching the DetectionRequest schema
    const payload = {
      session_id: `report-${Date.now()}`,
      timestamp: new Date().toISOString(),
      image: imageB64,
      gps: gps ? { latitude: gps.latitude, longitude: gps.longitude } : null,
      confidence_threshold: confidenceThreshold,
    }

    try {
      const response = await apiClient.post('/detection/infer', payload, { timeout: 30000 })
      const data = response.data

      if (!data || data.status === 'model_not_configured') {
        // Backend is up but model weights are not loaded
        return this._modelNotConfiguredResult(data)
      }

      if (data.status === 'invalid_image') {
        return this._invalidImageResult(data)
      }

      // Parse the real detections
      const detections = Array.isArray(data.detections) ? data.detections : []

      // Pick the primary (highest-confidence) detection
      const primary = detections.length > 0 ? detections[0] : null

      // Build bounding boxes in the format expected by DamageAnalysisCard
      const boundingBoxes = detections.map((det, i) => ({
        id: `yolo-box-${i}`,
        label: `${det.class_name} (${det.damage_code})`,
        confidence: det.confidence,
        damageCode: det.damage_code,
        box: det.box, // already { x, y, w, h } in percentages
      }))

      return {
        damageType: primary ? damageCodeToLabel(primary.damage_code) : 'No Damage Detected',
        damageCode: primary ? primary.damage_code : null,
        confidence: primary ? primary.confidence : 0,
        severity: primary ? primary.severity : 'low',
        model: data.model || 'YOLOv8m-RDD2022',
        inferenceTimeMs: data.inference_time_ms || 0,
        status: data.status || 'success',
        boundingBoxes,
        detectionCount: detections.length,
        isBackendResult: true,
        backendUnavailable: false,
        // Physical dimensions cannot be measured from a single uncalibrated image
        dimensions: null,
      }
    } catch (err) {
      console.error('[complaintService] Backend inference failed:', err)
      return this._backendUnavailableResult()
    }
  },

  /** Result when the backend is unreachable */
  _backendUnavailableResult() {
    return {
      damageType: 'Unknown (Backend Offline)',
      damageCode: null,
      confidence: 0,
      severity: 'medium',
      model: 'Backend Unavailable',
      inferenceTimeMs: 0,
      status: 'backend_unavailable',
      boundingBoxes: [],
      detectionCount: 0,
      isBackendResult: false,
      backendUnavailable: true,
      dimensions: null,
    }
  },

  /** Result when model weights are not configured */
  _modelNotConfiguredResult(data) {
    return {
      damageType: 'Model Not Configured',
      damageCode: null,
      confidence: 0,
      severity: 'medium',
      model: data?.model || 'YOLOv8-RDD2022 (Unconfigured)',
      inferenceTimeMs: data?.inference_time_ms || 0,
      status: 'model_not_configured',
      boundingBoxes: [],
      detectionCount: 0,
      isBackendResult: true,
      backendUnavailable: false,
      dimensions: null,
    }
  },

  /** Result when image is invalid or unreadable */
  _invalidImageResult(data) {
    return {
      damageType: 'Invalid Image',
      damageCode: null,
      confidence: 0,
      severity: 'low',
      model: data?.model || 'YOLOv8m-RDD2022',
      inferenceTimeMs: data?.inference_time_ms || 0,
      status: 'invalid_image',
      boundingBoxes: [],
      detectionCount: 0,
      isBackendResult: true,
      backendUnavailable: false,
      dimensions: null,
    }
  },

  /**
   * Calculate Smart Road Priority Score (SRPS: 0 – 100).
   *
   * Uses only values that are actually available at report time.
   * Heuristic-derived values are clearly documented as such.
   *
   * Weights:
   *   Damage Severity (S)      35% — from YOLO inference
   *   Traffic Importance (T)   25% — location-text heuristic (documented)
   *   Location Criticality (L) 20% — location-text heuristic (documented)
   *   Road Importance (R)      15% — location-text heuristic (documented)
   *   Citizen Reports (C)       5% — 1 report = this submission; scaled to [30,98]
   *
   * @param {{ severity, locationText, upvotes }} factors
   * @returns {{ totalScore, priorityLevel, components }}
   */
  calculateSRPS({ severity = 'medium', locationText = '', upvotes = 1 } = {}) {
    const loc = (locationText || '').toLowerCase()
    const sev = (severity || 'medium').toLowerCase()

    // ── S: Damage Severity (from real YOLO inference) ──────────────────
    const sevScores = { critical: 96, high: 82, medium: 60, low: 42 }
    const S = sevScores[sev] ?? 60

    // ── T: Traffic Importance (location-text heuristic) ────────────────
    // Source: Named road pattern matching. Documented as heuristic estimate,
    // NOT real sensor data. Neutral default = 52 (unknown road).
    let T = 52
    if (/fc road|hinjewadi|highway|wakad|nh-/i.test(loc)) T = 94
    else if (/senapati bapat|karve|swargate/i.test(loc)) T = 88
    else if (/baner|nagar road|katraj/i.test(loc)) T = 82
    else if (/paud road|viman nagar|kondhwa/i.test(loc)) T = 74

    // ── L: Location Criticality (location-text heuristic) ─────────────
    let L = 50
    if (/hospital|goodluck|icc|nal stop/i.test(loc)) L = 92
    else if (/shivaji chowk|flyover|underpass/i.test(loc)) L = 86
    else if (/school|station|market/i.test(loc)) L = 78
    else if (/balewadi|kharadi|magarpatta/i.test(loc)) L = 72

    // ── R: Road Importance (location-text heuristic) ───────────────────
    let R = 48
    if (/highway|fc road|nh-|expressway/i.test(loc)) R = 95
    else if (/senapati bapat|baner road|nagar road|karve road/i.test(loc)) R = 86
    else if (/hinjewadi phase|paud road|swargate/i.test(loc)) R = 80
    else if (/central avenue|station road|aundh/i.test(loc)) R = 68

    // ── C: Citizen Reports ─────────────────────────────────────────────
    // 1 upvote = first submission. Capped at 98.
    const C = Math.min(98, Math.max(30, Math.round(upvotes * 1.6 + 25)))

    const weights = { S: 0.35, T: 0.25, L: 0.20, R: 0.15, C: 0.05 }
    const totalScore = Math.min(
      100,
      Math.round(S * weights.S + T * weights.T + L * weights.L + R * weights.R + C * weights.C),
    )

    let priorityLevel = 'Low'
    if (totalScore >= 85) priorityLevel = 'Critical'
    else if (totalScore >= 70) priorityLevel = 'High'
    else if (totalScore >= 50) priorityLevel = 'Medium'

    const components = [
      {
        name: 'Damage Severity',
        weight: 35,
        score: S,
        weightedScore: Math.round(S * weights.S),
        description: 'From YOLOv8m inference result (class confidence + severity label)',
        source: 'YOLO Backend Inference',
      },
      {
        name: 'Traffic Importance',
        weight: 25,
        score: T,
        weightedScore: Math.round(T * weights.T),
        description: 'Location-text heuristic estimate. Real sensor data unavailable.',
        source: 'Location Name Pattern (Heuristic)',
      },
      {
        name: 'Location Criticality',
        weight: 20,
        score: L,
        weightedScore: Math.round(L * weights.L),
        description: 'Proximity to hospitals, schools, transit hubs (heuristic).',
        source: 'Location Name Pattern (Heuristic)',
      },
      {
        name: 'Road Importance',
        weight: 15,
        score: R,
        weightedScore: Math.round(R * weights.R),
        description: 'Road hierarchy classification (heuristic from address text).',
        source: 'Location Name Pattern (Heuristic)',
      },
      {
        name: 'Citizen Reports',
        weight: 5,
        score: C,
        weightedScore: Math.round(C * weights.C),
        description: `Based on ${upvotes} citizen report(s) for this location.`,
        source: 'Citizen Submission Count',
      },
    ]

    return { totalScore, priorityLevel, components }
  },

  /**
   * Submit new citizen road damage complaint.
   * Tries real backend first; falls back to localStorage if unavailable.
   *
   * @param {object} payload
   * @returns {Promise<{ success: boolean, complaint: object }>}
   */
  async submitComplaint(payload) {
    // Try the real backend
    try {
      const [lat, lng] = payload.coordinates || [18.5186, 73.8415]
      const backendPayload = {
        damageType: payload.damageType || 'Pothole',
        severity: payload.severity || 'medium',
        priorityScore: payload.priorityScore || 50,
        location: payload.location || 'Unknown Location',
        ward: payload.ward || null,
        coordinates: payload.coordinates || [lat, lng],
        latitude: lat,
        longitude: lng,
        description: payload.description || '',
        aiConfidence: payload.aiConfidence || null,
        reportingSource: 'citizen_app',
      }

      const res = await apiClient.post('/complaints', backendPayload, { timeout: 8000 })
      const complaint = res.data

      // Also save locally so it appears immediately in My Reports (localStorage)
      saveComplaintLocally({
        id: complaint.id,
        incidentId: complaint.incidentId,
        damageType: complaint.damageType,
        location: complaint.location,
        ward: complaint.ward,
        coordinates: complaint.coordinates,
        severity: complaint.severity,
        priority: complaint.priorityScore,
        status: complaint.status || 'Pending',
        date: 'Today, ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        timestamp: complaint.createdAt || new Date().toISOString(),
        aiConfidence: payload.aiConfidence || null,
        description: payload.description || '',
        imageUrl: payload.imageUrl || null,
        estimatedFix: 'Under PMC Inspection',
        upvotes: 1,
        srpsBreakdown: payload.srpsBreakdown || null,
      })

      return { success: true, complaint }
    } catch (backendErr) {
      console.warn('[complaintService] Backend complaint submission failed, using local fallback:', backendErr.message)
    }

    // Local fallback — assign a local ID and save
    await delay(400)
    const randomId = Math.floor(450 + Math.random() * 50)
    const incidentId = `INC-2026-00${Math.floor(930 + Math.random() * 60)}`
    const complaintId = `PMC-2026-0${randomId}`

    const newComplaint = {
      id: complaintId,
      incidentId,
      damageType: payload.damageType || 'Pothole',
      location: payload.location || 'FC Road, Deccan Gymkhana, Pune',
      ward: payload.ward || 'Ward 14 (Shivajinagar - Deccan)',
      coordinates: payload.coordinates || [18.5186, 73.8415],
      severity: payload.severity || 'medium',
      priority: payload.priorityScore || 50,
      status: 'Pending',
      date: 'Today, ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      timestamp: new Date().toISOString(),
      aiConfidence: payload.aiConfidence || null,
      description: payload.description || 'Citizen reported road hazard.',
      imageUrl: payload.imageUrl || null,
      estimatedFix: 'Under PMC Inspection',
      upvotes: 1,
      assignedSquad: 'PMC Rapid Response Team #4',
      srpsBreakdown: payload.srpsBreakdown || null,
    }

    saveComplaintLocally(newComplaint)
    return { success: true, complaint: newComplaint }
  },

  /**
   * Get single complaint by ID or tracking code.
   * @param {string} id
   * @returns {object | null}
   */
  getComplaintById(id) {
    if (!id) return null
    const all = getSavedComplaints()
    const norm = id.trim().toLowerCase()
    const found = all.find(
      (c) => c.id.toLowerCase() === norm || (c.incidentId && c.incidentId.toLowerCase() === norm),
    )

    if (found) {
      return {
        ...found,
        imageUrl: found.imageUrl || '/sample-pothole.jpg',
        repairOfficer: found.repairOfficer || {
          name: 'Ramesh Kumar',
          title: 'Senior Field Repair Officer',
          department: 'Zone-C Rapid Pavement Unit, Pune Municipal Corp',
          phone: '+91 98111 54321',
          email: 'engineer@smartroad.gov',
          badgeId: 'PMC-ENG-082',
        },
        workOrder: found.workOrder || {
          id: `WO-PN-2026-${found.id.slice(-3)}`,
          crewSize: 6,
          equipment: 'Milling machine, Bitumen sprayer, 3-ton vibratory roller',
          materials: '1.8 tonnes Hot Mix Asphalt (VG-30 grade)',
          scheduledDate: found.estimatedFix || '15 Oct 2026',
        },
        boundingBoxes: found.boundingBoxes || [],
      }
    }

    return null
  },
}

export default complaintService

