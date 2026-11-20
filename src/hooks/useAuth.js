import useAuthStore from "@/store/useAuthStore";
import { useCallback } from "react";
import { APP_CONFIG } from "@/config/appConfig";

/**
 * Custom hook to handle Authentication and Authorization (RBAC) checks.
 * Exposes authentication state, user details, and utility functions for role verification.
 */
const useAuth = () => {
  const storeUser = useAuthStore((state) => state?.user);
  const accessToken = useAuthStore((state) => state?.accessToken);
  const logout = useAuthStore((state) => state?.logout);

  const isAuthenticated = APP_CONFIG?.bypassAuth || Boolean(accessToken);
  const user = storeUser || (APP_CONFIG?.bypassAuth ? { name: "Dev Admin", roleName: "SUPER_ADMIN", email: "admin@tts.com" } : null);
  const roleName = user?.roleName;

  /**
   * Checks if the user's role is included in the allowed roles list.
   * Uses case-insensitive comparison to prevent typos or casing issues.
   * 
   * @param {string|string[]} allowedRoles - A single role string or an array of allowed roles.
   * @returns {boolean} True if the user has one of the allowed roles, false otherwise.
   */
  const hasRole = useCallback(
    (allowedRoles) => {
      if (APP_CONFIG?.bypassAuth) return true;
      if (!roleName) return false;

      const rolesToCheck = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Normalize user role and allowed roles for comparison
      const normalizedUserRole = roleName.trim().toLowerCase();
      return rolesToCheck.some(
        (role) => role?.trim().toLowerCase() === normalizedUserRole
      );
    },
    [roleName]
  );

  return {
    user,
    isAuthenticated,
    roleName,
    hasRole,
    logout,
  };
};

export default useAuth;
