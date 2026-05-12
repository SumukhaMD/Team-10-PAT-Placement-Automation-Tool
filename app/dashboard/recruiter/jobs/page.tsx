"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Briefcase, 
  Calendar,
  Users,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
  Loader
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface Job {
  id: string | number
  title: string
  type: string
  status: "ACTIVE" | "CLOSED" | "DRAFT"
  applicationsCount?: number
  shortlistedCount?: number
  interviewCount?: number
  selectedCount?: number
  positions: number | string
  salary: string
  location: string
  deadline: string
  postedDate?: string
}

export default function RecruiterJobsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [deleteId, setDeleteId] = useState<string | number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/jobs", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("placeit_access_token")}`
        }
      })

      if (!response.ok) throw new Error("Failed to fetch jobs")

      const data = await response.json()
      setJobs(Array.isArray(data) ? data : data.data || [])
    } catch (error) {
      console.error("[v0] Fetch jobs error:", error)
      toast({
        title: "Error",
        description: "Failed to load job postings.",
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
      const response = await fetch(`/api/jobs/${deleteId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("placeit_access_token")}`
        }
      })

      if (!response.ok) throw new Error("Failed to delete job")

      setJobs(jobs.filter(j => j.id !== deleteId))
      toast({
        title: "Success",
        description: "Job posting deleted successfully!",
      })
    } catch (error) {
      console.error("[v0] Delete job error:", error)
      toast({
        title: "Error",
        description: "Failed to delete job posting.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteId(null)
    }
  }

  const handleDuplicate = async (job: Job) => {
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("placeit_access_token")}`
        },
        body: JSON.stringify({
          title: `${job.title} (Copy)`,
          location: job.location,
          salary: job.salary,
          positions: job.positions,
          deadline: job.deadline,
          jobType: job.type,
        })
      })

      if (!response.ok) throw new Error("Failed to duplicate job")

      const newJob = await response.json()
      setJobs([...jobs, newJob])
      toast({
        title: "Success",
        description: "Job posting duplicated successfully!",
      })
    } catch (error) {
      console.error("[v0] Duplicate job error:", error)
      toast({
        title: "Error",
        description: "Failed to duplicate job posting.",
        variant: "destructive",
      })
    }
  }

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-500/10 text-green-600",
    CLOSED: "bg-muted text-muted-foreground",
    DRAFT: "bg-yellow-500/10 text-yellow-600",
  }

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === "all") return true
    return job.status.toLowerCase() === activeTab
  })

  if (loading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader 
          title="Job Postings" 
          subtitle="Manage your job listings"
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
        title="Job Postings" 
        subtitle="Manage your job listings"
        user={{ name: "Recruiter", email: "recruiter@company.com", role: "Recruiter" }}
      />
      
      <div className="p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({jobs.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({jobs.filter(j => j.status === "ACTIVE").length})</TabsTrigger>
              <TabsTrigger value="closed">Closed ({jobs.filter(j => j.status === "CLOSED").length})</TabsTrigger>
            </TabsList>
          </Tabs>
          <Link href="/dashboard/recruiter/jobs/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No job postings found. Create one to get started!</p>
              <Link href="/dashboard/recruiter/jobs/new">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Post First Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:border-accent/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                          <Briefcase className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                          <Link href={`/dashboard/recruiter/jobs/${job.id}`} className="hover:underline">
                            <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={statusColors[job.status]}>
                              {job.status}
                            </Badge>
                            <Badge variant="outline">{job.type}</Badge>
                            <span className="text-sm text-muted-foreground">{job.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                          <p className="text-2xl font-bold text-foreground">{job.applicationsCount || 0}</p>
                          <p className="text-xs text-muted-foreground">Applications</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                          <p className="text-2xl font-bold text-foreground">{job.shortlistedCount || 0}</p>
                          <p className="text-xs text-muted-foreground">Shortlisted</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                          <p className="text-2xl font-bold text-foreground">{job.interviewCount || 0}</p>
                          <p className="text-xs text-muted-foreground">Interviewed</p>
                        </div>
                        <div className="p-3 rounded-lg bg-accent/10 text-center">
                          <p className="text-2xl font-bold text-accent">{job.selectedCount || 0}</p>
                          <p className="text-xs text-muted-foreground">Selected</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.positions} positions
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Deadline: {job.deadline}
                        </span>
                        <span className="text-accent font-medium">{job.salary}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Link href={`/dashboard/recruiter/jobs/${job.id}`}>
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
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/recruiter/jobs/${job.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/recruiter/jobs/${job.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Job
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(job)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => { e.preventDefault(); setDeleteId(job.id) }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Close Job
                              </DropdownMenuItem>
                            </DialogTrigger>
                            {deleteId === job.id && (
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Job Posting?</DialogTitle>
                                  <DialogDescription>
                                    This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex gap-4 justify-end pt-4">
                                  <Button variant="outline" onClick={() => setDeleteId(null)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={deleteLoading}
                                  >
                                    {deleteLoading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                                    {deleteLoading ? "Deleting..." : "Delete"}
                                  </Button>
                                </div>
                              </DialogContent>
                            )}
                          </Dialog>
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
    </div>
  )
}
