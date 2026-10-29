/**
 * complaintService.js — Isolated service for Road Damage Reporting and AI Prediction.
 *
 * Designed to connect to FastAPI backend:
 *  - POST /api/v1/predict     (AI vision inference with bounding box detection)
 *  - POST /api/v1/complaints  (Register complaint with GIS location and SRPS score)
 *  - GET  /api/v1/complaints  (Fetch citizen complaints)
 *
 * Current implementation uses realistic client-side mock logic, saving
 * newly reported complaints to localStorage so they immediately reflect
 * in the Citizen Dashboard and My Reports.
 */

import { mockPuneComplaints } from '../data/mockData'

const LOCAL_COMPLAINTS_KEY = 'rds_citizen_complaints'

/** Helper to simulate network latency */
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms))

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

export const complaintService = {
  /**
   * Simulate AI Vision Inference (POST /api/v1/predict)
   *
   * Analyzes uploaded road image, detecting damage type,
   * confidence score, severity rating, and bounding box coordinates.
   *
   * @param {File | string} imageFileOrUrl
   * @returns {Promise<{
   *   damageType: string,
   *   confidence: number,
   *   severity: 'critical' | 'high' | 'medium' | 'low',
   *   boundingBoxes: Array<{ label: string, confidence: number, box: { x: number, y: number, w: number, h: number } }>,
   *   dimensions: { depthCm: number, widthCm: number, areaSqM: number },
   *   recommendedAction: string
   * }>}
   */
  async predictDamage(imageFileOrUrl) {
    await delay(700)

    // Realistic AI detection output
    return {
      damageType: 'Pothole',
      confidence: 0.964,
      severity: 'critical',
      boundingBoxes: [
        {
          id: 'box-1',
          label: 'Pothole (Severe)',
          confidence: 0.964,
          box: {
            x: 20, // percentage from left
            y: 35, // percentage from top
            w: 55, // width percentage
            h: 46, // height percentage
          },
        },
      ],
      dimensions: {
        depthCm: 14.5,
        widthCm: 52.0,
        areaSqM: 0.58,
      },
      recommendedAction: 'Rapid cold-planing & hot-mix asphalt patching required within 48h.',
    }
  },

  /**
   * Calculate Smart Road Priority Score (SRPS: 0 - 100)
   *
   * Evaluates the 5 multi-factor criteria:
   *  1. Damage Severity (Weight: 35%)
   *  2. Traffic Importance (Weight: 25%)
   *  3. Location Criticality (Weight: 15%)
   *  4. Road Importance (Weight: 15%)
   *  5. Citizen Report Frequency (Weight: 10%)
   *
   * @param {object} factors
   * @returns {{
   *   totalScore: number,
   *   priorityLevel: 'Critical' | 'High' | 'Medium' | 'Low',
   *   components: Array<{ name: string, weight: number, score: number, weightedScore: number, description: string }>
   * }}
   */
  calculateSRPS(factors = {}) {
    const {
      severity = 'critical',
      trafficImportance = 88,    // Peak traffic volume on road (0 - 100)
      locationCriticality = 90,  // Proximity to hospitals, schools, transit hubs (0 - 100)
      roadImportance = 85,       // Arterial / Highway vs Local ward street (0 - 100)
      reportFrequency = 80,      // Number of citizen duplicate reports (0 - 100)
    } = factors

    // Severity base score
    let severityScore = 95
    if (severity === 'high') severityScore = 80
    if (severity === 'medium') severityScore = 60
    if (severity === 'low') severityScore = 40

    // Component calculations
    const components = [
      {
        name: 'Damage Severity',
        weight: 35,
        score: severityScore,
        weightedScore: Math.round(severityScore * 0.35),
        description: 'Physical depth (>10cm), crack expansion & vehicle tire damage potential',
      },
      {
        name: 'Traffic Importance',
        weight: 25,
        score: trafficImportance,
        weightedScore: Math.round(trafficImportance * 0.25),
        description: 'High daily passenger density, public transport & PMT bus route transit',
      },
      {
        name: 'Location Criticality',
        weight: 15,
        score: locationCriticality,
        weightedScore: Math.round(locationCriticality * 0.15),
        description: 'Near emergency services, school crossings & commercial intersections',
      },
      {
        name: 'Road Importance',
        weight: 15,
        score: roadImportance,
        weightedScore: Math.round(roadImportance * 0.15),
        description: 'Primary city arterial corridor (FC Road, SB Road, IT Corridors)',
      },
      {
        name: 'Citizen Report Frequency',
        weight: 10,
        score: reportFrequency,
        weightedScore: Math.round(reportFrequency * 0.1),
        description: 'Community alerts and crowd-sourced hazard confirmations',
      },
    ]

    const totalScore = components.reduce((acc, c) => acc + c.weightedScore, 0)

    let priorityLevel = 'Low'
    if (totalScore >= 85) priorityLevel = 'Critical'
    else if (totalScore >= 70) priorityLevel = 'High'
    else if (totalScore >= 50) priorityLevel = 'Medium'

    return {
      totalScore: Math.min(100, Math.max(0, totalScore)),
      priorityLevel,
      components,
    }
  },

  /**
   * Submit new citizen road damage complaint (POST /api/v1/complaints)
   *
   * @param {object} payload
   * @returns {Promise<{ success: boolean, complaint: object }>}
   */
  async submitComplaint(payload) {
    await delay(800)

    const randomIdNumber = Math.floor(450 + Math.random() * 50)
    const complaintId = `PMC-2026-0${randomIdNumber}`
    const incidentId = `INC-2026-00${Math.floor(930 + Math.random() * 60)}`

    const newComplaint = {
      id: complaintId,
      incidentId: incidentId,
      damageType: payload.damageType || 'Pothole',
      location: payload.location || 'FC Road, Deccan Gymkhana, Pune',
      ward: payload.ward || 'Ward 14 (Shivajinagar - Deccan)',
      coordinates: payload.coordinates || [18.5186, 73.8415],
      severity: payload.severity || 'critical',
      priority: payload.priorityScore || 92,
      status: 'Pending',
      date: 'Today, ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      timestamp: new Date().toISOString(),
      aiConfidence: payload.aiConfidence || '96.4%',
      description: payload.description || 'Citizen reported road hazard.',
      imageUrl: payload.imageUrl || '/sample-pothole.jpg',
      estimatedFix: 'Under PMC Inspection',
      upvotes: 1,
      assignedSquad: 'PMC Rapid Response Team #4',
      srpsBreakdown: payload.srpsBreakdown || null,
    }

    saveComplaintLocally(newComplaint)

    return {
      success: true,
      complaint: newComplaint,
    }
  },

  /**
   * Get single complaint by ID or tracking code (GET /api/v1/complaints/:id)
   *
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
      // Enrich with officer and lifecycle metadata if not already present
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
        boundingBoxes: found.boundingBoxes || [
          {
            id: 'box-1',
            label: `${found.damageType || 'Pothole'} (${found.aiConfidence || '96.4%'})`,
            box: { x: 22, y: 35, w: 52, h: 48 },
          },
        ],
      }
    }

    return null
  },
}

export default complaintService

