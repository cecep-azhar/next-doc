import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DocumentPageProps {
  params: Promise<{
    tenantSlug: string;
    projectSlug: string;
    versionSlug: string;
    docSlug: string;
  }>;
}

async function getDocumentData(
  tenantSlug: string,
  projectSlug: string,
  versionSlug: string,
  docSlug: string
) {
  const tenant = await db.tenant.findUnique({
    where: { slug: tenantSlug },
    include: { settings: true }
  });

  if (!tenant) return null;

  const project = await db.project.findFirst({
    where: {
      tenantId: tenant.id,
      slug: projectSlug,
      isPublic: true
    }
  });

  if (!project) return null;

  const version = await db.version.findFirst({
    where: {
      projectId: project.id,
      slug: versionSlug,
      isPublished: true
    }
  });

  if (!version) return null;

  const document = await db.document.findFirst({
    where: {
      versionId: version.id,
      slug: docSlug,
      isPublished: true,
      locale: 'en'
    }
  });

  if (!document) return null;

  // Get all documents for navigation
  const allDocs = await db.document.findMany({
    where: {
      versionId: version.id,
      isPublished: true,
      locale: 'en'
    },
    orderBy: [
      { category: 'asc' },
      { order: 'asc' }
    ]
  });

  const currentIndex = allDocs.findIndex(d => d.id === document.id);
  const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
  const nextDoc = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

  return {
    tenant,
    project,
    version,
    document,
    allDocs,
    prevDoc,
    nextDoc
  };
}

export default async function DocumentPage(props: DocumentPageProps) {
  const params = await props.params;
  const data = await getDocumentData(
    params.tenantSlug,
    params.projectSlug,
    params.versionSlug,
    params.docSlug
  );

  if (!data) {
    notFound();
  }

  const { tenant, project, version, document, allDocs, prevDoc, nextDoc } = data;

  // Group docs by category for sidebar
  const docsByCategory = allDocs.reduce((acc, doc) => {
    const category = doc.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, typeof allDocs>);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href={`/${tenant.slug}`} className="flex items-center gap-3 hover:opacity-80">
              {tenant.logo && (
                <img src={tenant.logo} alt={tenant.name} className="h-7 w-7 rounded" />
              )}
              <span className="font-bold">{tenant.name}</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${tenant.slug}`}>Docs Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 border-r bg-muted/10 overflow-y-auto sticky top-14 h-[calc(100vh-3.5rem)]">
          <div className="p-4 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{project.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">Version {version.name}</p>
            </div>

            <nav className="space-y-4">
              {Object.entries(docsByCategory).map(([category, docs]) => (
                <div key={category}>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                    {category}
                  </h4>
                  <ul className="space-y-1">
                    {docs.map((doc) => (
                      <li key={doc.id}>
                        <Link
                          href={`/${tenant.slug}/docs/${project.slug}/${version.slug}/${doc.slug}`}
                          className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
                            doc.id === document.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          {doc.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <article className="container max-w-4xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="text-sm text-muted-foreground mb-6">
              <Link href={`/${tenant.slug}`} className="hover:text-primary">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link href={`/${tenant.slug}`} className="hover:text-primary">
                {project.name}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{document.title}</span>
            </nav>

            {/* Document Header */}
            <header className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{document.title}</h1>
              {document.excerpt && (
                <p className="text-xl text-muted-foreground">{document.excerpt}</p>
              )}
              {document.publishedAt && (
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span>Published: {new Date(document.publishedAt).toLocaleDateString()}</span>
                  <span>Updated: {new Date(document.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
            </header>

            {/* Document Content */}
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {document.content}
              </ReactMarkdown>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-12 pt-6 border-t">
              {prevDoc ? (
                <Button variant="outline" asChild>
                  <Link href={`/${tenant.slug}/docs/${project.slug}/${version.slug}/${prevDoc.slug}`}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {prevDoc.title}
                  </Link>
                </Button>
              ) : (
                <div />
              )}

              {nextDoc && (
                <Button variant="outline" asChild>
                  <Link href={`/${tenant.slug}/docs/${project.slug}/${version.slug}/${nextDoc.slug}`}>
                    {nextDoc.title}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}
