"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"

type HeaderProps = {
  title: string
  subtitle?: string
  // user prop is optional for backward compatibility — data is read from auth context
  user?: {
    name: string
    email: string
    role: string
  }
}

export function DashboardHeader({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const profileHref = user?.role === "ADMIN" || user?.role === "TPO"
    ? "/dashboard/admin/settings"
    : user?.role === "RECRUITER"
    ? "/dashboard/recruiter/company"
    : "/dashboard/student/profile"

  const settingsHref = user?.role === "ADMIN" || user?.role === "TPO"
    ? "/dashboard/admin/settings"
    : user?.role === "RECRUITER"
    ? "/dashboard/recruiter/company"
    : "/dashboard/student/settings"

  const notificationsHref = user?.role === "STUDENT"
    ? "/dashboard/student/notifications"
    : "/dashboard/admin"

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="h-full flex items-center justify-between px-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="w-64 pl-9 bg-muted/50 border-transparent focus:border-border"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-[10px] font-medium text-accent-foreground flex items-center justify-center">
                  •
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium">Application Update</span>
                <span className="text-sm text-muted-foreground">Your application for TechCorp has been shortlisted</span>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium">Interview Scheduled</span>
                <span className="text-sm text-muted-foreground">Interview with InnovateLabs on March 25</span>
                <span className="text-xs text-muted-foreground">5 hours ago</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={notificationsHref} className="text-center justify-center text-accent">
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-accent">
                    {user?.name?.split(" ").map(n => n[0]).join("") || "U"}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role?.toLowerCase() || "student"}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={profileHref}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={settingsHref}>Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => logout()}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
