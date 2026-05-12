"use client"

import { useState } from "react"
import Link from "next/link"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  Loader, 
  Trash2, 
  Edit,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Download
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RecruiterJobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [formData, setFormData] = useState({
    role: "Software Engineer",
    jobType: "FULL_TIME",
    description: "Develop and maintain scalable web applications using modern technologies.",
    requirements: "5+ years of experience with React and Node.js",
    salary: "12-18 LPA",
    positions: "5",
    deadline: "2024-04-15",
    location: "Bangalore",
    skills: "React, Node.js, MongoDB, Docker",
    experience: "2-5 years",
  })

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/jobs/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("placeit_access_token")}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error("Failed to update job")

      toast({
        title: "Success",
        description: "Job posting updated successfully!",
      })
      setIsEditing(false)
    } catch (error) {
      console.error("[v0] Job update error:", error)
      toast({
        title: "Error",
        description: "Failed to update job posting.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/jobs/${params.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("placeit_access_token")}`
        }
      })

      if (!response.ok) throw new Error("Failed to delete job")

      toast({
        title: "Success",
        description: "Job posting deleted successfully!",
      })
      router.push("/dashboard/recruiter/jobs")
    } catch (error) {
      console.error("[v0] Job delete error:", error)
      toast({
        title: "Error",
        description: "Failed to delete job posting.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setDeleteOpen(false)
    }
  }

  const handleExport = () => {
    const data = {
      title: formData.role,
      ...formData,
      timestamp: new Date().toISOString()
    }
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2)))
    element.setAttribute("download", `job-${params.id}.json`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast({
      title: "Success",
      description: "Job details exported successfully!",
    })
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Job Details" 
        subtitle="View and manage job posting"
        user={{ name: "Recruiter", email: "recruiter@company.com", role: "Recruiter" }}
      />
      
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{formData.role}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              variant={isEditing ? "default" : "outline"} 
              size="sm" 
              onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
              disabled={loading}
            >
              {isEditing ? (
                <>
                  {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                  {loading ? "Saving..." : "Save Changes"}
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Job Posting?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. All applications for this job will also be affected.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-4 justify-end pt-4">
                  <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                    {loading ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-5 w-5 mx-auto text-accent mb-2" />
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-semibold">{formData.location}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-5 w-5 mx-auto text-accent mb-2" />
              <p className="text-sm text-muted-foreground">Salary</p>
              <p className="font-semibold">{formData.salary}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto text-accent mb-2" />
              <p className="text-sm text-muted-foreground">Positions</p>
              <p className="font-semibold">{formData.positions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-5 w-5 mx-auto text-accent mb-2" />
              <p className="text-sm text-muted-foreground">Deadline</p>
              <p className="font-semibold text-sm">{formData.deadline}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{formData.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{formData.requirements}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.split(",").map((skill) => (
                      <span key={skill.trim()} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input name="role" value={formData.role} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input name="location" value={formData.location} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Salary</Label>
                    <Input name="salary" value={formData.salary} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Positions</Label>
                    <Input name="positions" type="number" value={formData.positions} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea name="description" rows={4} value={formData.description} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Requirements</Label>
                  <Textarea name="requirements" rows={4} value={formData.requirements} onChange={handleChange} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Statistics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">156</p>
              <p className="text-sm text-muted-foreground">Applications</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">45</p>
              <p className="text-sm text-muted-foreground">Shortlisted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">20</p>
              <p className="text-sm text-muted-foreground">Interviews</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">5</p>
              <p className="text-sm text-muted-foreground">Selected</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
