import { useAuth } from '../components/AuthContext';
import { Permissions, getPermissions } from '../utils/permissions';

/**
 * Hook to get user permissions based on their role
 */
export function usePermissions(): Permissions {
  const { user } = useAuth();
  return getPermissions(user?.role || '');
}

/**
 * Hook to check if user has a specific permission
 */
export function useHasPermission(permission: keyof Permissions): boolean {
  const { user } = useAuth();
  if (!user) return false;
  const permissions = getPermissions(user.role);
  return permissions[permission];
}

