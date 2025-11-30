import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Smartphone, TrendingUp, Shield, Share2, BarChart3 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { TestimonialsCarousel } from "@/components/testimonials-carousel"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            TuFund
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Fundraise Easily with{" "}
            <span className="text-primary">Paystack</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Create campaigns, accept donations, and track progress in real-time.
            Accessible worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Your Campaign Free
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Browse Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose TuFund?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Smartphone className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Paystack Ready</CardTitle>
                <CardDescription>
                  Accept donations via Paystack. Support for cards, bank transfers, and mobile money. Secure and instant payments.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Real-Time Tracking</CardTitle>
                <CardDescription>
                  Watch your campaign progress update in real-time as donations come in.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Secure & Safe</CardTitle>
                <CardDescription>
                  Bank-level security with fraud detection. Your funds are protected.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Share2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Easy Sharing</CardTitle>
                <CardDescription>
                  Share your campaign via WhatsApp, email, or social media with one click.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Detailed Reports</CardTitle>
                <CardDescription>
                  Download PDF reports and track all donations with full transparency.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Heart className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Global Cards</CardTitle>
                <CardDescription>
                  Accept international donations via credit and debit cards.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Our Users Say
          </h2>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">TuFund</h3>
              <p className="text-sm text-muted-foreground">
                Making fundraising easy and accessible for everyone in Kenya.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/campaigns" className="hover:text-foreground">
                    Browse Campaigns
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="hover:text-foreground">
                    Create Campaign
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2025 TuFund. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

