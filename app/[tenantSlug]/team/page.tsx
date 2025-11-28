import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { userHasPermission } from '@/lib/tenant-helpers';
import { TenantRole } from '@/lib/permissions';
import { Mail, Shield, UserPlus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface TeamPageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

export default async function TeamPage(props: TeamPageProps) {
  const session = await auth();
  const params = await props.params;
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const tenant = await db.tenant.findUnique({
    where: { slug: params.tenantSlug },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: [
          { role: 'asc' },
          { createdAt: 'asc' },
        ],
      },
    },
  });

  if (!tenant) {
    notFound();
  }

  // Check permission
  const canManageTeam = await userHasPermission(
    tenant.id,
    session.user.id,
    'team.invite'
  );

  const currentUserMember = tenant.members.find(m => m.userId === session.user.id);
  const currentUserRole = currentUserMember?.role as TenantRole || 'VIEWER';

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'EDITOR':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'VIEWER':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
      case 'ADMIN':
        return <Shield className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Team Members</h1>
            <p className="text-muted-foreground">
              Manage team members and their roles for {tenant.name}
            </p>
          </div>
          {canManageTeam && (
            <Button asChild>
              <Link href={`/${params.tenantSlug}/team/invite`}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Members</CardDescription>
            <CardTitle className="text-3xl">{tenant.members.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Owners</CardDescription>
            <CardTitle className="text-3xl">
              {tenant.members.filter(m => m.role === 'OWNER').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Admins</CardDescription>
            <CardTitle className="text-3xl">
              {tenant.members.filter(m => m.role === 'ADMIN').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Editors</CardDescription>
            <CardTitle className="text-3xl">
              {tenant.members.filter(m => m.role === 'EDITOR').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            People who have access to this organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tenant.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {member.user.image ? (
                      <img
                        src={member.user.image}
                        alt={member.user.name || 'User'}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-primary">
                        {member.user.name?.charAt(0) || member.user.email?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{member.user.name || 'Unknown'}</p>
                      {member.userId === session.user.id && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {member.user.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={getRoleBadgeColor(member.role)}>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(member.role)}
                      <span>{member.role}</span>
                    </div>
                  </Badge>
                  
                  {canManageTeam && member.userId !== session.user.id && member.role !== 'OWNER' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/${params.tenantSlug}/team/${member.id}/edit`}>
                          Change Role
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Understanding what each role can do
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-800">OWNER</Badge>
                <span className="text-sm font-medium">Full Control</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Manage billing & subscription</li>
                <li>• Setup custom domain</li>
                <li>• Delete organization</li>
                <li>• Manage all team members</li>
                <li>• Full access to all content</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">ADMIN</Badge>
                <span className="text-sm font-medium">Administrative Access</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Manage team members</li>
                <li>• Organization settings</li>
                <li>• Full content access</li>
                <li>• View analytics</li>
                <li>• Cannot access billing</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">EDITOR</Badge>
                <span className="text-sm font-medium">Content Management</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Create & edit projects</li>
                <li>• Manage documents</li>
                <li>• Publish content</li>
                <li>• View analytics</li>
                <li>• Cannot manage team</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-100 text-gray-800">VIEWER</Badge>
                <span className="text-sm font-medium">Read-Only Access</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• View team members</li>
                <li>• View projects</li>
                <li>• View documents</li>
                <li>• Cannot edit anything</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
