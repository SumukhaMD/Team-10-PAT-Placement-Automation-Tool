"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth-context"
import { jobsApi } from "@/lib/api-service"
import { useCompanies } from "@/hooks/use-data"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft, Briefcase } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const branches = ["CSE", "IT", "ECE", "EEE", "ME", "CE", "CHE"]
const jobTypes = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "CONTRACT", label: "Contract" },
]

export default function NewJobPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    title: "",
    companyId: "",
    description: "",
    jobType: "FULL_TIME",
    location: "",
    minSalary: "",
    maxSalary: "",
    minCgpa: "",
    maxBacklogs: "0",
    requirements: "",
    responsibilities: "",
    skills: "",
  })

  const { data: companiesData, isLoading: companiesLoading } = useCompanies({ limit: 100 })

  const companies = companiesData?.data || []

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleBranchToggle = (branch: string) => {
    setSelectedBranches(prev => 
      prev.includes(branch) 
        ? prev.filter(b => b !== branch)
        : [...prev, branch]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.companyId) {
      toast.error("Please select a company")
      return
    }

    setIsSubmitting(true)

    try {
      const jobData = {
        title: formData.title,
        companyId: formData.companyId,
        description: formData.description,
        jobType: formData.jobType,
        location: formData.location,
        salary: {
          min: parseInt(formData.minSalary) || 0,
          max: parseInt(formData.maxSalary) || 0,
          currency: "INR",
        },
        eligibilityCriteria: {
          minCgpa: parseFloat(formData.minCgpa) || 0,
          maxBacklogs: parseInt(formData.maxBacklogs) || 0,
          allowedBranches: selectedBranches.length > 0 ? selectedBranches : branches,
        },
        requirements: formData.requirements.split("\n").filter(r => r.trim()),
        responsibilities: formData.responsibilities.split("\n").filter(r => r.trim()),
        skills: formData.skills.split(",").map(s => s.trim()).filter(s => s),
        status: "ACTIVE",
      }

      const response = await jobsApi.create(jobData)

      if (response.success) {
        toast.success("Job posted successfully")
        router.push("/dashboard/admin/jobs")
      } else {
        toast.error(response.error || "Failed to post job")
      }
    } catch (error) {
      toast.error("An error occurred while posting the job")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Post New Job" 
        subtitle="Create a new job posting"
        user={{ 
          name: user?.name || "Admin", 
          email: user?.email || "", 
          role: user?.role || "TPO" 
        }}
      />
      
      <div className="p-6">
        <Link href="/dashboard/admin/jobs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                  <CardDescription>Basic information about the job</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Software Engineer"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    {companiesLoading ? (
                      <div className="flex items-center gap-2 py-2">
                        <Spinner className="h-4 w-4" />
                        <span className="text-sm text-muted-foreground">Loading companies...</span>
                      </div>
                    ) : (
                      <Select value={formData.companyId} onValueChange={(value) => handleChange("companyId", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company: { id: string; name: string }) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Job Type *</Label>
                      <Select value={formData.jobType} onValueChange={(value) => handleChange("jobType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Bangalore, India"
                        value={formData.location}
                        onChange={(e) => handleChange("location", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the role and responsibilities..."
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responsibilities">Responsibilities (one per line)</Label>
                    <Textarea
                      id="responsibilities"
                      placeholder="Design and develop software&#10;Collaborate with team&#10;Code reviews"
                      value={formData.responsibilities}
                      onChange={(e) => handleChange("responsibilities", e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements (one per line)</Label>
                    <Textarea
                      id="requirements"
                      placeholder="Bachelor's degree in CS&#10;2+ years experience&#10;Strong problem-solving skills"
                      value={formData.requirements}
                      onChange={(e) => handleChange("requirements", e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma-separated)</Label>
                    <Input
                      id="skills"
                      placeholder="Java, Python, React, SQL"
                      value={formData.skills}
                      onChange={(e) => handleChange("skills", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Eligibility Criteria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minCgpa">Minimum CGPA</Label>
                      <Input
                        id="minCgpa"
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        placeholder="e.g., 6.0"
                        value={formData.minCgpa}
                        onChange={(e) => handleChange("minCgpa", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxBacklogs">Maximum Backlogs</Label>
                      <Input
                        id="maxBacklogs"
                        type="number"
                        min="0"
                        placeholder="e.g., 0"
                        value={formData.maxBacklogs}
                        onChange={(e) => handleChange("maxBacklogs", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Eligible Branches (leave empty for all)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                      {branches.map((branch) => (
                        <div key={branch} className="flex items-center space-x-2">
                          <Checkbox
                            id={`branch-${branch}`}
                            checked={selectedBranches.includes(branch)}
                            onCheckedChange={() => handleBranchToggle(branch)}
                          />
                          <Label htmlFor={`branch-${branch}`} className="text-sm font-normal cursor-pointer">
                            {branch}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Salary Package</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="minSalary">Minimum (LPA)</Label>
                    <Input
                      id="minSalary"
                      type="number"
                      min="0"
                      placeholder="e.g., 8"
                      value={formData.minSalary}
                      onChange={(e) => handleChange("minSalary", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxSalary">Maximum (LPA)</Label>
                    <Input
                      id="maxSalary"
                      type="number"
                      min="0"
                      placeholder="e.g., 15"
                      value={formData.maxSalary}
                      onChange={(e) => handleChange("maxSalary", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Spinner className="h-4 w-4 mr-2" />
                        Posting Job...
                      </>
                    ) : (
                      <>
                        <Briefcase className="h-4 w-4 mr-2" />
                        Post Job
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full mt-3"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
