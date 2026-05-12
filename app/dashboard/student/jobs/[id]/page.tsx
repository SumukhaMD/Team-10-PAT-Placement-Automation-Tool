"use client"

import { useState, use } from "react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  Clock,
  Calendar,
  Users,
  IndianRupee,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Loader2,
  CheckCircle2,
  GraduationCap,
  Globe,
  Mail,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { apiService } from "@/lib/api-service"
import { Spinner } from "@/components/ui/spinner"
import { format, formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import useSWR from "swr"

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("placeit_access_token")}`
    }
  })
  if (!response.ok) throw new Error("Failed to fetch")
  const data = await response.json()
  return data.data || data
}

const toArray = (val: any): string[] => {
  if (!val) return []
  if (Array.isArray(val)) return val
  return val.split(/,|\n/).map((s: string) => s.trim()).filter(Boolean)
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  const { data: job, isLoading, error } = useSWR(
    `/api/jobs/${resolvedParams.id}`,
    fetcher
  )

  const toggleSave = () => {
    setSaved(!saved)
    toast.success(saved ? "Removed from saved jobs" : "Job saved successfully")
  }

  const handleApply = async () => {
    setApplying(true)
    try {
      const response = await apiService.post("/api/applications", { jobId: resolvedParams.id })
      if (response.success) {
        toast.success("Application submitted successfully!")
        setHasApplied(true)
      } else {
        toast.error(response.error || "Failed to apply")
      }
    } catch {
      toast.error("Failed to submit application")
    } finally {
      setApplying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader 
          title="Job Details" 
          subtitle="Loading..."
          user={{ name: user?.name || "Student", email: user?.email || "", role: "student" }}
        />
        <div className="flex items-center justify-center py-24">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen">
        <DashboardHeader 
          title="Job Details" 
          subtitle="Job not found"
          user={{ name: user?.name || "Student", email: user?.email || "", role: "student" }}
        />
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground mt-4">Job not found or has been removed</p>
              <Link href="/dashboard/student/jobs">
                <Button className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Job Details" 
        subtitle={job.company?.name || "Company"}
        user={{ name: user?.name || "Student", email: user?.email || "", role: "student" }}
      />
      
      <div className="p-6 space-y-6">
        {/* Back Button */}
        <Link href="/dashboard/student/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="h-16 w-16 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    {job.company?.logo ? (
                      <img 
                        src={job.company.logo} 
                        alt={job.company.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-accent" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
                        <p className="text-lg text-muted-foreground">{job.company?.name}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={toggleSave}>
                        {saved ? (
                          <BookmarkCheck className="h-5 w-5 text-accent" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                      <Badge variant={job.jobType === "INTERNSHIP" ? "outline" : "default"}>
                        {job.jobType?.replace("_", " ")}
                      </Badge>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      {job.experience && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Briefcase className="h-4 w-4" />
                          {job.experience}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-foreground">
                  <p className="whitespace-pre-wrap">{job.description || "No description provided."}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {toArray(job.requirements).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {toArray(job.requirements).map((req: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Responsibilities */}
            {toArray(job.responsibilities).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {toArray(job.responsibilities).map((resp: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                        <span className="text-foreground">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                {job.salary && (
                  <div className="text-center pb-4 border-b border-border">
                    <p className="text-sm text-muted-foreground">Salary</p>
                    <p className="text-2xl font-bold text-accent">
                      {job.salary.min}-{job.salary.max} LPA
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Openings
                    </span>
                    <span className="font-medium text-foreground">{job.positions || "Multiple"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Applications
                    </span>
                    <span className="font-medium text-foreground">{job.applicationsCount || 0}</span>
                  </div>
                  {job.deadline && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Deadline
                      </span>
                      <span className="font-medium text-foreground">
                        {format(new Date(job.deadline), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                </div>

                {hasApplied ? (
                  <Button className="w-full" disabled>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Applied
                  </Button>
                ) : (
                  <Button className="w-full" onClick={handleApply} disabled={applying}>
                    {applying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      "Apply Now"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Eligibility Criteria */}
            {job.eligibilityCriteria && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Eligibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {job.eligibilityCriteria.minCgpa && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Min CGPA
                      </span>
                      <span className="font-medium text-foreground">{job.eligibilityCriteria.minCgpa}</span>
                    </div>
                  )}
                  {toArray(job.eligibilityCriteria.allowedBranches).length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Allowed Branches</p>
                      <div className="flex flex-wrap gap-1">
                        {toArray(job.eligibilityCriteria.allowedBranches).map((branch: string) => (
                          <Badge key={branch} variant="outline" className="text-xs">
                            {branch}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Company Info */}
            {job.company && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">About the Company</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      {job.company.logo ? (
                        <img 
                          src={job.company.logo} 
                          alt={job.company.name}
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <Building2 className="h-5 w-5 text-accent" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{job.company.name}</p>
                      <p className="text-xs text-muted-foreground">{job.company.industry}</p>
                    </div>
                  </div>
                  {job.company.description && (
                    <p className="text-sm text-muted-foreground">{job.company.description}</p>
                  )}
                  <div className="space-y-2 pt-2">
                    {job.company.website && (
                      <a 
                        href={job.company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-accent hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                    {job.company.email && (
                      <a 
                        href={`mailto:${job.company.email}`}
                        className="flex items-center gap-2 text-sm text-accent hover:underline"
                      >
                        <Mail className="h-4 w-4" />
                        {job.company.email}
                      </a>
                    )}
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
