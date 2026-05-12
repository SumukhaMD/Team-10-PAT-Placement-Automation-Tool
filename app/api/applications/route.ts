import { NextRequest, NextResponse } from "next/server"
import { gatewayRequest, BACKEND_ROUTES, getAuthToken } from "@/lib/gateway"
import { decodeToken } from "@/lib/auth-token"

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request)
    const { searchParams } = new URL(request.url)
    
    const params = new URLSearchParams()
    const page = searchParams.get("page")
    const limit = searchParams.get("limit")
    const status = searchParams.get("status")
    const jobId = searchParams.get("jobId")
    const companyId = searchParams.get("companyId")

    if (page) params.append("page", page)
    if (limit) params.append("size", limit) // Backend uses 'size' not 'limit'
    if (status) params.append("status", status)

    const claims = decodeToken(token)
    const role = claims?.role?.toUpperCase()

    if (jobId) {
      const endpoint = `${BACKEND_ROUTES.placements.applications.byJob(jobId)}?${params.toString()}`
      return buildApplicationsResponse(endpoint, token || undefined, page, limit)
    }

    if (companyId && role === "RECRUITER") {
      const jobsResponse = await gatewayRequest(
        `${BACKEND_ROUTES.placements.jobs.list}?companyId=${companyId}&size=100`,
        {
          method: "GET",
          token: token || undefined,
        }
      )

      if (!jobsResponse.success) {
        return NextResponse.json(
          { success: false, error: jobsResponse.error },
          { status: jobsResponse.status }
        )
      }

      const rawJobs = Array.isArray(jobsResponse.data)
        ? jobsResponse.data
        : ((jobsResponse.data as Record<string, unknown>)?.content as unknown[]) || []

      const jobIds = rawJobs
        .map((job) => (job as Record<string, unknown>)?.id)
        .filter((value): value is string | number => value !== undefined && value !== null)

      const applicationResults = await Promise.all(
        jobIds.map((id) =>
          gatewayRequest(BACKEND_ROUTES.placements.applications.byJob(String(id)), {
            method: "GET",
            token: token || undefined,
          })
        )
      )

      const failedRequest = applicationResults.find((result) => !result.success)
      if (failedRequest) {
        return NextResponse.json(
          { success: false, error: failedRequest.error },
          { status: failedRequest.status }
        )
      }

      const applications = applicationResults.flatMap((result) => {
        if (!result.data) return []
        return Array.isArray(result.data)
          ? result.data
          : ((result.data as Record<string, unknown>)?.content as unknown[]) || []
      })

      return NextResponse.json({
        success: true,
        data: applications,
        total: applications.length,
        page: page ? parseInt(page) : 0,
        limit: limit ? parseInt(limit) : 20,
      })
    }

    const endpoint = `${BACKEND_ROUTES.placements.applications.list}?${params.toString()}`
    return buildApplicationsResponse(endpoint, token || undefined, page, limit)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch applications" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request)

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { jobId, coverLetter } = body

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Job ID is required" },
        { status: 400 }
      )
    }

    const response = await gatewayRequest(
      `${BACKEND_ROUTES.placements.applications.create}?jobId=${encodeURIComponent(String(jobId))}`,
      {
      method: "POST",
      body: { coverLetter },
      token,
      }
    )

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: "Application submitted successfully",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to submit application" },
      { status: 500 }
    )
  }
}

async function buildApplicationsResponse(
  endpoint: string,
  token: string | undefined,
  page: string | null,
  limit: string | null
) {
  const response = await gatewayRequest(endpoint, {
    method: "GET",
    token,
  })

  if (!response.success) {
    return NextResponse.json(
      { success: false, error: response.error },
      { status: response.status }
    )
  }

  const data = response.data
  return NextResponse.json({
    success: true,
    data: Array.isArray(data) ? data : (data as Record<string, unknown>)?.content || [],
    total: Array.isArray(data) ? data.length : (data as Record<string, unknown>)?.totalElements || 0,
    page: page ? parseInt(page) : 0,
    limit: limit ? parseInt(limit) : 20,
  })
}
