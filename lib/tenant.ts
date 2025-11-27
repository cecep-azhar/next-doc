/**
 * MULTI-TENANT UTILITIES
 * 
 * Handles subdomain routing, tenant detection, and tenant-scoped operations
 */

import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { cache } from 'react';
import type { Tenant, TenantMember, User } from '@prisma/client';

// =============================================================================
// TENANT DETECTION
// =============================================================================

/**
 * Get current tenant from subdomain or path
 * Can be used in Server Components, Server Actions, and Route Handlers
 */
export const getCurrentTenant = cache(async (): Promise<Tenant | null> => {
  const headersList = await headers();
  const subdomain = headersList.get('x-tenant-subdomain');

  if (!subdomain) {
    return null;
  }

  try {
    const tenant = await db.tenant.findUnique({
      where: { slug: subdomain },
      include: {
        settings: true,
      },
    });

    return tenant;
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return null;
  }
});

/**
 * Get tenant by slug
 */
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  try {
    return await db.tenant.findUnique({
      where: { slug },
      include: {
        settings: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching tenant by slug:', error);
    return null;
  }
}

/**
 * Get tenant by custom domain
 */
export async function getTenantByDomain(domain: string): Promise<Tenant | null> {
  try {
    return await db.tenant.findUnique({
      where: { domain },
      include: {
        settings: true,
      },
    });
  } catch (error) {
    console.error('Error fetching tenant by domain:', error);
    return null;
  }
}

// =============================================================================
// TENANT MEMBERSHIP & PERMISSIONS
// =============================================================================

/**
 * Get user's role in a tenant
 */
export async function getUserTenantRole(
  userId: string,
  tenantId: string
): Promise<'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | null> {
  try {
    const member = await db.tenantMember.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
      select: {
        role: true,
      },
    });

    return member?.role || null;
  } catch (error) {
    console.error('Error fetching user tenant role:', error);
    return null;
  }
}

/**
 * Check if user has access to tenant
 */
export async function hasAccessToTenant(
  userId: string,
  tenantId: string
): Promise<boolean> {
  const role = await getUserTenantRole(userId, tenantId);
  return role !== null;
}

/**
 * Check if user is tenant owner or admin
 */
export async function isTenantAdmin(
  userId: string,
  tenantId: string
): Promise<boolean> {
  const role = await getUserTenantRole(userId, tenantId);
  return role === 'OWNER' || role === 'ADMIN';
}

/**
 * Get all tenants for a user
 */
export async function getUserTenants(userId: string) {
  try {
    const memberships = await db.tenantMember.findMany({
      where: { userId },
      include: {
        tenant: {
          include: {
            settings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return memberships.map((m) => ({
      ...m.tenant,
      userRole: m.role,
    }));
  } catch (error) {
    console.error('Error fetching user tenants:', error);
    return [];
  }
}

// =============================================================================
// TENANT CREATION & MANAGEMENT
// =============================================================================

/**
 * Create a new tenant
 */
export async function createTenant(data: {
  name: string;
  slug: string;
  ownerId: string;
  plan?: 'FREE' | 'PRO' | 'TEAM';
}) {
  try {
    // Check if slug is available
    const existing = await db.tenant.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new Error('Tenant slug already exists');
    }

    // Create tenant with owner membership
    const tenant = await db.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        ownerId: data.ownerId,
        plan: data.plan || 'FREE',
        members: {
          create: {
            userId: data.ownerId,
            role: 'OWNER',
          },
        },
        settings: {
          create: {
            allowPublicDocs: true,
            enableSearch: true,
            enableVersioning: true,
          },
        },
      },
      include: {
        settings: true,
        members: true,
      },
    });

    // Log tenant creation
    await db.auditLog.create({
      data: {
        userId: data.ownerId,
        tenantId: tenant.id,
        action: 'TENANT_CREATED',
        resource: 'tenant',
        resourceId: tenant.id,
        metadata: JSON.stringify({ name: data.name, slug: data.slug }),
      },
    });

    return tenant;
  } catch (error) {
    console.error('Error creating tenant:', error);
    throw error;
  }
}

/**
 * Update tenant
 */
export async function updateTenant(
  tenantId: string,
  data: Partial<{
    name: string;
    slug: string;
    domain: string;
    logo: string;
  }>
) {
  try {
    return await db.tenant.update({
      where: { id: tenantId },
      data,
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    throw error;
  }
}

/**
 * Delete tenant
 */
export async function deleteTenant(tenantId: string) {
  try {
    return await db.tenant.delete({
      where: { id: tenantId },
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    throw error;
  }
}

// =============================================================================
// TENANT MEMBERS MANAGEMENT
// =============================================================================

/**
 * Add member to tenant
 */
export async function addTenantMember(
  tenantId: string,
  userId: string,
  role: 'ADMIN' | 'MEMBER' | 'VIEWER'
) {
  try {
    return await db.tenantMember.create({
      data: {
        tenantId,
        userId,
        role,
      },
    });
  } catch (error) {
    console.error('Error adding tenant member:', error);
    throw error;
  }
}

/**
 * Update member role
 */
export async function updateTenantMemberRole(
  tenantId: string,
  userId: string,
  role: 'ADMIN' | 'MEMBER' | 'VIEWER'
) {
  try {
    return await db.tenantMember.update({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
      data: { role },
    });
  } catch (error) {
    console.error('Error updating tenant member role:', error);
    throw error;
  }
}

/**
 * Remove member from tenant
 */
export async function removeTenantMember(tenantId: string, userId: string) {
  try {
    return await db.tenantMember.delete({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
    });
  } catch (error) {
    console.error('Error removing tenant member:', error);
    throw error;
  }
}

/**
 * Get all members of a tenant
 */
export async function getTenantMembers(tenantId: string) {
  try {
    return await db.tenantMember.findMany({
      where: { tenantId },
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching tenant members:', error);
    return [];
  }
}

// =============================================================================
// SLUG VALIDATION
// =============================================================================

/**
 * Validate tenant slug format
 */
export function isValidSlug(slug: string): boolean {
  // Must be lowercase alphanumeric with hyphens, 3-32 characters
  const slugRegex = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;
  return slugRegex.test(slug);
}

/**
 * Check if slug is available
 */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  try {
    const tenant = await db.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });
    return !tenant;
  } catch (error) {
    console.error('Error checking slug availability:', error);
    return false;
  }
}

// =============================================================================
// RESERVED SLUGS (Cannot be used as tenant slugs)
// =============================================================================

export const RESERVED_SLUGS = [
  'www',
  'app',
  'api',
  'admin',
  'saas-admin',
  'dashboard',
  'auth',
  'signup',
  'signin',
  'signout',
  'settings',
  'docs',
  'blog',
  'support',
  'help',
  'status',
  'pricing',
  'about',
  'contact',
  'legal',
  'privacy',
  'terms',
  'security',
];

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
}
