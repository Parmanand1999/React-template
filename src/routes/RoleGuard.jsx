import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { APP_CONFIG } from "@/config/appConfig";

/**
 * Route Guard for Authorization check.
 * Verifies if the authenticated user has one of the allowed roles.
 * Redirects to `/unauthorized` if they do not have permission.
 */
const RoleGuard = ({ allowedRoles = [] }) => {
    const { hasRole } = useAuth();
    if (APP_CONFIG?.bypassAuth || !APP_CONFIG?.enableRBAC) {
        return <Outlet />;
    }
    if (!hasRole(allowedRoles)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default RoleGuard;