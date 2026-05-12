"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  GraduationCap,
  FileText,
  Download,
  Calendar,
  Building2,
  Briefcase
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { applicationsApi } from "@/lib/api-service"
import { Spinner } from "@/components/ui/spinner"
import { format } from "date-fns"
import { toast } from "sonner"
import Link from "next/link"
import useSWR from "swr"

const statusColors: Record<string, string> = {
  APPLIED: "bg-muted text-muted-foreground",
  UNDER_REVIEW: "bg-yellow-500/10 text-yellow-600",
  SHORTLISTED: "bg-accent/10 text-accent",
  INTERVIEW: "bg-blue-500/10 text-blue-600",
  SELECTED: "bg-green-500/10 text-green-600",
  REJECTED: "bg-destructive/10 text-destructive",
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [newStatus, setNewStatus] = useState("")

  const { data: applicationData, isLoading, mutate } = useSWR(
    `application-${resolvedParams.id}`,
    () => applicationsApi.get(resolvedParams.id)
  )

  const application = applicationData?.data

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error("Please select a status")
      return
    }

    setIsUpdating(true)
    try {
      const response = await applicationsApi.updateStatus(
        resolvedParams.id,
        newStatus,
        feedback
      )

      if (response.success) {
        toast.success("Application status updated")
        mutate()
        setFeedback("")
        setNewStatus("")
      } else {
        toast.error(response.error || "Failed to update status")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Application not found</p>
          <Link href="/dashboard/admin/applications">
            <Button variant="link">Go back to applications</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Application Details" 
        subtitle="Review and manage this application"
        user={{ 
          name: user?.name || "Admin", 
          email: user?.email || "", 
          role: user?.role || "TPO" 
        }}
      />
      
      <div className="p-6">
        <Link href="/dashboard/admin/applications" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-accent">
                      {application.student?.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-foreground">{application.student?.name}</p>
                    <p className="text-muted-foreground">{application.student?.branch} - {application.student?.batch}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{application.student?.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{application.student?.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">CGPA: {application.student?.cgpa || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Applied: {format(new Date(application.appliedAt || new Date().toISOString()), "MMM d, yyyy")}</span>
                  </div>
                </div>

                {application.student?.resumeUrl && (
                  <Button variant="outline" className="mt-4">
                    <FileText className="h-4 w-4 mr-2" />
                    View Resume
                    <Download className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Job Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-foreground">{application.job?.title}</p>
                    <p className="text-muted-foreground">{application.job?.company?.name}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <Badge variant="outline">{application.job?.jobType?.replace("_", " ")}</Badge>
                      <span className="text-sm text-muted-foreground">{application.job?.location}</span>
                      {application.job?.salary && (
                        <span className="text-sm text-accent font-medium">
                          {application.job.salary.min}-{application.job.salary.max} LPA
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cover Letter */}
            {application.coverLetter && (
              <Card>
                <CardHeader>
                  <CardTitle>Cover Letter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">{application.coverLetter}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Application History */}
            {application.history && application.history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Application History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {application.history.map((item: any, index: number) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="h-2 w-2 rounded-full bg-accent mt-2" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Badge className={statusColors[item.status]}>
                              {item.status.replace("_", " ")}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(item.timestamp), "MMM d, yyyy h:mm a")}
                            </span>
                          </div>
                          {item.feedback && (
                            <p className="text-sm text-muted-foreground mt-1">{item.feedback}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`${statusColors[application.status]} text-base px-4 py-2`}>
                  {application.status.replace("_", " ")}
                </Badge>
              </CardContent>
            </Card>

            {/* Update Status */}
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">New Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                      <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                      <SelectItem value="INTERVIEW">Schedule Interview</SelectItem>
                      <SelectItem value="SELECTED">Selected</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Add feedback or notes..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleUpdateStatus}
                  disabled={!newStatus || isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Update Status"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email to Student
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Application
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
