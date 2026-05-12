"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Users, 
  Building2, 
  Briefcase, 
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart
} from "lucide-react"

const overviewStats = [
  { label: "Total Students", value: "2,450", change: "+12%", trend: "up", icon: Users },
  { label: "Placed Students", value: "1,890", change: "+18%", trend: "up", icon: CheckCircle2 },
  { label: "Active Companies", value: "85", change: "+5%", trend: "up", icon: Building2 },
  { label: "Average Package", value: "12.5 LPA", change: "+8%", trend: "up", icon: TrendingUp },
]

const placementByBranch = [
  { branch: "CSE", total: 850, placed: 720, percentage: 85 },
  { branch: "IT", total: 620, placed: 510, percentage: 82 },
  { branch: "ECE", total: 480, placed: 360, percentage: 75 },
  { branch: "EEE", total: 300, placed: 200, percentage: 67 },
  { branch: "MECH", total: 200, placed: 100, percentage: 50 },
]

const topRecruiters = [
  { company: "TechCorp Solutions", hires: 45, packages: "12-18 LPA" },
  { company: "InnovateLabs", hires: 38, packages: "10-15 LPA" },
  { company: "CloudFirst Systems", hires: 32, packages: "15-22 LPA" },
  { company: "FinTech Pro", hires: 28, packages: "8-12 LPA" },
  { company: "DataDrive Inc", hires: 25, packages: "10-14 LPA" },
]

const monthlyTrend = [
  { month: "Aug", applications: 120, placements: 15 },
  { month: "Sep", applications: 280, placements: 45 },
  { month: "Oct", applications: 450, placements: 120 },
  { month: "Nov", applications: 620, placements: 280 },
  { month: "Dec", applications: 780, placements: 420 },
  { month: "Jan", applications: 920, placements: 580 },
  { month: "Feb", applications: 1050, placements: 720 },
  { month: "Mar", applications: 1200, placements: 890 },
]

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Analytics" 
        subtitle="Placement statistics and insights"
        user={{ name: "Dr. Priya Sharma", email: "tpo@nit.ac.in", role: "TPO" }}
      />
      
      <div className="p-6 space-y-6">
        {/* Time Filter */}
        <div className="flex justify-end">
          <Select defaultValue="2024">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2023-2024</SelectItem>
              <SelectItem value="2023">2022-2023</SelectItem>
              <SelectItem value="2022">2021-2022</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-xs mt-1 flex items-center gap-1">
                      {stat.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      )}
                      <span className={stat.trend === "up" ? "text-green-500" : "text-destructive"}>
                        {stat.change}
                      </span>
                      <span className="text-muted-foreground">vs last year</span>
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Placement by Branch */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5 text-accent" />
                Placement by Branch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {placementByBranch.map((branch) => (
                  <div key={branch.branch}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{branch.branch}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {branch.placed} / {branch.total} students
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${
                        branch.percentage >= 80 ? "text-green-600" :
                        branch.percentage >= 60 ? "text-yellow-600" : "text-destructive"
                      }`}>
                        {branch.percentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          branch.percentage >= 80 ? "bg-green-500" :
                          branch.percentage >= 60 ? "bg-yellow-500" : "bg-destructive"
                        }`}
                        style={{ width: `${branch.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Recruiters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-accent" />
                Top Recruiters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topRecruiters.map((recruiter, index) => (
                  <div key={recruiter.company} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{recruiter.company}</p>
                        <p className="text-xs text-muted-foreground">{recruiter.packages}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{recruiter.hires}</p>
                      <p className="text-xs text-muted-foreground">hires</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              Monthly Placement Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {monthlyTrend.map((month) => (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-accent/20 rounded-t"
                      style={{ height: `${(month.applications / 1200) * 150}px` }}
                    />
                    <div 
                      className="w-full bg-accent rounded-t"
                      style={{ height: `${(month.placements / 1200) * 150}px` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{month.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-accent/20" />
                <span className="text-sm text-muted-foreground">Applications</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-accent" />
                <span className="text-sm text-muted-foreground">Placements</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm font-medium text-green-600">Highest Package</p>
                <p className="text-2xl font-bold text-foreground mt-1">42 LPA</p>
                <p className="text-xs text-muted-foreground mt-1">TechCorp Solutions - Software Engineer</p>
              </div>
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm font-medium text-accent">Most Active Drive</p>
                <p className="text-2xl font-bold text-foreground mt-1">320 Apps</p>
                <p className="text-xs text-muted-foreground mt-1">InnovateLabs - Full Stack Developer</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm font-medium text-blue-600">Fastest Placement</p>
                <p className="text-2xl font-bold text-foreground mt-1">48 hrs</p>
                <p className="text-xs text-muted-foreground mt-1">CloudFirst Systems - DevOps Engineer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
