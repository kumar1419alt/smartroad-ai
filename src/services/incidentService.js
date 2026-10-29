/**
 * Incident service — all API calls related to road damage incidents.
 *
 * Currently returns mock data with a simulated network delay.
 * To connect to FastAPI:
 *   - Remove the mock delay helpers.
 *   - Uncomment the apiClient calls.
 */

import apiClient from './apiClient'
import {
  mockIncidents,
  mockDashboardSummary,
  mockMonthlyTrend,
  mockDamageTypeDistribution,
  mockActivityFeed,
  mockZones,
} from '../data/mockData'

/** Simulate async latency for mock data (ms) */
const delay = (ms = 600) => new Promise((res) => setTimeout(res, ms))

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * Fetch high-level KPI summary for the dashboard.
 * FastAPI route: GET /dashboard/summary
 */
export async function fetchDashboardSummary() {
  await delay()
  return mockDashboardSummary
  // return (await apiClient.get('/dashboard/summary')).data
}

/**
 * Fetch monthly detection/repair trend data.
 * FastAPI route: GET /dashboard/trend
 */
export async function fetchMonthlyTrend() {
  await delay()
  return mockMonthlyTrend
  // return (await apiClient.get('/dashboard/trend')).data
}

/**
 * Fetch damage type distribution for charts.
 * FastAPI route: GET /dashboard/damage-distribution
 */
export async function fetchDamageTypeDistribution() {
  await delay()
  return mockDamageTypeDistribution
  // return (await apiClient.get('/dashboard/damage-distribution')).data
}

/**
 * Fetch recent platform activity feed.
 * FastAPI route: GET /dashboard/activity
 */
export async function fetchActivityFeed() {
  await delay()
  return mockActivityFeed
  // return (await apiClient.get('/dashboard/activity')).data
}

// ─── Incidents ────────────────────────────────────────────────────────────────

/**
 * Fetch paginated, filtered list of incidents.
 * FastAPI route: GET /incidents
 * @param {object} params - { page, pageSize, severity, status, zone, search }
 */
export async function fetchIncidents(params = {}) {
  await delay()
  let results = [...mockIncidents]

  // Client-side mock filtering — FastAPI handles this server-side
  if (params.severity) {
    results = results.filter((i) => i.severity === params.severity)
  }
  if (params.status) {
    results = results.filter((i) => i.status === params.status)
  }
  if (params.zone) {
    results = results.filter((i) => i.location.zone === params.zone)
  }
  if (params.search) {
    const q = params.search.toLowerCase()
    results = results.filter(
      (i) =>
        i.id.toLowerCase().includes(q) ||
        i.location.address.toLowerCase().includes(q) ||
        i.damageType.toLowerCase().includes(q),
    )
  }

  return {
    data: results,
    total: results.length,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
  }
  // return (await apiClient.get('/incidents', { params })).data
}

/**
 * Fetch a single incident by ID.
 * FastAPI route: GET /incidents/{id}
 */
export async function fetchIncidentById(id) {
  await delay(400)
  const incident = mockIncidents.find((i) => i.id === id)
  if (!incident) throw new Error(`Incident ${id} not found.`)
  return incident
  // return (await apiClient.get(`/incidents/${id}`)).data
}

/**
 * Fetch all incidents (for map layer).
 * FastAPI route: GET /incidents/map
 */
export async function fetchIncidentMapData() {
  await delay(800)
  return mockIncidents.map(({ id, severity, status, priorityScore, location, damageType }) => ({
    id, severity, status, priorityScore, location, damageType,
  }))
  // return (await apiClient.get('/incidents/map')).data
}

// ─── Zones ────────────────────────────────────────────────────────────────────

/**
 * Fetch zone-level repair summary.
 * FastAPI route: GET /zones
 */
export async function fetchZones() {
  await delay()
  return mockZones
  // return (await apiClient.get('/zones')).data
}
