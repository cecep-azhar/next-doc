import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogOut, Settings, Users, FileText } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const isSuperAdmin = session.user.role === 'SUPERADMIN';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session.user.name || session.user.email}
            </p>
          </div>
          <form action={async () => {
            'use server';
            const { signOut } = await import('@/lib/auth');
            await signOut({ redirectTo: '/' });
          }}>
            <Button variant="outline" type="submit">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{session.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{session.user.name || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isSuperAdmin 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {session.user.role}
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID:</span>
                <span className="font-mono text-xs">{session.user.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isSuperAdmin && (
            <Link href="/saas-admin">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Super Admin Panel
                  </CardTitle>
                  <CardDescription>
                    Manage system-wide settings and users
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )}

          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Tenants
              </CardTitle>
              <CardDescription>
                View and manage your organizations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentation
              </CardTitle>
              <CardDescription>
                Create and edit documentation
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Success Message */}
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Login Successful! 🎉
                </h3>
                <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                  You have successfully signed in to your account. Your session is active and secure.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🚀 Demo Mode Active
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              You're using the demo database. Here are the available test accounts:
            </p>
            <div className="space-y-2 text-sm">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                <p className="font-semibold">Superadmin:</p>
                <p>Email: cecep.azhtech@gmail.com</p>
                <p>Password: 12345678</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                <p className="font-semibold">Regular User:</p>
                <p>Email: user@example.com</p>
                <p>Password: password123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
