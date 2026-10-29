/**
 * authService.js — Authentication service structured for JWT.
 *
 * Current implementation uses realistic client-side mock authentication.
 * When integrating with the real FastAPI backend, replace the mock logic
 * inside these functions with `apiClient.post('/auth/login', ...)` calls.
 * The return shapes ({ user, token }) and storage keys will remain identical.
 *
 * NOTE: Passwords are used here strictly for local demo simulation.
 * Never handle or store plaintext credentials in a real backend.
 */

import { mockUsers } from '../data/mockData'
import { USER_ROLES } from '../constants'

const TOKEN_KEY = 'rds_auth_token'
const USER_KEY = 'rds_user'
const REGISTERED_USERS_KEY = 'rds_registered_users'

/** Helper to simulate network latency */
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

/** Encode object to Base64URL string for JWT simulation */
function base64UrlEncode(obj) {
  const jsonStr = JSON.stringify(obj)
  return btoa(unescape(encodeURIComponent(jsonStr)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/** Decode Base64URL string */
function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  const jsonStr = decodeURIComponent(escape(atob(base64)))
  return JSON.parse(jsonStr)
}

/**
 * Generate a JWT-shaped token string.
 * Structure: Header.Payload.Signature
 */
function createMockJwt(user) {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: now,
    exp: now + 24 * 60 * 60, // 24 hours expiry
    iss: 'smartroad-ai-auth',
  }
  const encodedHeader = base64UrlEncode(header)
  const encodedPayload = base64UrlEncode(payload)
  const mockSignature = 'mock_sig_' + Math.random().toString(36).substring(2, 12)

  return `${encodedHeader}.${encodedPayload}.${mockSignature}`
}

/**
 * Get all available mock users (built-in demo users + any registered in localStorage)
 */
function getAllUsers() {
  let customUsers = []
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY)
    if (raw) customUsers = JSON.parse(raw)
  } catch (err) {
    console.error('Failed to parse registered users from localStorage', err)
  }
  return [...mockUsers, ...customUsers]
}

/**
 * Persist newly registered user to localStorage demo store
 */
function saveCustomUser(user) {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY)
    const existing = raw ? JSON.parse(raw) : []
    existing.push(user)
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(existing))
  } catch (err) {
    console.error('Failed to save user to localStorage', err)
  }
}

export const authService = {
  /**
   * Login with email and password.
   * Simulates FastAPI JWT authentication endpoint (e.g. POST /api/v1/auth/token).
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ user: object, token: string }>}
   */
  async login(email, password) {
    await delay(350)

    const normalizedEmail = (email || '').trim().toLowerCase()
    const trimmedPassword = (password || '').trim()
    const users = getAllUsers()

    let foundUser = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail,
    )

    // Convenient alias fallback for demo engineer account
    if (!foundUser && (normalizedEmail === 'engineer@example.com' || normalizedEmail === 'engineer@smartroad.ai')) {
      foundUser = users.find((u) => u.role === USER_ROLES.ENGINEER)
    }

    if (!foundUser) {
      throw new Error('No account found with this email address. Please check your spelling or register.')
    }

    // Accept both 'eng123' and 'engineer123' for the demo engineer account
    const isEngineerPasswordMatch =
      foundUser.role === USER_ROLES.ENGINEER &&
      (trimmedPassword === 'eng123' || trimmedPassword === 'engineer123' || trimmedPassword === foundUser.password)

    const isPasswordValid = isEngineerPasswordMatch || foundUser.password === trimmedPassword

    if (!isPasswordValid) {
      throw new Error('Invalid password. Please check your credentials and try again.')
    }

    // Clone user without password
    const { password: _pwd, ...safeUser } = foundUser
    const token = createMockJwt(safeUser)

    // Store in browser storage
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser))

    return { user: safeUser, token }
  },

  /**
   * Register a new user with chosen role.
   *
   * @param {object} params
   * @param {string} params.name
   * @param {string} params.email
   * @param {string} params.password
   * @param {string} params.role - 'citizen' | 'admin' | 'engineer'
   * @param {string} [params.department]
   * @param {string} [params.zone]
   * @returns {Promise<{ user: object, token: string }>}
   */
  async register({ name, email, password, role = USER_ROLES.CITIZEN, department = null, zone = null }) {
    await delay(650)

    const normalizedEmail = (email || '').trim().toLowerCase()
    const trimmedName = (name || '').trim()

    if (!trimmedName) {
      throw new Error('Full name is required.')
    }
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw new Error('A valid email address is required.')
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.')
    }

    const users = getAllUsers()
    const exists = users.some((u) => u.email.toLowerCase() === normalizedEmail)
    if (exists) {
      throw new Error('An account with this email address already exists. Please log in instead.')
    }

    // Generate initials
    const parts = trimmedName.split(' ')
    const initials = parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : trimmedName.substring(0, 2).toUpperCase()

    const newUser = {
      id: `usr-${role.substring(0, 3)}-${Date.now().toString().slice(-4)}`,
      name: trimmedName,
      email: normalizedEmail,
      password, // Mock-only demo storage
      role,
      department: department || (role === USER_ROLES.ADMIN ? 'Municipal Administration' : role === USER_ROLES.ENGINEER ? 'Field Works Department' : null),
      title: role === USER_ROLES.ADMIN ? 'System Administrator' : role === USER_ROLES.ENGINEER ? 'Field Repair Officer' : 'Verified Resident',
      avatarInitials: initials,
      zone: zone || (role === USER_ROLES.CITIZEN ? 'General Public' : 'Assigned Ward'),
    }

    saveCustomUser(newUser)

    const { password: _pwd, ...safeUser } = newUser
    const token = createMockJwt(safeUser)

    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser))

    return { user: safeUser, token }
  },

  /**
   * Request password reset instructions.
   *
   * @param {string} email
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async forgotPassword(email) {
    await delay(500)

    const normalizedEmail = (email || '').trim().toLowerCase()
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw new Error('Please enter a valid email address.')
    }

    return {
      success: true,
      message: `Password reset instructions have been sent to ${normalizedEmail}. For demo testing, you can use the pre-configured demo account passwords.`,
    }
  },

  /**
   * Clear authentication state and tokens.
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  /**
   * Get active JWT token.
   *
   * @returns {string | null}
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },

  /**
   * Get currently logged in user profile.
   *
   * @returns {object | null}
   */
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  /**
   * Check if token is present and not expired.
   *
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = this.getToken()
    if (!token) return false

    try {
      const parts = token.split('.')
      if (parts.length < 2) return false
      const payload = base64UrlDecode(parts[1])
      const now = Math.floor(Date.now() / 1000)
      return payload.exp ? payload.exp > now : true
    } catch {
      return false
    }
  },
}

export default authService
