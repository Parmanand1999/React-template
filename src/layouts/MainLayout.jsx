import { useEffect, useRef } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";

/**
 * Automatically collapses the sidebar by default when opening wide-table modules (Batches, Machines),
 * but allows the user to manually toggle it open or closed whenever they want.
 */
function SidebarAutoCollapse() {
  const location = useLocation();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const prevPathRef = useRef("");
  const setOpenRef = useRef(setOpen);
  const setOpenMobileRef = useRef(setOpenMobile);
  const isMobileRef = useRef(isMobile);

  // Keep callback refs fresh without causing re-trigger of route effect
  useEffect(() => {
    setOpenRef.current = setOpen;
    setOpenMobileRef.current = setOpenMobile;
    isMobileRef.current = isMobile;
  });

  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevPathRef.current;
    prevPathRef.current = currentPath;

    // Detect section transitions
    const getSection = (path) => {
      if (!path) return "";
      if (path.includes("batch")) return "batch";
      if (path.includes("machine")) return "machine";
      return "other";
    };

    const currentSection = getSection(currentPath);
    const prevSection = getSection(prevPath);

    // Only auto-adjust when transitioning to a different section (e.g., initial open or module switch)
    if (currentSection !== prevSection) {
      if (currentSection === "batch" || currentSection === "machine") {
        // By default close/collapse on opening Batches or Machines module
        if (isMobileRef.current) {
          setOpenMobileRef.current(false);
        } else {
          setOpenRef.current(false);
        }
      } else if (prevSection === "batch" || prevSection === "machine") {
        // Leaving wide-table modules to standard modules (Dashboard, Travel Agent, Employee), restore open state
        if (!isMobileRef.current) {
          setOpenRef.current(true);
        }
      }
    }
  }, [location.pathname]);

  return null;
}

export default function MainLayout() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  // Dynamic header page title based on active route
  const getPageTitle = (path) => {
    if (path === "/") return "Dashboard";
    if (path.includes("entries")) return "Batch Entries";
    if (path.includes("employee") || path.includes("user")) return "Manage Employee";
    if (path.includes("client")) return "Manage Travel Agent";
    if (path.includes("batch")) return "Manage Batches";
    if (path.includes("registration-tokens")) return "Registration Tokens";
    if (path.includes("machine")) return "Manage Machines";
    return "Dashboard";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] text-slate-800 font-sans">
      <SidebarProvider>
        <SidebarAutoCollapse />
        <AppSidebar />

        <main className="flex flex-1 flex-col overflow-hidden bg-[#f8fafc]">
          {/* Top Header Bar matching Manage Employee screenshot */}
          <header className="h-16 shrink-0 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shadow-2xs z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-slate-600 hover:text-slate-900" />
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {getPageTitle(location.pathname)}
              </h1>
            </div>

            {/* Header Right Controls: Notification Bell & Profile Avatar */}
            <div className="flex items-center gap-4">
              {/* Notification Bell Icon with Red Badge */}
              <button
                type="button"
                className="relative w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  4
                </span>
              </button>

              {/* User Avatar Badge with Emerald Online Dot */}
              <div className="relative flex items-center justify-center cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-[#818cf8] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
            </div>
          </header>

          {/* Main Page Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-4 bg-[#f8fafc]">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}