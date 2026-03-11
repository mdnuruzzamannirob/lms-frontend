"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  BookOpen,
  BookCopy,
  Tags,
  Users,
  CircleDollarSign,
  CalendarClock,
  CreditCard,
  UserCog,
  BarChart3,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn, getInitials } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store";
import { logout } from "@/store/features/authSlice";
import { useLogoutMutation } from "@/store/api/authApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BookOpen,
  Tags,
  Users,
  BookCopy,
  CircleDollarSign,
  CalendarClock,
  CreditCard,
  UserCog,
  BarChart3,
};

function NavLinks({
  items,
  pathname,
  onClick,
}: {
  items: readonly { label: string; href: string; icon: string }[];
  pathname: string;
  onClick?: () => void;
}) {
  return (
    <nav className="space-y-1 px-3">
      {items.map((item) => {
        const Icon = iconMap[item.icon];
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [logoutApi] = useLogoutMutation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = isAdmin ? NAV_ITEMS.admin : NAV_ITEMS.user;

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // Continue with local logout even if API fails
    }
    dispatch(logout());
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 px-6 font-bold">
        <BookOpen className="h-5 w-5" />
        <span className="text-lg">LibraHub</span>
      </div>
      <Separator />
      <ScrollArea className="flex-1 py-4">
        <NavLinks
          items={navItems}
          pathname={pathname}
          onClick={() => setMobileOpen(false)}
        />
      </ScrollArea>
      <Separator />
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 px-3">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">
                  {user ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium">
                  {user?.name || "User"}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {user?.role || "user"}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-card">
        {sidebarContent}
      </aside>

      {/* Mobile header */}
      <div className="flex h-14 items-center gap-2 border-b px-4 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            {sidebarContent}
          </SheetContent>
        </Sheet>
        <BookOpen className="h-5 w-5" />
        <span className="font-bold">LibraHub</span>
      </div>
    </>
  );
}
