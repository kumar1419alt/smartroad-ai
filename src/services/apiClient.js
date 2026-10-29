/**
 * Axios HTTP client configured for the FastAPI backend.
 *
 * All service modules import this instance so that auth headers,
 * base URL, and interceptors are configured in one place.
 *
 * To enable real API calls:
 *   1. Set VITE_API_BASE_URL in your .env file.
 *   2. Remove or update the mock interceptor in each service.
 */

import axios from 'axios'
import { API_BASE_URL } from '../constants'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ─── Request interceptor — attach JWT if present ──────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rds_auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ─── Response interceptor — normalise errors ──────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with a non-2xx status
      const { status, data } = error.response
      const message = data?.detail || data?.message || `Request failed with status ${status}`
      return Promise.reject(new Error(message))
    } else if (error.request) {
      return Promise.reject(new Error('Network error — unable to reach the server.'))
    }
    return Promise.reject(error)
  },
)

export default apiClient
