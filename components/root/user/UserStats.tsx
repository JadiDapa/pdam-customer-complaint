"use client";

import { UserType } from "@/servers/validators/user.validator";
import { UsersIcon } from "lucide-react";

export default function UserStats({ users }: { users: UserType[] }) {
  const stats = [
    {
      title: "Total All Users",
      value: users.length.toString(),
      icon: UsersIcon,
    },
    {
      title: "Total Admins",
      value: users.filter((user) => user.role === "ADMIN").length.toString(),
      icon: UsersIcon,
    },
    {
      title: "Total Leads",
      value: users.filter((user) => user.role === "LEAD").length.toString(),
      icon: UsersIcon,
    },
    {
      title: "Total Customers",
      value: users.filter((user) => user.role === "CUSTOMER").length.toString(),
      icon: UsersIcon,
    },
  ];
  return (
    <div className="bg-card flex flex-col overflow-hidden rounded-xl border sm:flex-row">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`flex flex-1 items-center justify-between p-5 sm:p-6 ${
            i !== stats.length - 1 ? "border-b sm:border-b-0 sm:border-r" : ""
          }`}
        >
          <div className="flex flex-1 items-center gap-4">
            <div className="bg-primary text-primary-foreground rounded-md p-2">
              <stat.icon />
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">{stat.title}</p>
              <h3 className="text-xl font-semibold tracking-tight">
                {stat.value}
              </h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
