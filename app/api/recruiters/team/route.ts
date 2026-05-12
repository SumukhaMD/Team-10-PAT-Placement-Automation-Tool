import { NextRequest, NextResponse } from "next/server"
import { gatewayRequest, getAuthToken } from "@/lib/gateway"

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request)
    const { searchParams } = new URL(request.url)

    const params = new URLSearchParams()
    const page = searchParams.get("page")
    const limit = searchParams.get("limit")

    if (page) params.append("page", page)
    if (limit) params.append("size", limit)

    const endpoint = `/api/companies/recruiters?${params.toString()}`

    const response = await gatewayRequest(endpoint, {
      method: "GET",
      token: token || undefined,
    })

    if (!response.success) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        page: page ? parseInt(page) : 0,
        limit: limit ? parseInt(limit) : 20,
        warning: response.error || "Recruiter team endpoint is not available in the backend",
      })
    }

    const data = response.data

    return NextResponse.json({
      success: true,
      data: Array.isArray(data) ? data : (data as Record<string, unknown>)?.content || [],
      total: Array.isArray(data) ? data.length : (data as Record<string, unknown>)?.totalElements || 0,
      page: page ? parseInt(page) : 0,
      limit: limit ? parseInt(limit) : 20,
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      warning: error instanceof Error ? error.message : "Failed to fetch team members",
    })
  }
}
