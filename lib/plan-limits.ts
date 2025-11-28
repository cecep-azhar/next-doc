/**
 * Plan Limits & Features
 * 
 * FREE Plan: Perfect for personal projects
 * PRO Plan: Unlimited for businesses
 */

export type Plan = 'FREE' | 'PRO';

export interface PlanLimits {
  projects: number;
  pages: number;
  teamMembers: number;
  versions: number;
  customDomain: boolean;
  whiteLabel: boolean; // Hide DocuVerse branding
  apiAccess: boolean;
  analytics: boolean;
  support: 'community' | 'email' | 'priority';
  fileUpload: number; // MB per file
  storage: number; // Total MB
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    projects: 10,
    pages: 100,
    teamMembers: 3,
    versions: 3,
    customDomain: false,
    whiteLabel: false, // Show DocuVerse footer
    apiAccess: false,
    analytics: false,
    support: 'community',
    fileUpload: 5, // 5MB per file
    storage: 500, // 500MB total
  },
  
  PRO: {
    projects: -1, // Unlimited
    pages: -1, // Unlimited
    teamMembers: -1, // Unlimited
    versions: -1, // Unlimited
    customDomain: true,
    whiteLabel: true, // Hide DocuVerse footer
    apiAccess: true,
    analytics: true,
    support: 'priority',
    fileUpload: 100, // 100MB per file
    storage: -1, // Unlimited
  },
};

/**
 * Check if tenant can perform action based on plan limits
 */
export function canPerformAction(plan: Plan, action: keyof PlanLimits): boolean {
  const limits = PLAN_LIMITS[plan];
  const value = limits[action];
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  return value === -1 || value > 0;
}

/**
 * Check if tenant has reached limit
 */
export function hasReachedLimit(
  plan: Plan,
  limitType: 'projects' | 'pages' | 'teamMembers' | 'versions' | 'storage',
  currentCount: number
): boolean {
  const limit = PLAN_LIMITS[plan][limitType];
  
  // -1 means unlimited
  if (limit === -1) return false;
  
  return currentCount >= limit;
}

/**
 * Get remaining quota
 */
export function getRemainingQuota(
  plan: Plan,
  limitType: 'projects' | 'pages' | 'teamMembers' | 'versions' | 'storage',
  currentCount: number
): number {
  const limit = PLAN_LIMITS[plan][limitType];
  
  // -1 means unlimited
  if (limit === -1) return -1;
  
  return Math.max(0, limit - currentCount);
}

/**
 * Check if upgrade is needed
 */
export function needsUpgrade(
  plan: Plan,
  limitType: keyof PlanLimits,
  currentCount?: number
): { needed: boolean; message: string } {
  const limits = PLAN_LIMITS[plan];
  const limit = limits[limitType];
  
  // Already on PRO
  if (plan === 'PRO') {
    return { needed: false, message: '' };
  }
  
  // Boolean features
  if (typeof limit === 'boolean' && !limit) {
    return {
      needed: true,
      message: `Upgrade to PRO to enable ${limitType}`,
    };
  }
  
  // Count-based limits
  if (typeof limit === 'number' && limit !== -1 && currentCount !== undefined) {
    if (currentCount >= limit) {
      return {
        needed: true,
        message: `You've reached the limit of ${limit} ${limitType}. Upgrade to PRO for unlimited.`,
      };
    }
  }
  
  return { needed: false, message: '' };
}

/**
 * Format limit display
 */
export function formatLimit(limit: number): string {
  if (limit === -1) return 'Unlimited';
  if (limit >= 1000) return `${(limit / 1000).toFixed(1)}K`;
  return limit.toString();
}

/**
 * Get plan features for display
 */
export function getPlanFeatures(plan: Plan): string[] {
  const limits = PLAN_LIMITS[plan];
  
  if (plan === 'FREE') {
    return [
      `${limits.projects} projects`,
      `${limits.pages} pages`,
      `Up to ${limits.teamMembers} team members`,
      `${limits.versions} versions per project`,
      'Community support',
      `${limits.fileUpload}MB file uploads`,
      `${limits.storage}MB storage`,
    ];
  }
  
  // PRO
  return [
    'Unlimited projects',
    'Unlimited pages',
    'Unlimited team members',
    'Unlimited versions',
    'Custom domain',
    'Remove DocuVerse branding',
    'Advanced analytics',
    'API access',
    'Priority support',
    '100MB file uploads',
    'Unlimited storage',
  ];
}
