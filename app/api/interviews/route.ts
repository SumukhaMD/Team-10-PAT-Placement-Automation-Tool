import { NextRequest, NextResponse } from "next/server"
import { gatewayRequest, BACKEND_ROUTES, getAuthToken } from "@/lib/gateway"

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request)
    const { searchParams } = new URL(request.url)

    const params = new URLSearchParams()
    const page = searchParams.get("page")
    const limit = searchParams.get("limit")
    const status = searchParams.get("status")
    const companyId = searchParams.get("companyId")

    if (page) params.append("page", page)
    if (limit) params.append("size", limit)
    if (status) params.append("status", status)
    if (companyId) params.append("companyId", companyId)

    const endpoint = `${BACKEND_ROUTES.placements.interviews.list}?${params.toString()}`

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

    const data = response.data

    return NextResponse.json({
      success: true,
      data: Array.isArray(data) ? data : (data as Record<string, unknown>)?.content || [],
      total: Array.isArray(data) ? data.length : (data as Record<string, unknown>)?.totalElements || 0,
      page: page ? parseInt(page) : 0,
      limit: limit ? parseInt(limit) : 20,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch interviews" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request)

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const normalizedInterview = normalizeInterviewPayload(body)

    const response = await gatewayRequest(BACKEND_ROUTES.placements.interviews.create, {
      method: "POST",
      body: normalizedInterview,
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
      message: "Interview scheduled successfully",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to schedule interview" },
      { status: 500 }
    )
  }
}

function normalizeInterviewPayload(body: Record<string, unknown>) {
  // applicationId is optional — send null if missing/invalid
  const rawAppId = body.applicationId
  const applicationId =
    rawAppId != null && String(rawAppId).trim() !== "" && !Number.isNaN(Number(rawAppId))
      ? Number(rawAppId)
      : null

  const companyId = Number(body.companyId)
  const studentId = Number(body.studentId)

  if (!companyId || Number.isNaN(companyId)) {
    throw new Error("Company ID is required to schedule an interview")
  }

  if (!studentId || Number.isNaN(studentId)) {
    throw new Error("Student ID is required to schedule an interview")
  }

  const type = String(body.interviewType || body.type || "TECHNICAL")
  const interviewDate = String(body.interviewDate || "")
  const interviewTime = String(body.interviewTime || "09:00")

  // Ensure scheduledDate is in "YYYY-MM-DDTHH:mm:ss" format
  let scheduledDate = String(
    body.scheduledDate ||
      (interviewDate ? `${interviewDate}T${interviewTime}` : new Date().toISOString())
  )
  // Append :00 if seconds component is missing (datetime-local gives HH:mm only)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(scheduledDate)) {
    scheduledDate = `${scheduledDate}:00`
  }

  return {
    applicationId,
    companyId,
    studentId,
    type: ["TECHNICAL", "HR", "BOTH", "GROUP"].includes(type) ? type : "TECHNICAL",
    scheduledDate,
    meetingLink: String(body.meetingLink || body.location || ""),
    feedback: String(body.description || ""),
    status: String(body.status || "SCHEDULED"),
  }
}
