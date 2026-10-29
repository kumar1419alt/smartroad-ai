/**
 * detectionService.js — Road Damage AI Vision & YOLO Inference Service.
 *
 * Supported Road Damage Classes (RDD2022 / Global Standard):
 *  - D00: Longitudinal Crack
 *  - D10: Transverse Crack
 *  - D20: Alligator Crack (Fatigue failure)
 *  - D40: Pothole (Structural defect)
 *
 * Backend Endpoint Contract:
 *  - URL: POST {API_BASE_URL}/detection/infer
 *  - Request Body:
 *      {
 *        "session_id": string,
 *        "timestamp": ISOString,
 *        "image": string (Base64 data URL or raw binary),
 *        "gps": { "latitude": number, "longitude": number, "accuracy": number },
 *        "confidence_threshold": number (0.0 - 1.0)
 *      }
 *  - Response Body:
 *      {
 *        "success": boolean,
 *        "model": string (e.g. "YOLOv8x-RDD2022"),
 *        "inference_time_ms": number,
 *        "detections": Array<{
 *          "class_id": "D00" | "D10" | "D20" | "D40",
 *          "class_name": string,
 *          "confidence": number (0.0 - 1.0),
 *          "box": { "x": number, "y": number, "w": number, "h": number } // Percentages 0-100
 *        }>
 *      }
 *
 * If no backend server is running at the configured endpoint, detectionService
 * provides a clearly labeled DEMO SIMULATION MODE for UI verification.
 * In DEMO MODE, results are explicitly flagged with `is_simulated: true`
 * and will never claim to be real model predictions.
 */

import apiClient from './apiClient'
import { API_BASE_URL } from '../constants'

export const ROAD_DAMAGE_CLASSES = {
  D00: {
    code: 'D00',
    name: 'Longitudinal Crack',
    category: 'Linear Cracking',
    defaultSeverity: 'high',
    color: '#f97316', // Orange
    bgLight: 'bg-orange-50 text-orange-700 border-orange-200',
    description: 'Cracks parallel to road centerline caused by wheel fatigue and pavement joint contraction',
  },
  D10: {
    code: 'D10',
    name: 'Transverse Crack',
    category: 'Thermal Stress Cracking',
    defaultSeverity: 'medium',
    color: '#eab308', // Amber/Yellow
    bgLight: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    description: 'Cracks perpendicular to road centerline caused by asphalt thermal shrinkage',
  },
  D20: {
    code: 'D20',
    name: 'Alligator Crack',
    category: 'Structural Fatigue Failure',
    defaultSeverity: 'high',
    color: '#ef4444', // Red
    bgLight: 'bg-red-50 text-red-700 border-red-200',
    description: 'Interconnected spiderweb cracks indicating structural sub-base foundation weakness',
  },
  D40: {
    code: 'D40',
    name: 'Pothole',
    category: 'Cavity / Structural Defect',
    defaultSeverity: 'critical',
    color: '#dc2626', // Dark Red
    bgLight: 'bg-red-100 text-red-800 border-red-300',
    description: 'Severe pavement void formed by moisture penetration and heavy vehicle impact',
  },
}

/** Local storage keys for dashcam configuration */
export const DASHCAM_STORAGE_KEYS = {
  CONFIDENCE_THRESHOLD: 'rds_dashcam_confidence_threshold',
  SAMPLING_INTERVAL: 'rds_dashcam_sampling_interval',
  CUSTOM_ENDPOINT: 'rds_dashcam_custom_endpoint',
  DEMO_MODE: 'rds_dashcam_demo_mode',
}

/** Default configuration values */
export const DEFAULT_DASHCAM_CONFIG = {
  confidenceThreshold: 0.70, // 70% min confidence
  samplingIntervalMs: 1800,   // Sample every 1.8 seconds
  endpoint: '/detection/infer',
  demoMode: true,             // Default to demo mode when running frontend standalone
}

