import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Globe, Lock, Search, Sparkles, Code } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">DocuVerse SaaS</span>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link href="/pricing" className="text-sm font-medium transition-colors hover:text-primary">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm font-medium transition-colors hover:text-primary">
              Docs
            </Link>
            <Link href="/auth/signin" className="text-sm font-medium transition-colors hover:text-primary">
              Sign In
            </Link>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center space-y-8 py-24 text-center">
        <div className="space-y-4">
          <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            🚀 The Future of Documentation
          </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Beautiful Documentation
            <br />
            <span className="gradient-text">Built for Modern Teams</span>
          </h1>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
            Create stunning, fast, and developer-friendly documentation. 
            Multi-tenant SaaS platform with instant search, versioning, and beautiful UI.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" asChild className="gap-2">
            <Link href="/auth/signup">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/demo">
              View Demo
            </Link>
          </Button>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          No credit card required • 14-day free trial • Cancel anytime
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Zap className="h-10 w-10 text-primary" />}
            title="Lightning Fast"
            description="Built with Next.js 16, React 19, and partial prerendering for instant page loads."
          />
          <FeatureCard
            icon={<Globe className="h-10 w-10 text-primary" />}
            title="Multi-Tenant"
            description="Subdomain routing, custom domains, and complete tenant isolation out of the box."
          />
          <FeatureCard
            icon={<Search className="h-10 w-10 text-primary" />}
            title="Instant Search"
            description="Powered by Typesense for typo-tolerant, lightning-fast search across all docs."
          />
          <FeatureCard
            icon={<Lock className="h-10 w-10 text-primary" />}
            title="Secure & Private"
            description="Role-based access control, SSO support, and enterprise-grade security."
          />
          <FeatureCard
            icon={<Code className="h-10 w-10 text-primary" />}
            title="Developer First"
            description="Write in MDX, version control with Git, beautiful code highlighting."
          />
          <FeatureCard
            icon={<Sparkles className="h-10 w-10 text-primary" />}
            title="Beautiful UI"
            description="Glassmorphism effects, dark mode, responsive design, and stunning animations."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="flex flex-col items-center justify-center space-y-8 rounded-lg bg-primary/5 p-12 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Ready to create amazing docs?
          </h2>
          <p className="mx-auto max-w-[600px] text-lg text-muted-foreground">
            Join thousands of developers and teams building better documentation with DocuVerse.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/signup">
              Start Building Today <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-bold">DocuVerse</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Beautiful documentation platform for modern teams.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
              <li><Link href="/docs" className="hover:text-primary">Documentation</Link></li>
              <li><Link href="/changelog" className="hover:text-primary">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-primary">About</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-primary">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-primary">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-primary">Terms</Link></li>
              <li><Link href="/security" className="hover:text-primary">Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="container mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © 2025 DocuVerse SaaS. Built with ❤️ in Indonesia.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/10">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
