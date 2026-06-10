"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle2, Activity, Clock } from "lucide-react";

interface Props {
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
  };
}

export default function DashboardPerformance({ stats }: Props) {
  const { total, pending, inProgress, resolved } = stats;

  const resolvedPct = total ? Math.round((resolved / total) * 100) : 0;
  const inProgressPct = total ? Math.round((inProgress / total) * 100) : 0;
  const pendingPct = total ? Math.round((pending / total) * 100) : 0;

  const metrics = [
    {
      label: "Keluhan Selesai",
      desc:
        resolvedPct >= 70
          ? "Tingkat resolusi sangat baik!"
          : "Perlu ditingkatkan",
      value: `${resolvedPct}%`,
      pct: resolvedPct,
      barColor: "bg-green-500",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-600",
      icon: CheckCircle2,
    },
    {
      label: "Sedang Diproses",
      desc: "Dalam penanganan teknisi",
      value: `${inProgressPct}%`,
      pct: inProgressPct,
      barColor: "bg-blue-500",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      icon: Activity,
    },
    {
      label: "Menunggu Tindakan",
      desc:
        pending > inProgress ? "Butuh penugasan segera" : "Dalam batas wajar",
      value: `${pendingPct}%`,
      pct: pendingPct,
      barColor: "bg-yellow-500",
      iconBg: "bg-yellow-500/10",
      iconColor: "text-yellow-600",
      icon: Clock,
    },
  ];

  return (
    <Card className="border-border/60">
      <CardHeader className="px-5 pt-4 pb-2">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Performa
        </p>
      </CardHeader>
      <CardContent className="space-y-9 px-5 pb-5">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${m.iconBg}`}
              >
                <m.icon className={`size-4 ${m.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-foreground text-sm font-medium">
                    {m.label}
                  </span>
                  <span className="text-foreground shrink-0 text-sm font-bold">
                    {m.value}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">{m.desc}</p>
              </div>
            </div>
            <div className="bg-muted relative h-2 w-full overflow-hidden rounded-full">
              <div
                className={`h-full rounded-full transition-all duration-500 ${m.barColor}`}
                style={{ width: `${m.pct}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
