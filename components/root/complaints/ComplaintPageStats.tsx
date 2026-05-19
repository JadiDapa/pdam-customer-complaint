"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  LayoutList,
  Clock,
  Wrench,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  cancelled: number;
  todayCount: number;
}

const CARDS = [
  {
    key: "total" as const,
    label: "Total Keluhan",
    icon: LayoutList,
    colorClass: "bg-primary/10 text-primary",
  },
  {
    key: "pending" as const,
    label: "Pending",
    icon: Clock,
    colorClass: "bg-yellow-500/10 text-yellow-600",
  },
  {
    key: "inProgress" as const,
    label: "In Progress",
    icon: Wrench,
    colorClass: "bg-blue-500/10 text-blue-600",
  },
  {
    key: "resolved" as const,
    label: "Resolved",
    icon: CheckCircle2,
    colorClass: "bg-green-500/10 text-green-600",
  },
  {
    key: "cancelled" as const,
    label: "Cancelled",
    icon: XCircle,
    colorClass: "bg-muted text-muted-foreground",
  },
];

export default function ComplaintPageStats({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CARDS.map(({ key, label, icon: Icon, colorClass }) => (
        <Card key={key} className="border-border/60">
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`rounded-lg p-2 ${colorClass}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">{label}</p>
              <p className="text-xl font-semibold">{stats[key]}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
