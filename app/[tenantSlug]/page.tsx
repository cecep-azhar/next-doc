import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TenantFooter } from '@/components/tenant-footer';

interface TenantPageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

export default async function TenantPage(props: TenantPageProps) {
  const params = await props.params;
  const tenant = await db.tenant.findUnique({
    where: { slug: params.tenantSlug },
    include: {
      projects: {
        include: {
          versions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!tenant) {
    notFound();
  }

  return (
    <>
      <div className="container mx-auto px-4 py-12 min-h-[calc(100vh-200px)]">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{tenant.name}</h1>
          {tenant.description && (
            <p className="text-xl text-muted-foreground">{tenant.description}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenant.projects.map((project: any) => {
            const latestVersion = project.versions[0];
            return (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  {project.description && (
                    <CardDescription>{project.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {latestVersion && (
                    <Link
                      href={`/${params.tenantSlug}/docs/${project.slug}/${latestVersion.slug}`}
                      className="text-primary hover:underline"
                    >
                      View Documentation →
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {tenant.projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects yet.</p>
          </div>
        )}
      </div>
      
      <TenantFooter tenantSlug={params.tenantSlug} />
    </>
  );
}
