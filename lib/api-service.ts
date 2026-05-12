import type {
  Company,
  DashboardStats,
  Interview,
  JobApplication,
  JobPosting,
  Notification,
  PaginatedResponse,
  PlacementDrive,
  StudentProfile,
} from "@/lib/types"

const API_BASE_URL = ""

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
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

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
  _retry?: boolean
}

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("placeit_access_token")
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("placeit_refresh_token")
  }

  private saveTokens(accessToken: string, refreshToken: string) {
    if (typeof window === "undefined") return
    localStorage.setItem("placeit_access_token", accessToken)
    localStorage.setItem("placeit_refresh_token", refreshToken)
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) return false

    try {
      const response = await fetch(this.buildUrl("/api/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) return false

      const result = await response.json()
      const payload = result?.data ?? result
      if (!payload?.accessToken || !payload?.refreshToken) return false

      this.saveTokens(payload.accessToken, payload.refreshToken)
      return true
    } catch {
      return false
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const baseUrl = this.baseUrl || (typeof window !== "undefined" ? window.location.origin : "")
    const url = new URL(`${baseUrl}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    return url.toString()
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { params, _retry, ...fetchOptions } = options
    const url = this.buildUrl(endpoint, params)

    console.log("[v0] API Request:", fetchOptions.method || "GET", url)

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    }

    const token = this.getToken()
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      })

      console.log("[v0] API Response Status:", response.status, response.statusText)

      const text = await response.text()
      console.log("[v0] API Response Body:", text.substring(0, 500))

      let data: Record<string, unknown> = {}

      if (text) {
        try {
          data = JSON.parse(text)
        } catch {
          console.error("[v0] JSON parse failed:", text.substring(0, 200))
          return {
            success: false,
            error: response.ok ? "Invalid JSON response" : text || `HTTP ${response.status}`,
          }
        }
      }

      if (!response.ok) {
        if (response.status === 401 && !_retry && !endpoint.startsWith("/api/auth/")) {
          const refreshed = await this.refreshAccessToken()
          if (refreshed) {
            return this.request<T>(endpoint, { ...options, _retry: true })
          }
        }

        console.error("[v0] API Error Response:", response.status, response.statusText, data)
        return {
          success: false,
          error: (data.error as string) || (data.message as string) || `HTTP ${response.status}`,
        }
      }

      let payload: T;
      if (data.data !== undefined) {
        if (data.total !== undefined || data.page !== undefined) {
          // If it has pagination metadata, return the whole data object so the caller gets data, total, page, etc.
          payload = data as unknown as T;
        } else {
          payload = data.data as T;
        }
      } else {
        payload = data as T;
      }

      console.log("[v0] API Success FIXED payload:", payload)
      return {
        success: true,
        data: payload,
        message: data.message as string | undefined,
      }
    } catch (error) {
      console.error("[v0] API Network Error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET", params })
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  async uploadFile<T>(endpoint: string, file: File, fieldName = "file"): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append(fieldName, file)

    const token = this.getToken()
    const headers: HeadersInit = {}
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers,
        body: formData,
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
          }
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error: (data.error as string) || (data.message as string) || `HTTP ${response.status}`,
        }
      }

      return {
        success: true,
        data: (data.data ?? data) as T,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      }
    }
  }
}

export const apiService = new ApiService(API_BASE_URL)

export const authApi = {
  login: (email: string, password: string) =>
    apiService.post<AuthResponseData>("/api/auth/login", { email, password }),
  register: (data: { name: string; email: string; password: string; role: string; phone?: string }) =>
    apiService.post("/api/auth/register", data),
  verifyOtp: (email: string, otp: string) =>
    apiService.post<AuthResponseData>("/api/auth/verify-otp", { email, otp }),
  forgotPassword: (email: string) =>
    apiService.post("/api/auth/forgot-password", { email }),
  resetPassword: (email: string, otp: string, newPassword: string) =>
    apiService.post("/api/auth/reset-password", { email, otp, newPassword }),
  logout: (refreshToken: string) =>
    apiService.post("/api/auth/logout", { refreshToken }),
  me: () => apiService.get("/api/auth/me"),
  refresh: (refreshToken: string) =>
    apiService.post<AuthResponseData>("/api/auth/refresh", { refreshToken }),
}

export const jobsApi = {
  list: (params?: { page?: number; limit?: number; search?: string; type?: string; status?: string; companyId?: string }) =>
    apiService.get<PaginatedResponse<JobPosting>>("/api/jobs", params),
  get: (id: string) => apiService.get<JobPosting>(`/api/jobs/${id}`),
  create: (data: unknown) => apiService.post<JobPosting>("/api/jobs", data),
  update: (id: string, data: unknown) => apiService.put<JobPosting>(`/api/jobs/${id}`, data),
  delete: (id: string) => apiService.delete<void>(`/api/jobs/${id}`),
}

export const applicationsApi = {
  list: (params?: { page?: number; limit?: number; status?: string; jobId?: string; companyId?: string }) =>
    apiService.get<PaginatedResponse<JobApplication>>("/api/applications", params),
  get: (id: string) => apiService.get<JobApplication>(`/api/applications/${id}`),
  create: (data: { jobId: string; coverLetter?: string }) =>
    apiService.post<JobApplication>("/api/applications", data),
  updateStatus: (id: string, status: string, feedback?: string) =>
    apiService.patch<JobApplication>(`/api/applications/${id}/status`, { status, feedback }),
  withdraw: (id: string) => apiService.delete<void>(`/api/applications/${id}`),
}

export const interviewsApi = {
  list: (params?: { page?: number; limit?: number; status?: string; upcoming?: boolean; companyId?: string }) =>
    apiService.get<PaginatedResponse<Interview>>("/api/interviews", params),
  get: (id: string) => apiService.get<Interview>(`/api/interviews/${id}`),
  create: (data: unknown) => apiService.post<Interview>("/api/interviews", data),
  update: (id: string, data: unknown) => apiService.put<Interview>(`/api/interviews/${id}`, data),
  cancel: (id: string, reason?: string) =>
    apiService.patch<Interview>(`/api/interviews/${id}/cancel`, { reason }),
  addFeedback: (id: string, feedback: string, rating?: number) =>
    apiService.patch<Interview>(`/api/interviews/${id}/feedback`, { feedback, rating }),
}

export const drivesApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    apiService.get<PaginatedResponse<PlacementDrive>>("/api/drives", params),
  get: (id: string) => apiService.get<PlacementDrive>(`/api/drives/${id}`),
  create: (data: unknown) => apiService.post<PlacementDrive>("/api/drives", data),
  update: (id: string, data: unknown) => apiService.put<PlacementDrive>(`/api/drives/${id}`, data),
  updateStatus: (id: string, status: string) =>
    apiService.patch<PlacementDrive>(`/api/drives/${id}/status`, { status }),
  delete: (id: string) => apiService.delete<void>(`/api/drives/${id}`),
}

export const companiesApi = {
  list: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    apiService.get<PaginatedResponse<Company>>("/api/companies", params),
  get: (id: string) => apiService.get<Company>(`/api/companies/${id}`),
  create: (data: unknown) => apiService.post<Company>("/api/companies", data),
  update: (id: string, data: unknown) => apiService.put<Company>(`/api/companies/${id}`, data),
  updateStatus: (id: string, status: string) =>
    apiService.patch<Company>(`/api/companies/${id}/status`, { status }),
  delete: (id: string) => apiService.delete<void>(`/api/companies/${id}`),
}

export const studentsApi = {
  list: (params?: { page?: number; limit?: number; search?: string; branch?: string; status?: string }) =>
    apiService.get<PaginatedResponse<StudentProfile>>("/api/students", params),
  get: (id: string) => apiService.get<StudentProfile>(`/api/students/${id}`),
  getProfile: () => apiService.get<StudentProfile>("/api/students/profile"),
  updateProfile: (data: unknown) => apiService.put<StudentProfile>("/api/students/profile", data),
  uploadResume: (file: File) => apiService.uploadFile<{ resumeUrl?: string }>("/api/students/resume", file, "resume"),
}

export const analyticsApi = {
  dashboard: () => apiService.get<DashboardStats>("/api/analytics/dashboard"),
  placements: (params?: { year?: number; branch?: string }) =>
    apiService.get("/api/analytics/placements", params),
  companies: () => apiService.get("/api/analytics/companies"),
}

export const notificationsApi = {
  list: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    apiService.get<PaginatedResponse<Notification>>("/api/notifications", params),
  markAsRead: (id: string) => apiService.patch<Notification>(`/api/notifications/${id}/read`, {}),
  markAllAsRead: () => apiService.patch<void>("/api/notifications/read-all", {}),
  getUnreadCount: () => apiService.get<{ count: number }>("/api/notifications/unread-count"),
}
