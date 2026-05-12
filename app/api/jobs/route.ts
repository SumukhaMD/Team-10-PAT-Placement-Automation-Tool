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

    const endpoint = `${BACKEND_ROUTES.placements.jobs.list}?${params.toString()}`

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
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch jobs" },
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
    const normalizedJob = normalizeJobPayload(body)

    const response = await gatewayRequest(BACKEND_ROUTES.placements.jobs.create, {
      method: "POST",
      body: normalizedJob,
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
      message: "Job posted successfully",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create job" },
      { status: 500 }
    )
  }
}

function normalizeJobPayload(body: Record<string, unknown>) {
  const companyId = Number(body.companyId)
  const driveId = body.driveId != null && String(body.driveId).trim() !== "" ? Number(body.driveId) : null

  if (!companyId || Number.isNaN(companyId)) {
    throw new Error("Company ID is required to create a job")
  }

  const salary = parseSalary(body.salary)

  // Normalize jobType to valid backend enum values
  const rawJobType = String(body.jobType || body.type || "FULL_TIME")
  const validJobTypes = ["FULL_TIME", "INTERNSHIP", "PART_TIME"]
  const jobType = validJobTypes.includes(rawJobType) ? rawJobType : "FULL_TIME"

  // Normalize status to valid backend enum values: ACTIVE, CLOSED, ON_HOLD
  const rawStatus = String(body.status || "ACTIVE").toUpperCase()
  const statusMap: Record<string, string> = {
    ACTIVE: "ACTIVE",
    OPEN: "ACTIVE",
    CLOSED: "CLOSED",
    ON_HOLD: "ON_HOLD",
    UPCOMING: "ACTIVE",
    PUBLISHED: "ACTIVE",
  }
  const status = statusMap[rawStatus] ?? "ACTIVE"

  return {
    driveId,
    companyId,
    title: String(body.title || body.role || "Untitled Job"),
    description: String(body.description || ""),
    requirements: Array.isArray(body.requirements)
      ? body.requirements.join(", ")
      : String(body.requirements || ""),
    jobType,
    location: String(body.location || "Remote"),
    salary,
    status,
    deadline: body.deadline ? String(body.deadline) : null,
  }
}

function parseSalary(value: unknown): number {
  // Handle complex salary object {min, max, currency} from admin form
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>
    const min = Number(obj.min ?? obj.minSalary ?? 0)
    const max = Number(obj.max ?? obj.maxSalary ?? 0)
    // Convert LPA to rupees: take average of min/max, multiply by 100000
    const lpa = max > 0 ? Math.round((min + max) / 2) : min
    return lpa > 0 ? lpa * 100000 : 0
  }

  if (typeof value === "number") return value

  const text = String(value || "")
  const match = text.replace(/,/g, "").match(/\d+(\.\d+)?/)

  if (!match) return 0

  const parsed = Number(match[0])

  if (/lpa/i.test(text)) return Math.round(parsed * 100000)

  return Math.round(parsed)
}
