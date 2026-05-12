import { NextRequest, NextResponse } from "next/server"
import { gatewayRequest, BACKEND_ROUTES, getAuthToken } from "@/lib/gateway"

export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request)
    const body = await request.json()
    const { refreshToken } = body

    if (token && refreshToken) {
      await gatewayRequest(BACKEND_ROUTES.auth.logout, {
        method: "POST",
        body: { refreshToken },
        token,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    // Always return success for logout
    return NextResponse.json({
      success: true,
      message: "Logged out",
    })
  }
}
