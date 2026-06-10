"use client";

import { User as UserModel } from "@/generated/prisma";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useClerk } from "@clerk/nextjs";
import { LogOut, Plus, User, Home, LucideIcon, Menu, Sun, Moon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const ALL_NAV_LINKS: {
  title: string;
  url: string;
  icon: LucideIcon;
  exact?: boolean;
  customerOnly?: boolean;
}[] = [
  { title: "Home", url: "/", icon: Home, exact: true },
  { title: "Profil", url: "/profile", icon: User, customerOnly: true },
  { title: "Buat Keluhan", url: "/complaints/new", icon: Plus, customerOnly: true },
];

export default function CustomerNavbar({ user }: { user: UserModel }) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const NAV_LINKS = ALL_NAV_LINKS.filter(
    (l) => !l.customerOnly || user.role === "CUSTOMER",
  );

  return (
    <header className="bg-card flex w-full items-center justify-between rounded-2xl px-4 py-3">
      {/* Logo */}
      <Link
        href="/"
        className="group bg-card flex max-w-fit items-center gap-2 rounded-full p-1 pe-3"
      >
        <div className="relative flex size-11 items-center justify-center overflow-hidden rounded-full">
          <Image
            src="https://fornews.co/news/inline/2021/02/Logo-PDAM-Tirta-Musi.png"
            fill
            className="object-contain object-center p-1"
            alt="PDAM Tirta Musi"
          />
        </div>
        <span className="text-foreground text-xl font-black tracking-wide uppercase">
          Tirta Musi
        </span>
      </Link>

      {/* Desktop: Nav links */}
      <nav className="hidden items-center gap-1 md:flex">
        {NAV_LINKS.map((link) => {
          const isActive = link.exact
            ? pathname === link.url
            : pathname.startsWith(link.url);
          return (
            <Link
              key={link.url}
              href={link.url}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <link.icon className="size-3.5" />
              {link.title}
            </Link>
          );
        })}
      </nav>

      {/* Desktop: User + Logout */}
      <div className="hidden items-center gap-3 md:flex">
        <div className="flex flex-col items-end leading-tight">
          <span className="text-foreground text-sm font-semibold">
            {user.fullname}
          </span>
          <span className="text-muted-foreground text-xs">{user.role}</span>
        </div>
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2 transition-colors"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        <button
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
          className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2 transition-colors"
          aria-label="Log out"
        >
          <LogOut className="size-4" />
        </button>
      </div>

      {/* Mobile: Hamburger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2 transition-colors md:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </SheetTrigger>

        <SheetContent side="right" className="flex w-72 flex-col">
          <SheetHeader>
            <SheetTitle className="text-left">Menu</SheetTitle>
          </SheetHeader>

          <div className="flex items-center gap-3 border-b py-3">
            <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-full text-sm font-semibold">
              {user.fullname?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">{user.fullname}</span>
              <span className="text-muted-foreground text-xs">{user.role}</span>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1 py-2">
            {NAV_LINKS.map((link) => {
              const isActive = link.exact
                ? pathname === link.url
                : pathname.startsWith(link.url);
              return (
                <Link
                  key={link.url}
                  href={link.url}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <link.icon className="size-4 shrink-0" />
                  {link.title}
                </Link>
              );
            })}
          </nav>

          <div className="border-t pt-3 flex flex-col gap-1">
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground hover:bg-muted flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            >
              {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
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
