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

    if (page) params.append("page", page)
    if (limit) params.append("size", limit) // Backend uses 'size' not 'limit'
    if (status) params.append("status", status)

    const endpoint = `${BACKEND_ROUTES.placements.drives.list}?${params.toString()}`
    
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

    // Handle Spring Boot Page response format
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
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch drives" },
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
    let normalizedDrive: Record<string, unknown>
    try {
      normalizedDrive = normalizeDrivePayload(body)
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: validationError instanceof Error ? validationError.message : "Invalid drive data" },
        { status: 400 }
      )
    }

    console.log("[v0] Drive POST payload to backend:", JSON.stringify(normalizedDrive))

    const response = await gatewayRequest(BACKEND_ROUTES.placements.drives.create, {
      method: "POST",
      body: normalizedDrive,
      token,
    })

    if (!response.success) {
      console.error("[v0] Drive creation backend error:", response.error, response.status)
      return NextResponse.json(
        { success: false, error: response.error },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: "Placement drive created successfully",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create drive" },
      { status: 500 }
    )
  }
}

function normalizeDrivePayload(body: Record<string, unknown>) {
  const companyId = Number(body.companyId)
  if (!companyId || Number.isNaN(companyId)) {
    throw new Error("Company ID is required to create a placement drive")
  }

  // Flatten eligibilityCriteria
  const criteria = (body.eligibilityCriteria || {}) as Record<string, unknown>
  const allowedBranches = Array.isArray(criteria.allowedBranches)
    ? (criteria.allowedBranches as string[]).join(",")
    : typeof body.allowedBranches === "string"
      ? body.allowedBranches
      : ""

  // Normalize status to valid backend DriveStatus enum: UPCOMING, ACTIVE, COMPLETED, CANCELLED
  const rawStatus = String(body.status || "UPCOMING").toUpperCase()
  const validStatuses = ["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"]
  const status = validStatuses.includes(rawStatus) ? rawStatus : "UPCOMING"

  // Normalize jobType
  const rawJobType = String(body.jobType || "FULL_TIME").toUpperCase()
  const validJobTypes = ["FULL_TIME", "INTERNSHIP", "CONTRACT", "PART_TIME"]
  const jobType = validJobTypes.includes(rawJobType) ? rawJobType : "FULL_TIME"

  // Salary — send flat numeric fields that the backend entity expects
  const salary = (body.salary || {}) as Record<string, unknown>
  const minSalary = Number(salary.min ?? body.minSalary ?? 0)
  const maxSalary = Number(salary.max ?? body.maxSalary ?? 0)

  // Requirements — accept array or newline-delimited string
  let requirements: string[] = []
  if (Array.isArray(body.requirements)) {
    requirements = (body.requirements as unknown[]).map(String).filter(Boolean)
  } else if (typeof body.requirements === "string") {
    requirements = body.requirements.split("\n").map((r) => r.trim()).filter(Boolean)
  }

  return {
    companyId,
    title: String(body.title || "Untitled Drive"),
    description: String(body.description || ""),
    status,
    jobType,
    totalPositions: Number(body.positions || body.totalPositions || 1),
    startDate: body.startDate ? String(body.startDate) : null,
    endDate: body.endDate ? String(body.endDate) : null,
    minimumCgpa: Number(criteria.minCgpa ?? body.minimumCgpa ?? 0),
    maxBacklogs: Number(criteria.maxBacklogs ?? body.maxBacklogs ?? 0),
    allowedBranches,
    minSalary,
    maxSalary,
    location: body.location ? String(body.location) : null,
    requirements,
  }
}
