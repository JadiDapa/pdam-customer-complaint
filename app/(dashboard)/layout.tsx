import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/root/DashboardSidebar";
import DashboardNavbar from "@/components/root/DashboardNavbar";
import DashboardMobileHeader from "@/components/root/DashboardMobileHeader";
import { getCurrentUser } from "../actions/user.actions";
import { redirect } from "next/navigation";

type Props = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const user = await getCurrentUser();

  if (user.role === "CUSTOMER" || user.role === "TECHNICIAN") {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <div
        className="relative flex min-h-screen w-full flex-col bg-cover bg-fixed bg-center"
        style={{ backgroundImage: "url('/bg-img.jpg')" }}
      >
        <div className="bg-background/50 absolute inset-0" />
        <div className="relative z-10 flex min-h-screen w-full flex-col">
          <div className="px-2 pt-2">
            <DashboardMobileHeader user={user} />
            <DashboardNavbar user={user} />
          </div>

          <div className="flex flex-1 overflow-hidden md:ps-26">
            <div className="fixed left-0 hidden md:block">
              <DashboardSidebar />
            </div>
            <main className="flex w-full flex-col gap-2 overflow-hidden px-4 py-6 md:px-0 md:pe-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
