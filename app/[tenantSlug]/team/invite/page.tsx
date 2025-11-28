import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InviteForm } from './invite-form';
import { userHasPermission } from '@/lib/tenant-helpers';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface InvitePageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

export default async function InvitePage(props: InvitePageProps) {
  const session = await auth();
  const params = await props.params;
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const tenant = await db.tenant.findUnique({
    where: { slug: params.tenantSlug },
  });

  if (!tenant) {
    notFound();
  }

  // Check permission
  const canInvite = await userHasPermission(
    tenant.id,
    session.user.id,
    'team.invite'
  );

  if (!canInvite) {
    redirect(`/${params.tenantSlug}/team`);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/${params.tenantSlug}/team`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Invite Team Member</h1>
        <p className="text-muted-foreground">
          Add a new member to {tenant.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Details</CardTitle>
          <CardDescription>
            Enter the email address and select a role for the new team member
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteForm tenantId={tenant.id} tenantSlug={params.tenantSlug} />
        </CardContent>
      </Card>

      {/* Role Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="font-medium text-sm">OWNER</p>
            <p className="text-xs text-muted-foreground">Full control including billing and organization deletion</p>
          </div>
          <div>
            <p className="font-medium text-sm">ADMIN</p>
            <p className="text-xs text-muted-foreground">Manage team and content, but cannot access billing</p>
          </div>
          <div>
            <p className="font-medium text-sm">EDITOR</p>
            <p className="text-xs text-muted-foreground">Create and edit projects and documents</p>
          </div>
          <div>
            <p className="font-medium text-sm">VIEWER</p>
            <p className="text-xs text-muted-foreground">Read-only access to projects and documents</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
