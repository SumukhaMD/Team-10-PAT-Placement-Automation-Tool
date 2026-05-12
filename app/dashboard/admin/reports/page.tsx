"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { useDashboardStats } from "@/hooks/use-data"
import { Spinner } from "@/components/ui/spinner"
import { 
  Download, 
  FileText, 
  TrendingUp, 
  Users, 
  Building2,
  Briefcase,
  BarChart3
} from "lucide-react"
import { toast } from "sonner"

export default function ReportsPage() {
  const { user } = useAuth()
  const { data: statsData, isLoading } = useDashboardStats()
  const [selectedYear, setSelectedYear] = useState("2024")
  const [isExporting, setIsExporting] = useState<string | null>(null)

  const stats = statsData || {
    totalStudents: 0,
    totalCompanies: 0,
    activeDrives: 0,
    placedStudents: 0,
    placementRate: 0,
    pendingApplications: 0,
    averagePackage: 0,
    highestPackage: 0,
  }

  const handleExport = async (reportType: string, format: string) => {
    setIsExporting(reportType)
    try {
      // In production, this would call the API to generate and download the report
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success(`${reportType} report exported as ${format.toUpperCase()}`)
    } catch {
      toast.error("Failed to export report")
    } finally {
      setIsExporting(null)
    }
  }

  const reportCategories = [
    {
      title: "Placement Summary Report",
      description: "Overview of all placements including companies, packages, and student statistics",
      icon: TrendingUp,
      type: "placement-summary",
      formats: ["PDF", "Excel", "CSV"],
    },
    {
      title: "Student Placement Report",
      description: "Detailed report of placed students with company, package, and offer details",
      icon: Users,
      type: "student-placement",
      formats: ["PDF", "Excel", "CSV"],
    },
    {
      title: "Company Participation Report",
      description: "List of companies that participated in placement drives with hiring data",
      icon: Building2,
      type: "company-participation",
      formats: ["PDF", "Excel", "CSV"],
    },
    {
      title: "Drive-wise Report",
      description: "Detailed breakdown of each placement drive with applications and selections",
      icon: Briefcase,
      type: "drive-wise",
      formats: ["PDF", "Excel"],
    },
    {
      title: "Branch-wise Placement Report",
      description: "Placement statistics categorized by branch/department",
      icon: BarChart3,
      type: "branch-wise",
      formats: ["PDF", "Excel"],
    },
    {
      title: "Package Analysis Report",
      description: "Salary package analysis including averages, ranges, and distribution",
      icon: FileText,
      type: "package-analysis",
      formats: ["PDF", "Excel"],
    },
  ]

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Reports & Analytics" 
        subtitle="Generate and export placement reports"
        user={{ 
          name: user?.name || "Admin", 
          email: user?.email || "", 
          role: user?.role || "TPO" 
        }}
      />
      
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalStudents}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Placed Students</p>
                <p className="text-2xl font-bold text-green-600">{stats.placedStudents}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Placement Rate</p>
                <p className="text-2xl font-bold text-accent">{stats.placementRate?.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Companies</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalCompanies}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Year Selector */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Academic Year:</span>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024-2025</SelectItem>
              <SelectItem value="2023">2023-2024</SelectItem>
              <SelectItem value="2022">2022-2023</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reports Grid */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="placement">Placement</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportCategories.map((report) => (
                <Card key={report.type} className="hover:border-accent/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <report.icon className="h-6 w-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription className="mt-1">{report.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {report.formats.map((format) => (
                        <Button
                          key={format}
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport(report.title, format)}
                          disabled={isExporting === report.title}
                        >
                          {isExporting === report.title ? (
                            <Spinner className="h-4 w-4 mr-2" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Export {format}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="placement" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportCategories.filter(r => ["placement-summary", "student-placement", "branch-wise"].includes(r.type)).map((report) => (
                <Card key={report.type} className="hover:border-accent/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <report.icon className="h-6 w-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription className="mt-1">{report.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {report.formats.map((format) => (
                        <Button
                          key={format}
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport(report.title, format)}
                          disabled={isExporting === report.title}
                        >
                          {isExporting === report.title ? (
                            <Spinner className="h-4 w-4 mr-2" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Export {format}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="company" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportCategories.filter(r => ["company-participation", "drive-wise"].includes(r.type)).map((report) => (
                <Card key={report.type} className="hover:border-accent/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <report.icon className="h-6 w-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription className="mt-1">{report.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {report.formats.map((format) => (
                        <Button
                          key={format}
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport(report.title, format)}
                          disabled={isExporting === report.title}
                        >
                          {isExporting === report.title ? (
                            <Spinner className="h-4 w-4 mr-2" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Export {format}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportCategories.filter(r => ["package-analysis"].includes(r.type)).map((report) => (
                <Card key={report.type} className="hover:border-accent/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <report.icon className="h-6 w-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription className="mt-1">{report.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {report.formats.map((format) => (
                        <Button
                          key={format}
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport(report.title, format)}
                          disabled={isExporting === report.title}
                        >
                          {isExporting === report.title ? (
                            <Spinner className="h-4 w-4 mr-2" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Export {format}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
