/**
 * Role-Based Access Control (RBAC) System
 * 
 * Roles:
 * - OWNER: Full control, billing, delete tenant
 * - ADMIN: Manage team, projects, settings (except billing)
 * - EDITOR: Create/edit docs, manage own projects
 * - VIEWER: Read-only access to documentation
 */

export type TenantRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';

export type Permission = 
  // Tenant Management
  | 'tenant.settings.update'
  | 'tenant.settings.view'
  | 'tenant.billing.manage'
  | 'tenant.delete'
  | 'tenant.domain.manage'
  
  // Team Management
  | 'team.invite'
  | 'team.remove'
  | 'team.roles.update'
  | 'team.view'
  
  // Project Management
  | 'project.create'
  | 'project.update'
  | 'project.delete'
  | 'project.view'
  | 'project.settings.update'
  
  // Document Management
  | 'document.create'
  | 'document.update'
  | 'document.delete'
  | 'document.view'
  | 'document.publish'
  
  // Version Management
  | 'version.create'
  | 'version.update'
  | 'version.delete'
  
  // Analytics
  | 'analytics.view';

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<TenantRole, Permission[]> = {
  OWNER: [
    // Full access to everything
    'tenant.settings.update',
    'tenant.settings.view',
    'tenant.billing.manage',
    'tenant.delete',
    'tenant.domain.manage',
    'team.invite',
    'team.remove',
    'team.roles.update',
    'team.view',
    'project.create',
    'project.update',
    'project.delete',
    'project.view',
    'project.settings.update',
    'document.create',
    'document.update',
    'document.delete',
    'document.view',
    'document.publish',
    'version.create',
    'version.update',
    'version.delete',
    'analytics.view',
  ],
  
  ADMIN: [
    // Everything except billing and tenant deletion
    'tenant.settings.update',
    'tenant.settings.view',
    'team.invite',
    'team.remove',
    'team.roles.update',
    'team.view',
    'project.create',
    'project.update',
    'project.delete',
    'project.view',
    'project.settings.update',
    'document.create',
    'document.update',
    'document.delete',
    'document.view',
    'document.publish',
    'version.create',
    'version.update',
    'version.delete',
    'analytics.view',
  ],
  
  EDITOR: [
    // Can manage content but not team or settings
    'team.view',
    'project.create',
    'project.update',
    'project.view',
    'document.create',
    'document.update',
    'document.delete',
    'document.view',
    'document.publish',
    'version.create',
    'version.update',
    'analytics.view',
  ],
  
  VIEWER: [
    // Read-only access
    'team.view',
    'project.view',
    'document.view',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: TenantRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: TenantRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: TenantRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: TenantRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if user can perform action based on their role
 */
export function canPerformAction(
  userRole: TenantRole,
  requiredPermission: Permission
): boolean {
  return hasPermission(userRole, requiredPermission);
}

/**
 * Role hierarchy level (higher number = more permissions)
 */
export const ROLE_HIERARCHY: Record<TenantRole, number> = {
  VIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
  OWNER: 4,
};

/**
 * Check if a role can manage another role
 * (e.g., ADMIN can change EDITOR/VIEWER roles but not OWNER)
 */
export function canManageRole(managerRole: TenantRole, targetRole: TenantRole): boolean {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Get roles that a user can assign to others
 */
export function getAssignableRoles(userRole: TenantRole): TenantRole[] {
  const allRoles: TenantRole[] = ['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'];
  return allRoles.filter(role => canManageRole(userRole, role));
}
