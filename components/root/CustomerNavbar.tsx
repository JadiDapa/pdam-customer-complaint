"use client";

import { User as UserModel } from "@/generated/prisma";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useClerk } from "@clerk/nextjs";
import { LogOut, Plus, User, LucideIcon } from "lucide-react";
import Image from "next/image";

const NAV_LINKS: {
  title: string;
  url: string;
  icon?: LucideIcon;
  exact?: boolean;
}[] = [
  { title: "Home", url: "/", exact: true },
  { title: "Profil", url: "/profile", icon: User },
  { title: "Buat Keluhan", url: "/complaints/new", icon: Plus },
];

export default function CustomerNavbar({ user }: { user: UserModel }) {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <header className="bg-card flex w-full items-center justify-between rounded-2xl px-4 py-3">
      {/* Logo */}
      <Link
        href="/"
        className="group bg-card flex max-w-fit items-center gap-2 rounded-full p-1 pe-3"
      >
        <div className="bg-primary relative flex size-11 items-center justify-center overflow-hidden rounded-full">
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

      {/* Nav links */}
      <nav className="flex items-center gap-1">
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
              {"icon" in link && link.icon && (
                <link.icon className="size-3.5" />
              )}
              {link.title}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end leading-tight">
          <span className="text-foreground text-sm font-semibold">
            {user.fullname}
          </span>
          <span className="text-muted-foreground text-xs">{user.role}</span>
        </div>
        <button
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
          className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2 transition-colors"
          aria-label="Log out"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  );
}
