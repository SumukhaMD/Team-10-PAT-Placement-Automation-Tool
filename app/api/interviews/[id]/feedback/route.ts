import { NextRequest, NextResponse } from "next/server"
import { gatewayRequest, BACKEND_ROUTES, getAuthToken } from "@/lib/gateway"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = getAuthToken(request)

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { feedback, rating } = body as { feedback: string; rating?: number }

    if (!feedback) {
      return NextResponse.json(
        { success: false, error: "Feedback is required" },
        { status: 400 }
      )
    }

    const response = await gatewayRequest(BACKEND_ROUTES.placements.interviews.feedback(id), {
      method: "PATCH",
      body: { feedback, rating },
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
      message: "Interview feedback submitted successfully",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to submit interview feedback" },
      { status: 500 }
    )
  }
}