/**
 * Normalise any class name or code to standard RDD2022 metadata.
 */
export function normalizeDamageClass(rawClass) {
  if (!rawClass) return ROAD_DAMAGE_CLASSES.D40

  const key = String(rawClass).trim().toUpperCase()

  if (ROAD_DAMAGE_CLASSES[key]) {
    return ROAD_DAMAGE_CLASSES[key]
  }

  // Common synonyms mapping
  const lower = String(rawClass).toLowerCase()
  if (lower.includes('pothole') || lower.includes('crater')) {
    return ROAD_DAMAGE_CLASSES.D40
  }
  if (lower.includes('alligator') || lower.includes('fatigue') || lower.includes('crocodile')) {
    return ROAD_DAMAGE_CLASSES.D20
  }
  if (lower.includes('transverse') || lower.includes('cross')) {
    return ROAD_DAMAGE_CLASSES.D10
  }
  if (lower.includes('longitudinal') || lower.includes('linear') || lower.includes('crack')) {
    return ROAD_DAMAGE_CLASSES.D00
  }

  return {
    code: 'UNKNOWN',
    name: rawClass,
    category: 'Unclassified Road Defect',
    defaultSeverity: 'medium',
    color: '#64748b',
    bgLight: 'bg-slate-100 text-slate-700 border-slate-200',
    description: 'Unclassified road surface anomaly',
  }
}

/**
 * Detection Service — manages communication with YOLO inference backend and fallback demo engine.
 */
