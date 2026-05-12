"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Filter,
  CalendarPlus
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useApplications } from "@/hooks/use-data"
import { applicationsApi } from "@/lib/api-service"
import { Spinner } from "@/components/ui/spinner"
import { formatDistanceToNow, format } from "date-fns"
import { toast } from "sonner"
import Link from "next/link"

const statusColors: Record<string, string> = {
  APPLIED: "bg-muted text-muted-foreground",
  UNDER_REVIEW: "bg-yellow-500/10 text-yellow-600",
  SHORTLISTED: "bg-accent/10 text-accent",
  INTERVIEW: "bg-blue-500/10 text-blue-600",
  SELECTED: "bg-green-500/10 text-green-600",
  REJECTED: "bg-destructive/10 text-destructive",
  WITHDRAWN: "bg-muted text-muted-foreground",
}

export default function AdminApplicationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [newStatus, setNewStatus] = useState("")

  const { data: applicationsData, isLoading, mutate } = useApplications({
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit: 50,
  })

  const applications = applicationsData?.data || []

  const filteredApplications = applications.filter((app: any) => {
    const matchesSearch = 
      app.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job?.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === "all" || app.status === activeTab.toUpperCase()
    return matchesSearch && matchesTab
  })

  const handleUpdateStatus = async () => {
    if (!selectedApplication || !newStatus) return
    
    setIsUpdating(true)
    try {
      const response = await applicationsApi.updateStatus(
        selectedApplication.id,
        newStatus,
        feedback
      )

      if (response.success) {
        toast.success("Application status updated")
        mutate()
        setSelectedApplication(null)
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

  const statusCounts = {
    all: applications.length,
    applied: applications.filter((a: any) => a.status === "APPLIED").length,
    under_review: applications.filter((a: any) => a.status === "UNDER_REVIEW").length,
    shortlisted: applications.filter((a: any) => a.status === "SHORTLISTED").length,
    selected: applications.filter((a: any) => a.status === "SELECTED").length,
    rejected: applications.filter((a: any) => a.status === "REJECTED").length,
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Applications" 
        subtitle="Review and manage student applications"
        user={{ 
          name: user?.name || "Admin", 
          email: user?.email || "", 
          role: user?.role || "TPO" 
        }}
      />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">{statusCounts.all}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Under Review</p>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.under_review}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Shortlisted</p>
              <p className="text-2xl font-bold text-accent">{statusCounts.shortlisted}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Selected</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.selected}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-destructive">{statusCounts.rejected}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student, company, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="APPLIED">Applied</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                <SelectItem value="INTERVIEW">Interview</SelectItem>
                <SelectItem value="SELECTED">Selected</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="applied">New ({statusCounts.applied})</TabsTrigger>
            <TabsTrigger value="under_review">Review ({statusCounts.under_review})</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted ({statusCounts.shortlisted})</TabsTrigger>
            <TabsTrigger value="selected">Selected ({statusCounts.selected})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Applications Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No applications found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Company</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Applied</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((app: any) => (
                      <tr key={app.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center">
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
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {app.job?.company?.name || "Company"}
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground">
                          {app.job?.title || "Position"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[app.status]}>
                            {app.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedApplication(app)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-accent hover:text-accent hover:bg-accent/10"
                              onClick={() => {
                                const params = new URLSearchParams()
                                if (app.id) params.set("applicationId", String(app.id))
                                if (app.student?.id) params.set("studentId", String(app.student.id))
                                if (app.job?.company?.id) params.set("companyId", String(app.job.company.id))
                                router.push(`/dashboard/admin/interviews/new?${params.toString()}`)
                              }}
                            >
                              <CalendarPlus className="h-4 w-4 mr-1" />
                              Schedule
                            </Button>
                          </div>
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

      {/* Review Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Update the status of this application
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-accent">
                    {selectedApplication.student?.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{selectedApplication.student?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedApplication.student?.email}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>CGPA: {selectedApplication.student?.cgpa || "N/A"}</span>
                    <span>Branch: {selectedApplication.student?.branch || "N/A"}</span>
                  </div>
                </div>
                <Badge className={statusColors[selectedApplication.status]}>
                  {selectedApplication.status.replace("_", " ")}
                </Badge>
              </div>

              {/* Job Info */}
              <div className="p-4 rounded-lg border border-border">
                <p className="font-medium text-foreground">{selectedApplication.job?.title}</p>
                <p className="text-sm text-muted-foreground">{selectedApplication.job?.company?.name}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Applied: {format(new Date(selectedApplication.appliedAt), "MMM d, yyyy")}</span>
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApplication.coverLetter && (
                <div className="space-y-2">
                  <Label>Cover Letter</Label>
                  <div className="p-4 rounded-lg bg-muted/50 text-sm">
                    {selectedApplication.coverLetter}
                  </div>
                </div>
              )}

              {/* Update Status */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Update Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
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
                  <Label htmlFor="feedback">Feedback (Optional)</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Add any feedback or notes..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApplication(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={!newStatus || isUpdating}>
              {isUpdating ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
