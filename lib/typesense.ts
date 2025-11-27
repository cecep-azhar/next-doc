/**
 * TYPESENSE SEARCH INTEGRATION
 * 
 * Provides instant, typo-tolerant search across all documentation
 * with tenant-scoping for multi-tenancy
 */

import Typesense from 'typesense';

// Initialize Typesense client (server-side only)
export const typesenseAdmin = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || 'localhost',
      port: parseInt(process.env.TYPESENSE_PORT || '8108'),
      protocol: process.env.TYPESENSE_PROTOCOL || 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY!,
  connectionTimeoutSeconds: 2,
});

// =============================================================================
// COLLECTION SCHEMA
// =============================================================================

export const DOCUMENTS_COLLECTION = 'documents';

export const documentsSchema = {
  name: DOCUMENTS_COLLECTION,
  fields: [
    { name: 'tenantId', type: 'string', facet: true },
    { name: 'projectId', type: 'string', facet: true },
    { name: 'versionId', type: 'string', facet: true },
    { name: 'title', type: 'string' },
    { name: 'content', type: 'string' },
    { name: 'slug', type: 'string' },
    { name: 'category', type: 'string', facet: true, optional: true },
    { name: 'locale', type: 'string', facet: true },
    { name: 'tags', type: 'string[]', facet: true, optional: true },
    { name: 'isPublished', type: 'bool', facet: true },
    { name: 'publishedAt', type: 'int64', optional: true },
    { name: 'createdAt', type: 'int64' },
  ],
  default_sorting_field: 'createdAt',
} as const;

// =============================================================================
// COLLECTION MANAGEMENT
// =============================================================================

/**
 * Initialize Typesense collections
 */
export async function initializeTypesense() {
  try {
    // Check if collection exists
    const collections = await typesenseAdmin.collections().retrieve();
    const exists = collections.some((col) => col.name === DOCUMENTS_COLLECTION);

    if (!exists) {
      await typesenseAdmin.collections().create(documentsSchema);
      console.log('✅ Typesense collection created');
    } else {
      console.log('✅ Typesense collection already exists');
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Typesense:', error);
    return false;
  }
}

/**
 * Reset Typesense collection (delete and recreate)
 */
export async function resetTypesenseCollection() {
  try {
    await typesenseAdmin.collections(DOCUMENTS_COLLECTION).delete();
    await typesenseAdmin.collections().create(documentsSchema);
    console.log('✅ Typesense collection reset');
    return true;
  } catch (error) {
    console.error('❌ Failed to reset Typesense collection:', error);
    return false;
  }
}

// =============================================================================
// INDEXING
// =============================================================================

/**
 * Index a single document
 */
export async function indexDocument(document: {
  id: string;
  tenantId: string;
  projectId: string;
  versionId: string;
  title: string;
  content: string;
  slug: string;
  category?: string | null;
  locale: string;
  tags?: string | null;
  isPublished: boolean;
  publishedAt?: Date | null;
  createdAt: Date;
}) {
  try {
    const typesenseDoc = {
      id: document.id,
      tenantId: document.tenantId,
      projectId: document.projectId,
      versionId: document.versionId,
      title: document.title,
      content: stripMarkdown(document.content),
      slug: document.slug,
      category: document.category || '',
      locale: document.locale,
      tags: document.tags ? JSON.parse(document.tags) : [],
      isPublished: document.isPublished,
      publishedAt: document.publishedAt
        ? Math.floor(document.publishedAt.getTime() / 1000)
        : 0,
      createdAt: Math.floor(document.createdAt.getTime() / 1000),
    };

    await typesenseAdmin
      .collections(DOCUMENTS_COLLECTION)
      .documents()
      .upsert(typesenseDoc);

    return true;
  } catch (error) {
    console.error('Error indexing document:', error);
    return false;
  }
}

/**
 * Index all documents for a tenant
 */
export async function indexAllTenantDocuments(tenantId: string) {
  try {
    const { db } = await import('@/lib/db');

    const documents = await db.document.findMany({
      where: {
        version: {
          project: {
            tenantId,
          },
        },
      },
      include: {
        version: {
          include: {
            project: true,
          },
        },
      },
    });

    for (const doc of documents) {
      await indexDocument({
        id: doc.id,
        tenantId: doc.version.project.tenantId,
        projectId: doc.version.projectId,
        versionId: doc.versionId,
        title: doc.title,
        content: doc.content,
        slug: doc.slug,
        category: doc.category,
        locale: doc.locale,
        tags: doc.tags,
        isPublished: doc.isPublished,
        publishedAt: doc.publishedAt,
        createdAt: doc.createdAt,
      });
    }

    console.log(`✅ Indexed ${documents.length} documents for tenant ${tenantId}`);
    return true;
  } catch (error) {
    console.error('Error indexing tenant documents:', error);
    return false;
  }
}

/**
 * Remove document from index
 */
export async function removeDocumentFromIndex(documentId: string) {
  try {
    await typesenseAdmin
      .collections(DOCUMENTS_COLLECTION)
      .documents(documentId)
      .delete();
    return true;
  } catch (error) {
    console.error('Error removing document from index:', error);
    return false;
  }
}

// =============================================================================
// SEARCH
// =============================================================================

/**
 * Search documents with tenant filtering
 */
export async function searchDocuments({
  query,
  tenantId,
  locale,
  limit = 10,
  page = 1,
}: {
  query: string;
  tenantId: string;
  locale?: string;
  limit?: number;
  page?: number;
}) {
  try {
    const filterBy: string[] = [
      `tenantId:=${tenantId}`,
      'isPublished:=true',
    ];

    if (locale) {
      filterBy.push(`locale:=${locale}`);
    }

    const searchParameters = {
      q: query,
      query_by: 'title,content,category',
      filter_by: filterBy.join(' && '),
      per_page: limit,
      page,
      highlight_full_fields: 'title,content',
      snippet_threshold: 30,
      num_typos: 2,
      typo_tokens_threshold: 1,
    };

    const results = await typesenseAdmin
      .collections(DOCUMENTS_COLLECTION)
      .documents()
      .search(searchParameters);

    return results;
  } catch (error) {
    console.error('Error searching documents:', error);
    return null;
  }
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Strip markdown formatting for search indexing
 */
function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .replace(/`{1,3}[^`]+`{1,3}/g, '') // Remove code blocks
    .replace(/>\s+/g, '') // Remove blockquotes
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/\n{2,}/g, ' ') // Replace multiple newlines
    .trim();
}

/**
 * Generate search API key for client-side (scoped to tenant)
 */
export async function generateSearchApiKey(tenantId: string): Promise<string> {
  try {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour

    const scopedKey = await typesenseAdmin.keys().create({
      description: `Search key for tenant ${tenantId}`,
      actions: ['documents:search'],
      collections: [DOCUMENTS_COLLECTION],
      expires_at: expiresAt,
    });

    return scopedKey.value;
  } catch (error) {
    console.error('Error generating search API key:', error);
    throw error;
  }
}
