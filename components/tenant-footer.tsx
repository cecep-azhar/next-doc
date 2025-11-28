import Link from 'next/link';
import { db } from '@/lib/db';

interface TenantFooterProps {
  tenantSlug: string;
}

export async function TenantFooter({ tenantSlug }: TenantFooterProps) {
  const tenant = await db.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { plan: true, name: true },
  });

  // PRO plan: No branding (white-label)
  if (tenant?.plan === 'PRO') {
    return (
      <footer className="border-t mt-12 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {tenant.name}. All rights reserved.
          </div>
        </div>
      </footer>
    );
  }

  // FREE plan: Show DocuVerse branding
  return (
    <footer className="border-t mt-12 py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {tenant?.name || 'Documentation'}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Powered by</span>
            <Link 
              href="https://docuverse.com" 
              target="_blank"
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              DocuVerse
            </Link>
            <span>•</span>
            <Link 
              href="/pricing" 
              className="text-primary hover:underline"
            >
              Upgrade to remove branding
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
