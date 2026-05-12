import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-primary px-8 py-16 md:px-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground max-w-3xl text-balance">
              Ready to transform your placement process?
            </h2>
            <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl">
              Join hundreds of institutions already using PlaceIT to streamline campus placements 
              and connect students with their dream careers.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <Link href="/auth/register">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="h-12 px-8 text-base font-medium"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button 
                  size="lg" 
                  variant="ghost"
                  className="h-12 px-8 text-base font-medium text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
