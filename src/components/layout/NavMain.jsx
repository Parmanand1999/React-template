import { NavLink, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({ groups = [] }) {
  const { pathname } = useLocation();

  const isRouteActive = (url) => {
    if (!url) return false;
    if (url === "/") return pathname === "/";
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <SidebarGroup key={group.groupLabel} className="p-0">
          <SidebarGroupLabel className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {group.groupLabel}
          </SidebarGroupLabel>

          <SidebarMenu className="mt-1 space-y-1">
            {group.items.map((item) => {
              const isActive = isRouteActive(item.url);

              return (
                <SidebarMenuItem key={item.title}>
                  {/* Base UI: `render` prop (not Radix `asChild`) so the menu button renders as the link itself */}
                  <SidebarMenuButton
                    render={<NavLink to={item.url} />}
                    tooltip={item.title}
                    isActive={isActive}
                    className={`flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-slate-100 text-slate-900 font-semibold shadow-2xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-normal"
                    }`}
                  >
                    {item.icon ? (
                      <item.icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? "text-slate-900" : "text-slate-500"
                        }`}
                      />
                    ) : null}
                    <span className="truncate group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </div>
  );
}
