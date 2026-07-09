import { ReactNode } from "react";
import { getCurrentUser } from "../actions/user.actions";
import { redirect } from "next/navigation";
import CustomerNavbar from "@/components/root/CustomerNavbar";

type Props = {
  children: ReactNode;
};

export default async function CustomerLayout({ children }: Props) {
  const user = await getCurrentUser();

  if (user.role === "ADMIN" || user.role === "TECHNICIAN") {
    redirect("/dashboard");
  }

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-fixed bg-center"
      style={{ backgroundImage: "url('/bg-img.jpg')" }}
    >
      <div className="bg-background/70 absolute inset-0" />
      <div className="relative z-10 min-h-screen">
        <div className="px-2 pt-2">
          <CustomerNavbar user={user} />
        </div>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
