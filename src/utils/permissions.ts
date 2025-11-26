/**
 * Role-based access control (RBAC) utilities
 * Defines permissions for supplier staff roles
 */

export type SupplierRole = 'supplier_owner' | 'supplier_manager' | 'supplier_sales';

export interface Permissions {
  // Pages
  canAccessLinkRequests: boolean;
  canAccessOrders: boolean;
  canAccessComplaints: boolean;
  canAccessChat: boolean;
  canAccessSettings: boolean;

  // Link Requests
  canApproveLinkRequests: boolean;
  canRejectLinkRequests: boolean;
  canBlockLinks: boolean;

  // Orders
  canViewOrders: boolean;
  canUpdateOrderStatus: boolean;
  canAcceptOrders: boolean;
  canRejectOrders: boolean;

  // Complaints
  canViewComplaints: boolean;
  canResolveComplaints: boolean;
  canEscalateComplaints: boolean;

  // Chat
  canViewChat: boolean;
  canSendMessages: boolean;

  // Catalog/Products
  canManageProducts: boolean;

  // Settings
  canManageTeam: boolean;
  canManageSuppliers: boolean;
}

/**
 * Get permissions for a given role
 */
export function getPermissions(role: string): Permissions {
  const isOwner = role === 'supplier_owner';
  const isManager = role === 'supplier_manager';
  const isSales = role === 'supplier_sales';
  const isSupplierStaff = isOwner || isManager || isSales;

  return {
    // Pages - All supplier staff can access these
    canAccessLinkRequests: isSupplierStaff, // All supplier staff can view link requests
    canAccessOrders: isSupplierStaff, // All supplier staff can view orders
    canAccessComplaints: isSupplierStaff, // All can view
    canAccessChat: isSupplierStaff, // All can communicate
    canAccessSettings: isOwner || isManager, // Only Owner and Manager

    // Link Requests - Owner, Manager, and Sales can approve/deny
    canApproveLinkRequests: isSupplierStaff, // All supplier staff can approve
    canRejectLinkRequests: isSupplierStaff, // All supplier staff can reject
    canBlockLinks: isOwner || isManager, // Only Owner and Manager can block

    // Orders - All can view, Owner/Manager can manage
    canViewOrders: isSupplierStaff, // All supplier staff can view orders
    canUpdateOrderStatus: isOwner || isManager, // Only Owner and Manager can update status
    canAcceptOrders: isOwner || isManager, // Only Owner and Manager can accept
    canRejectOrders: isOwner || isManager, // Only Owner and Manager can reject

    // Complaints
    canViewComplaints: isSupplierStaff, // All can view
    canResolveComplaints: isOwner || isManager, // Only Owner and Manager can resolve
    canEscalateComplaints: isOwner || isManager, // Only Owner and Manager can escalate

    // Chat - All can communicate
    canViewChat: isSupplierStaff,
    canSendMessages: isSupplierStaff,

    // Settings - Only Owner and Manager
    canManageTeam: isOwner, // Only Owner
    canManageSuppliers: isOwner, // Only Owner
    canManageProducts: isOwner || isManager, // Owner and Manager can manage catalog
  };
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(role: string, permission: keyof Permissions): boolean {
  const permissions = getPermissions(role);
  return permissions[permission];
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(role: string, ...permissions: (keyof Permissions)[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(role: string, ...permissions: (keyof Permissions)[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: string): string {
  switch (role) {
    case 'supplier_owner':
      return 'Supplier Owner';
    case 'supplier_manager':
      return 'Supplier Manager';
    case 'supplier_sales':
      return 'Sales Representative';
    case 'consumer':
      return 'Consumer';
    default:
      return role.charAt(0).toUpperCase() + role.slice(1);
  }
}

/**
 * Check if role is a supplier staff role
 */
export function isSupplierStaff(role: string): boolean {
  return ['supplier_owner', 'supplier_manager', 'supplier_sales'].includes(role);
}

