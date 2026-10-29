/**
 * AuthContext.jsx — React Context providing global authentication state.
 *
 * Exposes:
 *  - user, token, isAuthenticated, isLoading
 *  - login(email, password)
 *  - register({ name, email, password, role })
 *  - logout()
 *  - forgotPassword(email)
 *  - getRoleDashboard(role)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'
import { ROLE_DASHBOARDS, USER_ROLES } from '../constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = authService.getToken()
      const storedUser = authService.getCurrentUser()

      if (storedToken && storedUser && authService.isAuthenticated()) {
        setToken(storedToken)
        setUser(storedUser)
      } else {
        // Clear any stale/expired tokens
        authService.logout()
        setToken(null)
        setUser(null)
      }
    } catch (err) {
      console.error('Failed to restore auth session:', err)
      authService.logout()
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Login user with credentials
   */
  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password)
    setUser(result.user)
    setToken(result.token)
    return result
  }, [])

  /**
   * Register new user
   */
  const register = useCallback(async (params) => {
    const result = await authService.register(params)
    setUser(result.user)
    setToken(result.token)
    return result
  }, [])

  /**
   * Request password reset instructions
   */
  const forgotPassword = useCallback(async (email) => {
    return await authService.forgotPassword(email)
  }, [])

  /**
   * Log out active session
   */
  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    setToken(null)
  }, [])

  /**
   * Get target dashboard URL based on user role
   */
  const getRoleDashboard = useCallback((role) => {
    if (!role) return '/login'
    return ROLE_DASHBOARDS[role] || '/citizen/dashboard'
  }, [])

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    getRoleDashboard,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Custom hook to access auth state and methods
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>')
  }
  return context
}

export default AuthContext
