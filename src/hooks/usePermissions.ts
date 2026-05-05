import { useAuth } from "./auth/useAuth";

/**
 * Returns a `can(permission)` helper.
 * If the user has no permissions loaded (super-admin / initial setup), all actions are allowed.
 */
export function usePermissions() {
  const { user } = useAuth();

  function can(permission: string): boolean {
    if (!user?.permissions?.length) return true;
    return user.permissions.includes(permission);
  }

  return { can };
}
