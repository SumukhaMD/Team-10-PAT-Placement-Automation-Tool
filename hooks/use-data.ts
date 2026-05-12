"use client"

import useSWR from "swr"
import { apiService } from "@/lib/api-service"
import { useAuth } from "@/lib/auth-context"
import type {
  JobPosting,
  JobApplication,
  Interview,
  PlacementDrive,
  StudentProfile,
  Company,
  DashboardStats,
  Notification,
  PaginatedResponse,
} from "@/lib/types"

// Generic fetcher for SWR
const fetcher = async <T>(url: string): Promise<T> => {
  const response = await apiService.get<T>(url)
  if (!response.success) {
    throw new Error(response.error || "Failed to fetch data")
  }
  return response.data as T
}

// Jobs hooks
export function useJobs(params?: {
  page?: number
  limit?: number
  search?: string
  type?: string
  status?: string
  companyId?: string
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.search) searchParams.set("search", params.search)
  if (params?.type) searchParams.set("type", params.type)
  if (params?.status) searchParams.set("status", params.status)
  if (params?.companyId) searchParams.set("companyId", params.companyId)

  const queryString = searchParams.toString()
  const url = `/api/jobs${queryString ? `?${queryString}` : ""}`

  return useSWR<PaginatedResponse<JobPosting>>(
    !isLoading && isAuthenticated ? url : null,
    fetcher
  )
}

export function useJob(id: string | null) {
  const { isAuthenticated, isLoading } = useAuth()
  return useSWR<JobPosting>(
    !isLoading && isAuthenticated && id ? `/api/jobs/${id}` : null,
    fetcher
  )
}

// Applications hooks
export function useApplications(params?: {
  page?: number
  limit?: number
  status?: string
  jobId?: string
  companyId?: string
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.status) searchParams.set("status", params.status)
  if (params?.jobId) searchParams.set("jobId", params.jobId)
  if (params?.companyId) searchParams.set("companyId", params.companyId)

  const queryString = searchParams.toString()
  const url = `/api/applications${queryString ? `?${queryString}` : ""}`

  return useSWR<PaginatedResponse<JobApplication>>(
    !isLoading && isAuthenticated ? url : null,
    fetcher
  )
}

export function useApplication(id: string | null) {
  const { isAuthenticated, isLoading } = useAuth()
  return useSWR<JobApplication>(
    !isLoading && isAuthenticated && id ? `/api/applications/${id}` : null,
    fetcher
  )
}

// Interviews hooks
export function useInterviews(params?: {
  page?: number
  limit?: number
  status?: string
  upcoming?: boolean
  companyId?: string
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.status) searchParams.set("status", params.status)
  if (params?.upcoming !== undefined) searchParams.set("upcoming", String(params.upcoming))
  if (params?.companyId) searchParams.set("companyId", params.companyId)

  const queryString = searchParams.toString()
  const url = `/api/interviews${queryString ? `?${queryString}` : ""}`

  return useSWR<PaginatedResponse<Interview>>(
    !isLoading && isAuthenticated ? url : null,
    fetcher
  )
}

// Drives hooks
export function useDrives(params?: {
  page?: number
  limit?: number
  status?: string
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.status) searchParams.set("status", params.status)

  const queryString = searchParams.toString()
  const url = `/api/drives${queryString ? `?${queryString}` : ""}`

  return useSWR<PaginatedResponse<PlacementDrive>>(
    !isLoading && isAuthenticated ? url : null,
    fetcher
  )
}

export function useDrive(id: string | null) {
  const { isAuthenticated, isLoading } = useAuth()
  return useSWR<PlacementDrive>(
    !isLoading && isAuthenticated && id ? `/api/drives/${id}` : null,
    fetcher
  )
}

// Companies hooks
export function useCompanies(params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.search) searchParams.set("search", params.search)
  if (params?.status) searchParams.set("status", params.status)

  const queryString = searchParams.toString()
  const url = `/api/companies${queryString ? `?${queryString}` : ""}`

  return useSWR<PaginatedResponse<Company>>(
    !isLoading && isAuthenticated ? url : null,
    fetcher
  )
}

export function useCompany(id: string | null) {
  const { isAuthenticated, isLoading } = useAuth()
  return useSWR<Company>(
    !isLoading && isAuthenticated && id ? `/api/companies/${id}` : null,
    fetcher
  )
}

// Students hooks
export function useStudents(params?: {
  page?: number
  limit?: number
  search?: string
  branch?: string
  status?: string
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.search) searchParams.set("search", params.search)
  if (params?.branch) searchParams.set("branch", params.branch)
  if (params?.status) searchParams.set("status", params.status)

  const queryString = searchParams.toString()
  const url = `/api/students${queryString ? `?${queryString}` : ""}`

  return useSWR<PaginatedResponse<StudentProfile>>(
    !isLoading && isAuthenticated ? url : null,
    fetcher
  )
}

export function useStudentProfile() {
  const { isAuthenticated, isLoading } = useAuth()
  return useSWR<StudentProfile>(
    !isLoading && isAuthenticated ? "/api/students/profile" : null,
    fetcher
  )
}

// Analytics hooks
export function useDashboardStats() {
  const { isAuthenticated, isLoading } = useAuth()
  return useSWR<DashboardStats>(
    !isLoading && isAuthenticated ? "/api/analytics/dashboard" : null,
    fetcher
  )
}

// Notifications hooks
export function useNotifications(params?: {
  page?: number
  limit?: number
  unreadOnly?: boolean
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.unreadOnly !== undefined) searchParams.set("unreadOnly", String(params.unreadOnly))

  const queryString = searchParams.toString()
  const url = `/api/notifications${queryString ? `?${queryString}` : ""}`

  return useSWR<PaginatedResponse<Notification>>(
    !isLoading && isAuthenticated ? url : null,
    fetcher
  )
}

export function useUnreadNotificationCount() {
  const { isAuthenticated, isLoading } = useAuth()
  return useSWR<{ count: number }>(
    !isLoading && isAuthenticated ? "/api/notifications/unread-count" : null,
    fetcher
  )
}
