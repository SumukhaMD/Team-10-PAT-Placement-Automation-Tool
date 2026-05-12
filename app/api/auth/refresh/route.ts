import { NextRequest, NextResponse } from "next/server"
import { gatewayRequest, BACKEND_ROUTES } from "@/lib/gateway"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: "Refresh token is required" },
        { status: 400 }
      )
    }

    let response = await gatewayRequest(BACKEND_ROUTES.auth.refresh, {
      method: "POST",
      body: { refreshToken },
    })

    if (!response.success && shouldRetryLegacyRefresh(response.error)) {
      response = await gatewayRequest("/api/auth/refresh-token", {
        method: "POST",
        body: { refreshToken },
      })
    }

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
      { success: false, error: error instanceof Error ? error.message : "Token refresh failed" },
      { status: 500 }
    )
  }
}

function shouldRetryLegacyRefresh(error?: string) {
  if (!error) return false
  return error.includes("No static resource auth/refresh") || error.includes("404") || error.includes("Not Found")
}
