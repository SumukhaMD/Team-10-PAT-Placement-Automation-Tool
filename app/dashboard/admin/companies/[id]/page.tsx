"use client"

import { useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  MapPin, 
  Globe,
  Mail,
  Phone,
  Users,
  Briefcase,
  Calendar,
  ArrowLeft,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { useCompany, useDrives } from "@/hooks/use-data"
import { companiesApi } from "@/lib/api-service"
import { Spinner } from "@/components/ui/spinner"
import { format } from "date-fns"
import { toast } from "sonner"

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: company, isLoading, error } = useCompany(resolvedParams.id)
  const { data: drivesData } = useDrives({ limit: 10 })
  
  // Filter drives for this company
  const companyDrives = (drivesData?.data || []).filter((d: any) => d.companyId === resolvedParams.id)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await companiesApi.delete(resolvedParams.id)
      if (response.success) {
        toast.success("Company deleted successfully")
        router.push("/dashboard/admin/companies")
      } else {
        toast.error(response.error || "Failed to delete company")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader 
          title="Company Details" 
          subtitle="Loading..."
          user={{ name: user?.name || "Admin", email: user?.email || "", role: user?.role || "TPO" }}
        />
        <div className="flex items-center justify-center py-24">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="min-h-screen">
        <DashboardHeader 
          title="Company Details" 
          subtitle="Company not found"
          user={{ name: user?.name || "Admin", email: user?.email || "", role: user?.role || "TPO" }}
        />
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground mt-4">Company not found or has been removed</p>
              <Link href="/dashboard/admin/companies">
                <Button className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Companies
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title={company.name} 
        subtitle={company.industry || "Company"}
        user={{ name: user?.name || "Admin", email: user?.email || "", role: user?.role || "TPO" }}
      />
      
      <div className="p-6 space-y-6">
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard/admin/companies" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Companies
          </Link>
          <div className="flex gap-2">
            <Link href={`/dashboard/admin/companies/${resolvedParams.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Info */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="h-20 w-20 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  {company.logo ? (
                    <img 
                      src={company.logo} 
                      alt={company.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <Building2 className="h-10 w-10 text-accent" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
                      <p className="text-muted-foreground">{company.industry}</p>
                    </div>
                    <Badge className={
                      company.status === "ACTIVE" 
                        ? "bg-green-500/10 text-green-600" 
                        : "bg-muted text-muted-foreground"
                    }>
                      {company.status || "ACTIVE"}
                    </Badge>
                  </div>
                  
                  {company.description && (
                    <p className="text-foreground mt-4">{company.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${company.email}`} className="text-sm text-accent hover:underline">
                    {company.email}
                  </a>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{company.phone}</span>
                </div>
              )}
              {company.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:underline flex items-center gap-1"
                  >
                    {company.website.replace(/^https?:\/\//, "")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {(company.address?.city || company.location) && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {company.address?.city || company.location}
                    {company.address?.state && `, ${company.address.state}`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto text-accent mb-2" />
              <p className="text-2xl font-bold text-foreground">{company.recruiters || 0}</p>
              <p className="text-xs text-muted-foreground">Recruiters</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Briefcase className="h-6 w-6 mx-auto text-accent mb-2" />
              <p className="text-2xl font-bold text-foreground">{company.activeDrives || 0}</p>
              <p className="text-xs text-muted-foreground">Active Drives</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">{company.totalHires || 0}</p>
              <p className="text-xs text-muted-foreground">Total Hires</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">
                {company.createdAt ? format(new Date(company.createdAt), "MMM yyyy") : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground">Joined</p>
            </CardContent>
          </Card>
        </div>

        {/* Company Drives */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Placement Drives</CardTitle>
            <Link href="/dashboard/admin/drives/new">
              <Button size="sm">Create Drive</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {companyDrives.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground mt-2">No drives for this company yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {companyDrives.map((drive: any) => (
                  <div key={drive.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">{drive.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {drive.startDate && drive.endDate 
                          ? `${format(new Date(drive.startDate), "MMM d")} - ${format(new Date(drive.endDate), "MMM d, yyyy")}`
                          : "Dates TBD"
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={
                        drive.status === "ACTIVE" 
                          ? "bg-green-500/10 text-green-600" 
                          : drive.status === "UPCOMING"
                          ? "bg-accent/10 text-accent"
                          : "bg-muted text-muted-foreground"
                      }>
                        {drive.status}
                      </Badge>
                      <Link href={`/dashboard/admin/drives/${drive.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {company.name}? 
              This will also remove all associated drives, jobs, and applications.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Company"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
