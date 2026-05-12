"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Users,
  Briefcase,
  Edit,
  Download,
  Mail,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useDrive, useApplications } from "@/hooks/use-data"
import { Spinner } from "@/components/ui/spinner"
import { format } from "date-fns"
import Link from "next/link"

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-600",
  UPCOMING: "bg-accent/10 text-accent",
  COMPLETED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-destructive/10 text-destructive",
  APPLIED: "bg-muted text-muted-foreground",
  UNDER_REVIEW: "bg-yellow-500/10 text-yellow-600",
  SHORTLISTED: "bg-accent/10 text-accent",
  INTERVIEW: "bg-blue-500/10 text-blue-600",
  SELECTED: "bg-green-500/10 text-green-600",
  REJECTED: "bg-destructive/10 text-destructive",
}

const toArray = (val: any): string[] => {
  if (!val) return []
  if (Array.isArray(val)) return val
  return val.split(/,|\n/).map((s: string) => s.trim()).filter(Boolean)
}

export default function DriveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user } = useAuth()

  const { data: drive, isLoading } = useDrive(resolvedParams.id)
  const { data: applicationsData } = useApplications({ jobId: resolvedParams.id, limit: 50 })

  const applications = applicationsData?.data || []

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!drive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Drive not found</p>
          <Link href="/dashboard/admin/drives">
            <Button variant="link">Go back to drives</Button>
          </Link>
        </div>
      </div>
    )
  }

  const appStats = {
    total: applications.length,
    underReview: applications.filter((a: any) => a.status === "UNDER_REVIEW").length,
    shortlisted: applications.filter((a: any) => a.status === "SHORTLISTED").length,
    selected: applications.filter((a: any) => a.status === "SELECTED").length,
    rejected: applications.filter((a: any) => a.status === "REJECTED").length,
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Drive Details" 
        subtitle="View and manage placement drive"
        user={{ 
          name: user?.name || "Admin", 
          email: user?.email || "", 
          role: user?.role || "TPO" 
        }}
      />
      
      <div className="p-6">
        <Link href="/dashboard/admin/drives" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Drives
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Drive Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-16 w-16 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    {drive.company?.logo ? (
                      <img 
                        src={drive.company.logo} 
                        alt={drive.company.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-accent" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-foreground">{drive.title}</h1>
                        <p className="text-lg text-muted-foreground">{drive.company?.name}</p>
                      </div>
                      <Badge className={statusColors[drive.status] || statusColors.UPCOMING}>
                        {drive.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {drive.location || "Location TBD"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {drive.jobType?.replace("_", " ") || "Full Time"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {drive.positions || 0} positions
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{appStats.total}</p>
                    <p className="text-xs text-muted-foreground">Applications</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{appStats.underReview}</p>
                    <p className="text-xs text-muted-foreground">Under Review</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{appStats.shortlisted}</p>
                    <p className="text-xs text-muted-foreground">Shortlisted</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{appStats.selected}</p>
                    <p className="text-xs text-muted-foreground">Selected</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Applications Tab */}
            <Card>
              <CardHeader>
                <CardTitle>Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <p className="text-muted-foreground mt-2">No applications yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Branch</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">CGPA</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.slice(0, 10).map((app: any) => (
                          <tr key={app.id} className="border-b border-border last:border-0">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                                  <span className="text-xs font-medium text-accent">
                                    {app.student?.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{app.student?.name || "Student"}</p>
                                  <p className="text-xs text-muted-foreground">{app.student?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">{app.student?.branch || "N/A"}</td>
                            <td className="py-3 px-4 text-sm text-foreground">{app.student?.cgpa || "N/A"}</td>
                            <td className="py-3 px-4">
                              <Badge className={statusColors[app.status]}>
                                {app.status.replace("_", " ")}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Link href={`/dashboard/admin/applications/${app.id}`}>
                                <Button variant="ghost" size="sm">Review</Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {applications.length > 10 && (
                  <div className="mt-4 text-center">
                    <Link href={`/dashboard/admin/applications?driveId=${resolvedParams.id}`}>
                      <Button variant="outline">View All {applications.length} Applications</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" onClick={() => router.push(`/dashboard/admin/drives/${resolvedParams.id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Drive
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Notifications
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Applications
                </Button>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Registration Opens</p>
                  <p className="font-medium text-foreground">
                    {drive.startDate ? format(new Date(drive.startDate), "MMM d, yyyy") : "TBD"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Application Deadline</p>
                  <p className="font-medium text-foreground">
                    {drive.endDate ? format(new Date(drive.endDate), "MMM d, yyyy") : "TBD"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Package Details */}
            <Card>
              <CardHeader>
                <CardTitle>Package</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-accent">
                  {drive.salary?.min && drive.salary?.max 
                    ? `${drive.salary.min} - ${drive.salary.max} LPA` 
                    : "Not specified"
                  }
                </p>
              </CardContent>
            </Card>

            {/* Eligibility */}
            <Card>
              <CardHeader>
                <CardTitle>Eligibility Criteria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Minimum CGPA</span>
                  <span className="font-medium">{drive.eligibilityCriteria?.minCgpa || "Any"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Max Backlogs</span>
                  <span className="font-medium">{drive.eligibilityCriteria?.maxBacklogs ?? "Any"}</span>
                </div>
                {toArray(drive.eligibilityCriteria?.allowedBranches).length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Eligible Branches</p>
                    <div className="flex flex-wrap gap-2">
                      {toArray(drive.eligibilityCriteria?.allowedBranches).map((branch: string) => (
                        <Badge key={branch} variant="outline">{branch}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
