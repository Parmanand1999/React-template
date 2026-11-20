
import { createBrowserRouter } from "react-router-dom";

import React, { lazy, Suspense } from "react";

import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import SkeletonCard from "@/components/common/SkeletonCard";
import ForgotPassword from "@/features/AuthService/ForgotPassword";
import ResetPassword from "@/features/AuthService/ResetPassword";
import VerifyEmail from "@/features/AuthService/VerifyEmail";
import { ROLES } from "@/constants/roles";

import { APP_CONFIG } from "@/config/appConfig";
import RoleGuard from "./RoleGuard";

// Lazy components
const MainLayout = lazy(() => import("@/layouts/MainLayout"));
const Login = lazy(() => import("@/features/AuthService/Login"));
// const SignUp = lazy(() => import("@/features/AuthService/SignUp"));
const DashBoard = lazy(() => import("@/features/DashBoard/DashBoard"));
const Profile = lazy(() => import("@/features/Profile/Profile"));
const PageNotFound = lazy(() => import("@/PageNotFound"));
const Unauthorized = lazy(() => import("@/Unauthorized"));

// User Management CRUD Pages (deleted in favor of EmployeeManagement)
// const BackednAdminList = lazy(() => import("@/features/SupperAdmin/BackendAdminManagement/BackednAdminList"));
// const AddBackendAdmin = lazy(() => import("@/features/SupperAdmin/BackendAdminManagement/pages/AddBackendAdmin"));
// const EditBackendAdmin = lazy(() => import("@/features/SupperAdmin/BackendAdminManagement/pages/EditBackendAdmin"));
// const ViewBackendAdmin = lazy(() => import("@/features/SupperAdmin/BackendAdminManagement/pages/ViewBackendAdmin"));

// Client Management CRUD Pages
const ClientListing = lazy(() => import("@/features/SupperAdmin/ClientManagement/Pages/ClientListing"));
const AddClient = lazy(() => import("@/features/SupperAdmin/ClientManagement/Pages/AddClient"));
const EditClient = lazy(() => import("@/features/SupperAdmin/ClientManagement/Pages/EditClient"));

// Employee Management Pages
const EmployeeListing = lazy(() => import("@/features/EmployeeManagement/EmployeeListing"));
const AddEmployee = lazy(() => import("@/features/EmployeeManagement/Pages/AddEmployee"));

// Batch Management Pages
const BatchListing = lazy(() => import("@/features/BatchManagement/Pages/BatchListing"));
const BatchEntriesListing = lazy(() => import("@/features/BatchManagement/Pages/BatchEntriesListing"));

// Machine Management Pages
const MachineListing = lazy(() => import("@/features/MachineManagement/Pages/MachineListing"));
const RegistrationTokensListing = lazy(() => import("@/features/MachineManagement/Pages/RegistrationTokensListing"));

const LazyWrapper = ({ children }) => (
    <Suspense fallback={<SkeletonCard />}>{children}</Suspense>
);

const ProtectedLayout = () => {
    const isAuthenticated = useAuthStore((state) => Boolean(state?.accessToken));
    const isAllowed = APP_CONFIG?.bypassAuth || isAuthenticated;

    return isAllowed ? (
        <LazyWrapper>
            <MainLayout />
        </LazyWrapper>
    ) : (
        <Navigate to="/login" replace />
    );
};

const UnauthenticatedLayout = () => {
    const isAuthenticated = useAuthStore((state) => Boolean(state?.accessToken));

    // When bypassAuth is enabled, allow accessing login page or redirecting cleanly
    return (!isAuthenticated || APP_CONFIG?.bypassAuth) ? (
        <Outlet />
    ) : (
        <Navigate to="/" replace />
    );
};

export const APP_ROUTES = [
    {
        path: "/",
        element: <ProtectedLayout />,
        children: [
            {
                element: <RoleGuard allowedRoles={[ROLES.User, ROLES.SUPER_ADMIN]} />,
                children: [
                    {
                        index: true,
                        element: (
                            <LazyWrapper>
                                <DashBoard />
                            </LazyWrapper>
                        ),
                    },
                    {
                        path: "/profile",
                        element: (
                            <LazyWrapper>
                                <Profile />
                            </LazyWrapper>
                        ),
                    }
                ]

            },
            {
                element: <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.User]} />,
                children: [
                    // {
                    //     path: "/backend-admin",
                    //     element: (
                    //         <LazyWrapper>
                    //             <BackednAdminList />
                    //         </LazyWrapper>
                    //     ),
                    // },
                    // {
                    //     path: "/backend-admin/add",
                    //     element: (
                    //         <LazyWrapper>
                    //             <AddBackendAdmin />
                    //         </LazyWrapper>
                    //     ),
                    // },
                    // {
                    //     path: "/backend-admin/:id/edit",
                    //     element: (
                    //         <LazyWrapper>
                    //             <EditBackendAdmin />
                    //         </LazyWrapper>
                    //     ),
                    // },
                    // {
                    //     path: "/backend-admin/:id",
                    //     element: (
                    //         <LazyWrapper>
                    //             <ViewBackendAdmin />
                    //         </LazyWrapper>
                    //     ),
                    // },
                    {
                        path: "/clients",
                        element: (
                            <LazyWrapper>
                                <ClientListing />
                            </LazyWrapper>
                        ),
                    },
                    {
                        path: "/clients/add",
                        element: (
                            <LazyWrapper>
                                <AddClient />
                            </LazyWrapper>
                        ),
                    },
                    {
                        path: "/clients/:id/edit",
                        element: (
                            <LazyWrapper>
                                <EditClient />
                            </LazyWrapper>
                        ),
                    },
                    {
                        path: "/employees",
                        element: (
                            <LazyWrapper>
                                <EmployeeListing />
                            </LazyWrapper>
                        ),
                    },
                    {
                        path: "/add-employee",
                        element: (
                            <LazyWrapper>
                                <AddEmployee />
                            </LazyWrapper>
                        ),
                    },
                    {
                        path: "/batches",
                        element: (
                            <LazyWrapper>
                                <BatchListing />
                            </LazyWrapper>
                        ),
                    },
                    {
                        path: "/batches/:batchId/entries",
                        element: (
                            <LazyWrapper>
                                <BatchEntriesListing />
                            </LazyWrapper>
                        ),
                    },
                    {
                        path: "/machines",
                        element: (
                            <LazyWrapper>
                                <MachineListing />
                            </LazyWrapper>
                        ),
                    },
                    {
                        path: "/machines/registration-tokens",
                        element: (
                            <LazyWrapper>
                                <RegistrationTokensListing />
                            </LazyWrapper>
                        ),
                    },
                ]
            },


        ],
    },
    {
        element: <UnauthenticatedLayout />,
        children: [
            {
                path: "/login",
                element: (
                    <LazyWrapper>
                        <Login />
                    </LazyWrapper>
                ),
            },
            {
                path: "/forgot-password",
                element: (<LazyWrapper><ForgotPassword /></LazyWrapper>),
            },
            {
                path: "/reset-password",
                element: (<LazyWrapper><ResetPassword /></LazyWrapper>),
            },
            {
                path: "/verify-email",
                element: (<LazyWrapper><VerifyEmail /></LazyWrapper>),
            },
        ],
    },
    {
        path: "/unauthorized",
        element: (
            <LazyWrapper>
                <Unauthorized />
            </LazyWrapper>
        ),
    },

    {
        path: "*",
        element: (
            <LazyWrapper>
                <PageNotFound />
            </LazyWrapper>
        ),
    },
];


export const router = createBrowserRouter(APP_ROUTES);