import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, Building2, FileText, DollarSign, Activity, Settings } from 'lucide-react';

export default async function SuperAdminPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  // Get statistics
  const [
    totalUsers,
    totalTenants,
    totalProjects,
    totalDocuments,
    activeTenants,
    paidTenants
  ] = await Promise.all([
    db.user.count(),
    db.tenant.count(),
    db.project.count(),
    db.document.count(),
    db.tenant.count({ where: { subscriptionStatus: 'ACTIVE' } }),
    db.tenant.count({ where: { plan: { not: 'FREE' } } })
  ]);

  // Get recent tenants
  const recentTenants = await db.tenant.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      owner: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  // Get recent users
  const recentUsers = await db.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Super Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage system-wide settings and users
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
            <form action={async () => {
              'use server';
              const { signOut } = await import('@/lib/auth');
              await signOut({ redirectTo: '/' });
            }}>
              <Button variant="ghost" type="submit">Sign Out</Button>
            </form>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTenants}</div>
              <p className="text-xs text-muted-foreground">{activeTenants} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Tenants</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paidTenants}</div>
              <p className="text-xs text-muted-foreground">
                ${paidTenants * 9} MRR (estimated)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">Documentation projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDocuments}</div>
              <p className="text-xs text-muted-foreground">Published articles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Tenants */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tenants</CardTitle>
              <CardDescription>Latest organizations created</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {tenant.owner.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium ${
                        tenant.plan === 'FREE' ? 'text-muted-foreground' :
                        tenant.plan === 'PRO' ? 'text-blue-600' :
                        'text-purple-600'
                      }`}>
                        {tenant.plan}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.name || 'No name'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium ${
                        user.role === 'SUPERADMIN' ? 'text-purple-600' : 'text-blue-600'
                      }`}>
                        {user.role}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Administrative tools and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                <Link href="/saas-admin/users">
                  <Users className="h-6 w-6" />
                  <span>Manage Users</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                <Link href="/saas-admin/tenants">
                  <Building2 className="h-6 w-6" />
                  <span>Manage Tenants</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                <Link href="/saas-admin/settings">
                  <Settings className="h-6 w-6" />
                  <span>System Settings</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
