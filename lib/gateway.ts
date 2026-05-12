const GATEWAY_URL = process.env.BACKEND_URL || process.env.BACKEND_GATEWAY_URL || "http://localhost:8080"

interface GatewayRequestOptions {
  method?: string
  body?: unknown
  headers?: Record<string, string>
  token?: string
}

interface GatewayResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  status: number
}

export async function gatewayRequest<T>(
  endpoint: string,
  options: GatewayRequestOptions = {}
): Promise<GatewayResponse<T>> {
  const { method = "GET", body, headers = {}, token } = options

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  }

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`
    // Extract user identity headers from JWT for backend services
    const userHeaders = getUserHeadersFromToken(token)
    Object.assign(requestHeaders, userHeaders)
  }

  const fullUrl = `${GATEWAY_URL}${endpoint}`
  console.log("[v0] Gateway Request:", method, fullUrl)

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    })

    console.log("[v0] Gateway Response Status:", response.status, response.statusText)

    const text = await response.text()
    console.log("[v0] Gateway Response Body:", text.substring(0, 500))

    let data: Record<string, unknown> = {}
    if (text) {
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error("[v0] Gateway JSON parse error:", parseError)
        return {
          success: false,
          error: `Invalid JSON response: ${text.substring(0, 100)}`,
          status: response.status,
        }
      }
    }

    if (!response.ok) {
      console.error("[v0] Gateway Error:", data)
      const directResponse = await directServiceFallback<T>(endpoint, {
        method,
        body,
        headers,
        token,
      }, response.status, (data.message as string) || (data.error as string))

      if (directResponse) return directResponse

      return {
        success: false,
        error: (data.message as string) || (data.error as string) || `HTTP ${response.status}`,
        status: response.status,
      }
    }

    const payload = (data.data !== undefined ? data.data : data) as T
    console.log("[v0] Gateway Success, payload:", JSON.stringify(payload).substring(0, 200))

    return {
      success: true,
      data: payload,
      status: response.status,
    }
  } catch (error) {
    console.error("[v0] Gateway Network Error:", error)
    
    // Try direct fallback if gateway is down
    const directResponse = await directServiceFallback<T>(endpoint, {
      method,
      body,
      headers,
      token,
    }, 503, "Gateway connection failed")

    if (directResponse) return directResponse

    return {
      success: false,
      error: error instanceof Error ? error.message : "Gateway connection failed",
      status: 500,
    }
  }
}

async function directServiceFallback<T>(
  endpoint: string,
  options: GatewayRequestOptions,
  gatewayStatus: number,
  gatewayError?: string
): Promise<GatewayResponse<T> | null> {
  if (!shouldUseDirectFallback(gatewayStatus, gatewayError)) return null

  const serviceUrl = getDirectServiceUrl(endpoint)
  if (!serviceUrl) return null

  const { method = "GET", body, headers = {}, token } = options
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  }

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`
    const userHeaders = getUserHeadersFromToken(token)
    Object.assign(requestHeaders, userHeaders)
  }

  console.log("[v0] Direct Service Fallback:", method, serviceUrl)

  try {
    const response = await fetch(serviceUrl, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    })

    const text = await response.text()
    let data: Record<string, unknown> = {}
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        return {
          success: false,
          error: response.ok ? "Invalid JSON response" : text || `HTTP ${response.status}`,
          status: response.status,
        }
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: (data.message as string) || (data.error as string) || `HTTP ${response.status}`,
        status: response.status,
      }
    }

    return {
      success: true,
      data: (data.data !== undefined ? data.data : data) as T,
      status: response.status,
    }
  } catch (error) {
    console.error("[v0] Direct Service Fallback Error:", error)
    return null
  }
}

function shouldUseDirectFallback(status: number, error?: string) {
  return status === 401 || status === 404 || status === 500 || status === 503 || !!error?.includes("No static resource")
}

function getDirectServiceUrl(endpoint: string) {
  const directBaseUrls = {
    auth: process.env.AUTH_SERVICE_URL || "http://localhost:8081",
    students: process.env.STUDENT_SERVICE_URL || "http://localhost:8082",
    companies: process.env.COMPANY_SERVICE_URL || "http://localhost:8083",
    placements: process.env.PLACEMENT_SERVICE_URL || "http://localhost:8084",
    notifications: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:8085",
  }

  if (endpoint.startsWith("/api/auth/")) return `${directBaseUrls.auth}${endpoint.replace(/^\/api/, "")}`
  if (endpoint.startsWith("/api/students")) return `${directBaseUrls.students}${endpoint.replace(/^\/api/, "")}`
  if (endpoint.startsWith("/api/companies")) return `${directBaseUrls.companies}${endpoint.replace(/^\/api/, "")}`
  if (endpoint.startsWith("/api/placements")) return `${directBaseUrls.placements}${endpoint.replace(/^\/api/, "")}`
  if (endpoint.startsWith("/api/jobs")) return `${directBaseUrls.placements}${endpoint.replace(/^\/api\/jobs/, "/placements/jobs")}`
  if (endpoint.startsWith("/api/applications")) return `${directBaseUrls.placements}${endpoint.replace(/^\/api\/applications/, "/placements/applications")}`
  if (endpoint.startsWith("/api/interviews")) return `${directBaseUrls.placements}${endpoint.replace(/^\/api\/interviews/, "/placements/interviews")}`
  if (endpoint.startsWith("/api/drives")) return `${directBaseUrls.placements}${endpoint.replace(/^\/api\/drives/, "/placements/drives")}`
  if (endpoint.startsWith("/api/notifications")) return `${directBaseUrls.notifications}${endpoint.replace(/^\/api/, "")}`

  return null
}

