import { Star } from "lucide-react"

const testimonials = [
  {
    quote: "PlaceIT transformed our placement process. We went from weeks of manual coordination to a fully automated system that our students love.",
    author: "Dr. Priya Sharma",
    role: "TPO, National Institute of Technology",
    rating: 5,
  },
  {
    quote: "As a recruiter, I can now manage all campus hiring from one dashboard. The quality of candidates and the ease of scheduling is remarkable.",
    author: "Rajesh Kumar",
    role: "HR Director, TechCorp India",
    rating: 5,
  },
  {
    quote: "Getting placed was so much easier with PlaceIT. I could track all my applications and never missed an interview notification.",
    author: "Ananya Patel",
    role: "Software Engineer, InnovateLabs",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-accent uppercase tracking-wide mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Loved by institutions and recruiters
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our users have to say about their experience with PlaceIT
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="relative rounded-xl border border-border bg-card p-8 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="text-foreground leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-accent">
                    {testimonial.author.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
