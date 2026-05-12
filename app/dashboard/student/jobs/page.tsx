"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Building2,
  MapPin,
  Briefcase,
  Clock,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Loader2,
} from "lucide-react"
import { useJobs } from "@/hooks/use-data"
import { useAuth } from "@/lib/auth-context"
import { apiService } from "@/lib/api-service"
import { toast } from "sonner"
import { formatDistanceToNow, format } from "date-fns"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"

type JobForDisplay = {
  id: string
  title: string
  company: {
    name: string
    logo?: string
  }
  location: string
  experience?: string
  createdAt: string
  requirements: string[]
  description?: string
  jobType: string
  salaryText?: string
  applicationsCount?: number
  deadline?: string
}

type RawJob = Record<string, any>

export default function JobsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [applyingTo, setApplyingTo] = useState<string | null>(null)

  const { data: jobsData, isLoading, error, mutate } = useJobs({
    search: searchTerm || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
  })

  const jobs = (jobsData?.data || []).map((job) => normalizeJob(job as RawJob))
  const total = jobsData?.total || jobs.length

  const toggleSaveJob = (id: string) => {
    setSavedJobs((prev) => (prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]))

    toast.success(savedJobs.includes(id) ? "Job removed from saved" : "Job saved successfully")
  }

  const handleApply = async (jobId: string) => {
    setApplyingTo(jobId)

    try {
      const response = await apiService.post("/api/applications", { jobId })

      if (response.success) {
        toast.success("Application submitted successfully!")
        mutate()
      } else {
        toast.error(response.error || "Failed to apply")
      }
    } catch (err) {
      console.error("[v0] Apply job error:", err)
      toast.error("Failed to submit application")
    } finally {
      setApplyingTo(null)
    }
  }

  function normalizeJob(raw: RawJob): JobForDisplay {
    const company = raw.company && typeof raw.company === "object" ? raw.company : {}

    return {
      id: String(raw.id || raw.jobId || ""),
      title: String(raw.title || raw.role || raw.jobTitle || "Untitled Job"),
      company: {
        name: String(company.name || raw.companyName || `Company #${raw.companyId || "Unknown"}`),
        logo: typeof company.logo === "string" ? company.logo : undefined,
      },
      location: String(raw.location || "Remote"),
      experience: raw.experience ? String(raw.experience) : undefined,
      createdAt: String(raw.createdAt || raw.createdDate || raw.postedAt || new Date().toISOString()),
      requirements: normalizeRequirements(raw.requirements),
      description: raw.description ? String(raw.description) : undefined,
      jobType: String(raw.jobType || raw.type || "FULL_TIME"),
      salaryText: formatSalary(raw.salary),
      applicationsCount:
        typeof raw.applicationsCount === "number"
          ? raw.applicationsCount
          : typeof raw.applicationCount === "number"
            ? raw.applicationCount
            : undefined,
      deadline: raw.deadline ? String(raw.deadline) : undefined,
    }
  }

  function normalizeRequirements(requirements: unknown): string[] {
    if (Array.isArray(requirements)) {
      return requirements.map((item) => String(item).trim()).filter(Boolean)
    }

    if (typeof requirements === "string") {
      return requirements
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter(Boolean)
    }

    return []
  }

  function formatSalary(salary: unknown): string | undefined {
    if (!salary) return undefined

    if (typeof salary === "number") {
      if (salary >= 100000) {
        return `${(salary / 100000).toFixed(1).replace(/\.0$/, "")} LPA`
      }

      return `₹${salary.toLocaleString()}`
    }

    if (typeof salary === "string") {
      return salary
    }

    if (typeof salary === "object") {
      const salaryObject = salary as Record<string, unknown>
      const min = salaryObject.min
      const max = salaryObject.max

      if (min && max) {
        return `${min}-${max} LPA`
      }

      if (salaryObject.amount) {
        return String(salaryObject.amount)
      }
    }

    return undefined
  }

  function formatCreatedDate(value: string) {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return "Recently posted"
    }

    return formatDistanceToNow(date, { addSuffix: true })
  }

  function formatDeadline(value: string) {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return format(date, "MMM d, yyyy")
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="Browse Jobs"
        subtitle="Find your perfect opportunity"
        user={{
          name: user?.name || "Student",
          email: user?.email || "",
          role: "student",
        }}
      />

      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <Input
                  placeholder="Search jobs or companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                  <SelectItem value="INTERNSHIP">Internship</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {jobs.length} of {total} jobs
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Failed to load jobs. Please try again.</p>

              <Button onClick={() => mutate()} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground mt-4">No jobs found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:border-accent/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        {job.company.logo ? (
                          <img
                            src={job.company.logo}
                            alt={job.company.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <Building2 className="h-7 w-7 text-accent" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link
                              href={`/dashboard/student/jobs/${job.id}`}
                              className="text-lg font-semibold text-foreground hover:text-accent transition-colors"
                            >
                              {job.title}
                            </Link>

                            <p className="text-muted-foreground">{job.company.name}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>

                          {job.experience && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {job.experience}
                            </span>
                          )}

                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatCreatedDate(job.createdAt)}
                          </span>
                        </div>

                        {job.requirements.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {job.requirements.slice(0, 5).map((skill) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}

                            {job.requirements.length > 5 && (
                              <Badge variant="outline">+{job.requirements.length - 5} more</Badge>
                            )}
                          </div>
                        )}

                        {job.description && (
                          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                            {job.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={job.jobType === "INTERNSHIP" ? "outline" : "default"}>
                          {job.jobType.replace("_", " ")}
                        </Badge>

                        <Button variant="ghost" size="icon" onClick={() => toggleSaveJob(job.id)}>
                          {savedJobs.includes(job.id) ? (
                            <BookmarkCheck className="h-5 w-5 text-accent" />
                          ) : (
                            <Bookmark className="h-5 w-5" />
                          )}
                        </Button>
                      </div>

                      {job.salaryText && (
                        <p className="text-lg font-semibold text-accent">{job.salaryText}</p>
                      )}

                      {job.applicationsCount !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          {job.applicationsCount} applicants
                        </p>
                      )}

                      {job.deadline && (
                        <p className="text-xs text-muted-foreground">
                          Deadline: {formatDeadline(job.deadline)}
                        </p>
                      )}

                      <Button
                        className="w-full mt-2"
                        onClick={() => handleApply(job.id)}
                        disabled={applyingTo === job.id}
                      >
                        {applyingTo === job.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          "Apply Now"
                        )}
                      </Button>
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
