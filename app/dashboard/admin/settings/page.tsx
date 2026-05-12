"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { 
  Settings, 
  Bell, 
  Mail, 
  Shield, 
  Building, 
  Calendar,
  Save
} from "lucide-react"

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  const [generalSettings, setGeneralSettings] = useState({
    instituteName: "National Institute of Technology",
    instituteCode: "NIT-001",
    academicYear: "2024-2025",
    placementSeason: "2024",
    email: "placement@nit.ac.in",
    phone: "+91 9876543210",
    address: "NIT Campus, Bangalore - 560001",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newApplicationAlert: true,
    driveStartAlert: true,
    interviewScheduleAlert: true,
    placementUpdateAlert: true,
  })

  const [placementSettings, setPlacementSettings] = useState({
    autoApproveApplications: false,
    allowMultipleOffers: true,
    maxOffersPerStudent: "3",
    minCgpaDefault: "6.0",
    maxBacklogsDefault: "0",
    dreamPackageThreshold: "15",
    superDreamPackageThreshold: "25",
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In production, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Settings saved successfully")
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Settings" 
        subtitle="Configure placement portal settings"
        user={{ 
          name: user?.name || "Admin", 
          email: user?.email || "", 
          role: user?.role || "TPO" 
        }}
      />
      
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="general" className="gap-2">
              <Building className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="placement" className="gap-2">
              <Calendar className="h-4 w-4" />
              Placement
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Institute Information</CardTitle>
                <CardDescription>Basic details about your institution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instituteName">Institute Name</Label>
                    <Input
                      id="instituteName"
                      value={generalSettings.instituteName}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, instituteName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instituteCode">Institute Code</Label>
                    <Input
                      id="instituteCode"
                      value={generalSettings.instituteCode}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, instituteCode: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Select 
                      value={generalSettings.academicYear} 
                      onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, academicYear: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-2025">2024-2025</SelectItem>
                        <SelectItem value="2025-2026">2025-2026</SelectItem>
                        <SelectItem value="2026-2027">2026-2027</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="placementSeason">Placement Season</Label>
                    <Select 
                      value={generalSettings.placementSeason} 
                      onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, placementSeason: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={generalSettings.email}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={generalSettings.phone}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={generalSettings.address}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                  />
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  <h4 className="font-medium">Alert Types</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label>New Application Alerts</Label>
                    <Switch
                      checked={notificationSettings.newApplicationAlert}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, newApplicationAlert: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Drive Start Alerts</Label>
                    <Switch
                      checked={notificationSettings.driveStartAlert}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, driveStartAlert: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Interview Schedule Alerts</Label>
                    <Switch
                      checked={notificationSettings.interviewScheduleAlert}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, interviewScheduleAlert: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Placement Update Alerts</Label>
                    <Switch
                      checked={notificationSettings.placementUpdateAlert}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, placementUpdateAlert: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="placement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Placement Rules</CardTitle>
                <CardDescription>Configure placement process rules and defaults</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-approve Applications</Label>
                    <p className="text-sm text-muted-foreground">Automatically approve eligible applications</p>
                  </div>
                  <Switch
                    checked={placementSettings.autoApproveApplications}
                    onCheckedChange={(checked) => setPlacementSettings(prev => ({ ...prev, autoApproveApplications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Multiple Offers</Label>
                    <p className="text-sm text-muted-foreground">Allow students to receive multiple job offers</p>
                  </div>
                  <Switch
                    checked={placementSettings.allowMultipleOffers}
                    onCheckedChange={(checked) => setPlacementSettings(prev => ({ ...prev, allowMultipleOffers: checked }))}
                  />
                </div>

                {placementSettings.allowMultipleOffers && (
                  <div className="space-y-2">
                    <Label htmlFor="maxOffers">Maximum Offers per Student</Label>
                    <Input
                      id="maxOffers"
                      type="number"
                      min="1"
                      max="10"
                      value={placementSettings.maxOffersPerStudent}
                      onChange={(e) => setPlacementSettings(prev => ({ ...prev, maxOffersPerStudent: e.target.value }))}
                      className="max-w-xs"
                    />
                  </div>
                )}

                <div className="border-t border-border pt-6 space-y-4">
                  <h4 className="font-medium">Default Eligibility Criteria</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minCgpa">Default Minimum CGPA</Label>
                      <Input
                        id="minCgpa"
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={placementSettings.minCgpaDefault}
                        onChange={(e) => setPlacementSettings(prev => ({ ...prev, minCgpaDefault: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxBacklogs">Default Maximum Backlogs</Label>
                      <Input
                        id="maxBacklogs"
                        type="number"
                        min="0"
                        value={placementSettings.maxBacklogsDefault}
                        onChange={(e) => setPlacementSettings(prev => ({ ...prev, maxBacklogsDefault: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  <h4 className="font-medium">Package Thresholds (LPA)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dreamPackage">Dream Package Threshold</Label>
                      <Input
                        id="dreamPackage"
                        type="number"
                        min="0"
                        value={placementSettings.dreamPackageThreshold}
                        onChange={(e) => setPlacementSettings(prev => ({ ...prev, dreamPackageThreshold: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">Packages above this are considered &quot;Dream&quot;</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="superDreamPackage">Super Dream Package Threshold</Label>
                      <Input
                        id="superDreamPackage"
                        type="number"
                        min="0"
                        value={placementSettings.superDreamPackageThreshold}
                        onChange={(e) => setPlacementSettings(prev => ({ ...prev, superDreamPackageThreshold: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">Packages above this are considered &quot;Super Dream&quot;</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage security and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t border-border pt-6">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Change Admin Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
