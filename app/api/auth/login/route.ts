import { NextRequest, NextResponse } from "next/server"
import { gatewayRequest, BACKEND_ROUTES } from "@/lib/gateway"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    const response = await gatewayRequest(BACKEND_ROUTES.auth.login, {
      method: "POST",
      body: { email, password },
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
      { success: false, error: error instanceof Error ? error.message : "Login failed" },
      { status: 500 }
    )
  }
}
