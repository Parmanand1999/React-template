import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { logoutUser } from "@/features/AuthService/LogoutUser"
import useAuthStore from "@/store/useAuthStore"
import { ChevronsUpDownIcon, SparklesIcon, BadgeCheckIcon, CreditCardIcon, BellIcon, LogOutIcon, UserIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function NavUser({
  user
}) {
  const navigate = useNavigate()
  const { isMobile } = useSidebar()
  const userData = useAuthStore((state) => state.user);
  console.log(userData, "userData");
  const handeleLogout = () => {
    logoutUser()
  }

  const handleProfile = () => {
    navigate("/profile")
  }

  return (
    <DropdownMenu>
      {/* Base UI: `render` prop (not Radix `asChild`) so the trigger and the sidebar button are one <button> */}
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size="lg"
            className="w-full flex items-center justify-between text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground transition-colors"
          />
        }
      >
          <Avatar className="h-8 w-8 rounded-lg border border-sidebar-border shadow-xs shrink-0">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg bg-accent text-accent-foreground font-semibold flex items-center justify-center">
              <UserIcon className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-foreground">{userData?.roleName || "Admin"}</span>
            <span className="truncate text-xs text-muted-foreground font-medium">{userData?.contactNumber}</span>
          </div>
          <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-fit"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg border border-border shadow-xs">
                <AvatarImage src={user.avatar} alt={userData?.contactNumber} />
                <AvatarFallback className="rounded-lg bg-accent text-accent-foreground font-semibold flex items-center justify-center">
                  <UserIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-slate-800">{userData?.roleName || "Admin"}</span>
                <span className="truncate text-xs text-slate-500 font-medium">{userData?.contactNumber}</span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>


        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfile}>
          <UserIcon />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handeleLogout}>
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