export const detectionService = {
  config: { ...DEFAULT_DASHCAM_CONFIG },

  /** Update runtime inference config */
  updateConfig(newConfig = {}) {
    this.config = { ...this.config, ...newConfig }
    if (newConfig.endpoint) {
      localStorage.setItem(DASHCAM_STORAGE_KEYS.CUSTOM_ENDPOINT, newConfig.endpoint)
    }
  },

  /**
   * Run inference on an extracted video frame.
   *
   * @param {object} params
   * @param {string} params.imageDataUrl - Base64 encoded JPEG data URL of the video frame
   * @param {string} params.sessionId
   * @param {object|null} params.gps - { latitude, longitude, accuracy, timestamp }
   * @param {number} params.confidenceThreshold - Min confidence (e.g. 0.70)
   * @param {boolean} params.forceDemoMode - Run synthetic demo simulation
   * @returns {Promise<{
   *   success: boolean,
   *   is_simulated: boolean,
   *   model: string,
   *   inference_time_ms: number,
   *   detections: Array<{
   *     class_id: string,
   *     class_name: string,
   *     confidence: number,
   *     box: { x: number, y: number, w: number, h: number },
   *     severity: string
   *   }>
   * }>}
   */
  async inferFrame({
    imageDataUrl,
    sessionId = 'session_default',
    gps = null,
    confidenceThreshold = 0.70,
    forceDemoMode = false,
  }) {
    const startTime = performance.now()

    // If Demo Mode is explicitly requested or forced, use synthetic simulation
    if (forceDemoMode) {
      return this._simulateDemoInference({ confidenceThreshold, startTime })
    }

    try {
      const endpoint = localStorage.getItem(DASHCAM_STORAGE_KEYS.CUSTOM_ENDPOINT) || DEFAULT_DASHCAM_CONFIG.endpoint

      // Prepare payload conforming to backend contract
      const payload = {
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        image: imageDataUrl,
        gps: gps ? {
          latitude: gps.latitude,
          longitude: gps.longitude,
          accuracy: gps.accuracy,
          timestamp: gps.timestamp || Date.now(),
        } : null,
        confidence_threshold: confidenceThreshold,
      }

      const response = await apiClient.post(endpoint, payload, {
        timeout: 5000, // 5s inference timeout
      })

      const inferenceTime = Math.round(performance.now() - startTime)
      const data = response.data || {}

      // Validate detections array
      const rawDetections = Array.isArray(data.detections) ? data.detections : []
      const validDetections = rawDetections
        .filter((d) => {
          if (!d || typeof d.confidence !== 'number') return false
          if (d.confidence < confidenceThreshold) return false
          // Check box structure
          return d.box && typeof d.box.x === 'number' && typeof d.box.w === 'number'
        })
        .map((d) => {
          const classMeta = normalizeDamageClass(d.class_id || d.class_name)
          return {
            class_id: classMeta.code,
            class_name: classMeta.name,
            confidence: Math.round(d.confidence * 1000) / 1000,
            box: {
              x: Math.max(0, Math.min(100, d.box.x)),
              y: Math.max(0, Math.min(100, d.box.y)),
              w: Math.max(2, Math.min(100, d.box.w)),
              h: Math.max(2, Math.min(100, d.box.h)),
            },
            severity: classMeta.defaultSeverity,
          }
        })

      return {
        success: true,
        is_simulated: false,
        model: data.model || 'YOLOv8-RDD2022 (Live Backend)',
        inference_time_ms: inferenceTime,
        detections: validDetections,
      }
    } catch (err) {
      // Backend is unreachable or returned error.
      // Do NOT silently fake real AI! Return failure with transparent error message,
      // and indicate demo mode fallback is available.
      const inferenceTime = Math.round(performance.now() - startTime)
      return {
        success: false,
        is_simulated: false,
        model: 'DISCONNECTED',
        inference_time_ms: inferenceTime,
        detections: [],
        error: err.message || 'YOLO backend unreachable. Check VITE_API_BASE_URL or enable Demo Mode.',
      }
    }
  },

  /**
   * Controlled demo simulation engine.
   * Generates realistic, reproducible damage bounding boxes for UI demonstration
   * when no live YOLO model is connected.
   *
   * Note: Always clearly flagged as `is_simulated: true`.
   */
  _simulateDemoInference({ confidenceThreshold, startTime }) {
    this._demoStep = (this._demoStep || 0) + 1
    const inferenceTime = Math.floor(90 + Math.random() * 80)
    const detections = []

    // In demo simulation, cycle through RDD2022 classes on sampled frames
    const classes = ['D40', 'D00', 'D20', 'D10']
    const chosenClassCode = classes[(this._demoStep - 1) % classes.length]
    const classMeta = ROAD_DAMAGE_CLASSES[chosenClassCode]

    const rawConf = confidenceThreshold + 0.12 + Math.random() * 0.12
    const confidence = Math.min(0.96, Math.round(rawConf * 1000) / 1000)

    // Bounding box on the road surface plane
    const box = {
      x: Math.round(28 + Math.random() * 30),
      y: Math.round(52 + Math.random() * 16),
      w: Math.round(24 + Math.random() * 18),
      h: Math.round(18 + Math.random() * 14),
    }

    detections.push({
      class_id: classMeta.code,
      class_name: classMeta.name,
      confidence,
      box,
      severity: classMeta.defaultSeverity,
    })

    return {
      success: true,
      is_simulated: true,
      model: 'DEMO SIMULATION (No YOLO backend connected)',
      inference_time_ms: inferenceTime,
      detections,
    }
  },

  /**
   * Check connection to configured YOLO inference backend.
   *
   * @returns {Promise<{ online: boolean, message: string, modelInfo?: string }>}
   */
  async checkBackendHealth() {
    try {
      const endpoint = localStorage.getItem(DASHCAM_STORAGE_KEYS.CUSTOM_ENDPOINT) || DEFAULT_DASHCAM_CONFIG.endpoint
      // Send lightweight ping / options probe
      const res = await apiClient.get('/health', { timeout: 3000 })
      return {
        online: true,
        message: 'YOLO Inference Backend Connected',
        modelInfo: res.data?.model || 'YOLOv8-RDD2022',
      }
    } catch (err) {
      return {
        online: false,
        message: 'Backend Offline / Standalone Frontend Mode',
      }
    }
  },
}

export default detectionService
