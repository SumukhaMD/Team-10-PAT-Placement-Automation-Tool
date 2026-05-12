"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

function ScheduleInterviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const applicationId = searchParams.get("applicationId") || ""
  const studentId = searchParams.get("studentId") || ""
  const companyId = searchParams.get("companyId") || ""
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    candidateName: searchParams.get("candidateName") || "",
    candidateEmail: searchParams.get("candidateEmail") || "",
    jobRole: searchParams.get("jobRole") || "",
    interviewDate: "",
    interviewTime: "",
    duration: "60",
    interviewType: "TECHNICAL",
    interviewer: "",
    location: "",
    description: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!applicationId || !studentId || !companyId) {
        throw new Error("Please start interview scheduling from a real application.")
      }

      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("placeit_access_token")}`,
        },
        body: JSON.stringify({
          applicationId,
          studentId,
          companyId,
          interviewDate: formData.interviewDate,
          interviewTime: formData.interviewTime,
          duration: parseInt(formData.duration),
          interviewType: formData.interviewType,
          interviewer: formData.interviewer,
          location: formData.location,
          description: formData.description,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error("[v0] Interview scheduling response:", response.status, errorBody)
        throw new Error(errorBody || "Failed to schedule interview")
      }

      toast({
        title: "Success",
        description: "Interview scheduled successfully! Email sent to candidate.",
      })

      router.push("/dashboard/recruiter/interviews")
    } catch (error) {
      console.error("[v0] Interview scheduling error:", error)
      toast({
        title: "Error",
        description: "Failed to schedule interview. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="Schedule Interview"
        subtitle="Schedule a new interview with a candidate"
      />

      <div className="p-6 max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Interview Details</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Candidate Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="candidateName">Candidate Name *</Label>
                    <Input
                      id="candidateName"
                      name="candidateName"
                      placeholder="e.g., John Doe"
                      value={formData.candidateName}
                      readOnly
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="candidateEmail">Email Address *</Label>
                    <Input
                      id="candidateEmail"
                      name="candidateEmail"
                      type="email"
                      placeholder="candidate@example.com"
                      value={formData.candidateEmail}
                      readOnly
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobRole">Job Role Applying For *</Label>
                    <Input
                      id="jobRole"
                      name="jobRole"
                      placeholder="e.g., Software Engineer"
                      value={formData.jobRole}
                      readOnly
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Interview Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="interviewDate">Interview Date *</Label>
                    <Input
                      id="interviewDate"
                      name="interviewDate"
                      type="date"
                      value={formData.interviewDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interviewTime">Interview Time *</Label>
                    <Input
                      id="interviewTime"
                      name="interviewTime"
                      type="time"
                      value={formData.interviewTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Select value={formData.duration} onValueChange={(value) => handleSelectChange("duration", value)}>
                      <SelectTrigger id="duration">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                        <SelectItem value="120">120 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interviewType">Interview Type *</Label>
                    <Select value={formData.interviewType} onValueChange={(value) => handleSelectChange("interviewType", value)}>
                      <SelectTrigger id="interviewType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TECHNICAL">Technical</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="BOTH">Both</SelectItem>
                        <SelectItem value="GROUP">Group</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Interview Logistics</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location/Link *</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="e.g., Conference Room A or Zoom link"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interviewer">Interviewer Name/Email *</Label>
                    <Input
                      id="interviewer"
                      name="interviewer"
                      placeholder="e.g., John Smith (john@company.com)"
                      value={formData.interviewer}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional Instructions/Notes</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Any additional information for the candidate..."
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Schedule &amp; Send Email
                    </>
                  )}
                </Button>

                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
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
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <ScheduleInterviewContent />
    </Suspense>
  )
}
