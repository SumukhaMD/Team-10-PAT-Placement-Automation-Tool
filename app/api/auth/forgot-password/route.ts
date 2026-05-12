import { NextRequest, NextResponse } from "next/server"
import { gatewayRequest, BACKEND_ROUTES } from "@/lib/gateway"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      )
    }

    const response = await gatewayRequest(BACKEND_ROUTES.auth.forgotPassword, {
      method: "POST",
      body: { email },
    })

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "If the email exists, a password reset OTP has been sent.",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 }
    )
  }
}
