"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, FileText, Clock, Loader, ThumbsDown, ThumbsUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCompanies } from "@/hooks/use-data"
import { useAuth } from "@/lib/auth-context"
import { getStoredRecruiterCompanyId, setStoredRecruiterCompanyId } from "@/lib/recruiter-company"
import { Spinner } from "@/components/ui/spinner"

type RecruiterApplication = {
  id: string
  studentId: string
  jobId: string
  jobRole: string
  status: "APPLIED" | "UNDER_REVIEW" | "SHORTLISTED" | "INTERVIEW" | "SELECTED" | "REJECTED"
  resumeUrl?: string
}

type RawApplication = Record<string, unknown>
type RawJob = Record<string, unknown>

export default function RecruiterApplicationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [applications, setApplications] = useState<RecruiterApplication[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [companyId, setCompanyId] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { data: companiesData, isLoading: companiesLoading } = useCompanies({ limit: 100 })

  const companies = companiesData?.data || []

  useEffect(() => {
    setCompanyId(getStoredRecruiterCompanyId())
  }, [])

  useEffect(() => {
    if (!companyId) {
      setApplications([])
      return
    }

    void fetchApplications(companyId)
  }, [companyId])

  const fetchApplications = async (selectedCompanyId: string) => {
    try {
      setLoading(true)

      const token = localStorage.getItem("placeit_access_token")
      const [jobsResponse, applicationsResponse] = await Promise.all([
        fetch(`/api/jobs?companyId=${encodeURIComponent(selectedCompanyId)}&limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/applications?companyId=${encodeURIComponent(selectedCompanyId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (!jobsResponse.ok) throw new Error("Failed to fetch jobs")
      if (!applicationsResponse.ok) throw new Error("Failed to fetch applications")

      const jobsPayload = await jobsResponse.json()
      const applicationsPayload = await applicationsResponse.json()

      const rawJobs = Array.isArray(jobsPayload) ? jobsPayload : jobsPayload.data || []
      const rawApplications = Array.isArray(applicationsPayload) ? applicationsPayload : applicationsPayload.data || []

      const jobsById = new Map<string, string>(
        rawJobs.map((job: RawJob) => [
          String(job.id || job.jobId || ""),
          String(job.title || job.role || "Untitled Job"),
        ] as [string, string])
      )

      setApplications(
        rawApplications.map((application: RawApplication) =>
          normalizeApplication(application, jobsById)
        )
      )
    } catch (error) {
      console.error("[v0] Fetch applications error:", error)
      toast({
        title: "Error",
        description: "Failed to load recruiter applications.",
        variant: "destructive",
      })
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: RecruiterApplication["status"]) => {
    setActionLoading(applicationId)
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("placeit_access_token")}`,
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to update application")

      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId ? { ...application, status } : application
        )
      )

      toast({
        title: "Success",
        description: `Application moved to ${status.replace("_", " ").toLowerCase()}.`,
      })
    } catch (error) {
      console.error("[v0] Update application error:", error)
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const scheduleInterview = (application: RecruiterApplication) => {
    const params = new URLSearchParams({
      applicationId: application.id,
      studentId: application.studentId,
      companyId,
      jobRole: application.jobRole,
      candidateName: `Student ${application.studentId}`,
    })

    router.push(`/dashboard/recruiter/interviews/new?${params.toString()}`)
  }

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesSearch =
        application.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.jobRole.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTab = activeTab === "all" || application.status.toLowerCase() === activeTab
      return matchesSearch && matchesTab
    })
  }, [activeTab, applications, searchTerm])

  const statusColors: Record<RecruiterApplication["status"], string> = {
    APPLIED: "bg-accent/10 text-accent",
    UNDER_REVIEW: "bg-yellow-500/10 text-yellow-600",
    SHORTLISTED: "bg-green-500/10 text-green-600",
    INTERVIEW: "bg-blue-500/10 text-blue-600",
    SELECTED: "bg-green-500 text-green-50",
    REJECTED: "bg-destructive/10 text-destructive",
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="Applications"
        subtitle="Review and manage candidate applications"
        user={{ name: user?.name || "Recruiter", email: user?.email || "", role: "Recruiter" }}
      />

      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student ID or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select
                value={companyId || undefined}
                onValueChange={(value) => {
                  setCompanyId(value)
                  setStoredRecruiterCompanyId(value)
                }}
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companiesLoading ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">Loading companies...</div>
                  ) : (
                    companies.map((company: { id: string; name: string }) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          {[
            ["all", `All (${applications.length})`],
            ["applied", `Applied (${applications.filter((item) => item.status === "APPLIED").length})`],
            ["shortlisted", `Shortlisted (${applications.filter((item) => item.status === "SHORTLISTED").length})`],
            ["interview", `Interview (${applications.filter((item) => item.status === "INTERVIEW").length})`],
            ["selected", `Selected (${applications.filter((item) => item.status === "SELECTED").length})`],
          ].map(([value, label]) => (
            <Button
              key={value}
              variant={activeTab === value ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(value)}
            >
              {label}
            </Button>
          ))}
        </div>

        {!companyId ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              Choose a company to load recruiter applications.
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No applications found for the selected company.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="hover:border-accent/50 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">Student ID: {application.studentId}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{application.jobRole}</p>
                    </div>
                    <Badge className={statusColors[application.status]}>{application.status.replace("_", " ")}</Badge>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Application ID: {application.id}</p>
                    <p>Job ID: {application.jobId}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {application.resumeUrl ? (
                      <a href={application.resumeUrl} target="_blank" rel="noreferrer" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" size="sm" className="flex-1" disabled>
                        <FileText className="h-4 w-4 mr-2" />
                        No Resume
                      </Button>
                    )}
                  </div>

                  {application.status === "APPLIED" && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => updateApplicationStatus(application.id, "SHORTLISTED")}
                        disabled={actionLoading === application.id}
                      >
                        {actionLoading === application.id ? <Loader className="h-4 w-4 animate-spin" /> : <><ThumbsUp className="h-4 w-4 mr-2" />Shortlist</>}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => updateApplicationStatus(application.id, "REJECTED")}
                        disabled={actionLoading === application.id}
                      >
                        {actionLoading === application.id ? <Loader className="h-4 w-4 animate-spin" /> : <><ThumbsDown className="h-4 w-4 mr-2" />Reject</>}
                      </Button>
                    </div>
                  )}

                  {application.status === "SHORTLISTED" && (
                    <div className="pt-2 border-t border-border">
                      <Button size="sm" className="w-full" onClick={() => scheduleInterview(application)}>
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule Interview
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function normalizeApplication(
  raw: RawApplication,
  jobsById: Map<string, string>
): RecruiterApplication {
  const jobId = String(raw.jobId || "")
  const rawStatus = String(raw.status || "APPLIED").toUpperCase()

  return {
    id: String(raw.id || ""),
    studentId: String(raw.studentId || ""),
    jobId,
    jobRole: jobsById.get(jobId) || `Job ${jobId}`,
    status: normalizeStatus(rawStatus),
    resumeUrl: typeof raw.resumeUrl === "string" ? raw.resumeUrl : undefined,
  }
}

function normalizeStatus(value: string): RecruiterApplication["status"] {
  if (
    value === "APPLIED" ||
    value === "UNDER_REVIEW" ||
    value === "SHORTLISTED" ||
    value === "INTERVIEW" ||
    value === "SELECTED" ||
    value === "REJECTED"
  ) {
    return value
  }

  return "APPLIED"
}
