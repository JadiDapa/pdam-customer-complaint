"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import Image from "next/image";
import {
  Menu,
  Home,
  Activity,
  UserCheck,
  UserCog,
  Users,
  Settings,
  LogOut,
  Sun,
  Moon,
  LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { User, UserRole } from "@/generated/prisma";

const menuItems: {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: UserRole[];
}[] = [
  { title: "Dashboard", url: "/dashboard", icon: Home, roles: ["ADMIN"] },
  {
    title: "Complaints",
    url: "/dashboard/complaints",
    icon: Activity,
    roles: ["ADMIN", "TECHNICIAN"],
  },
  { title: "Customers", url: "/dashboard/customers", icon: UserCheck, roles: ["ADMIN"] },
  { title: "Technicians", url: "/dashboard/technicians", icon: UserCog, roles: ["ADMIN"] },
  { title: "Users", url: "/dashboard/users", icon: Users, roles: ["ADMIN"] },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    roles: ["ADMIN", "TECHNICIAN"],
  },
];

export default function DashboardMobileHeader({ user }: { user: User }) {
  const pathname = usePathname();
  const visibleItems = menuItems.filter((item) => item.roles.includes(user.role));
  const { signOut } = useClerk();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <header className="bg-card flex w-full items-center justify-between rounded-2xl px-4 py-3 md:hidden">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="bg-primary relative flex size-10 items-center justify-center overflow-hidden rounded-full">
          <Image
            src="https://fornews.co/news/inline/2021/02/Logo-PDAM-Tirta-Musi.png"
            fill
            className="object-contain object-center p-1"
            alt="PDAM Tirta Musi"
          />
        </div>
        <span className="text-foreground text-lg font-black tracking-wide uppercase">
          Tirta Musi
        </span>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </SheetTrigger>

        <SheetContent side="left" className="flex w-72 flex-col">
          <SheetHeader>
            <SheetTitle className="text-left">Menu</SheetTitle>
          </SheetHeader>

          <div className="flex items-center gap-3 border-b py-3">
            <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-full text-sm font-semibold">
              {user.fullname?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">{user.fullname}</span>
              <span className="text-muted-foreground text-xs">{user.role}</span>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1 py-2">
            {visibleItems.map((item) => {
              const active =
                item.url === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.url);
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-1 border-t pt-3">
            {mounted && (
              <div className="flex items-center gap-1 px-1 pb-1">
                <button
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    resolvedTheme === "light"
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Sun className="size-4" />
                  Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    resolvedTheme === "dark"
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Moon className="size-4" />
                  Dark
                </button>
              </div>
            )}
            <button
              onClick={() => signOut({ redirectUrl: "/sign-in" })}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="size-4" />
              Log Out
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
