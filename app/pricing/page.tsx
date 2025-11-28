import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Check } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="container py-24">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Start free, upgrade as you grow. All plans include 14-day free trial.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        <PricingCard
          name="Free Forever"
          price={0}
          description="Perfect for personal projects"
          features={[
            '10 projects',
            '100 pages',
            'Up to 3 team members',
            '3 versions per project',
            '5MB file uploads',
            '500MB storage',
            'Community support',
          ]}
          cta="Get Started Free"
          href="/auth/signup"
        />

        <PricingCard
          name="Pro"
          price={19}
          description="Everything unlimited for your business"
          features={[
            'Unlimited projects',
            'Unlimited pages',
            'Unlimited team members',
            'Unlimited versions',
            'Custom domain',
            'Remove branding',
            'Advanced analytics',
            'API access',
            '100MB file uploads',
            'Unlimited storage',
            'Priority support',
          ]}
          popular
          cta="Start 14-Day Free Trial"
          href="/auth/signup?plan=pro"
        />
      </div>

      <div className="mt-16 text-center text-sm text-muted-foreground">
        All prices in USD. Billed monthly. Cancel anytime.
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  popular,
  cta,
  href,
}: {
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
  href: string;
}) {
  return (
    <Card className={popular ? 'border-primary shadow-lg' : ''}>
      {popular && (
        <div className="rounded-t-lg bg-primary px-3 py-1 text-center text-sm font-medium text-primary-foreground">
          Most Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full" variant={popular ? 'default' : 'outline'}>
          <Link href={href}>{cta}</Link>
        </Button>
        <ul className="mt-6 space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
