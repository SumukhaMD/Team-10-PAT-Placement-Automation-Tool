"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, 
  Calendar,
  Eye,
  ChevronRight,
  XCircle,
  Loader2,
} from "lucide-react"
import { useApplications } from "@/hooks/use-data"
import { useAuth } from "@/lib/auth-context"
import { apiService } from "@/lib/api-service"
import { toast } from "sonner"
import { formatDistanceToNow, format } from "date-fns"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"
import type { JobApplication } from "@/lib/types"

const statusColors: Record<string, string> = {
  APPLIED: "bg-muted text-muted-foreground",
  UNDER_REVIEW: "bg-yellow-500/10 text-yellow-600",
  SHORTLISTED: "bg-accent/10 text-accent",
  INTERVIEW: "bg-blue-500/10 text-blue-600",
  SELECTED: "bg-green-500/10 text-green-600",
  REJECTED: "bg-destructive/10 text-destructive",
}

const statusSteps = ["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "SELECTED"]

function getTimeline(status: string) {
  const currentIndex = statusSteps.indexOf(status)
  if (status === "REJECTED") {
    return statusSteps.slice(0, currentIndex >= 0 ? currentIndex + 1 : 2).map((step, i) => ({
      status: step,
      completed: true,
    })).concat([{ status: "REJECTED", completed: true }])
  }
  return statusSteps.map((step, index) => ({
    status: step,
    completed: index <= currentIndex,
  }))
}

export default function ApplicationsPage() {
  const { user } = useAuth()
  const [selectedApp, setSelectedApp] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)

  const { data: applicationsData, isLoading, error, mutate } = useApplications()
  const applications = applicationsData?.data || []

  const filteredApplications = applications.filter((app) => {
    if (activeTab === "all") return true
    if (activeTab === "active") return !["SELECTED", "REJECTED"].includes(app.status)
    if (activeTab === "completed") return ["SELECTED", "REJECTED"].includes(app.status)
    return true
  })

  const selectedApplication = applications.find((app) => app.id === selectedApp)

  const handleWithdraw = async (applicationId: string) => {
    setWithdrawingId(applicationId)
    try {
      const response = await apiService.delete(`/api/applications/${applicationId}`)
      if (response.success) {
        toast.success("Application withdrawn successfully")
        mutate()
        if (selectedApp === applicationId) {
          setSelectedApp(null)
        }
      } else {
        toast.error(response.error || "Failed to withdraw application")
      }
    } catch (err) {
      toast.error("Failed to withdraw application")
    } finally {
      setWithdrawingId(null)
    }
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="My Applications" 
        subtitle="Track your job application progress"
        user={{ 
          name: user?.name || "Student", 
          email: user?.email || "", 
          role: "student" 
        }}
      />
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications List */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
                <TabsTrigger value="active">
                  Active ({applications.filter(a => !["SELECTED", "REJECTED"].includes(a.status)).length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({applications.filter(a => ["SELECTED", "REJECTED"].includes(a.status)).length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Failed to load applications. Please try again.</p>
                  <Button onClick={() => mutate()} className="mt-4">Retry</Button>
                </CardContent>
              </Card>
            ) : filteredApplications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground mt-4">No applications found</p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/student/jobs">Browse Jobs</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredApplications.map((app) => (
                  <Card 
                    key={app.id} 
                    className={`cursor-pointer transition-all ${
                      selectedApp === app.id ? "border-accent ring-2 ring-accent/20" : "hover:border-accent/50"
                    }`}
                    onClick={() => setSelectedApp(app.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                            {app.job?.company?.logo ? (
                              <img 
                                src={app.job.company.logo} 
                                alt={app.job.company.name}
                                className="h-8 w-8 rounded-lg object-cover"
                              />
                            ) : (
                              <Building2 className="h-6 w-6 text-accent" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{app.job?.title || "Position"}</h3>
                            <p className="text-sm text-muted-foreground">{app.job?.company?.name || "Company"}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(app.appliedAt || new Date().toISOString()), "MMM d, yyyy")}
                              </span>
                              <span>{app.job?.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={statusColors[app.status]}>
                            {app.status.replace("_", " ")}
                          </Badge>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Application Details */}
          <div className="lg:col-span-1">
            {selectedApplication ? (
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center">
                      {selectedApplication.job?.company?.logo ? (
                        <img 
                          src={selectedApplication.job.company.logo} 
                          alt={selectedApplication.job.company.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <Building2 className="h-7 w-7 text-accent" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{selectedApplication.job?.title}</h3>
                      <p className="text-sm text-muted-foreground">{selectedApplication.job?.company?.name}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge className={statusColors[selectedApplication.status]}>
                        {selectedApplication.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Location</span>
                      <span className="text-foreground">{selectedApplication.job?.location}</span>
                    </div>
                    {selectedApplication.job?.salary && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Salary</span>
                        <span className="text-accent font-medium">
                          {selectedApplication.job.salary.min}-{selectedApplication.job.salary.max} LPA
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Applied On</span>
                      <span className="text-foreground">
                        {format(new Date(selectedApplication.appliedAt || new Date().toISOString()), "MMM d, yyyy")}
                      </span>
                    </div>
                    {selectedApplication.updatedAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Update</span>
                        <span className="text-foreground">
                          {formatDistanceToNow(new Date(selectedApplication.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-6">
                    <h4 className="text-sm font-semibold text-foreground mb-4">Application Timeline</h4>
                    <div className="space-y-4">
                      {getTimeline(selectedApplication.status).map((step, index, arr) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`h-3 w-3 rounded-full ${
                              step.completed 
                                ? step.status === "REJECTED" 
                                  ? "bg-destructive" 
                                  : "bg-accent" 
                                : "bg-muted"
                            }`} />
                            {index < arr.length - 1 && (
                              <div className={`w-px h-8 ${
                                step.completed ? "bg-accent" : "bg-muted"
                              }`} />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className={`text-sm font-medium ${
                              step.completed ? "text-foreground" : "text-muted-foreground"
                            }`}>
                              {step.status.replace("_", " ")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {step.completed ? "Completed" : "Pending"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 mt-6">
                    <Button asChild className="w-full">
                      <Link href={`/dashboard/student/jobs/${selectedApplication.job?.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Job Details
                      </Link>
                    </Button>
                    {!["SELECTED", "REJECTED"].includes(selectedApplication.status) && (
                      <Button 
                        variant="outline" 
                        className="w-full text-destructive hover:text-destructive"
                        onClick={() => handleWithdraw(selectedApplication.id)}
                        disabled={withdrawingId === selectedApplication.id}
                      >
                        {withdrawingId === selectedApplication.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Withdrawing...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Withdraw Application
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Eye className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-foreground">Select an Application</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click on an application to view details
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
