/**
 * adminService.js — Service layer for Municipal Administrator Actions.
 *
 * Designed for FastAPI endpoints:
 *  - GET    /api/v1/admin/complaints         (Fetch paginated & filtered complaints)
 *  - GET    /api/v1/admin/complaints/{id}    (Fetch single complaint details)
 *  - PUT    /api/v1/admin/complaints/{id}/assign (Assign engineer / squad)
 *  - PUT    /api/v1/admin/complaints/{id}/status (Update lifecycle status)
 *
 * Current implementation uses realistic client-side mock logic with local persistence
 * so status changes and engineer assignments immediately persist across views.
 */

import { getSavedComplaints, saveComplaintLocally } from './complaintService'
import { deriveFactorsForComplaint } from '../utils/srpsCalculator'

const ADMIN_OVERRIDES_KEY = 'rds_admin_complaints_overrides'

/** Helper to simulate network latency for FastAPI calls */
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

function getOverrides() {
  try {
    const raw = localStorage.getItem(ADMIN_OVERRIDES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (err) {
    return {}
  }
}

function saveOverride(id, patch) {
  try {
    const overrides = getOverrides()
    overrides[id] = { ...(overrides[id] || {}), ...patch }
    localStorage.setItem(ADMIN_OVERRIDES_KEY, JSON.stringify(overrides))
  } catch (err) {
    console.error('Failed to save override', err)
  }
}

/**
 * Synthetic citizen names generator for demo complaints
 */
const CITIZEN_NAMES = [
  'Priya Verma',
  'Rahul Joshi',
  'Sunita Patil',
  'Anand Shinde',
  'Deepak Kulkarni',
  'Neha Deshmukh',
  'Suresh More',
  'Kavita Jadhav',
]

export const adminService = {
  /**
   * Fetch all complaints with overrides and SRPS factor calculation
   * Later maps to: GET /api/v1/admin/complaints
   */
  async getComplaints(filters = {}) {
    await delay(200)

    const baseList = getSavedComplaints()
    const overrides = getOverrides()

    // Merge base complaints with overrides and derive SRPS factors
    const enriched = baseList.map((item, idx) => {
      const override = overrides[item.id] || {}
      const merged = { ...item, ...override }

      // Assign synthetic citizen reporter if not present
      if (!merged.citizenName) {
        merged.citizenName = item.reportedBy?.includes('Citizen')
          ? item.reportedBy.replace('Citizen Report — ', '')
          : CITIZEN_NAMES[idx % CITIZEN_NAMES.length]
        merged.citizenPhone = '+91 98' + (20000000 + (idx * 13579) % 80000000)
      }

      const factors = deriveFactorsForComplaint(merged)
      return {
        ...merged,
        ...factors,
      }
    })

    return enriched
  },

  /**
   * Fetch single complaint by ID
   * Later maps to: GET /api/v1/admin/complaints/{id}
   */
  async getComplaintById(id) {
    await delay(150)
    const list = await this.getComplaints()
    return list.find((c) => c.id === id) || null
  },

  /**
   * Update complaint status
   * Later maps to: PUT /api/v1/admin/complaints/{id}/status
   */
  async updateStatus(id, newStatus, note = '') {
    await delay(300)
    saveOverride(id, {
      status: newStatus,
      statusUpdatedAt: new Date().toISOString(),
      statusNote: note,
    })
    return { success: true, id, status: newStatus }
  },

  /**
   * Assign repair squad and supervising engineer
   * Later maps to: PUT /api/v1/admin/complaints/{id}/assign
   */
  async assignEngineer(id, payload = {}) {
    await delay(350)
    const { assignedSquad, assignedEngineer, targetDate, note } = payload
    saveOverride(id, {
      assignedSquad,
      assignedEngineer,
      estimatedFix: targetDate,
      dispatchNote: note,
      status: 'In Progress', // Autotoggle to In Progress when crew is dispatched
    })
    return { success: true, id, payload }
  },
}
