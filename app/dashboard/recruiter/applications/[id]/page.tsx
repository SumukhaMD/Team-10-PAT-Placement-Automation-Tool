"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Download,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Award,
  Briefcase,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Send,
  Loader
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RecruiterApplicationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("INTERVIEW")
  
  const applicationData = {
    id: params.id,
    candidateName: "John Doe",
    candidateEmail: "john.doe@nit.ac.in",
    phone: "+91 9876543210",
    college: "NIT Karnataka",
    branch: "Computer Science and Engineering",
    cgpa: 8.5,
    graduationYear: 2024,
    jobRole: "Software Engineer",
    appliedDate: "Mar 18, 2024",
    status: "SHORTLISTED",
    skills: ["React", "Node.js", "Python", "MongoDB", "Docker"],
    resume: "john-doe-resume.pdf",
    links: {
      linkedin: "linkedin.com/in/johndoe",
      github: "github.com/johndoe",
      portfolio: "johndoe.dev"
    },
    experience: "2 internships at Tech Companies",
    about: "Passionate about full-stack development with strong problem-solving skills.",
    projects: [
      { name: "E-commerce Platform", description: "Built using MERN stack", link: "#" },
      { name: "Task Management App", description: "React + Firebase", link: "#" }
    ]
  }

  const statusColors: Record<string, string> = {
    NEW: "bg-accent/10 text-accent",
    SHORTLISTED: "bg-green-500/10 text-green-600",
    INTERVIEW: "bg-blue-500/10 text-blue-600",
    SELECTED: "bg-green-500 text-green-50",
    REJECTED: "bg-destructive/10 text-destructive",
  }

  const handleStatusUpdate = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/applications/${params.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("placeit_access_token")}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error("Failed to update status")

      toast({
        title: "Success",
        description: `Application status updated to ${newStatus}!`,
      })
      setStatusDialogOpen(false)
    } catch (error) {
      console.error("[v0] Status update error:", error)
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const quickAction = async (status: string) => {
    setNewStatus(status)
    setLoading(true)
    try {
      const response = await fetch(`/api/applications/${params.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("placeit_access_token")}`
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error("Failed to update status")

      toast({
        title: "Success",
        description: `Application ${status.toLowerCase()}!`,
      })
    } catch (error) {
      console.error("[v0] Quick action error:", error)
      toast({
        title: "Error",
        description: "Failed to perform action.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Application Details" 
        subtitle="Review candidate application"
        user={{ name: "Recruiter", email: "recruiter@company.com", role: "Recruiter" }}
      />
      
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{applicationData.candidateName}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Badge className={statusColors[applicationData.status]}>
                {applicationData.status}
              </Badge>
              <span className="text-sm">{applicationData.jobRole}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Resume
            </Button>
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  Change Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Application Status</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                      <SelectItem value="INTERVIEW">Interview</SelectItem>
                      <SelectItem value="SELECTED">Selected</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-4 justify-end pt-4">
                    <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleStatusUpdate}
                      disabled={loading}
                    >
                      {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                      Update Status
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Mail className="h-5 w-5 text-accent" />
              <div className="text-sm">
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{applicationData.candidateEmail}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Phone className="h-5 w-5 text-accent" />
              <div className="text-sm">
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{applicationData.phone}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-accent" />
              <div className="text-sm">
                <p className="text-muted-foreground">Applied</p>
                <p className="font-medium">{applicationData.appliedDate}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-accent" />
              <div className="text-sm">
                <p className="text-muted-foreground">Role</p>
                <p className="font-medium text-sm">{applicationData.jobRole}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{applicationData.about}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {applicationData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{applicationData.experience}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><a href={`https://${applicationData.links.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">LinkedIn Profile →</a></div>
                <div><a href={`https://${applicationData.links.github}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">GitHub Profile →</a></div>
                <div><a href={`https://${applicationData.links.portfolio}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Portfolio →</a></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <GraduationCap className="h-8 w-8 text-accent mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{applicationData.college}</h3>
                    <p className="text-muted-foreground">{applicationData.branch}</p>
                    <p className="text-sm text-muted-foreground mt-2">CGPA: {applicationData.cgpa} / 10</p>
                    <p className="text-sm text-muted-foreground">Expected Graduation: {applicationData.graduationYear}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            {applicationData.projects.map((project, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Award className="h-8 w-8 text-accent mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <p className="text-muted-foreground">{project.description}</p>
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-sm mt-2 inline-block">
                        View Project →
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        {applicationData.status === "NEW" && (
          <div className="flex gap-2 pt-4">
            <Button 
              className="flex-1"
              onClick={() => quickAction("SHORTLISTED")}
              disabled={loading}
            >
              {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <ThumbsUp className="h-4 w-4 mr-2" />}
              Shortlist
            </Button>
            <Button 
              variant="destructive"
              className="flex-1"
              onClick={() => quickAction("REJECTED")}
              disabled={loading}
            >
              {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <ThumbsDown className="h-4 w-4 mr-2" />}
              Reject
            </Button>
          </div>
        )}

        {applicationData.status === "SHORTLISTED" && (
          <Button className="w-full" size="lg">
            <Clock className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        )}

        {applicationData.status === "INTERVIEW" && (
          <div className="flex gap-2 pt-4">
            <Button 
              className="flex-1"
              onClick={() => quickAction("SELECTED")}
              disabled={loading}
            >
              {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <ThumbsUp className="h-4 w-4 mr-2" />}
              Select
            </Button>
            <Button 
              variant="destructive"
              className="flex-1"
              onClick={() => quickAction("REJECTED")}
              disabled={loading}
            >
              {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <ThumbsDown className="h-4 w-4 mr-2" />}
              Reject
            </Button>
          </div>
        )}

        {applicationData.status === "SELECTED" && (
          <Button className="w-full" size="lg">
            <Send className="h-4 w-4 mr-2" />
            Send Offer Letter
          </Button>
        )}
      </div>
    </div>
  )
}
