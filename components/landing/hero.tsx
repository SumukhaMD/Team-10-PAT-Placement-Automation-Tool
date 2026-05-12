import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-foreground mb-6">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>Now serving 500+ institutions</span>
            <Link href="#" className="text-accent hover:underline">
              Learn more
            </Link>
          </div>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl text-balance">
            Campus placements,{" "}
            <span className="text-accent">simplified</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed text-pretty">
            PlaceIT automates the entire placement process. From job postings to interview scheduling, 
            connect students with top recruiters seamlessly and efficiently.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="h-12 px-8 text-base font-medium">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base font-medium">
                See How It Works
              </Button>
            </Link>
          </div>
          <div className="mt-16 w-full max-w-5xl">
            <div className="relative rounded-xl border border-border bg-card p-2 shadow-2xl shadow-accent/10">
              <div className="absolute -top-px left-20 right-20 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
              <div className="rounded-lg bg-muted/50 aspect-video flex items-center justify-center overflow-hidden">
                <DashboardPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DashboardPreview() {
  return (
    <div className="w-full h-full bg-card p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">P</span>
          </div>
          <span className="font-semibold text-foreground">PlaceIT Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Drives", value: "12" },
          { label: "Applications", value: "847" },
          { label: "Interviews", value: "156" },
          { label: "Placements", value: "89" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-3 gap-4">
        <div className="col-span-2 rounded-lg border border-border bg-background p-4">
          <p className="text-sm font-medium text-foreground mb-4">Recent Applications</p>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="h-3 w-32 rounded bg-muted mb-1" />
                  <div className="h-2 w-20 rounded bg-muted" />
                </div>
                <div className="h-6 w-16 rounded-full bg-accent/20" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-sm font-medium text-foreground mb-4">Upcoming</p>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-2 rounded-md bg-muted/50">
                <div className="h-3 w-24 rounded bg-muted mb-1" />
                <div className="h-2 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
