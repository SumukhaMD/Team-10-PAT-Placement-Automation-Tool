import { NextRequest, NextResponse } from "next/server"
import { gatewayRequest, BACKEND_ROUTES, getAuthToken } from "@/lib/gateway"

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request)

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    
    const params = new URLSearchParams()
    const year = searchParams.get("year")
    const branch = searchParams.get("branch")

    if (year) params.append("year", year)
    if (branch) params.append("branch", branch)

    const endpoint = `${BACKEND_ROUTES.placements.analytics.placements}?${params.toString()}`
    
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

    return NextResponse.json({
      success: true,
      data: response.data,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
