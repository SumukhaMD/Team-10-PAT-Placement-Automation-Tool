"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Search,
  Download,
  Eye,
  Mail,
  MoreVertical,
  Users,
  FileText,
  Phone,
  GraduationCap,
  Calendar
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { useStudents } from "@/hooks/use-data"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

export default function StudentsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [branchFilter, setBranchFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  const { data: studentsData, isLoading } = useStudents({
    search: searchTerm || undefined,
    branch: branchFilter !== "all" ? branchFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit: 100,
  })

  const students = studentsData?.data || []

  const stats = {
    total: students.length,
    placed: students.filter((s: any) => s.placementStatus === "PLACED").length,
    notPlaced: students.filter((s: any) => s.placementStatus === "NOT_PLACED" || !s.placementStatus).length,
  }

  const handleExport = () => {
    toast.success("Export started - file will download shortly")
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Students" 
        subtitle="Manage and track student placements"
        user={{ 
          name: user?.name || "Admin", 
          email: user?.email || "", 
          role: user?.role || "TPO" 
        }}
      />
      
      <div className="p-6 space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Placed</p>
              <p className="text-2xl font-bold text-green-600">{stats.placed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Not Placed</p>
              <p className="text-2xl font-bold text-foreground">{stats.notPlaced}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Placement Rate</p>
              <p className="text-2xl font-bold text-accent">
                {stats.total > 0 ? Math.round((stats.placed / stats.total) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="CSE">CSE</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="ECE">ECE</SelectItem>
                  <SelectItem value="EEE">EEE</SelectItem>
                  <SelectItem value="ME">ME</SelectItem>
                  <SelectItem value="CE">CE</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PLACED">Placed</SelectItem>
                  <SelectItem value="NOT_PLACED">Not Placed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground mt-4">No students found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Branch</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">CGPA</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Applications</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Skills</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student: any) => (
                      <tr key={student.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-accent">
                                {student.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">{student.branch || "N/A"}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`font-medium ${
                            student.cgpa >= 8 ? "text-green-600" : 
                            student.cgpa >= 7 ? "text-foreground" : 
                            "text-yellow-600"
                          }`}>
                            {student.cgpa || "N/A"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <p className="text-foreground">{student.applicationsCount || 0} apps</p>
                            <p className="text-muted-foreground">{student.interviewsCount || 0} interviews</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <Badge className={
                              student.placementStatus === "PLACED" 
                                ? "bg-green-500/10 text-green-600" 
                                : "bg-yellow-500/10 text-yellow-600"
                            }>
                              {(student.placementStatus || "NOT_PLACED").replace("_", " ")}
                            </Badge>
                            {student.placedCompany && (
                              <p className="text-xs text-muted-foreground mt-1">{student.placedCompany}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {(student.skills || []).slice(0, 2).map((skill: string) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {(student.skills || []).length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{student.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedStudent(student)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                View Resume
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student Profile Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
            <DialogDescription>
              View detailed information about this student
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-accent">
                    {selectedStudent.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-xl font-semibold text-foreground">{selectedStudent.name}</p>
                  <p className="text-muted-foreground">{selectedStudent.branch} - {selectedStudent.batch}</p>
                  <Badge className={
                    selectedStudent.placementStatus === "PLACED" 
                      ? "bg-green-500/10 text-green-600 mt-2" 
                      : "bg-yellow-500/10 text-yellow-600 mt-2"
                  }>
                    {(selectedStudent.placementStatus || "NOT_PLACED").replace("_", " ")}
                  </Badge>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedStudent.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedStudent.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">CGPA: {selectedStudent.cgpa || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Batch: {selectedStudent.batch || "N/A"}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedStudent.applicationsCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Applications</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedStudent.interviewsCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Interviews</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{selectedStudent.offersCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Offers</p>
                </div>
              </div>

              {/* Skills */}
              {selectedStudent.skills && selectedStudent.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  View Resume
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
