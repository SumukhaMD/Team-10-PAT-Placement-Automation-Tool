"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Building2, 
  Briefcase, 
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Calendar,
  Clock,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useDashboardStats, useDrives, useApplications } from "@/hooks/use-data"
import { Spinner } from "@/components/ui/spinner"
import { formatDistanceToNow, format } from "date-fns"

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

export default function AdminDashboard() {
  const { user } = useAuth()
  const { data: statsData, isLoading: statsLoading } = useDashboardStats()
  const { data: drivesData, isLoading: drivesLoading } = useDrives({ limit: 3 })
  const { data: applicationsData, isLoading: applicationsLoading } = useApplications({ limit: 5 })

  const stats = statsData || {
    totalStudents: 0,
    totalCompanies: 0,
    activeDrives: 0,
    placedStudents: 0,
    placementRate: 0,
    pendingApplications: 0,
  }

  const drives = drivesData?.data || []
  const applications = applicationsData?.data || []

  const statCards = [
    { 
      label: "Total Students", 
      value: stats.totalStudents?.toLocaleString() || "0", 
      icon: Users, 
      change: "Registered students", 
      trend: "up" 
    },
    { 
      label: "Active Drives", 
      value: stats.activeDrives?.toString() || "0", 
      icon: Briefcase, 
      change: "Currently running", 
      trend: "neutral" 
    },
    { 
      label: "Companies", 
      value: stats.totalCompanies?.toString() || "0", 
      icon: Building2, 
      change: "Partner companies", 
      trend: "up" 
    },
    { 
      label: "Students Placed", 
      value: stats.placedStudents?.toLocaleString() || "0", 
      icon: CheckCircle2, 
      change: `${stats.placementRate?.toFixed(1) || 0}% placement rate`, 
      trend: "up" 
    },
  ]

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Admin Dashboard" 
        subtitle="Manage placement activities and track progress"
        user={{ 
          name: user?.name || "Admin", 
          email: user?.email || "", 
          role: user?.role || "TPO" 
        }}
      />
      
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        {statsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        {stat.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                        {stat.change}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Placement Drives */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Placement Drives</CardTitle>
              <Link href="/dashboard/admin/drives">
                <Button variant="ghost" size="sm" className="text-accent">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {drivesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : drives.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground mt-2">No placement drives yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {drives.map((drive) => (
                    <div key={drive.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                          {drive.company?.logo ? (
                            <img 
                              src={drive.company.logo} 
                              alt={drive.company.name}
                              className="h-8 w-8 rounded-lg object-cover"
                            />
                          ) : (
                            <Building2 className="h-6 w-6 text-accent" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{drive.company?.name || drive.title}</p>
                          <p className="text-sm text-muted-foreground">{drive.description}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{drive.applicationsCount || 0} applications</span>
                            <span>{drive.positions || 0} positions</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={statusColors[drive.status]}>
                          {drive.status}
                        </Badge>
                        {drive.endDate && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Deadline: {format(new Date(drive.endDate), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/dashboard/admin/drives/new">
                <Button className="w-full mt-4">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Create New Drive
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/admin/companies/new" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="h-4 w-4 mr-2" />
                  Add New Company
                </Button>
              </Link>
              <Link href="/dashboard/admin/jobs/new" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Post New Job
                </Button>
              </Link>
              <Link href="/dashboard/admin/students" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Students
                </Button>
              </Link>
              <Link href="/dashboard/admin/reports" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </Link>
              <Link href="/dashboard/admin/settings" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Applications</CardTitle>
            <Link href="/dashboard/admin/applications">
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
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground mt-2">No applications yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Company</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-accent">
                                {app.student?.name?.split(" ").map(n => n[0]).join("") || "?"}
                              </span>
                            </div>
                            <span className="font-medium text-foreground">{app.student?.name || "Student"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{app.job?.company?.name || "Company"}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{app.job?.title || "Position"}</td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[app.status]}>
                            {app.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(app.appliedAt || new Date().toISOString()), { addSuffix: true })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/dashboard/admin/applications/${app.id}`}>
                            <Button variant="ghost" size="sm">View</Button>
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
