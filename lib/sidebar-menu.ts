import { UserRole } from "@/generated/prisma";
import {
  Home,
  Settings,
  Users,
  ShieldCheck,
  MessagesSquare,
  LucideIcon,
} from "lucide-react";

type SubmenuItem = {
  title: string;
  url: string;
  roles?: UserRole[];
};

type MenuItem = {
  title: string;
  url?: string;
  icon: LucideIcon;
  submenu?: SubmenuItem[];
  roles?: UserRole[];
};

export const overviewItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    roles: [UserRole.ADMIN, UserRole.LEAD],
  },
  {
    title: "Home",
    url: "/",
    icon: Home,
    roles: [UserRole.CUSTOMER],
  },
  {
    title: "Daftar Keluhan",
    url: "/dashboard/complaints",
    icon: MessagesSquare,
    roles: [UserRole.ADMIN, UserRole.LEAD],
  },
  {
    title: "Pengguna",
    submenu: [
      {
        title: "Pelanggan",
        url: "/dashboard/customers",
        roles: [UserRole.ADMIN, UserRole.LEAD],
      },
      {
        title: "Teknisi",
        url: "/dashboard/technicians",
        roles: [UserRole.ADMIN, UserRole.LEAD],
      },
    ],
    icon: Users,
  },
  {
    title: "Manajemen User",
    url: "/dashboard/users",
    icon: ShieldCheck,
    roles: [UserRole.ADMIN],
  },
];

export const settingsItems = [
  {
    title: "Pengaturan",
    url: "/settings",
    icon: Settings,
  },
];

export const canSee = (role: UserRole, roles?: UserRole[]) =>
  !roles || roles.includes(role);

export const filterMenuByRole = (items: MenuItem[], role: UserRole) => {
  return items
    .filter((item) => canSee(role, item.roles))
    .map((item) => {
      if (!item.submenu) return item;

      const submenu = item.submenu.filter((sub) => canSee(role, sub.roles));

      if (submenu.length === 0) return null;

      return { ...item, submenu };
    })
    .filter(Boolean) as MenuItem[];
};
