import { NavMain } from "@/components/layout/NavMain";
import { NavUser } from "@/components/layout/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SIDEBAR_NAV_GROUPS } from "@/constants/routes.jsx";
import ttsLogoUrl from "@/assets/tts-logo.png";

const data = {
  user: {
    name: "Roadbuddy Admin",
    email: "admin@roadbuddy.com",
    avatar: "/avatars/shadcn.jpg",
  },
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar
      collapsible="icon"
      className="bg-white border-r border-slate-200/80 text-slate-700"
      {...props}
    >
      {/* Top Header Logo Section matching Manage Employee screenshot */}
      <SidebarHeader className="h-16 px-3 border-b border-slate-100 flex items-center justify-center">
        <div className="flex items-center justify-center w-full h-full">
          {ttsLogoUrl ? (
            <img
              src={ttsLogoUrl}
              alt="TTS Logo"
              className="w-full h-14 object-contain mix-blend-multiply group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 transition-all duration-200"
            />
          ) : (
            <div className="flex flex-col">
              <span className="text-xl font-black text-[#3456A7] leading-none">
                TTS
              </span>
              <span className="text-[9px] font-bold text-[#3456A7] tracking-wider uppercase">
                RECOVER EVERY PENNY
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <NavMain groups={SIDEBAR_NAV_GROUPS} />
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-100 p-2">
        <NavUser user={data.user} className="w-full" />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
