"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Briefcase, 
  FileText, 
  Calendar, 
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useJobs, useApplications, useInterviews, useCompanies } from "@/hooks/use-data"
import { Spinner } from "@/components/ui/spinner"
import { format, isToday } from "date-fns"
import { getStoredRecruiterCompanyId, setStoredRecruiterCompanyId } from "@/lib/recruiter-company"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const statusColors: Record<string, string> = {
  NEW: "bg-accent/10 text-accent",
  APPLIED: "bg-accent/10 text-accent",
  UNDER_REVIEW: "bg-yellow-500/10 text-yellow-600",
  SHORTLISTED: "bg-green-500/10 text-green-600",
  INTERVIEW: "bg-blue-500/10 text-blue-600",
  SELECTED: "bg-green-500/10 text-green-600",
  REJECTED: "bg-destructive/10 text-destructive",
}

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const [companyId, setCompanyId] = useState("")
  const { data: companiesData } = useCompanies({ limit: 100 })

  useEffect(() => {
    setCompanyId(getStoredRecruiterCompanyId())
  }, [])

  const { data: jobsData, isLoading: jobsLoading } = useJobs({ limit: 5, companyId: companyId || undefined })
  const { data: applicationsData, isLoading: applicationsLoading } = useApplications({ limit: 5, companyId: companyId || undefined })
  const { data: interviewsData, isLoading: interviewsLoading } = useInterviews({ upcoming: true, limit: 5, companyId: companyId || undefined })

  const jobs = jobsData?.data || []
  const applications = applicationsData?.data || []
  const interviews = interviewsData?.data || []
  const companies = companiesData?.data || []
  const totalApplications = (applicationsData as typeof applicationsData & { total?: number } | undefined)?.total || applications.length

  const todayInterviews = interviews.filter(i => {
    const interviewDate = new Date(i.scheduledAt || (i as typeof i & { scheduledDate?: string }).scheduledDate || "")
    return !Number.isNaN(interviewDate.getTime()) && isToday(interviewDate)
  })

  const stats = [
    { 
      label: "Active Job Posts", 
      value: jobs.filter(j => String(j.status) === "ACTIVE").length.toString(), 
      icon: Briefcase, 
      change: "Currently active" 
    },
    { 
      label: "Total Applications", 
      value: totalApplications.toString(), 
      icon: FileText, 
      change: "All applications" 
    },
    { 
      label: "Interviews Scheduled", 
      value: interviews.length.toString(), 
      icon: Calendar, 
      change: `${todayInterviews.length} today` 
    },
    { 
      label: "Offers Made", 
      value: applications.filter(a => a.status === "SELECTED").length.toString(), 
      icon: CheckCircle2, 
      change: "This season" 
    },
  ]

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Recruiter Dashboard" 
        subtitle="Manage job postings and candidate applications"
        user={{ 
          name: user?.name || "Recruiter", 
          email: user?.email || "", 
          role: "Recruiter" 
        }}
      />
      
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-4">
            <Select
              value={companyId || undefined}
              onValueChange={(value) => {
                setCompanyId(value)
                setStoredRecruiterCompanyId(value)
              }}
            >
              <SelectTrigger className="w-full md:w-72">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company: { id: string; name: string }) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Applications</CardTitle>
              <Link href="/dashboard/recruiter/applications">
                <Button variant="ghost" size="sm" className="text-accent">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground mt-2">No applications yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-accent">
                            {String(app.studentId || "?").slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                      <p className="font-medium text-foreground">Student ID: {(app as typeof app & { studentId?: string }).studentId || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">Application ID: {app.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={statusColors[app.status]}>
                          {app.status.replace("_", " ")}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">Job ID: {(app as typeof app & { jobId?: string }).jobId || "Unknown"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Interviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Today&apos;s Interviews</CardTitle>
              <Link href="/dashboard/recruiter/interviews">
                <Button variant="ghost" size="sm" className="text-accent">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {interviewsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : todayInterviews.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground mt-2">No interviews scheduled today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayInterviews.map((interview) => {
                    const interviewDate = new Date(interview.scheduledAt || (interview as typeof interview & { scheduledDate?: string }).scheduledDate || "")
                    return (
                    <div key={interview.id} className="p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium text-foreground">
                          {format(interviewDate, "h:mm a")}
                        </span>
                        <Badge variant="outline" className="ml-auto text-xs">{interview.mode}</Badge>
                      </div>
                      <p className="font-medium text-foreground">Student ID: {(interview as typeof interview & { studentId?: string }).studentId || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">Application ID: {(interview as typeof interview & { applicationId?: string }).applicationId || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground mt-1">{(interview as typeof interview & { roundType?: string }).roundType || interview.type || "Interview"}</p>
                    </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Job Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Active Job Posts</CardTitle>
            <Link href="/dashboard/recruiter/jobs/new">
              <Button>
                <Briefcase className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-6 w-6" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground mt-2">No job posts yet</p>
                <Link href="/dashboard/recruiter/jobs/new">
                  <Button className="mt-4">Post Your First Job</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Applications</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Deadline</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-b border-border last:border-0">
                        <td className="py-4 px-4">
                          <p className="font-medium text-foreground">{job.title}</p>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">{String((job as typeof job & { jobType?: string }).jobType || job.type || "").replace("_", " ")}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-foreground">{job.applicationsCount || 0}</span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={statusColors[job.status || "ACTIVE"]}>
                            {job.status || "ACTIVE"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-muted-foreground">
                            {(job as typeof job & { deadline?: string }).deadline ? format(new Date((job as typeof job & { deadline?: string }).deadline || ""), "MMM d, yyyy") : "No deadline"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link href={`/dashboard/recruiter/jobs/${job.id}/applications`}>
                            <Button variant="ghost" size="sm">View Applications</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
