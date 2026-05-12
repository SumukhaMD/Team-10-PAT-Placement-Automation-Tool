import { NextRequest, NextResponse } from "next/server"
import { gatewayRequest, BACKEND_ROUTES, getAuthToken } from "@/lib/gateway"

// Helper: safely extract numeric total from a gateway response
function extractTotal(data: unknown): number {
  if (!data) return 0
  const d = data as Record<string, unknown>
  // Spring Page response: totalElements
  if (typeof d.totalElements === "number") return d.totalElements
  if (typeof d.total === "number") return d.total
  if (typeof d.total === "string") return parseInt(d.total) || 0
  // Plain array or content array
  if (Array.isArray(d.content)) return d.content.length
  if (Array.isArray(data)) return (data as unknown[]).length
  return 0
}

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request)

    // ── 1. Try the placement-service analytics endpoint first ──────────────────
    const analyticsResponse = await gatewayRequest(BACKEND_ROUTES.placements.analytics.dashboard, {
      method: "GET",
      token: token || undefined,
    })

    if (analyticsResponse.success) {
      const d = analyticsResponse.data as Record<string, unknown>
      // Only use it if the backend actually returned non-zero values
      const hasData = Object.values(d || {}).some(v => typeof v === "number" && v > 0)
      if (hasData) {
        return NextResponse.json({ success: true, data: d })
      }
    }

    // ── 2. Aggregate from individual service endpoints in parallel ─────────────
    const [studentsCount, drivesRes, companiesRes, placedRes] = await Promise.allSettled([
      // Total students (with auth-service fallback built in)
      gatewayRequest("/api/students/count", { method: "GET", token: token || undefined }),
      // Active drives
      gatewayRequest("/api/placements/drives?status=ACTIVE&size=1", { method: "GET", token: token || undefined }),
      // All companies
      gatewayRequest("/api/companies?size=1", { method: "GET", token: token || undefined }),
      // Students query with limit=1 to get total (can't filter by placement status directly)
      gatewayRequest("/api/students/count", { method: "GET", token: token || undefined }),
    ])

    // Parse student counts
    let totalStudents = 0
    let placedStudents = 0
    if (studentsCount.status === "fulfilled" && studentsCount.value.success) {
      const sc = studentsCount.value.data as Record<string, unknown>
      totalStudents = Number(sc?.total ?? 0)
      placedStudents = Number(sc?.placed ?? 0)
    }
    // If still 0, try fetching raw student list total
    if (totalStudents === 0) {
      const fallback = await gatewayRequest("/api/students?size=1", {
        method: "GET",
        token: token || undefined,
      })
      if (fallback.success) totalStudents = extractTotal(fallback.data)
    }

    // Parse active drives
    let activeDrives = 0
    if (drivesRes.status === "fulfilled" && drivesRes.value.success) {
      activeDrives = extractTotal(drivesRes.value.data)
    }
    // Fallback: count all drives and filter
    if (activeDrives === 0) {
      const allDrives = await gatewayRequest("/api/placements/drives?size=200", {
        method: "GET",
        token: token || undefined,
      })
      if (allDrives.success) {
        const d = allDrives.data as Record<string, unknown>
        const content = (d?.content as unknown[]) || []
        activeDrives = content.filter((dr: any) =>
          dr.status === "ACTIVE" || dr.status === "active"
        ).length
      }
    }

    // Parse companies
    let totalCompanies = 0
    if (companiesRes.status === "fulfilled" && companiesRes.value.success) {
      totalCompanies = extractTotal(companiesRes.value.data)
    }

    const placementRate = totalStudents > 0
      ? parseFloat(((placedStudents / totalStudents) * 100).toFixed(1))
      : 0

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        placedStudents,
        totalCompanies,
        activeCompanies: totalCompanies,
        totalJobs: 0,
        openJobs: 0,
        totalApplications: 0,
        totalDrives: activeDrives,
        activeDrives,
        averagePackage: 0,
        highestPackage: 0,
        placementRate,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}

