import { Sidebar } from "@/components/dashboard/sidebar"

export default function RecruiterDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar role="recruiter" />
      <main className="lg:pl-64 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
