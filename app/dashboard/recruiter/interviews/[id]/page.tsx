"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Save,
  Loader,
  Mail,
  Phone,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RecruiterInterviewDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [rating, setRating] = useState(3)
  const [status, setStatus] = useState("COMPLETED")

  const interviewData = {
    id: params.id,
    candidateName: "Jane Smith",
    candidateEmail: "jane.smith@iitb.ac.in",
    candidatePhone: "+91 9876543210",
    jobRole: "Software Engineer",
    interviewDate: "Mar 25, 2024",
    interviewTime: "10:00 AM",
    duration: 60,
    interviewType: "Technical Round 1",
    location: "Video Call - https://meet.google.com/abc-xyz",
    interviewer: "John Smith",
    status: "SCHEDULED",
    college: "IIT Bombay",
    branch: "Computer Science",
    cgpa: 9.1,
  }

  const handleSaveFeedback = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/interviews/${params.id}/feedback`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("placeit_access_token")}`
        },
        body: JSON.stringify({
          feedback,
          rating,
          status: "COMPLETED"
        })
      })

      if (!response.ok) throw new Error("Failed to save feedback")

      toast({
        title: "Success",
        description: "Interview feedback saved successfully!",
      })
      setIsEditing(false)
    } catch (error) {
      console.error("[v0] Save feedback error:", error)
      toast({
        title: "Error",
        description: "Failed to save feedback.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Interview Details" 
        subtitle="Manage interview details and feedback"
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
            <h1 className="text-3xl font-bold mb-2">{interviewData.candidateName}</h1>
            <p className="text-muted-foreground">{interviewData.jobRole} - {interviewData.interviewType}</p>
          </div>
          <Badge className={interviewData.status === "SCHEDULED" ? "bg-accent/10 text-accent" : "bg-green-500/10 text-green-600"}>
            {interviewData.status}
          </Badge>
        </div>

        {/* Candidate Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Mail className="h-5 w-5 text-accent" />
              <div className="text-sm">
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium text-xs">{interviewData.candidateEmail}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Phone className="h-5 w-5 text-accent" />
              <div className="text-sm">
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium text-xs">{interviewData.candidatePhone}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <User className="h-5 w-5 text-accent" />
              <div className="text-sm">
                <p className="text-muted-foreground">College</p>
                <p className="font-medium text-xs">{interviewData.college}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Award className="h-5 w-5 text-accent" />
              <div className="text-sm">
                <p className="text-muted-foreground">CGPA</p>
                <p className="font-medium">{interviewData.cgpa}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interview Details */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4" />
                  Date & Time
                </p>
                <p className="font-semibold">{interviewData.interviewDate} at {interviewData.interviewTime}</p>
                <p className="text-xs text-muted-foreground mt-1">Duration: {interviewData.duration} minutes</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4" />
                  Location
                </p>
                <p className="font-semibold text-sm">{interviewData.location}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Interview Type</p>
                <p className="font-semibold">{interviewData.interviewType}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Interviewer</p>
                <p className="font-semibold">{interviewData.interviewer}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Section */}
        {interviewData.status === "SCHEDULED" ? (
          <Card>
            <CardHeader>
              <CardTitle>Interview Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" size="lg">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Join Interview (Video Call)
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                <FileText className="h-4 w-4 mr-2" />
                View Candidate Resume
              </Button>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => router.back()}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Interview
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Interview Feedback</CardTitle>
              <Button 
                size="sm"
                onClick={() => isEditing ? handleSaveFeedback() : setIsEditing(true)}
                disabled={loading}
              >
                {isEditing ? (
                  <>
                    {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                    {loading ? "Saving..." : <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Feedback
                    </>}
                  </>
                ) : (
                  "Edit"
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditing ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Rating</p>
                    <div className="flex gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-3 w-3 rounded-full ${
                            i < rating ? "bg-accent" : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Feedback</p>
                    <p className="text-foreground">{feedback || "No feedback provided yet."}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rating (1-5)</Label>
                    <div className="flex gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setRating(i + 1)}
                          className={`h-8 w-8 rounded-full transition-colors ${
                            i < rating ? "bg-accent" : "bg-muted hover:bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedback">Feedback</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Write your feedback about the candidate's performance..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={6}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        {interviewData.status === "COMPLETED" && (
          <div className="flex gap-2">
            <Button className="flex-1" size="lg">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Select Candidate
            </Button>
            <Button variant="outline" className="flex-1" size="lg">
              <XCircle className="h-4 w-4 mr-2" />
              Reject Candidate
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

import { Award } from "lucide-react"
