"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
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
import { 
  Briefcase, 
  Building2,
  MapPin,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  Users
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useJobs } from "@/hooks/use-data"
import { jobsApi } from "@/lib/api-service"
import { Spinner } from "@/components/ui/spinner"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-600",
  CLOSED: "bg-muted text-muted-foreground",
  ON_HOLD: "bg-yellow-500/10 text-yellow-600",
  // Fallback aliases from frontend legacy values
  OPEN: "bg-green-500/10 text-green-600",
  DRAFT: "bg-yellow-500/10 text-yellow-600",
  PAUSED: "bg-accent/10 text-accent",
}

export default function AdminJobsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [jobToDelete, setJobToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: jobsData, isLoading, mutate } = useJobs({
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit: 50,
  })

  const jobs = jobsData?.data || []

  const filteredJobs = jobs.filter((job: any) => {
    const matchesSearch = 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === "all" || job.status?.toLowerCase() === activeTab
    return matchesSearch && matchesTab
  })

  const jobCounts = {
    all: jobs.length,
    active: jobs.filter((j: any) => j.status === "ACTIVE").length,
    closed: jobs.filter((j: any) => j.status === "CLOSED").length,
    on_hold: jobs.filter((j: any) => j.status === "ON_HOLD").length,
  }

  const handleDeleteJob = async () => {
    if (!jobToDelete) return
    
    setIsDeleting(true)
    try {
      const response = await jobsApi.delete(jobToDelete.id)
      if (response.success) {
        toast.success("Job deleted successfully")
        mutate()
        setJobToDelete(null)
      } else {
        toast.error(response.error || "Failed to delete job")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Job Postings" 
        subtitle="Manage all job postings"
        user={{ 
          name: user?.name || "Admin", 
          email: user?.email || "", 
          role: user?.role || "TPO" 
        }}
      />
      
      <div className="p-6 space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/dashboard/admin/jobs/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Post Job
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({jobCounts.all})</TabsTrigger>
            <TabsTrigger value="active">Active ({jobCounts.active})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({jobCounts.closed})</TabsTrigger>
            <TabsTrigger value="on_hold">On Hold ({jobCounts.on_hold})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Jobs List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground mt-4">No jobs found</p>
              <Link href="/dashboard/admin/jobs/new">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job: any) => (
              <Card key={job.id} className="hover:border-accent/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        {job.company?.logo ? (
                          <img 
                            src={job.company.logo} 
                            alt={job.company.name}
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                        ) : (
                          <Briefcase className="h-6 w-6 text-accent" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start gap-3 flex-wrap">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                            <p className="text-muted-foreground">{job.company?.name}</p>
                          </div>
                          <Badge className={statusColors[job.status] || statusColors.OPEN}>
                            {job.status}
                          </Badge>
                          <Badge variant="outline">{job.jobType?.replace("_", " ") || "Full Time"}</Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location || "Remote"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {job.applicationsCount || 0} applications
                          </span>
                          {job.salary && typeof job.salary === "object" ? (
                            <span className="text-accent font-medium">
                              {(job.salary as any).min}-{(job.salary as any).max} LPA
                            </span>
                          ) : job.salary ? (
                            <span className="text-accent font-medium">
                              {Number(job.salary) >= 100000 
                                ? `${(Number(job.salary) / 100000).toFixed(1).replace(/\.0$/, "")} LPA`
                                : `₹${Number(job.salary).toLocaleString()}`
                              }
                            </span>
                          ) : null}
                          <span>
                            Posted {formatDistanceToNow(new Date(job.createdAt || Date.now()), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/admin/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/jobs/${job.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/jobs/${job.id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Job
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => setJobToDelete(job)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!jobToDelete} onOpenChange={() => setJobToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Posting</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{jobToDelete?.title}&quot;? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJobToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteJob} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Job"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
