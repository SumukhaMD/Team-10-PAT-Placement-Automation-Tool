import { NextRequest, NextResponse } from "next/server"
import { gatewayRequest, BACKEND_ROUTES, getAuthToken } from "@/lib/gateway"

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request)
    const { searchParams } = new URL(request.url)
    
    const params = new URLSearchParams()
    const page = searchParams.get("page")
    const limit = searchParams.get("limit")
    const search = searchParams.get("search")
    const branch = searchParams.get("branch")
    const status = searchParams.get("status")
    const graduationYear = searchParams.get("graduationYear")

    if (page) params.append("page", page)
    if (limit) params.append("size", limit) // Backend Spring Boot uses 'size' not 'limit'
    if (search) params.append("search", search)
    if (branch) params.append("branch", branch)
    if (status) params.append("status", status)
    if (graduationYear) params.append("graduationYear", graduationYear)

    const endpoint = `${BACKEND_ROUTES.students.list}?${params.toString()}`
    
    const response = await gatewayRequest(endpoint, {
      method: "GET",
      token: token || undefined,
    })

    if (!response.success) {
      console.error("[v0] Students backend error:", response.error, response.status)
      // Don't return error — fall through to auth fallback below
    }

    // Handle Spring Boot Page response format (content / totalElements) or plain array
    const data = response.data as Record<string, unknown> | unknown[]
    const primaryList: unknown[] = Array.isArray(data) ? data : ((data as Record<string, unknown>)?.content as unknown[]) || []
    const primaryTotal = Array.isArray(data) ? data.length : Number((data as Record<string, unknown>)?.totalElements ?? (data as Record<string, unknown>)?.total ?? 0)

    // --- Fallback: if profiles table is empty, call auth-service for raw STUDENT users ---
    if (response.success && Number(primaryTotal) === 0 && primaryList.length === 0) {
      console.log("[v0] Students profiles table empty — falling back to auth-service /auth/users")
      const fallbackResponse = await gatewayRequest("/api/auth/users?role=STUDENT", {
        method: "GET",
        token: token || undefined,
      })

      if (fallbackResponse.success) {
        const fb = fallbackResponse.data as Record<string, unknown>
        // auth-service returns { success, data: [...], total }
        // The gateway wraps it, so fb might be the inner payload or the full body
        const rawList: unknown[] = (Array.isArray(fb) ? fb : (fb?.data as unknown[])) || []
        const fbTotal = Number(fb?.total ?? rawList.length)

        // Map raw auth user objects to student-shaped objects
        const studentList = rawList.map((u: any) => ({
          id: String(u.id ?? u.userId ?? ""),
          userId: String(u.userId ?? u.id ?? ""),
          name: u.name ?? "",
          email: u.email ?? "",
          role: u.role ?? "STUDENT",
          branch: u.branch ?? "Not Set",
          placementStatus: "NOT_PLACED",
          cgpa: null,
          graduationYear: null,
          skills: [],
        }))

        return NextResponse.json({
          success: true,
          data: studentList,
          total: fbTotal || studentList.length,
          page: page ? parseInt(page) : 0,
          limit: limit ? parseInt(limit) : 20,
          _source: "auth-fallback",
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: primaryList,
      total: primaryTotal,
      page: page ? parseInt(page) : 0,
      limit: limit ? parseInt(limit) : 20,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch students" },
      { status: 500 }
    )
  }
}
