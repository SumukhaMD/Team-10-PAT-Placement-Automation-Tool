import { NextRequest, NextResponse } from "next/server"
import { gatewayRequest, BACKEND_ROUTES, getAuthToken } from "@/lib/gateway"

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request)
    const { searchParams } = new URL(request.url)
    
    const params = new URLSearchParams()
    const page = searchParams.get("page")
    const limit = searchParams.get("limit")
    const unreadOnly = searchParams.get("unreadOnly")

    if (page) params.append("page", page)
    if (limit) params.append("limit", limit)
    if (unreadOnly) params.append("unreadOnly", unreadOnly)

    const endpoint = `${BACKEND_ROUTES.notifications.list}?${params.toString()}`
    
    const response = await gatewayRequest(endpoint, {
      method: "GET",
      token: token || undefined,
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
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}
