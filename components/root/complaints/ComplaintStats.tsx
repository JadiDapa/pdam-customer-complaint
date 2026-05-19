"use client";

import { ComplaintType } from "@/servers/validators/complaint.validator";
import { ArrowUpRight, ArrowDownRight, Users } from "lucide-react";

export default function ComplaintStats({
  complaints,
}: {
  complaints: ComplaintType[];
}) {
  const valueChangePercentage = complaints
    ? Math.round(
        ((complaints.filter((r) => {
          const reportDate = new Date(r.createdAt);
          return (
            reportDate.getMonth() === new Date().getMonth() &&
            reportDate.getFullYear() === new Date().getFullYear()
          );
        }).length -
          complaints.filter((r) => {
            const reportDate = new Date(r.createdAt);
            return (
              reportDate.getMonth() === new Date().getMonth() - 1 &&
              reportDate.getFullYear() === new Date().getFullYear()
            );
          }).length) /
          complaints.filter((r) => {
            const reportDate = new Date(r.createdAt);
            return (
              reportDate.getMonth() === new Date().getMonth() - 1 &&
              reportDate.getFullYear() === new Date().getFullYear()
            );
          }).length) *
          100,
      )
    : 0;

  const stats = [
    {
      title: "Total Reports",
      value: complaints ? complaints.length : "0",
      trend: "up",
      icon: ArrowUpRight,
    },
    {
      title: "This Month's Reports",
      value: complaints
        ? complaints.filter((r) => {
            const reportDate = new Date(r.createdAt);
            return (
              reportDate.getMonth() === new Date().getMonth() &&
              reportDate.getFullYear() === new Date().getFullYear()
            );
          }).length
        : "0",
      change: valueChangePercentage,
      trend: "up",
      icon: ArrowDownRight,
    },
    {
      title: "Last Month's Reports",
      value: complaints
        ? complaints.filter((r) => {
            const reportDate = new Date(r.createdAt);
            return (
              reportDate.getMonth() === new Date().getMonth() - 1 &&
              reportDate.getFullYear() === new Date().getFullYear()
            );
          }).length
        : "0",
      trend: "down",
      icon: Users,
    },
  ];
  return (
    <div className="bg-card flex flex-row overflow-hidden rounded-xl border px-6 py-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`flex flex-1 items-center justify-between p-6 ${
            i !== stats.length - 1 ? "border-r" : ""
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

          {/* Right */}
          <div
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
              stat.trend === "up"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {stat.trend === "up" ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {stat.change}
          </div>
        </div>
      ))}
    </div>
  );
}
