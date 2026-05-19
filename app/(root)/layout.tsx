import { ReactNode } from "react";
import { getCurrentUser } from "../actions/user.actions";
import { redirect } from "next/navigation";
import CustomerNavbar from "@/components/root/CustomerNavbar";

type Props = {
  children: ReactNode;
};

export default async function CustomerLayout({ children }: Props) {
  const user = await getCurrentUser();

  if (user.role !== "CUSTOMER") {
    redirect("/dashboard");
  }

  return (
    <div className="bg-muted min-h-screen w-full">
      <div className="px-2 pt-2">
        <CustomerNavbar user={user} />
      </div>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
