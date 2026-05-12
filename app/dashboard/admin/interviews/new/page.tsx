"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { interviewsApi } from "@/lib/api-service"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { CalendarClock, ArrowLeft } from "lucide-react"
import Link from "next/link"

function formatScheduledDate(raw: string): string {
  if (!raw) return ""
  // datetime-local gives "YYYY-MM-DDTHH:mm" — append :00 if seconds are missing
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) {
    return `${raw}:00`
  }
  return raw
}

function ScheduleInterviewForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  // Read pre-fill values from URL query params
  const qApplicationId = searchParams.get("applicationId") || ""
  const qStudentId = searchParams.get("studentId") || ""
  const qCompanyId = searchParams.get("companyId") || ""

  const [form, setForm] = useState({
    applicationId: qApplicationId,
    studentId: qStudentId,
    companyId: qCompanyId,
    interviewType: "TECHNICAL",
    scheduledDate: "",
    meetingLink: "",
    description: "",
    status: "SCHEDULED",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Keep form in sync if URL params change (e.g. navigation)
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      applicationId: qApplicationId,
      studentId: qStudentId,
      companyId: qCompanyId,
    }))
  }, [qApplicationId, qStudentId, qCompanyId])

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.companyId) {
      toast.error("Company ID is required")
      return
    }
    if (!form.studentId) {
      toast.error("Student ID is required")
      return
    }
    if (!form.scheduledDate) {
      toast.error("Scheduled date is required")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        applicationId: form.applicationId ? Number(form.applicationId) : null,
        studentId: Number(form.studentId),
        companyId: Number(form.companyId),
        interviewType: form.interviewType,
        scheduledDate: formatScheduledDate(form.scheduledDate),
        meetingLink: form.meetingLink,
        description: form.description,
        status: form.status,
      }

      const response = await interviewsApi.create(payload)

      if (response.success) {
        toast.success("Interview scheduled successfully!")
        router.push("/dashboard/admin/applications")
      } else {
        toast.error(response.error || "Failed to schedule interview")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="Schedule Interview"
        subtitle="Create a new interview for a student application"
        user={{
          name: user?.name || "Admin",
          email: user?.email || "",
          role: user?.role || "TPO",
        }}
      />

      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dashboard/admin/applications"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Applications
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <CalendarClock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle>Interview Details</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Fill in the details to schedule an interview
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* IDs row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicationId">
                    Application ID{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="applicationId"
                    placeholder="e.g. 42"
                    value={form.applicationId}
                    onChange={(e) => handleChange("applicationId", e.target.value)}
                    type="number"
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">
                    Student ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="studentId"
                    placeholder="e.g. 7"
                    value={form.studentId}
                    onChange={(e) => handleChange("studentId", e.target.value)}
                    type="number"
                    min={1}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyId">
                    Company ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="companyId"
                    placeholder="e.g. 3"
                    value={form.companyId}
                    onChange={(e) => handleChange("companyId", e.target.value)}
                    type="number"
                    min={1}
                    required
                  />
                </div>
              </div>

              {/* Interview Type */}
              <div className="space-y-2">
                <Label htmlFor="interviewType">Interview Type</Label>
                <Select
                  value={form.interviewType}
                  onValueChange={(v) => handleChange("interviewType", v)}
                >
                  <SelectTrigger id="interviewType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TECHNICAL">Technical</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="BOTH">Both (Technical + HR)</SelectItem>
                    <SelectItem value="GROUP">Group Discussion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Scheduled Date */}
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">
                  Scheduled Date &amp; Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={form.scheduledDate}
                  onChange={(e) => handleChange("scheduledDate", e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Will be sent as <code>YYYY-MM-DDTHH:mm:ss</code> to the backend.
                </p>
              </div>

              {/* Meeting Link / Location */}
              <div className="space-y-2">
                <Label htmlFor="meetingLink">Meeting Link / Location</Label>
                <Input
                  id="meetingLink"
                  placeholder="https://meet.google.com/… or Office Block A"
                  value={form.meetingLink}
                  onChange={(e) => handleChange("meetingLink", e.target.value)}
                />
              </div>

              {/* Notes / Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Notes</Label>
                <Textarea
                  id="description"
                  placeholder="Additional instructions for the candidate…"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => handleChange("status", v)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="PENDING">Pending Confirmation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      Scheduling…
                    </>
                  ) : (
                    <>
                      <CalendarClock className="h-4 w-4 mr-2" />
                      Schedule Interview
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ScheduleInterviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    }>
      <ScheduleInterviewForm />
    </Suspense>
  )
}
