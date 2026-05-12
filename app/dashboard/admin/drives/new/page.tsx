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
import { drivesApi } from "@/lib/api-service"
import { useCompanies } from "@/hooks/use-data"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft, Building2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const branches = ["CSE", "IT", "ECE", "EEE", "ME", "CE", "CHE"]
const jobTypes = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "CONTRACT", label: "Contract" },
]

export default function NewDrivePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    title: "",
    companyId: "",
    description: "",
    jobType: "FULL_TIME",
    positions: "",
    minCgpa: "",
    maxBacklogs: "0",
    minSalary: "",
    maxSalary: "",
    location: "",
    startDate: "",
    endDate: "",
    requirements: "",
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

  const formatDateTime = (date: string) =>
    date && !date.includes('T') ? `${date}T00:00:00` : date

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.companyId) {
      toast.error("Please select a company")
      return
    }
    
    if (selectedBranches.length === 0) {
      toast.error("Please select at least one branch")
      return
    }

    setIsSubmitting(true)

    try {
      const driveData = {
        title: formData.title,
        companyId: formData.companyId,
        description: formData.description,
        jobType: formData.jobType,
        positions: parseInt(formData.positions) || 1,
        eligibilityCriteria: {
          minCgpa: parseFloat(formData.minCgpa) || 0,
          maxBacklogs: parseInt(formData.maxBacklogs) || 0,
          allowedBranches: selectedBranches,
        },
        salary: {
          min: parseInt(formData.minSalary) || 0,
          max: parseInt(formData.maxSalary) || 0,
          currency: "INR",
        },
        location: formData.location,
        startDate: formatDateTime(formData.startDate),
        endDate: formatDateTime(formData.endDate),
        requirements: formData.requirements.split("\n").filter(r => r.trim()),
        status: "UPCOMING",
      }

      const response = await drivesApi.create(driveData)

      if (response.success) {
        toast.success("Placement drive created successfully")
        router.push("/dashboard/admin/drives")
      } else {
        toast.error(response.error || "Failed to create drive")
      }
    } catch (error) {
      toast.error("An error occurred while creating the drive")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Create Placement Drive" 
        subtitle="Set up a new placement drive for students"
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

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Drive Details</CardTitle>
                  <CardDescription>Basic information about the placement drive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Drive Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Software Engineer Campus Recruitment 2024"
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
                    <p className="text-xs text-muted-foreground">
                      Company not listed? <Link href="/dashboard/admin/companies/new" className="text-accent hover:underline">Add new company</Link>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the role and what the company is looking for..."
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      rows={4}
                      required
                    />
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
                      <Label htmlFor="positions">Number of Positions *</Label>
                      <Input
                        id="positions"
                        type="number"
                        min="1"
                        placeholder="e.g., 10"
                        value={formData.positions}
                        onChange={(e) => handleChange("positions", e.target.value)}
                        required
                      />
                    </div>
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

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements (one per line)</Label>
                    <Textarea
                      id="requirements"
                      placeholder="Strong programming skills in Java/Python&#10;Knowledge of data structures&#10;Good communication skills"
                      value={formData.requirements}
                      onChange={(e) => handleChange("requirements", e.target.value)}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Eligibility Criteria</CardTitle>
                  <CardDescription>Set the eligibility requirements for students</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minCgpa">Minimum CGPA *</Label>
                      <Input
                        id="minCgpa"
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        placeholder="e.g., 7.0"
                        value={formData.minCgpa}
                        onChange={(e) => handleChange("minCgpa", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxBacklogs">Maximum Backlogs Allowed</Label>
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
                    <Label>Eligible Branches *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                      {branches.map((branch) => (
                        <div key={branch} className="flex items-center space-x-2">
                          <Checkbox
                            id={branch}
                            checked={selectedBranches.includes(branch)}
                            onCheckedChange={() => handleBranchToggle(branch)}
                          />
                          <Label htmlFor={branch} className="text-sm font-normal cursor-pointer">
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
                    <Label htmlFor="minSalary">Minimum (LPA) *</Label>
                    <Input
                      id="minSalary"
                      type="number"
                      min="0"
                      placeholder="e.g., 8"
                      value={formData.minSalary}
                      onChange={(e) => handleChange("minSalary", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxSalary">Maximum (LPA) *</Label>
                    <Input
                      id="maxSalary"
                      type="number"
                      min="0"
                      placeholder="e.g., 15"
                      value={formData.maxSalary}
                      onChange={(e) => handleChange("maxSalary", e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Registration Opens *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange("startDate", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Application Deadline *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange("endDate", e.target.value)}
                      required
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
                        Creating Drive...
                      </>
                    ) : (
                      "Create Placement Drive"
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
