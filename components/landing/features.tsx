import { 
  Users, 
  Building2, 
  CalendarCheck, 
  FileText, 
  Bell, 
  BarChart3,
  Shield,
  Zap
} from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Student Management",
    description: "Complete student profiles with skills, education, and placement status tracking.",
  },
  {
    icon: Building2,
    title: "Company Portal",
    description: "Dedicated dashboard for recruiters to post jobs and manage applications.",
  },
  {
    icon: CalendarCheck,
    title: "Interview Scheduling",
    description: "Automated scheduling with calendar integration and instant notifications.",
  },
  {
    icon: FileText,
    title: "Resume Management",
    description: "Secure resume storage with easy upload and recruiter access controls.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Real-time email alerts for application updates and interview reminders.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive insights on placement drives, applications, and success rates.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Secure access control for students, TPOs, admins, and recruiters.",
  },
  {
    icon: Zap,
    title: "Automated Workflows",
    description: "Streamlined application processing from submission to final selection.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-accent uppercase tracking-wide mb-3">
            Features
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Everything you need for seamless placements
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete platform designed to simplify every aspect of campus recruitment
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-xl border border-border bg-card p-6 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
