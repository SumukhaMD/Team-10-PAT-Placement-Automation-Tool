"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ArrowLeft, Loader } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCompanies } from "@/hooks/use-data"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-context"
import { getStoredRecruiterCompanyId, setStoredRecruiterCompanyId } from "@/lib/recruiter-company"

export default function RecruiterNewJobPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyId: "",
    role: "",
    jobType: "FULL_TIME",
    description: "",
    requirements: "",
    salary: "",
    positions: "1",
    deadline: "",
    location: "Remote",
    skills: "",
    experience: "",
  })

  const { data: companiesData, isLoading: companiesLoading } = useCompanies({ limit: 100 })

  const companies = companiesData?.data || []

  useEffect(() => {
    const storedCompanyId = getStoredRecruiterCompanyId()
    if (storedCompanyId) {
      setFormData((prev) => ({ ...prev, companyId: storedCompanyId }))
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("placeit_access_token")}`,
        },
        body: JSON.stringify({
          companyId: formData.companyId,
          title: formData.role,
          description: formData.description,
          requirements: formData.requirements,
          salary: formData.salary,
          positions: parseInt(formData.positions),
          jobType: formData.jobType,
          location: formData.location,
          deadline: formData.deadline,
          skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
          experience: formData.experience,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error("[v0] Job creation response:", response.status, errorBody)
        throw new Error(errorBody || "Failed to create job posting")
      }

      setStoredRecruiterCompanyId(formData.companyId)

      toast({
        title: "Success",
        description: "Job posting created successfully!",
      })

      router.push("/dashboard/recruiter/jobs")
    } catch (error) {
      console.error("[v0] Job creation error:", error)
      toast({
        title: "Error",
        description: "Failed to create job posting. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="Post New Job"
        subtitle="Create a new job posting"
        user={{ name: user?.name || "Recruiter", email: user?.email || "", role: "Recruiter" }}
      />

      <div className="p-6 max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyId">Company *</Label>
                  {companiesLoading ? (
                    <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                      <Spinner className="h-4 w-4" />
                      Loading companies...
                    </div>
                  ) : (
                    <Select value={formData.companyId} onValueChange={(value) => handleSelectChange("companyId", value)}>
                      <SelectTrigger id="companyId">
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

                <div className="space-y-2">
                  <Label htmlFor="role">Job Title *</Label>
                  <Input
                    id="role"
                    name="role"
                    placeholder="e.g., Software Engineer"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobType">Job Type *</Label>
                  <Select value={formData.jobType} onValueChange={(value) => handleSelectChange("jobType", value)}>
                    <SelectTrigger id="jobType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL_TIME">Full Time</SelectItem>
                      <SelectItem value="PART_TIME">Part Time</SelectItem>
                      <SelectItem value="INTERNSHIP">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., Bangalore, India"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salary Range *</Label>
                  <Input
                    id="salary"
                    name="salary"
                    placeholder="e.g., 12 LPA"
                    value={formData.salary}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="positions">Number of Positions *</Label>
                  <Input
                    id="positions"
                    name="positions"
                    type="number"
                    min="1"
                    value={formData.positions}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline *</Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Required *</Label>
                <Select value={formData.experience} onValueChange={(value) => handleSelectChange("experience", value)}>
                  <SelectTrigger id="experience">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fresher">Fresher</SelectItem>
                    <SelectItem value="0-2 years">0-2 years</SelectItem>
                    <SelectItem value="2-5 years">2-5 years</SelectItem>
                    <SelectItem value="5-10 years">5-10 years</SelectItem>
                    <SelectItem value="10+ years">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Required Skills (comma-separated) *</Label>
                <Input
                  id="skills"
                  name="skills"
                  placeholder="e.g., React, Node.js, Python, MongoDB"
                  value={formData.skills}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Detailed job description..."
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements *</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="Detailed requirements..."
                  rows={4}
                  value={formData.requirements}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading || !formData.companyId}>
                  {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                  {loading ? "Creating..." : "Create Job Posting"}
                </Button>

                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
