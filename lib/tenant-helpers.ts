import { db } from '@/lib/db';
import { hasPermission, type TenantRole, type Permission } from '@/lib/permissions';
import { hasReachedLimit, getRemainingQuota, type Plan } from '@/lib/plan-limits';

/**
 * Get tenant member role for a user
 */
export async function getTenantMemberRole(
  tenantId: string,
  userId: string
): Promise<TenantRole | null> {
  const member = await db.tenantMember.findUnique({
    where: {
      tenantId_userId: {
        tenantId,
        userId,
      },
    },
    select: { role: true },
  });

  return member?.role as TenantRole | null;
}

/**
 * Check if user has permission in tenant
 */
export async function userHasPermission(
  tenantId: string,
  userId: string,
  permission: Permission
): Promise<boolean> {
  const role = await getTenantMemberRole(tenantId, userId);
  if (!role) return false;
  
  return hasPermission(role, permission);
}

/**
 * Get tenant with usage stats
 */
export async function getTenantWithUsage(tenantId: string) {
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    include: {
      projects: {
        include: {
          _count: {
            select: { documents: true },
          },
        },
      },
      members: true,
    },
  });

  if (!tenant) return null;

  const projectCount = tenant.projects.length;
  const pageCount = tenant.projects.reduce(
    (sum, project) => sum + project._count.documents,
    0
  );
  const memberCount = tenant.members.length;

  return {
    ...tenant,
    usage: {
      projects: projectCount,
      pages: pageCount,
      members: memberCount,
    },
  };
}

/**
 * Check if tenant can create more resources
 */
export async function canCreateResource(
  tenantId: string,
  resourceType: 'projects' | 'pages' | 'teamMembers'
): Promise<{ allowed: boolean; message?: string }> {
  const tenant = await getTenantWithUsage(tenantId);
  if (!tenant) {
    return { allowed: false, message: 'Tenant not found' };
  }

  const plan = tenant.plan as Plan;
  const currentCount = tenant.usage[resourceType === 'teamMembers' ? 'members' : resourceType];

  const reachedLimit = hasReachedLimit(plan, resourceType, currentCount);

  if (reachedLimit) {
    const remaining = getRemainingQuota(plan, resourceType, currentCount);
    return {
      allowed: false,
      message: `You've reached your plan limit. ${remaining === 0 ? 'Upgrade to PRO for unlimited.' : ''}`,
    };
  }

  return { allowed: true };
}

/**
 * Get tenant by custom domain or slug
 */
export async function getTenantByDomainOrSlug(identifier: string) {
  // Try to find by custom domain first
  let tenant = await db.tenant.findFirst({
    where: {
      domain: identifier,
      status: 'ACTIVE',
    },
  });

  // If not found, try by slug
  if (!tenant) {
    tenant = await db.tenant.findFirst({
      where: {
        slug: identifier,
        status: 'ACTIVE',
      },
    });
  }

  return tenant;
}

/**
 * Check if tenant can use custom domain
 */
export function canUseCustomDomain(plan: string): boolean {
  return plan === 'PRO';
}

/**
 * Check if tenant has white-label (no branding)
 */
export function hasWhiteLabel(plan: string): boolean {
  return plan === 'PRO';
}

/**
 * Format tenant display URL
 */
export function getTenantUrl(tenant: { domain: string | null; slug: string }): string {
  if (tenant.domain) {
    return `https://${tenant.domain}`;
  }
  return `https://${tenant.slug}.yourdomain.com`;
}

/**
 * Validate custom domain format
 */
export function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
}
