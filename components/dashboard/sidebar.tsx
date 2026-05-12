"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Calendar, 
  User, 
  Settings,
  LogOut,
  Building2,
  Users,
  BarChart3,
  Bell,
  ChevronLeft,
  Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

type SidebarProps = {
  role: "student" | "admin" | "recruiter"
}

const studentNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
  { label: "Jobs", href: "/dashboard/student/jobs", icon: Briefcase },
  { label: "Applications", href: "/dashboard/student/applications", icon: FileText },
  { label: "Interviews", href: "/dashboard/student/interviews", icon: Calendar },
  { label: "Profile", href: "/dashboard/student/profile", icon: User },
]

const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Placement Drives", href: "/dashboard/admin/drives", icon: Briefcase },
  { label: "Applications", href: "/dashboard/admin/applications", icon: FileText },
  { label: "Interviews", href: "/dashboard/admin/interviews/new", icon: Calendar },
  { label: "Students", href: "/dashboard/admin/students", icon: Users },
  { label: "Companies", href: "/dashboard/admin/companies", icon: Building2 },
  { label: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
]

const recruiterNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/recruiter", icon: LayoutDashboard },
  { label: "Job Postings", href: "/dashboard/recruiter/jobs", icon: Briefcase },
  { label: "Applications", href: "/dashboard/recruiter/applications", icon: FileText },
  { label: "Interviews", href: "/dashboard/recruiter/interviews", icon: Calendar },
  { label: "Company Profile", href: "/dashboard/recruiter/company", icon: Building2 },
]

const navItemsMap = {
  student: studentNavItems,
  admin: adminNavItems,
  recruiter: recruiterNavItems,
}

const settingsRouteMap = {
  student: "/dashboard/student/settings",
  admin: "/dashboard/admin/settings",
  recruiter: "/dashboard/recruiter/company",
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logout } = useAuth()
  const navItems = navItemsMap[role]
  const settingsHref = settingsRouteMap[role]

  const handleLogout = async () => {
    await logout()
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">P</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">PlaceIT</span>
        </Link>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-50",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">P</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">PlaceIT</span>
            </Link>
          )}
          {isCollapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary mx-auto">
              <span className="text-sm font-bold text-primary-foreground">P</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(isCollapsed && "mx-auto")}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-accent/10 text-accent" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          <Link
            href={settingsHref}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
              isCollapsed && "justify-center px-2"
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
              isCollapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
