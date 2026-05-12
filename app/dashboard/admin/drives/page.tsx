"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  Building2, 
  Calendar,
  Users,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useDrives } from "@/hooks/use-data"
import { drivesApi } from "@/lib/api-service"
import { Spinner } from "@/components/ui/spinner"
import { format } from "date-fns"
import { toast } from "sonner"

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-600",
  UPCOMING: "bg-accent/10 text-accent",
  COMPLETED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-destructive/10 text-destructive",
}

export default function DrivesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [driveToDelete, setDriveToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: drivesData, isLoading, mutate } = useDrives({
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit: 50,
  })

  const drives = drivesData?.data || []

  const filteredDrives = drives.filter((drive: any) => {
    const matchesSearch = 
      drive.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === "all" || drive.status?.toLowerCase() === activeTab
    return matchesSearch && matchesTab
  })

  const driveCounts = {
    all: drives.length,
    active: drives.filter((d: any) => d.status === "ACTIVE").length,
    upcoming: drives.filter((d: any) => d.status === "UPCOMING").length,
    completed: drives.filter((d: any) => d.status === "COMPLETED").length,
  }

  const handleDeleteDrive = async () => {
    if (!driveToDelete) return
    
    setIsDeleting(true)
    try {
      const response = await drivesApi.delete(driveToDelete.id)
      if (response.success) {
        toast.success("Drive deleted successfully")
        mutate()
        setDriveToDelete(null)
      } else {
        toast.error(response.error || "Failed to delete drive")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExport = () => {
    toast.success("Export started - file will download shortly")
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Placement Drives" 
        subtitle="Manage and track all placement drives"
        user={{ 
          name: user?.name || "Admin", 
          email: user?.email || "", 
          role: user?.role || "TPO" 
        }}
      />
      
      <div className="p-6 space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search drives..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/dashboard/admin/drives/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Drive
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({driveCounts.all})</TabsTrigger>
            <TabsTrigger value="active">Active ({driveCounts.active})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({driveCounts.upcoming})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({driveCounts.completed})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Drives List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : filteredDrives.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground mt-4">No placement drives found</p>
              <Link href="/dashboard/admin/drives/new">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Drive
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDrives.map((drive: any) => (
              <Card key={drive.id} className="hover:border-accent/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex gap-4">
                      <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        {drive.company?.logo ? (
                          <img 
                            src={drive.company.logo} 
                            alt={drive.company.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-accent">
                            {drive.company?.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("") || "DR"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start gap-3 flex-wrap">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{drive.company?.name || drive.title}</h3>
                            <p className="text-muted-foreground">{drive.description || drive.title}</p>
                          </div>
                          <Badge className={statusColors[drive.status] || statusColors.UPCOMING}>
                            {drive.status}
                          </Badge>
                          <Badge variant="outline">{drive.jobType?.replace("_", " ") || "FULL TIME"}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Applications</p>
                            <p className="font-semibold text-foreground">{drive.applicationsCount || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Shortlisted</p>
                            <p className="font-semibold text-foreground">{drive.shortlistedCount || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Positions</p>
                            <p className="font-semibold text-foreground">{drive.positions || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Package</p>
                            <p className="font-semibold text-accent">
                              {drive.salary?.min && drive.salary?.max 
                                ? `${drive.salary.min}-${drive.salary.max} LPA` 
                                : "N/A"
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {drive.startDate && drive.endDate 
                              ? `${format(new Date(drive.startDate), "MMM d")} - ${format(new Date(drive.endDate), "MMM d, yyyy")}`
                              : "Dates TBD"
                            }
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {drive.eligibilityCriteria?.minCgpa 
                              ? `CGPA >= ${drive.eligibilityCriteria.minCgpa}` 
                              : "Open to all"
                            }
                          </span>
                          {drive.eligibilityCriteria?.allowedBranches && (
                            <span>
                              {drive.eligibilityCriteria.allowedBranches.join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/admin/drives/${drive.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/drives/${drive.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/drives/${drive.id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Drive
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDriveToDelete(drive)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancel Drive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!driveToDelete} onOpenChange={() => setDriveToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Placement Drive</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel the drive for {driveToDelete?.company?.name || driveToDelete?.title}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDriveToDelete(null)}>
              Keep Drive
            </Button>
            <Button variant="destructive" onClick={handleDeleteDrive} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Cancelling...
                </>
              ) : (
                "Cancel Drive"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
