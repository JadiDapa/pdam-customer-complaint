import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/root/DashboardSidebar";
import DashboardNavbar from "@/components/root/DashboardNavbar";
import { getCurrentUser } from "../actions/user.actions";
import { redirect } from "next/navigation";

type Props = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const user = await getCurrentUser();

  if (user.role === "CUSTOMER") {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <div className="bg-muted relative flex min-h-screen w-full flex-col">
        <div className="px-2 pt-2">
          <DashboardNavbar user={user} />
        </div>

        <div className="flex flex-1 overflow-hidden ps-26">
          <div className="fixed left-0">
            <DashboardSidebar />
          </div>
          <main className="flex w-full flex-col gap-2 overflow-hidden py-6 pe-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
