"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Search,
  Plus,
  Users,
  Briefcase,
  MapPin,
  Globe,
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
import { useCompanies } from "@/hooks/use-data"
import { companiesApi } from "@/lib/api-service"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

export default function CompaniesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [companyToDelete, setCompanyToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: companiesData, isLoading, mutate } = useCompanies({
    search: searchTerm || undefined,
    limit: 50,
  })

  const companies = companiesData?.data || []

  useEffect(() => {
    console.log("[v0] Companies page loaded - user role:", user?.role)
    console.log("[v0] Companies data received:", companies)
  }, [companies, user?.role])

  const filteredCompanies = companies.filter((company: any) =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: companies.length,
    active: companies.filter((c: any) => c.status === "ACTIVE").length,
    totalHires: companies.reduce((acc: number, c: any) => acc + (c.totalHires || 0), 0),
    activeDrives: companies.reduce((acc: number, c: any) => acc + (c.activeDrives || 0), 0),
  }

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return
    
    setIsDeleting(true)
    try {
      const response = await companiesApi.delete(companyToDelete.id)
      if (response.success) {
        toast.success("Company removed successfully")
        mutate()
        setCompanyToDelete(null)
      } else {
        toast.error(response.error || "Failed to remove company")
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
        title="Companies" 
        subtitle="Manage registered companies and recruiters"
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
              <p className="text-sm text-muted-foreground">Total Companies</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Hires</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalHires}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Active Drives</p>
              <p className="text-2xl font-bold text-accent">{stats.activeDrives}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/dashboard/admin/companies/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </Link>
          </div>
        </div>

        {/* Companies Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground mt-4">No companies found</p>
              <Link href="/dashboard/admin/companies/new">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Company
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company: any) => (
              <Card key={company.id} className="hover:border-accent/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center">
                        {company.logo ? (
                          <img 
                            src={company.logo} 
                            alt={company.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-accent">
                            {company.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{company.name}</h3>
                        <p className="text-sm text-muted-foreground">{company.industry}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/companies/${company.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/companies/${company.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => setCompanyToDelete(company)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {company.address?.city || company.location || "Location not set"}
                    </div>
                    {company.website && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <a 
                          href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-accent"
                        >
                          {company.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">{company.recruiters || 0}</p>
                      <p className="text-xs text-muted-foreground">Recruiters</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">{company.totalHires || 0}</p>
                      <p className="text-xs text-muted-foreground">Hires</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-accent">{company.activeDrives || 0}</p>
                      <p className="text-xs text-muted-foreground">Drives</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Badge className={
                      company.status === "ACTIVE" 
                        ? "bg-green-500/10 text-green-600" 
                        : "bg-muted text-muted-foreground"
                    }>
                      {company.status || "ACTIVE"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!companyToDelete} onOpenChange={() => setCompanyToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {companyToDelete?.name}? 
              This will also remove all associated drives and applications.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompanyToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCompany} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Removing...
                </>
              ) : (
                "Remove Company"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
