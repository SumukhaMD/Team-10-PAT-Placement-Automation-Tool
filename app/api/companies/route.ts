import { NextRequest, NextResponse } from "next/server"
import { gatewayRequest, BACKEND_ROUTES, getAuthToken } from "@/lib/gateway"

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request)
    const { searchParams } = new URL(request.url)
    
    const params = new URLSearchParams()
    const page = searchParams.get("page")
    const limit = searchParams.get("limit")
    const search = searchParams.get("search")
    const status = searchParams.get("status")

    if (page) params.append("page", page)
    if (limit) params.append("limit", limit)
    if (search) params.append("search", search)
    if (status) params.append("status", status)

    const endpoint = `${BACKEND_ROUTES.companies.list}?${params.toString()}`
    
    const response = await gatewayRequest(endpoint, {
      method: "GET",
      token: token || undefined,
    })

    if (!response.success) {
      console.error("[v0-api] GET /api/companies - Error:", response.error)
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
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch companies" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request)

    console.log("[v0-api] POST /api/companies - Token present:", !!token)

    if (!token) {
      console.warn("[v0-api] POST /api/companies - No auth token found")
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log("[v0-api] POST /api/companies - Body:", JSON.stringify(body).substring(0, 200))

    const response = await gatewayRequest(BACKEND_ROUTES.companies.create, {
      method: "POST",
      body,
      token,
    })

    console.log("[v0-api] POST /api/companies - Gateway response success:", response.success)

    if (!response.success) {
      console.error("[v0-api] POST /api/companies - Error:", response.error)
      
      return NextResponse.json(
        { success: false, error: response.error },
        { status: response.status }
      )
    }

    console.log("[v0-api] POST /api/companies - Success")
    return NextResponse.json({
      success: true,
      data: response.data,
      message: "Company created successfully",
    })
  } catch (error) {
    console.error("[v0-api] POST /api/companies - Exception:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create company" },
      { status: 500 }
    )
  }
}
