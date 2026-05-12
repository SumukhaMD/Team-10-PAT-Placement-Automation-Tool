import { NextRequest, NextResponse } from "next/server"
import { gatewayRequest, getAuthToken } from "@/lib/gateway"

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request)

    const response = await gatewayRequest("/api/students/count", {
      method: "GET",
      token: token || undefined,
    })

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: response.status }
      )
    }

    const data = response.data as Record<string, unknown>
    return NextResponse.json({
      success: true,
      total: Number(data?.total ?? 0),
      placed: Number(data?.placed ?? 0),
      notPlaced: Number(data?.notPlaced ?? 0),
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch count" },
      { status: 500 }
    )
  }
}
