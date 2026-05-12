"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, 
  Calendar,
  Clock,
  Video,
  MapPin,
  ExternalLink,
} from "lucide-react"
import { useInterviews } from "@/hooks/use-data"
import { useAuth } from "@/lib/auth-context"
import { Spinner } from "@/components/ui/spinner"
import { format, isPast } from "date-fns"
import { useState } from "react"

const resultColors: Record<string, string> = {
  CLEARED: "bg-accent/10 text-accent",
  SELECTED: "bg-green-500/10 text-green-600",
  REJECTED: "bg-destructive/10 text-destructive",
  PENDING: "bg-yellow-500/10 text-yellow-600",
}

export default function InterviewsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("upcoming")
  
  const { data: interviewsData, isLoading, error, mutate } = useInterviews()
  const interviews = interviewsData?.data || []

  const getInterviewDate = (interview: any) => new Date(interview.scheduledAt || interview.scheduledDate || "")

  const upcomingInterviews = interviews.filter((i: any) => {
    const date = getInterviewDate(i)
    return !Number.isNaN(date.getTime()) && !isPast(date) && i.status !== "COMPLETED"
  })
  const pastInterviews = interviews.filter((i: any) => {
    const date = getInterviewDate(i)
    return Number.isNaN(date.getTime()) || isPast(date) || i.status === "COMPLETED"
  })

  const displayInterviews = activeTab === "upcoming" ? upcomingInterviews : pastInterviews

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Interviews" 
        subtitle="Manage your scheduled interviews"
        user={{ name: user?.name || "Student", email: user?.email || "", role: "student" }}
      />
      
      <div className="p-6 space-y-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingInterviews.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastInterviews.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Interviews List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Failed to load interviews. Please try again.</p>
              <Button onClick={() => mutate()} className="mt-4">Retry</Button>
            </CardContent>
          </Card>
        ) : displayInterviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-medium text-foreground">
                {activeTab === "upcoming" ? "No upcoming interviews" : "No past interviews"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === "upcoming" 
                  ? "Your scheduled interviews will appear here" 
                  : "Your completed interviews will appear here"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayInterviews.map((interview: any) => (
              <Card key={interview.id} className="hover:border-accent/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex gap-4 flex-1">
                      <div className={`h-14 w-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        activeTab === "upcoming" ? "bg-accent/10" : "bg-muted"
                      }`}>
                        {interview.company?.logo ? (
                          <img 
                            src={interview.company.logo} 
                            alt={interview.company.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <Building2 className={`h-7 w-7 ${activeTab === "upcoming" ? "text-accent" : "text-muted-foreground"}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {interview.job?.title || "Position"}
                        </h3>
                        <p className="text-muted-foreground">{interview.company?.name || "Company"}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                          <span className="flex items-center gap-1.5 text-foreground">
                            <Calendar className="h-4 w-4 text-accent" />
                            {format(getInterviewDate(interview), "MMM d, yyyy")}
                          </span>
                          <span className="flex items-center gap-1.5 text-foreground">
                            <Clock className="h-4 w-4 text-accent" />
                            {format(getInterviewDate(interview), "h:mm a")}
                            {interview.duration && ` (${interview.duration} mins)`}
                          </span>
                          {interview.mode === "VIDEO" || interview.mode === "ONLINE" ? (
                            <span className="flex items-center gap-1.5 text-foreground">
                              <Video className="h-4 w-4 text-accent" />
                              Video Call
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-foreground">
                              <MapPin className="h-4 w-4 text-accent" />
                              {interview.location || "On-site"}
                            </span>
                          )}
                        </div>

                        {interview.notes && activeTab === "upcoming" && (
                          <div className="mt-4 p-3 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Preparation Notes: </span>
                              {interview.notes}
                            </p>
                          </div>
                        )}

                        {interview.feedback && activeTab === "past" && (
                          <div className="mt-4 p-3 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Feedback: </span>
                              {interview.feedback}
                            </p>
                          </div>
                        )}

                        {interview.interviewers && (
                          <div className="mt-3">
                            <p className="text-xs text-muted-foreground">
                              Interviewers: {Array.isArray(interview.interviewers) 
                                ? interview.interviewers.join(", ") 
                                : interview.interviewers
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <Badge variant="outline">{interview.roundType || interview.type || "Interview"}</Badge>
                      
                      {activeTab === "past" && interview.result && (
                        <Badge className={resultColors[interview.result] || resultColors.PENDING}>
                          {interview.result}
                        </Badge>
                      )}
                      
                      {activeTab === "upcoming" && (
                        <>
                          {(interview.mode === "VIDEO" || interview.mode === "ONLINE") && interview.meetingLink && (
                            <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                              <Button className="w-full sm:w-auto">
                                <Video className="h-4 w-4 mr-2" />
                                Join Meeting
                                <ExternalLink className="h-3 w-3 ml-2" />
                              </Button>
                            </a>
                          )}
                          {interview.mode === "ONSITE" && interview.location && (
                            <a 
                              href={`https://maps.google.com/?q=${encodeURIComponent(interview.location)}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Button variant="outline" className="w-full sm:w-auto">
                                <MapPin className="h-4 w-4 mr-2" />
                                Get Directions
                              </Button>
                            </a>
                          )}
                        </>
                      )}
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
