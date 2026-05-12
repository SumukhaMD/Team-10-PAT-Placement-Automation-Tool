"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BriefcaseIcon,
  FileTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ClockIcon,
  BuildingIcon,
  MapPinIcon,
  TrendingUpIcon,
  AlertCircleIcon,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useApplications, useInterviews, useJobs } from "@/hooks/use-data"
import { Spinner } from "@/components/ui/spinner"
import { formatDistanceToNow, format } from "date-fns"

const statusColors: Record<string, string> = {
  APPLIED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  UNDER_REVIEW: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  SHORTLISTED: "bg-accent/10 text-accent border-accent/20",
  INTERVIEW: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  SELECTED: "bg-green-500/10 text-green-500 border-green-500/20",
  REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const { data: applicationsData, isLoading: applicationsLoading } = useApplications({ limit: 5 })
  const { data: interviewsData, isLoading: interviewsLoading } = useInterviews({ upcoming: true, limit: 3 })
  const { data: jobsData, isLoading: jobsLoading } = useJobs({ limit: 6, status: "ACTIVE" })

  const applications = applicationsData?.data || []
  const interviews = interviewsData?.data || []
  const jobs = jobsData?.data || []
  const getInterviewDate = (interview: any) => new Date(interview.scheduledAt || interview.scheduledDate || "")

  // Calculate stats
  const stats = {
    totalApplications: applicationsData?.total || 0,
    activeApplications: applications.filter(a => !["SELECTED", "REJECTED"].includes(a.status)).length,
    selectedCount: applications.filter(a => a.status === "SELECTED").length,
    upcomingInterviews: interviews.length,
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(" ")[0] || "Student"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your placement journey and discover new opportunities
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/student/jobs">
            Browse Jobs
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.totalApplications}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <FileTextIcon className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Applications</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.activeApplications}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUpIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Interviews</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.upcomingInterviews}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offers Received</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.selectedCount}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Applications */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/student/applications">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {applicationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-6 w-6" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <FileTextIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground mt-2">No applications yet</p>
                <Button asChild className="mt-4" size="sm">
                  <Link href="/dashboard/student/jobs">Start Applying</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 5).map((application) => (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <BuildingIcon className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{application.job?.title || "Job Position"}</p>
                        <p className="text-sm text-muted-foreground">
                          {application.job?.company?.name || "Company"} • Applied {formatDistanceToNow(new Date(application.appliedAt || new Date().toISOString()), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={statusColors[application.status] || ""}>
                      {application.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Upcoming Interviews</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/student/interviews">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {interviewsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-6 w-6" />
              </div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground mt-2">No upcoming interviews</p>
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.slice(0, 3).map((interview) => (
                  <div
                    key={interview.id}
                    className="p-4 rounded-lg border border-border bg-muted/30"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{interview.company?.name || "Company"}</p>
                        <p className="text-sm text-muted-foreground">{interview.roundType || "Interview"}</p>
                      </div>
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                        {interview.mode}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {format(getInterviewDate(interview), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-3.5 w-3.5" />
                        {format(getInterviewDate(interview), "h:mm a")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Jobs */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recommended for You</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/student/jobs">View all jobs</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <BriefcaseIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground mt-2">No jobs available at the moment</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jobs.slice(0, 6).map((job) => (
                <Link
                  key={job.id}
                  href={`/dashboard/student/jobs/${job.id}`}
                  className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted hover:border-accent/50 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <BuildingIcon className="h-5 w-5 text-accent" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {job.jobType}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-foreground mt-3 group-hover:text-accent transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{job.company?.name}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="h-3 w-3" />
                      {job.location}
                    </span>
                    {job.salary && typeof job.salary === "object" ? (
                      <span>
                        {(job.salary as any).min}-{(job.salary as any).max} LPA
                      </span>
                    ) : job.salary ? (
                      <span>
                        {Number(job.salary) >= 100000
                          ? `${(Number(job.salary) / 100000).toFixed(1).replace(/\.0$/, "")} LPA`
                          : `₹${Number(job.salary).toLocaleString()}`}
                      </span>
                    ) : null}
                  </div>
                  {job.deadline && (
                    <div className="mt-2 flex items-center gap-1 text-xs">
                      <AlertCircleIcon className="h-3 w-3 text-yellow-500" />
                      <span className="text-yellow-500">
                        Deadline: {format(new Date(job.deadline), "MMM d")}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
