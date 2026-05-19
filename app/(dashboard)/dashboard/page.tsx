import { ComplaintService } from "@/servers/services/complaint.service";
import { getCurrentUser } from "@/app/actions/user.actions";
import PageHeader from "@/components/root/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Clock,
  FileText,
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import DashboardChart from "@/components/root/complaints/DashboardChart";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  const [stats, dailyData, recentComplaints] = await Promise.all([
    ComplaintService.getStats(),
    ComplaintService.getDailyStats(7),
    ComplaintService.getRecent(5),
  ]);

  const statCards = [
    {
      label: "Total",
      value: stats.total,
      icon: FileText,
      color: "text-foreground",
      bg: "bg-muted",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-500/10",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <main className="min-h-screen w-full space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={`Selamat datang, ${user.fullname}!`}
          subtitle="Ringkasan sistem pengaduan PDAM"
        />
        <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <CalendarDays className="size-4" />
          {format(new Date(), "dd MMMM yyyy")} · {stats.todayCount} keluhan hari
          ini
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} className="border-border/60">
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full ${s.bg}`}
              >
                <s.icon className={`size-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">{s.label}</p>
                <p className="text-foreground text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <DashboardChart data={dailyData} />

      {/* Recent complaints */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground text-lg font-semibold">
            Keluhan Terbaru
          </h2>
          <Link
            href="/dashboard/complaints"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Lihat semua →
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {recentComplaints.map((c) => (
            <Link key={c.id} href={`/complaints/${c.id}`}>
              <div className="group border-border/50 hover:border-border bg-card flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-all">
                {/* Status stripe */}
                <div
                  className={[
                    "h-8 w-0.5 shrink-0 rounded-full",
                    c.status === "RESOLVED" ? "bg-green-500" : "bg-border",
                  ].join(" ")}
                />

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm leading-snug font-medium">
                    {c.title}
                  </p>
                  <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                    <span>{c.disturbanceType.replace(/_/g, " ")}</span>
                    <span className="bg-border inline-block h-px w-3" />
                    <span>{format(new Date(c.updatedAt), "dd MMM yyyy")}</span>
                  </p>
                </div>

                {/* Status badge */}
                <span
                  className={[
                    "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    c.status === "RESOLVED"
                      ? "bg-green-500/10 text-green-600"
                      : "bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {c.status === "RESOLVED" ? "Selesai" : "Dibatalkan"}
                </span>

                {/* Chevron */}
                <ChevronRight
                  size={14}
                  className="text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 transition-colors"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
