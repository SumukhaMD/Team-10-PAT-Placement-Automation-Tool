import { CheckCircle2 } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Register & Setup",
    description: "Create your account and set up your institution or company profile in minutes.",
    features: ["Quick onboarding", "Role-based setup", "Custom branding"],
  },
  {
    number: "02",
    title: "Create Placement Drives",
    description: "TPOs create and manage placement drives with eligibility criteria and schedules.",
    features: ["Eligibility filters", "Drive scheduling", "Auto-notifications"],
  },
  {
    number: "03",
    title: "Students Apply",
    description: "Eligible students browse opportunities and submit applications with their profiles.",
    features: ["One-click apply", "Application tracking", "Status updates"],
  },
  {
    number: "04",
    title: "Interview & Select",
    description: "Recruiters review, shortlist, interview, and select the best candidates.",
    features: ["Interview scheduling", "Feedback system", "Offer management"],
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-accent uppercase tracking-wide mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Simple steps to streamlined placements
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes and transform your placement process
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-border -translate-x-1/2" />
              )}
              <div className="relative">
                <span className="text-6xl font-bold text-muted/50">{step.number}</span>
                <h3 className="text-xl font-semibold text-foreground mt-4 mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {step.description}
                </p>
                <ul className="space-y-2">
                  {step.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
