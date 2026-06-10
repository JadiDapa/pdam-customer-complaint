import { ComplaintService } from "@/servers/services/complaint.service";
import { getCurrentUser } from "@/app/actions/user.actions";
import PageHeader from "@/components/root/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import DashboardPerformance from "@/components/root/complaints/DashboardPerformance";

const DISTURBANCE_LABELS: Record<string, string> = {
  KEBOCORAN_PIPA: "Kebocoran Pipa",
  AIR_TIDAK_MENGALIR: "Air Tidak Mengalir",
  AIR_KERUH: "Air Keruh",
  TEKANAN_RENDAH: "Tekanan Rendah",
  PIPA_PECAH: "Pipa Pecah",
  METER_RUSAK: "Meter Rusak",
  LAINNYA: "Lainnya",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-600",
  IN_PROGRESS: "bg-blue-500/10 text-blue-600",
  RESOLVED: "bg-green-500/10 text-green-600",
  CANCELLED: "bg-muted text-muted-foreground",
};

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  const [stats, monthlyData, recentComplaints] = await Promise.all([
    ComplaintService.getStats(),
    ComplaintService.getDailyStats(30),
    ComplaintService.getRecent(5),
  ]);

  const statCards = [
    {
      label: "Total Keluhan",
      value: stats.total,
      icon: FileText,
      trend: `+${stats.todayCount} keluhan hari ini`,
      trendColor: "text-emerald-600",
    },
    {
      label: "Menunggu",
      value: stats.pending,
      icon: Clock,
      trend: "Perlu ditindaklanjuti",
      trendColor: "text-amber-500",
    },
    {
      label: "Diproses",
      value: stats.inProgress,
      icon: Activity,
      trend: "Sedang berjalan",
      trendColor: "text-blue-500",
    },
    {
      label: "Selesai",
      value: stats.resolved,
      icon: CheckCircle2,
      trend: "Berhasil diselesaikan",
      trendColor: "text-emerald-600",
    },
  ];

  return (
    <main className="min-h-screen w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <p className="text-muted-foreground text-sm">{s.label}</p>
                <div className="bg-foreground text-background flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                  <s.icon className="size-4" />
                </div>
              </div>
              <p className="text-foreground mt-3 text-3xl font-bold tracking-tight">
                {s.value}
              </p>
              <p className={`mt-1.5 text-xs font-medium ${s.trendColor}`}>
                {s.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Performance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardChart data={monthlyData} />
        </div>
        <DashboardPerformance stats={stats} />
      </div>

      {/* Recent complaints table */}
      <Card className="border-border/60">
        <CardHeader className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Keluhan Terbaru
            </p>
            <Link
              href="/dashboard/complaints"
              className="text-muted-foreground hover:text-foreground flex items-center gap-0.5 text-xs transition-colors"
            >
              Lihat semua
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          {/* Table header */}
          <div className="border-border/50 text-muted-foreground mb-1 grid grid-cols-[2fr_2fr_1.5fr_1.5fr_1fr] gap-4 border-b px-5 pb-2 text-xs font-medium uppercase tracking-wide">
            <span>Pelanggan</span>
            <span>Judul</span>
            <span>Jenis Gangguan</span>
            <span>Status</span>
            <span className="text-right">Tanggal</span>
          </div>

          {/* Rows */}
          <div className="divide-border/40 divide-y">
            {recentComplaints.map((c) => (
              <Link key={c.id} href={`/complaints/${c.id}`}>
                <div className="hover:bg-muted/40 grid grid-cols-[2fr_2fr_1.5fr_1.5fr_1fr] items-center gap-4 px-5 py-3 text-sm transition-colors">
                  {/* Customer */}
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="bg-muted text-muted-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                      {(c.customer?.user.fullname ?? "?")
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-foreground truncate text-sm font-medium">
                        {c.customer?.user.fullname ?? "-"}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {c.customer?.user.username ?? "-"}
                      </p>
                    </div>
                  </div>

                  {/* Title */}
                  <p className="text-foreground truncate text-sm">{c.title}</p>

                  {/* Disturbance type */}
                  <p className="text-muted-foreground truncate text-sm">
                    {DISTURBANCE_LABELS[c.disturbanceType] ??
                      c.disturbanceType.replace(/_/g, " ")}
                  </p>

                  {/* Status */}
                  <span
                    className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[c.status] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {STATUS_LABELS[c.status] ?? c.status}
                  </span>

                  {/* Date */}
                  <p className="text-muted-foreground text-right text-xs">
                    {format(new Date(c.createdAt), "dd MMM yyyy")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
