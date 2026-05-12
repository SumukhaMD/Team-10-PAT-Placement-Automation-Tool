const stats = [
  { value: "500+", label: "Institutions", description: "trust PlaceIT" },
  { value: "98%", label: "placement rate", description: "for active users" },
  { value: "10K+", label: "students placed", description: "last year" },
  { value: "2x", label: "faster hiring", description: "than traditional" },
]

const logos = [
  "TechCorp",
  "InnovateLabs",
  "DataDrive",
  "CloudFirst",
  "DevHub",
  "CodeBase",
]

export function Stats() {
  return (
    <section className="py-16 border-y border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center md:text-left">
              <p className="text-3xl md:text-4xl font-bold text-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium text-foreground">{stat.label}</span>{" "}
                {stat.description}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground mb-6">
            Trusted by leading companies and institutions
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {logos.map((logo) => (
              <div
                key={logo}
                className="text-lg font-bold text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
