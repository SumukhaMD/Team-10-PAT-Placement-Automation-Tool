"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Bell,
  BriefcaseIcon,
  CalendarIcon,
  CheckCircle,
  AlertCircle,
  InfoIcon,
  Trash2,
  CheckCheck,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/hooks/use-data"
import { apiService } from "@/lib/api-service"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { Spinner } from "@/components/ui/spinner"

const notificationIcons: Record<string, React.ReactNode> = {
  APPLICATION: <BriefcaseIcon className="h-5 w-5" />,
  INTERVIEW: <CalendarIcon className="h-5 w-5" />,
  JOB: <BriefcaseIcon className="h-5 w-5" />,
  SUCCESS: <CheckCircle className="h-5 w-5" />,
  WARNING: <AlertCircle className="h-5 w-5" />,
  INFO: <InfoIcon className="h-5 w-5" />,
}

const notificationColors: Record<string, string> = {
  APPLICATION: "bg-blue-500/10 text-blue-500",
  INTERVIEW: "bg-purple-500/10 text-purple-500",
  JOB: "bg-accent/10 text-accent",
  SUCCESS: "bg-green-500/10 text-green-500",
  WARNING: "bg-yellow-500/10 text-yellow-500",
  INFO: "bg-muted text-muted-foreground",
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState("all")
  const { data: notificationsData, isLoading, mutate } = useNotifications({
    unreadOnly: filter === "unread",
  })

  const notifications = notificationsData?.data || []
  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiService.patch(`/api/notifications/${id}/read`)
      mutate()
    } catch (err) {
      toast.error("Failed to mark as read")
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await apiService.post("/api/notifications/mark-all-read")
      toast.success("All notifications marked as read")
      mutate()
    } catch (err) {
      toast.error("Failed to mark all as read")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiService.delete(`/api/notifications/${id}`)
      toast.success("Notification deleted")
      mutate()
    } catch (err) {
      toast.error("Failed to delete notification")
    }
  }

  const filteredNotifications = filter === "all" 
    ? notifications 
    : notifications.filter(n => !n.read)

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Notifications" 
        subtitle="Stay updated with your placement activities"
        user={{ 
          name: user?.name || "Student", 
          email: user?.email || "", 
          role: "student" 
        }}
      />
      
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread ({unreadCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="font-medium text-foreground mt-4">No notifications</h3>
              <p className="text-muted-foreground mt-1">
                {filter === "unread" 
                  ? "You&apos;re all caught up!" 
                  : "You don&apos;t have any notifications yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-colors ${!notification.read ? "bg-accent/5 border-accent/20" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      notificationColors[notification.type] || notificationColors.INFO
                    }`}>
                      {notificationIcons[notification.type] || notificationIcons.INFO}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.read && (
                            <Badge className="bg-accent/10 text-accent text-xs">New</Badge>
                          )}
                          <div className="flex gap-1">
                            {!notification.read && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      {notification.actionUrl && (
                        <Button variant="link" className="px-0 h-auto text-accent mt-2" asChild>
                          <a href={notification.actionUrl}>{notification.actionText || "View details"}</a>
                        </Button>
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
