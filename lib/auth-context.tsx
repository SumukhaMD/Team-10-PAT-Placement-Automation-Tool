"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { apiService } from "./api-service"

export type UserRole = "STUDENT" | "RECRUITER" | "ADMIN" | "TPO"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  avatar?: string
  emailVerified: boolean
  createdAt: string
}

interface AuthResponseData {
  userId: string | number
  email: string
  name: string
  role: string
  accessToken: string
  refreshToken: string
  requiresOtp?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; requiresOtp?: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  refreshToken: () => Promise<boolean>
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: UserRole
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = "placeit_access_token"
const REFRESH_TOKEN_KEY = "placeit_refresh_token"
const USER_KEY = "placeit_user"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const routerRef = useRef(router)

  useEffect(() => { routerRef.current = router }, [router])
  useEffect(() => { setIsMounted(true) }, [])

  const saveTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }

  const clearTokens = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  const getAccessToken = () => localStorage.getItem(TOKEN_KEY)
  const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY)

  const getUserFromAccessToken = (token: string): User | null => {
    try {
      const [, payload] = token.split(".")
      if (!payload) return null

      const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/")
      const decoded = JSON.parse(atob(normalizedPayload)) as {
        userId?: string | number
        email?: string
        name?: string
        role?: string
        exp?: number
      }

      if (decoded.exp && decoded.exp * 1000 < Date.now()) return null
      if (!decoded.userId || !decoded.email || !decoded.role) return null

      return {
        id: String(decoded.userId),
        email: decoded.email,
        name: decoded.name || decoded.email.split("@")[0],
        role: validateRole(decoded.role),
        emailVerified: true,
        createdAt: new Date().toISOString(),
      }
    } catch {
      return null
    }
  }

  const validateRole = (role: string): UserRole => {
    const validRoles: UserRole[] = ["STUDENT", "RECRUITER", "ADMIN", "TPO"]
    return validRoles.includes(role as UserRole) ? (role as UserRole) : "STUDENT"
  }

  const createUserFromAuthData = (data: AuthResponseData, fallbackEmail?: string): User => {
    const { userId, email: userEmail, name, role } = data
    if (!userId || !userEmail || !role) {
      throw new Error("Invalid user data from server")
    }
    return {
      id: String(userId),
      email: userEmail,
      name: name || (fallbackEmail || userEmail).split("@")[0],
      role: validateRole(role),
      emailVerified: true,
      createdAt: new Date().toISOString(),
    }
  }

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const refresh = getRefreshToken()
    if (!refresh) return false

    try {
      const response = await apiService.post<AuthResponseData>("/api/auth/refresh", { refreshToken: refresh })

      if (response.success && response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data

        if (!accessToken || !newRefreshToken) {
          clearTokens()
          setUser(null)
          return false
        }

        saveTokens(accessToken, newRefreshToken)

        const userData = createUserFromAuthData(response.data)
        setUser(userData)
        localStorage.setItem(USER_KEY, JSON.stringify(userData))

        return true
      }

      return false
    } catch {
      clearTokens()
      setUser(null)
      return false
    }
  }, [])

  const fetchCurrentUser = useCallback(async () => {
    const token = getAccessToken()

    if (!token) {
      setIsLoading(false)
      return
    }

    const tokenUser = getUserFromAccessToken(token)

    if (tokenUser) {
      setUser(tokenUser)
      localStorage.setItem(USER_KEY, JSON.stringify(tokenUser))
      setIsLoading(false)
      return
    }

    try {
      const refreshed = await refreshToken()

      if (!refreshed) {
        clearTokens()
        setUser(null)
      }
    } catch (error) {
      console.error("[v0] Error fetching current user:", error)
      clearTokens()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [refreshToken])

  useEffect(() => {
    const cachedUser = localStorage.getItem(USER_KEY)

    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser))
      } catch {
        /* invalid cache */
      }
    }

    fetchCurrentUser()
  }, [fetchCurrentUser])

  useEffect(() => {
    const interval = setInterval(() => {
      if (getAccessToken()) refreshToken()
    }, 13 * 60 * 1000)

    return () => clearInterval(interval)
  }, [refreshToken])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.post<AuthResponseData>("/api/auth/login", { email, password })

      console.log("[v0] Login response.success:", response.success)
      console.log("[v0] Login response.data:", response.data)

      if (!response.success) {
        return { success: false, error: response.error || response.message || "Login failed" }
      }

      if (!response.data) {
        return { success: false, error: "No data received from server" }
      }

      const { accessToken, refreshToken, requiresOtp } = response.data

      console.log("[v0] accessToken present:", !!accessToken)
      console.log("[v0] refreshToken present:", !!refreshToken)

      if (requiresOtp) {
        return { success: true, requiresOtp: true }
      }

      if (!accessToken || !refreshToken) {
        console.error("[v0] TOKENS MISSING. Full response.data:", response.data)
        return { success: false, error: "Invalid response data from server" }
      }

      const userData = createUserFromAuthData(response.data, email)

      saveTokens(accessToken, refreshToken)
      setUser(userData)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" }
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await apiService.post("/api/auth/register", data)

      if (response.success) return { success: true }

      return { success: false, error: response.error || "Registration failed" }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Registration failed" }
    }
  }

  const logout = async () => {
    try {
      const refreshTokenValue = getRefreshToken()

      if (refreshTokenValue) {
        await apiService.post("/api/auth/logout", { refreshToken: refreshTokenValue })
      }
    } finally {
      clearTokens()
      setUser(null)

      if (isMounted) routerRef.current.push("/auth/login")
    }
  }

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const response = await apiService.post<{ message?: string }>("/api/auth/verify-otp", { email, otp })

      if (!response.success) {
        return { success: false, error: response.error || response.message || "OTP verification failed" }
      }

      // verify-otp only marks the email as verified — no tokens are issued.
      // The user must log in separately after verification.
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" }
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      const response = await apiService.post<{ message: string }>("/api/auth/forgot-password", { email })

      if (!response.success) {
        return { success: false, error: response.error || response.message || "Failed to send reset email" }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to send reset email" }
    }
  }

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    try {
      const response = await apiService.post<{ message: string }>("/api/auth/reset-password", {
        email,
        otp,
        newPassword,
      })

      if (!response.success) {
        return { success: false, error: response.error || response.message || "Password reset failed" }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Password reset failed" }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        verifyOtp,
        forgotPassword,
        resetPassword,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider")

  return context
}

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    } else if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.push("/unauthorized")
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, isMounted])

  return { user, isLoading, isAuthenticated }
}