function getUserHeadersFromToken(token: string) {
  try {
    const [, payload] = token.split(".")
    if (!payload) return {}

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = JSON.parse(atob(normalizedPayload)) as {
      userId?: string | number
      id?: string | number
      sub?: string
      email?: string
      role?: string
    }

    const headers: Record<string, string> = {}
    
    // Some JWTs use 'sub' or 'id' instead of 'userId'
    const userId = decoded.userId || decoded.id || ""
    const email = decoded.email || decoded.sub || ""
    const role = decoded.role || ""

    if (userId) headers["X-User-Id"] = String(userId)
    if (email) headers["X-User-Email"] = String(email)
    if (role) headers["X-User-Role"] = String(role)
    
    return headers
  } catch {
    return {}
  }
}

export const BACKEND_ROUTES = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    verifyOtp: "/api/auth/verify-otp",
    resendOtp: "/api/auth/resend-otp",
    forgotPassword: "/api/auth/forgot-password",
    resetPassword: "/api/auth/reset-password",
    refresh: "/api/auth/refresh",
    logout: "/api/auth/logout",
    me: "/api/auth/me",
  },
  students: {
    list: "/api/students",
    get: (id: string) => `/api/students/${id}`,
    profile: "/api/students/profile",
    updateProfile: "/api/students/profile",
    uploadResume: "/api/students/resume",
    education: "/api/students/education",
    experience: "/api/students/experience",
    certifications: "/api/students/certifications",
  },
  companies: {
    list: "/api/companies",
    get: (id: string) => `/api/companies/${id}`,
    create: "/api/companies",
    update: (id: string) => `/api/companies/${id}`,
    delete: `/api/companies`,
    recruiters: (id: string) => `/api/companies/${id}/recruiters`,
  },
  placements: {
    drives: {
      list: "/api/placements/drives",
      get: (id: string) => `/api/placements/drives/${id}`,
      create: "/api/placements/drives",
      update: (id: string) => `/api/placements/drives/${id}`,
      delete: (id: string) => `/api/placements/drives/${id}`,
      updateStatus: (id: string) => `/api/placements/drives/${id}/status`,
    },
    jobs: {
      list: "/api/placements/jobs",
      get: (id: string) => `/api/placements/jobs/${id}`,
      create: "/api/placements/jobs",
      update: (id: string) => `/api/placements/jobs/${id}`,
      delete: (id: string) => `/api/placements/jobs/${id}`,
    },
    applications: {
      list: "/api/placements/applications/student",
      get: (id: string) => `/api/placements/applications/${id}`,
      create: "/api/placements/applications/apply",
      updateStatus: (id: string) => `/api/placements/applications/${id}/status`,
      withdraw: (id: string) => `/api/placements/applications/${id}`,
      byJob: (jobId: string) => `/api/placements/applications/job/${jobId}`,
    },
    interviews: {
      list: "/api/placements/interviews",
      get: (id: string) => `/api/placements/interviews/${id}`,
      create: "/api/placements/interviews",
      update: (id: string) => `/api/placements/interviews/${id}`,
      cancel: (id: string) => `/api/placements/interviews/${id}/cancel`,
      feedback: (id: string) => `/api/placements/interviews/${id}/feedback`,
    },
    analytics: {
      dashboard: "/api/placements/analytics/dashboard",
      placements: "/api/placements/analytics/placements",
    },
  },
  notifications: {
    list: "/api/notifications",
    send: "/api/notifications/send",
    markRead: (id: string) => `/api/notifications/${id}/read`,
    markAllRead: "/api/notifications/read-all",
    unreadCount: "/api/notifications/unread-count",
  },
}

export function getAuthToken(request: Request): string | null {
  // Try to get from Authorization header first
  const authHeader = request.headers.get("Authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }
  
  // Try to get from cookies
  const cookieHeader = request.headers.get("cookie")
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=")
      acc[key] = decodeURIComponent(value || "")
      return acc
    }, {} as Record<string, string>)
    
    // Check for auth token in cookies
    if (cookies["placeit_access_token"]) {
      return cookies["placeit_access_token"]
    }
    if (cookies["auth_token"]) {
      return cookies["auth_token"]
    }
  }
  
  return null
}
