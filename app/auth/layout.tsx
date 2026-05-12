import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground">
              <span className="text-lg font-bold text-primary">P</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-primary-foreground">PlaceIT</span>
          </Link>
          <div className="max-w-md">
            <blockquote className="text-2xl font-medium text-primary-foreground leading-relaxed">
              &ldquo;PlaceIT transformed our placement process. We went from weeks of manual coordination to a fully automated system.&rdquo;
            </blockquote>
            <div className="mt-6">
              <p className="text-primary-foreground font-semibold">Dr. Priya Sharma</p>
              <p className="text-primary-foreground/70 text-sm">TPO, National Institute of Technology</p>
            </div>
          </div>
          <div className="flex items-center gap-8 text-sm text-primary-foreground/60">
            <div>
              <p className="text-3xl font-bold text-primary-foreground">500+</p>
              <p>Institutions</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">10K+</p>
              <p>Students Placed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">98%</p>
              <p>Success Rate</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
