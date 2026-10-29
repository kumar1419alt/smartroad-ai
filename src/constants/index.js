/**
 * Application-wide constants and configuration.
 * Replace BASE_URL with your FastAPI backend origin when integrating.
 */

export const APP_NAME = 'RoadSense'
export const APP_TAGLINE = 'Smart Road Damage Management'
export const APP_VERSION = '1.0.0'

/** FastAPI backend base URL — override via VITE_API_BASE_URL env variable */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

/** Default map center (New Delhi, India) */
export const DEFAULT_MAP_CENTER = [28.6139, 77.2090]
export const DEFAULT_MAP_ZOOM = 12

/** Damage severity levels */
export const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

/** Repair status labels */
export const REPAIR_STATUS = {
  PENDING: 'pending',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DEFERRED: 'deferred',
}

/** Damage type categories */
export const DAMAGE_TYPE = {
  POTHOLE: 'pothole',
  CRACK: 'crack',
  SUBSIDENCE: 'subsidence',
  RUTTING: 'rutting',
  EDGE_DAMAGE: 'edge_damage',
  SURFACE_DETERIORATION: 'surface_deterioration',
}

/** Pagination */
export const DEFAULT_PAGE_SIZE = 20

/** Date format used across the app */
export const DATE_FORMAT = 'dd MMM yyyy'
export const DATETIME_FORMAT = 'dd MMM yyyy, HH:mm'

/** User roles for authentication and access control */
export const USER_ROLES = {
  CITIZEN: 'citizen',
  ADMIN: 'admin',
  ENGINEER: 'engineer',
}

/** Human-readable role labels */
export const ROLE_LABELS = {
  [USER_ROLES.CITIZEN]: 'Citizen',
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.ENGINEER]: 'Engineer / Repair Officer',
}

/** Default landing dashboard path per role */
export const ROLE_DASHBOARDS = {
  [USER_ROLES.CITIZEN]: '/citizen/dashboard',
  [USER_ROLES.ADMIN]: '/admin/dashboard',
  [USER_ROLES.ENGINEER]: '/engineer/dashboard',
}
