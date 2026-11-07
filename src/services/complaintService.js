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
    if (raw) {
      const local = JSON.parse(raw)
      if (Array.isArray(local) && local.length > 0) return local
    }
    return mockPuneComplaints
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
    const existingIdx = list.findIndex(c => c.id === complaint.id)
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...complaint }
    } else {
      list.unshift(complaint)
    }
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
   * @param {number} [options.confidenceThreshold=0.50]
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
   *   confidenceThreshold: number,
   *   isBackendResult: boolean,
   *   backendUnavailable: boolean,
   * }>}
   */
  async predictDamage(imageFileOrUrl, options = {}) {
    const { confidenceThreshold = 0.50, gps = null } = options

    // Convert image to base64 (required by API)
    let imageB64
    try {
      imageB64 = await imageToBase64(imageFileOrUrl)
    } catch (convErr) {
      console.error('[complaintService] Image conversion failed:', convErr)
      return this._backendUnavailableResult(confidenceThreshold)
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
        return this._modelNotConfiguredResult(data, confidenceThreshold)
      }

      if (data.status === 'invalid_image') {
        return this._invalidImageResult(data, confidenceThreshold)
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
        confidenceThreshold,
        isBackendResult: true,
        backendUnavailable: false,
        // Physical dimensions cannot be measured from a single uncalibrated image
        dimensions: null,
      }
    } catch (err) {
      console.error('[complaintService] Backend inference failed:', err)
      return this._backendUnavailableResult(confidenceThreshold)
    }
  },

  /** Result when the backend is unreachable */
  _backendUnavailableResult(confidenceThreshold = 0.50) {
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
      confidenceThreshold,
      isBackendResult: false,
      backendUnavailable: true,
      dimensions: null,
    }
  },

  /** Result when model weights are not configured */
  _modelNotConfiguredResult(data, confidenceThreshold = 0.50) {
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
      confidenceThreshold,
      isBackendResult: true,
      backendUnavailable: false,
      dimensions: null,
    }
  },

  /** Result when image is invalid or unreadable */
  _invalidImageResult(data, confidenceThreshold = 0.50) {
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
      confidenceThreshold,
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
  async getComplaintById(id) {
    if (!id) return null
    try {
      const { data } = await apiClient.get(`/complaints/${encodeURIComponent(id)}`)
      return this._enrichComplaint(data)
    } catch {
      // The offline report tracker remains usable when the API is unavailable.
    }

    const all = getSavedComplaints()
    const norm = id.trim().toLowerCase()
    const found = all.find(
      (c) => c.id.toLowerCase() === norm || (c.incidentId && c.incidentId.toLowerCase() === norm),
    )

    if (found) {
      return this._enrichComplaint(found)
    }

    return null
  },

  /**
   * Fetch all complaints from the real backend API.
   * Caches results locally for offline resilience.
   * @param {object} params
   * @returns {Promise<Array<object>>}
   */
  async fetchComplaints(params = {}) {
    try {
      const res = await apiClient.get('/complaints', { params, timeout: 8000 })
      if (Array.isArray(res.data) && res.data.length > 0) {
        localStorage.setItem(LOCAL_COMPLAINTS_KEY, JSON.stringify(res.data))
        return res.data
      }
    } catch (err) {
      console.warn('[complaintService] Failed to fetch complaints from backend, using cached local data:', err.message)
    }
    return getSavedComplaints()
  },

  /**
   * Engineer accepts / takes charge of an open complaint.
   * @param {string} id
   * @param {{ engineerName: string, squad?: string, note?: string }} payload
   */
  async acceptComplaint(id, { engineerName = 'Er. Rajesh Kulkarni', squad = 'Ward 14 Rapid Squad', note = '' } = {}) {
    try {
      const res = await apiClient.put(`/complaints/${encodeURIComponent(id)}/accept`, {
        engineerName,
        squad,
        note: note || `Complaint accepted by ${engineerName} for field repair.`,
      })
      this._updateLocalComplaint(res.data)
      return { success: true, complaint: res.data }
    } catch (err) {
      console.warn('[complaintService] Accept API failed, updating locally:', err.message)
      const all = getSavedComplaints()
      const idx = all.findIndex(c => c.id === id || c.incidentId === id)
      if (idx >= 0) {
        all[idx] = {
          ...all[idx],
          assignedEngineer: engineerName,
          assignedSquad: squad,
          status: 'In Progress',
          repairProgress: Math.max(all[idx].repairProgress || 0, 15),
          dispatchNote: note || `Complaint accepted by ${engineerName} for field repair.`,
        }
        localStorage.setItem(LOCAL_COMPLAINTS_KEY, JSON.stringify(all))
        return { success: true, complaint: all[idx] }
      }
      throw err
    }
  },

  /**
   * Engineer updates repair progress percentage (0 - 100%).
   * Auto-resolves when progress reaches 100%.
   * @param {string} id
   * @param {{ repairProgress: number, status?: string, note?: string, estimatedFix?: string, afterImageUrl?: string }} payload
   */
  async updateRepairProgress(id, { repairProgress, status, note, estimatedFix, afterImageUrl } = {}) {
    try {
      const res = await apiClient.put(`/complaints/${encodeURIComponent(id)}/repair-progress`, {
        repairProgress,
        status,
        note,
        estimatedFix,
        afterImageUrl,
      })
      this._updateLocalComplaint(res.data)
      return { success: true, complaint: res.data }
    } catch (err) {
      console.warn('[complaintService] Update progress API failed, updating locally:', err.message)
      const all = getSavedComplaints()
      const idx = all.findIndex(c => c.id === id || c.incidentId === id)
      if (idx >= 0) {
        const nextStatus = repairProgress >= 100 ? 'Resolved' : (status || (all[idx].status === 'Pending' ? 'In Progress' : all[idx].status))
        all[idx] = {
          ...all[idx],
          repairProgress,
          status: nextStatus,
          statusNote: note || all[idx].statusNote,
          estimatedFix: estimatedFix || all[idx].estimatedFix,
        }
        localStorage.setItem(LOCAL_COMPLAINTS_KEY, JSON.stringify(all))
        return { success: true, complaint: all[idx] }
      }
      throw err
    }
  },

  /**
   * Update complaint status (Admin / Engineer).
   * @param {string} id
   * @param {{ status: string, note?: string }} payload
   */
  async updateComplaintStatus(id, { status, note } = {}) {
    try {
      const res = await apiClient.put(`/admin/complaints/${encodeURIComponent(id)}/status`, {
        status,
        note,
      })
      this._updateLocalComplaint(res.data)
      return { success: true, complaint: res.data }
    } catch (err) {
      console.warn('[complaintService] Update status API failed, updating locally:', err.message)
      const all = getSavedComplaints()
      const idx = all.findIndex(c => c.id === id || c.incidentId === id)
      if (idx >= 0) {
        all[idx] = { ...all[idx], status, statusNote: note || all[idx].statusNote }
        localStorage.setItem(LOCAL_COMPLAINTS_KEY, JSON.stringify(all))
        return { success: true, complaint: all[idx] }
      }
      throw err
    }
  },

  /**
   * Fetch aggregated live statistics across all municipal complaints.
   */
  async fetchStatsSummary() {
    try {
      const res = await apiClient.get('/complaints/stats/summary', { timeout: 5000 })
      return res.data
    } catch (err) {
      console.warn('[complaintService] Stats summary API failed, calculating from local cache:', err.message)
      const all = getSavedComplaints()
      return {
        total_complaints: all.length,
        pending: all.filter(c => (c.status || '').toLowerCase().includes('pending')).length,
        in_progress: all.filter(c => (c.status || '').toLowerCase().includes('progress')).length,
        scheduled: all.filter(c => (c.status || '').toLowerCase().includes('scheduled')).length,
        resolved: all.filter(c => (c.status || '').toLowerCase().includes('resolved') || (c.status || '').toLowerCase().includes('completed')).length,
        critical: all.filter(c => (c.severity || '').toLowerCase() === 'critical').length,
        high: all.filter(c => (c.severity || '').toLowerCase() === 'high').length,
        medium: all.filter(c => (c.severity || '').toLowerCase() === 'medium').length,
        low: all.filter(c => (c.severity || '').toLowerCase() === 'low').length,
        average_priority: Math.round(all.reduce((acc, c) => acc + (c.priority || c.priorityScore || 50), 0) / (all.length || 1)),
        high_priority_count: all.filter(c => (c.priority || c.priorityScore || 50) >= 70).length,
      }
    }
  },

  /**
   * Adapter: Normalizes a ComplaintModel/Response into the structure expected by Engineer views.
   */
  complaintToIssue(c) {
    if (!c) return null
    const lat = c.latitude ?? (Array.isArray(c.coordinates) ? c.coordinates[0] : 18.5204)
    const lng = c.longitude ?? (Array.isArray(c.coordinates) ? c.coordinates[1] : 73.8567)
    const priorityScore = c.priorityScore ?? c.priority ?? 50
    let priorityLevel = 'Low'
    if (priorityScore >= 85) priorityLevel = 'Critical'
    else if (priorityScore >= 70) priorityLevel = 'High'
    else if (priorityScore >= 50) priorityLevel = 'Medium'

    return {
      id: c.id,
      complaintId: c.id,
      incidentId: c.incidentId || `INC-2026-${c.id.slice(-4)}`,
      damageType: c.damageType || 'Pothole',
      location: c.location || 'Pune City Road',
      ward: c.ward || 'Ward 14 (Shivajinagar - Deccan)',
      coordinates: [lat, lng],
      latitude: lat,
      longitude: lng,
      severity: (c.severity || 'medium').toLowerCase(),
      srps: priorityScore,
      priority: priorityScore,
      priorityLevel,
      status: c.status || 'Pending',
      repairProgress: c.repairProgress || 0,
      assignedDate: c.date || 'Recent',
      assignedEngineer: c.assignedEngineer || null,
      assignedSquad: c.assignedSquad || 'Rapid Response Squad',
      imageUrl: c.imageUrl || '/sample-pothole.jpg',
      roadImage: c.imageUrl || '/sample-pothole.jpg',
      aiConfidence: c.aiConfidence || '92.4%',
      aiDetection: {
        confidence: c.aiConfidence ? parseFloat(c.aiConfidence) : 92.4,
        class: c.damageType || 'Pothole',
      },
      boundingBoxes: c.boundingBoxes || [],
      description: c.description || 'Road surface damage requiring attention.',
      notes: c.statusNote || c.dispatchNote || '',
      statusNote: c.statusNote || '',
      dispatchNote: c.dispatchNote || '',
      estimatedFix: c.estimatedFix || 'Scheduled within 48 hrs',
      rawComplaint: c,
    }
  },

  _updateLocalComplaint(complaint) {
    saveComplaintLocally(complaint)
  },

  _enrichComplaint(found) {
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
  },
}

export default complaintService

