import { NextRequest, NextResponse } from "next/server"
import { gatewayRequest, BACKEND_ROUTES } from "@/lib/gateway"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp, newPassword } = body

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Email, OTP, and new password are required" },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const response = await gatewayRequest(BACKEND_ROUTES.auth.resetPassword, {
      method: "POST",
      body: { email, otp, newPassword },
    })

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successful. Please login with your new password.",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Password reset failed" },
      { status: 500 }
    )
  }
}
