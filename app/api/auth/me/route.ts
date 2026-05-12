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

    const response = await gatewayRequest(BACKEND_ROUTES.auth.me, {
      method: "GET",
      token,
    })

    if (!response.success) {
      const fallbackUser = getUserFromAccessToken(token)
      if (fallbackUser) {
        return NextResponse.json({
          success: true,
          data: fallbackUser,
        })
      }

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
      { success: false, error: error instanceof Error ? error.message : "Failed to get user" },
      { status: 500 }
    )
  }
}

function getUserFromAccessToken(token: string) {
  try {
    const [, payload] = token.split(".")
    if (!payload) return null

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = JSON.parse(Buffer.from(normalizedPayload, "base64").toString("utf8")) as {
      userId?: string | number
      email?: string
      name?: string
      role?: string
      exp?: number
    }

    if (decoded.exp && decoded.exp * 1000 < Date.now()) return null
    if (!decoded.userId || !decoded.email || !decoded.role) return null

    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name || decoded.email.split("@")[0],
      role: decoded.role,
    }
  } catch {
    return null
  }
}
