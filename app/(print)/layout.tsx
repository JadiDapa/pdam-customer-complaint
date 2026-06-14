import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../actions/user.actions";

type Props = {
  children: ReactNode;
};

/**
 * Standalone layout for printable documents — no sidebar / dashboard chrome.
 * Mirrors the dashboard access guard: only ADMIN / LEAD may print reports.
 */
export default async function PrintLayout({ children }: Props) {
  const user = await getCurrentUser();

  if (user.role === "CUSTOMER" || user.role === "TECHNICIAN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-neutral-100 print:bg-white">{children}</div>
  );
}
