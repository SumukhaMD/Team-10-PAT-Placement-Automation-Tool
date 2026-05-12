"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  Users,
  Briefcase,
  Edit2,
  Save,
  Plus,
  Trash2,
  Loader,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Recruiter {
  id: string | number
  name: string
  email: string
  role: string
  active: boolean
}

export default function RecruiterCompanyPage() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [addTeamMemberOpen, setAddTeamMemberOpen] = useState(false)
  const [newMemberData, setNewMemberData] = useState({ name: "", email: "", role: "" })
  const [recruiters, setRecruiters] = useState<Recruiter[]>([])
  const [deleteId, setDeleteId] = useState<string | number | null>(null)

  const [companyData, setCompanyData] = useState({
    name: "TechCorp Solutions",
    logo: "TC",
    industry: "Technology",
    description: "TechCorp Solutions is a leading technology company specializing in enterprise software solutions.",
    website: "https://techcorp.com",
    email: "careers@techcorp.com",
    phone: "+91 80 4567 8900",
    location: "Bangalore, India",
    address: "123 Tech Park, Electronic City, Bangalore - 560100",
    employees: "1000-5000",
    founded: "2010",
    linkedin: "linkedin.com/company/techcorp",
  })

  const [hiringStats, setHiringStats] = useState({
    totalHires: 45,
    activeDrives: 2,
    totalApplications: 320,
    avgTimeToHire: "14 days",
  })

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/recruiters/team", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("placeit_access_token")}`
        }
      })

      if (!response.ok) throw new Error("Failed to fetch team")

      const data = await response.json()
      setRecruiters(Array.isArray(data) ? data : data.data || [])
    } catch (error) {
      console.error("[v0] Fetch team error:", error)
    }
  }

  const handleAddTeamMember = async () => {
    if (!newMemberData.name || !newMemberData.email || !newMemberData.role) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/recruiters/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("placeit_access_token")}`
        },
        body: JSON.stringify(newMemberData)
      })

      if (!response.ok) throw new Error("Failed to add team member")

      const newMember = await response.json()
      setRecruiters([...recruiters, newMember])
      setNewMemberData({ name: "", email: "", role: "" })
      setAddTeamMemberOpen(false)

      toast({
        title: "Success",
        description: "Team member added successfully!",
      })
    } catch (error) {
      console.error("[v0] Add team member error:", error)
      toast({
        title: "Error",
        description: "Failed to add team member.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTeamMember = async (id: string | number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/recruiters/team/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("placeit_access_token")}`
        }
      })

      if (!response.ok) throw new Error("Failed to delete team member")

      setRecruiters(recruiters.filter(r => r.id !== id))
      setDeleteId(null)

      toast({
        title: "Success",
        description: "Team member removed successfully!",
      })
    } catch (error) {
      console.error("[v0] Delete team member error:", error)
      toast({
        title: "Error",
        description: "Failed to remove team member.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCompanyInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/recruiters/company", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("placeit_access_token")}`
        },
        body: JSON.stringify(companyData)
      })

      if (!response.ok) throw new Error("Failed to save company info")

      toast({
        title: "Success",
        description: "Company information updated successfully!",
      })
      setIsEditing(false)
    } catch (error) {
      console.error("[v0] Save company error:", error)
      toast({
        title: "Error",
        description: "Failed to update company information.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Company Profile" 
        subtitle="Manage your company information"
        user={{ name: "Recruiter", email: "recruiter@company.com", role: "Recruiter" }}
      />
      
      <div className="p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Company Profile</TabsTrigger>
            <TabsTrigger value="team">Recruitment Team</TabsTrigger>
            <TabsTrigger value="stats">Hiring Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Company Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-xl bg-accent/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-accent">{companyData.logo}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{companyData.name}</h2>
                      <p className="text-muted-foreground">{companyData.industry}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{companyData.employees} employees</Badge>
                        <Badge variant="outline">Founded {companyData.founded}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => isEditing ? handleSaveCompanyInfo() : setIsEditing(true)}
                    disabled={loading}
                  >
                    {isEditing ? (
                      <>
                        {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                        {loading ? "Saving..." : <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>}
                      </>
                    ) : (
                      <>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Company Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>About</Label>
                    <Textarea 
                      value={companyData.description}
                      onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input 
                        value={companyData.website}
                        onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Email</Label>
                      <Input 
                        value={companyData.email}
                        onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input 
                        value={companyData.phone}
                        onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input 
                        value={companyData.location}
                        onChange={(e) => setCompanyData({ ...companyData, location: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Full Address</Label>
                    <Input 
                      value={companyData.address}
                      onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-accent" />
                      <span className="text-sm text-muted-foreground">Total Hires</span>
                    </div>
                    <span className="font-semibold text-foreground">{hiringStats.totalHires}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-accent" />
                      <span className="text-sm text-muted-foreground">Active Drives</span>
                    </div>
                    <span className="font-semibold text-foreground">{hiringStats.activeDrives}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Applications</span>
                    <span className="font-semibold text-foreground">{hiringStats.totalApplications}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Avg Time to Hire</span>
                    <span className="font-semibold text-accent">{hiringStats.avgTimeToHire}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recruitment Team</CardTitle>
                <Dialog open={addTeamMemberOpen} onOpenChange={setAddTeamMemberOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Team Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input 
                          placeholder="Team member name"
                          value={newMemberData.name}
                          onChange={(e) => setNewMemberData({ ...newMemberData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input 
                          type="email"
                          placeholder="team@company.com"
                          value={newMemberData.email}
                          onChange={(e) => setNewMemberData({ ...newMemberData, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Input 
                          placeholder="e.g., Technical Recruiter"
                          value={newMemberData.role}
                          onChange={(e) => setNewMemberData({ ...newMemberData, role: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-4 justify-end pt-4">
                        <Button variant="outline" onClick={() => setAddTeamMemberOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleAddTeamMember}
                          disabled={loading}
                        >
                          {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                          Add Member
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recruiters.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No team members yet. Add one to get started!</p>
                  ) : (
                    recruiters.map((recruiter) => (
                      <div key={recruiter.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-accent">
                              {recruiter.name.split(" ").map(n => n[0]).join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{recruiter.name}</p>
                            <p className="text-sm text-muted-foreground">{recruiter.email}</p>
                            <p className="text-xs text-muted-foreground">{recruiter.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={recruiter.active ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}>
                            {recruiter.active ? "Active" : "Inactive"}
                          </Badge>
                          <Button variant="ghost" size="icon">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteId(recruiter.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            {deleteId === recruiter.id && (
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Remove Team Member?</DialogTitle>
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
                                    onClick={() => handleDeleteTeamMember(recruiter.id)}
                                    disabled={loading}
                                  >
                                    {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                                    Remove
                                  </Button>
                                </div>
                              </DialogContent>
                            )}
                          </Dialog>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-foreground">{hiringStats.totalHires}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total Hires This Year</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-foreground">{hiringStats.activeDrives}</p>
                  <p className="text-sm text-muted-foreground mt-1">Active Placement Drives</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-foreground">{hiringStats.totalApplications}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total Applications</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-accent">{hiringStats.avgTimeToHire}</p>
                  <p className="text-sm text-muted-foreground mt-1">Avg Time to Hire</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hiring by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { role: "Software Engineer", hires: 18, target: 20 },
                    { role: "Full Stack Developer", hires: 12, target: 15 },
                    { role: "DevOps Engineer", hires: 8, target: 8 },
                    { role: "Data Analyst", hires: 7, target: 10 },
                  ].map((item) => (
                    <div key={item.role}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{item.role}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.hires} / {item.target}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${(item.hires / item.target) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
