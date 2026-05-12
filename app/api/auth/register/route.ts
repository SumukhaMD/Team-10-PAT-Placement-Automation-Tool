import { NextRequest, NextResponse } from "next/server"
import { gatewayRequest, BACKEND_ROUTES } from "@/lib/gateway"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role, phone } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: "Name, email, password, and role are required" },
        { status: 400 }
      )
    }

    const validRoles = ["STUDENT", "RECRUITER", "ADMIN", "TPO"]
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role" },
        { status: 400 }
      )
    }

    const response = await gatewayRequest(BACKEND_ROUTES.auth.register, {
      method: "POST",
      body: { name, email, password, role, phone },
    })

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please verify your email with the OTP sent.",
      data: response.data,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Registration failed" },
      { status: 500 }
    )
  }
}
