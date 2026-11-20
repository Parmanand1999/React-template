import {
  LayoutDashboard,
  Users,
  UserCheck,
  Layers,
  Server,
  FileText,
  FileSpreadsheet,
  UserPlus,
  Box,
} from "lucide-react";
import { ROLES } from "./roles";

export const SIDEBAR_NAV_GROUPS = [
  {
    groupLabel: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
        roles: [ROLES.User, ROLES.SUPER_ADMIN],
      },
      {
        title: "Manage Travel Agent",
        url: "/clients",
        icon: Users,
        roles: [ROLES.SUPER_ADMIN, ROLES.User],
      },
      {
        title: "Manage Employee",
        url: "/employees",
        icon: UserCheck,
        roles: [ROLES.SUPER_ADMIN, ROLES.User],
      },
      {
        title: "Manage Batches",
        url: "/batches",
        icon: Layers,
        roles: [ROLES.SUPER_ADMIN, ROLES.User],
      },
      {
        title: "Manage Machines",
        url: "/machines",
        icon: Server,
        roles: [ROLES.SUPER_ADMIN, ROLES.User],
      },
      // {
      //   title: "Client Report",
      //   url: "/client-report",
      //   icon: FileText,
      //   roles: [ROLES.SUPER_ADMIN, ROLES.User],
      // },
      // {
      //   title: "Batch Report",
      //   url: "/batch-report",
      //   icon: FileSpreadsheet,
      //   roles: [ROLES.SUPER_ADMIN, ROLES.User],
      // },
    ],
  },
  // {
  //   groupLabel: "PRODUCTS",
  //   items: [
  //     {
  //       title: "Add Employees",
  //       url: "/add-employee",
  //       icon: UserPlus,
  //       roles: [ROLES.SUPER_ADMIN, ROLES.User],
  //     },
  //     {
  //       title: "Demo",
  //       url: "/demo",
  //       icon: Box,
  //       roles: [ROLES.SUPER_ADMIN, ROLES.User],
  //     },
  //   ],
  // },
];

export const SIDEBAR_NAV_ITEMS = SIDEBAR_NAV_GROUPS.flatMap((group) => group.items);