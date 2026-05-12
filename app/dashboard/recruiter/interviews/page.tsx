"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Loader,
  Video,
  Trash2,
  Eye,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Interview {
  id: string | number
  candidateName: string
  candidateEmail: string
  jobRole: string
  interviewDate: string
  interviewTime: string
  duration: number
  interviewType: string
  interviewer: string
  location: string
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "PENDING"
  feedback?: string
  rating?: number
}

type RawInterview = Record<string, unknown>

export default function RecruiterInterviewsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("scheduled")
  const [deleteId, setDeleteId] = useState<string | number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/interviews", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("placeit_access_token")}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch interviews")

      const data = await response.json()
      const rawInterviews = Array.isArray(data) ? data : data.data || []

      setInterviews(rawInterviews.map(normalizeInterview))
    } catch (error) {
      console.error("[v0] Fetch interviews error:", error)

      toast({
        title: "Error",
        description: "Failed to load interviews.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleteLoading(true)

    try {
      const response = await fetch(`/api/interviews/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("placeit_access_token")}`,
        },
      })

      if (!response.ok) throw new Error("Failed to delete interview")

      setInterviews(interviews.filter((i) => i.id !== deleteId))

      toast({
        title: "Success",
        description: "Interview cancelled successfully!",
      })
    } catch (error) {
      console.error("[v0] Delete interview error:", error)

      toast({
        title: "Error",
        description: "Failed to cancel interview.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteId(null)
    }
  }

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-accent/10 text-accent",
    COMPLETED: "bg-green-500/10 text-green-600",
    CANCELLED: "bg-destructive/10 text-destructive",
    PENDING: "bg-yellow-500/10 text-yellow-600",
  }

  const filteredInterviews = interviews.filter((interview) => {
    const candidateName = interview.candidateName || ""
    const jobRole = interview.jobRole || ""
    const status = interview.status || "PENDING"

    const matchesSearch =
      candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobRole.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTab = activeTab === "all" || status.toLowerCase() === activeTab

    return matchesSearch && matchesTab
  })

  function normalizeInterview(raw: RawInterview): Interview {
    const scheduledDate = String(raw.scheduledDate || raw.scheduledAt || "")
    const parsedDate = scheduledDate ? new Date(scheduledDate) : null
    const validDate = parsedDate && !Number.isNaN(parsedDate.getTime())

    return {
      id: String(raw.id || crypto.randomUUID()),
      candidateName: String(raw.candidateName || raw.studentName || `Student #${raw.studentId || "Unknown"}`),
      candidateEmail: String(raw.candidateEmail || raw.studentEmail || ""),
      jobRole: String(raw.jobRole || raw.jobTitle || raw.roundName || `Application #${raw.applicationId || "Unknown"}`),
      interviewDate: validDate ? parsedDate.toLocaleDateString() : String(raw.interviewDate || "Not scheduled"),
      interviewTime: validDate
        ? parsedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : String(raw.interviewTime || ""),
      duration: Number(raw.duration || raw.durationMinutes || 60),
      interviewType: String(raw.interviewType || raw.type || "TECHNICAL"),
      interviewer: String(raw.interviewer || raw.interviewerName || "Not assigned"),
      location: String(raw.location || raw.meetingLink || raw.venue || "Not provided"),
      status: normalizeStatus(raw.status),
      feedback: typeof raw.feedback === "string" ? raw.feedback : undefined,
      rating: typeof raw.rating === "number" ? raw.rating : undefined,
    }
  }

  function normalizeStatus(status: unknown): Interview["status"] {
    const value = String(status || "PENDING").toUpperCase()

    if (value === "SCHEDULED" || value === "COMPLETED" || value === "CANCELLED" || value === "PENDING") {
      return value
    }

    return "PENDING"
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader
          title="Interviews"
          subtitle="Manage your scheduled interviews"
          user={{ name: "Recruiter", email: "recruiter@company.com", role: "Recruiter" }}
        />

        <div className="flex items-center justify-center h-screen">
          <Loader className="h-8 w-8 animate-spin text-accent" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="Interviews"
        subtitle="Manage your scheduled interviews"
        user={{ name: "Recruiter", email: "recruiter@company.com", role: "Recruiter" }}
      />

      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search interviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Link href="/dashboard/recruiter/interviews/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="scheduled">
              Scheduled ({interviews.filter((i) => i.status === "SCHEDULED").length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({interviews.filter((i) => i.status === "COMPLETED").length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({interviews.filter((i) => i.status === "CANCELLED").length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({interviews.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredInterviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No interviews found. Schedule one to get started!</p>

              <Link href="/dashboard/recruiter/interviews/new">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule First Interview
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredInterviews.map((interview) => (
              <Card key={interview.id} className="hover:border-accent/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex gap-4 flex-1">
                      <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-semibold text-accent">
                          {interview.candidateName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-foreground">{interview.candidateName}</h3>
                          <Badge className={statusColors[interview.status]}>{interview.status}</Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">{interview.candidateEmail}</p>

                        <p className="text-sm text-foreground mt-1">
                          Applying for: <span className="font-medium">{interview.jobRole}</span>
                        </p>

                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                          <span className="flex items-center gap-1.5 text-foreground">
                            <Calendar className="h-4 w-4 text-accent" />
                            {interview.interviewDate}
                          </span>

                          <span className="flex items-center gap-1.5 text-foreground">
                            <Clock className="h-4 w-4 text-accent" />
                            {interview.interviewTime} ({interview.duration}m)
                          </span>

                          <span className="flex items-center gap-1.5 text-foreground">
                            <MapPin className="h-4 w-4 text-accent" />
                            {interview.location}
                          </span>
                        </div>

                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Interview Type:</span> {interview.interviewType}
                          </p>

                          <p className="text-xs text-muted-foreground mt-1">
                            <span className="font-medium">Interviewer:</span> {interview.interviewer}
                          </p>
                        </div>

                        {interview.status === "COMPLETED" && interview.feedback && (
                          <div className="mt-4 p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="h-4 w-4 text-accent" />
                              <span className="text-sm font-medium text-foreground">Feedback</span>

                              {interview.rating && (
                                <div className="flex items-center gap-1 ml-auto">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className={`h-2 w-2 rounded-full ${
                                        i < interview.rating! ? "bg-accent" : "bg-muted"
                                      }`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground">{interview.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Badge variant="outline">{interview.interviewType}</Badge>

                      {interview.status === "SCHEDULED" && (
                        <>
                          <Link href={`/dashboard/recruiter/interviews/${interview.id}`}>
                            <Button size="sm" className="w-full">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </Link>

                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Resume
                          </Button>
                        </>
                      )}

                      {interview.status === "COMPLETED" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="default">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Select
                          </Button>

                          <Button size="sm" variant="outline">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(interview.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </DialogTrigger>

                        {deleteId === interview.id && (
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Cancel Interview?</DialogTitle>
                              <DialogDescription>
                                This will cancel the interview and notify the candidate.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="flex gap-4 justify-end pt-4">
                              <Button variant="outline" onClick={() => setDeleteId(null)}>
                                Keep Interview
                              </Button>

                              <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
                                {deleteLoading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                                {deleteLoading ? "Cancelling..." : "Cancel Interview"}
                              </Button>
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
