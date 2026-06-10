import { ComplaintService } from "@/servers/services/complaint.service";
import { CustomerService } from "@/servers/services/customer.service";
import { TechnicianService } from "@/servers/services/technician.service";
import { getCurrentUser } from "../actions/user.actions";
import PageHeader from "@/components/root/PageHeader";
import ProfileCard from "@/components/root/ProfileCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Wrench,
} from "lucide-react";
import { format } from "date-fns";
import CustomerComplaintDetail from "@/components/root/complaints/CustomerComplaintDetail";

export default async function RootHomePage() {
  const user = await getCurrentUser();

  if (user.role === "TECHNICIAN") {
    return <TechnicianHomePage userId={user.id} fullname={user.fullname} username={user.username} />;
  }

  return <CustomerHomePage userId={user.id} fullname={user.fullname} username={user.username} />;
}

async function CustomerHomePage({
  userId,
  fullname,
  username,
}: {
  userId: number;
  fullname: string;
  username: string;
}) {
  const customer = await CustomerService.getByUserId(userId);

  const complaints = customer
    ? await ComplaintService.getByCustomerId(customer.id)
    : [];

  const total = complaints.length;
  const active = complaints.filter(
    (c) => c.status === "PENDING" || c.status === "IN_PROGRESS",
  ).length;
  const resolved = complaints.filter((c) => c.status === "RESOLVED").length;

  const activeComplaints = complaints.filter(
    (c) => c.status === "PENDING" || c.status === "IN_PROGRESS",
  );

  const pastComplaints = complaints
    .filter((c) => c.status === "RESOLVED" || c.status === "CANCELLED")
    .slice(0, 5);

  const stats = [
    {
      label: "Total Keluhan",
      value: total,
      icon: FileText,
      trend: "Semua keluhan Anda",
      trendColor: "text-muted-foreground",
    },
    {
      label: "Aktif",
      value: active,
      icon: Clock,
      trend: active > 0 ? "Sedang diproses" : "Tidak ada keluhan aktif",
      trendColor: active > 0 ? "text-amber-500" : "text-muted-foreground",
    },
    {
      label: "Selesai",
      value: resolved,
      icon: CheckCircle2,
      trend: "Berhasil diselesaikan",
      trendColor: "text-emerald-600",
    },
  ];

  const profileDetails = customer
    ? [
        { label: "No. Pelanggan", value: customer.customerId },
        { label: "No. Telepon", value: customer.phoneNumber },
        { label: "Alamat", value: customer.address },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Profile card */}
      <ProfileCard
        fullname={fullname}
        username={username}
        role="CUSTOMER"
        details={profileDetails}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title={`Selamat datang, ${fullname}!`}
          subtitle="Pantau status keluhan air Anda di sini."
        />
        {activeComplaints.length > 0 ? (
          <div className="flex items-center gap-1.5 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="size-3.5 shrink-0" />
            Ada keluhan aktif
          </div>
        ) : (
          <Link href="/complaints/new">
            <Button className="cursor-pointer">
              <Plus className="size-4" />
              Buat Keluhan
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <div className="bg-foreground text-background flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                  <stat.icon className="size-4" />
                </div>
              </div>
              <p className="text-foreground mt-3 text-3xl font-bold tracking-tight">
                {stat.value}
              </p>
              <p className={`mt-1.5 text-xs font-medium ${stat.trendColor}`}>
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Complaint */}
      <section className="space-y-3">
        <h2 className="text-foreground text-lg font-semibold">Keluhan Aktif</h2>
        {activeComplaints[0] ? (
          <CustomerComplaintDetail complaint={activeComplaints[0]} />
        ) : (
          <div className="border-border/60 bg-card rounded-2xl border p-8 text-center">
            <p className="text-muted-foreground text-sm">
              Tidak ada keluhan aktif saat ini.
            </p>
          </div>
        )}
      </section>

      {/* Past Complaints */}
      {pastComplaints.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">
            Riwayat Keluhan
          </h2>
          <div className="flex flex-col gap-3">
            {pastComplaints.map((c) => (
              <Link key={c.id} href={`/complaints/${c.id}`}>
                <div className="group border-border/50 hover:border-border bg-card flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-all">
                  <div
                    className={[
                      "h-8 w-0.5 shrink-0 rounded-full",
                      c.status === "RESOLVED" ? "bg-green-500" : "bg-border",
                    ].join(" ")}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm leading-snug font-medium">
                      {c.title}
                    </p>
                    <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                      <span>{c.disturbanceType.replace(/_/g, " ")}</span>
                      <span className="bg-border inline-block h-px w-3" />
                      <span>
                        {format(new Date(c.updatedAt), "dd MMM yyyy")}
                      </span>
                    </p>
                  </div>
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
                  <ChevronRight
                    size={14}
                    className="text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 transition-colors"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

async function TechnicianHomePage({
  userId,
  fullname,
  username,
}: {
  userId: number;
  fullname: string;
  username: string;
}) {
  const technician = await TechnicianService.getByUserId(userId);

  const complaints = technician
    ? await ComplaintService.getByTechnicianId(technician.id)
    : [];

  const total = complaints.length;
  const active = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolved = complaints.filter((c) => c.status === "RESOLVED").length;

  const activeComplaints = complaints.filter(
    (c) => c.status === "IN_PROGRESS",
  );
  const pastComplaints = complaints
    .filter((c) => c.status === "RESOLVED")
    .slice(0, 5);

  const stats = [
    {
      label: "Total Ditugaskan",
      value: total,
      icon: FileText,
      trend: "Semua penugasan",
      trendColor: "text-muted-foreground",
    },
    {
      label: "Sedang Dikerjakan",
      value: active,
      icon: Wrench,
      trend: active > 0 ? "Perlu diselesaikan" : "Tidak ada tugas aktif",
      trendColor: active > 0 ? "text-amber-500" : "text-muted-foreground",
    },
    {
      label: "Selesai",
      value: resolved,
      icon: CheckCircle2,
      trend: "Berhasil diselesaikan",
      trendColor: "text-emerald-600",
    },
  ];

  const profileDetails = technician
    ? [
        { label: "No. Telepon", value: technician.phoneNumber },
        { label: "Wilayah", value: technician.region },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Profile card */}
      <ProfileCard
        fullname={fullname}
        username={username}
        role="TECHNICIAN"
        details={profileDetails}
      />

      <PageHeader
        title={`Selamat datang, ${fullname}!`}
        subtitle="Lihat keluhan yang ditugaskan kepada Anda."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <div className="bg-foreground text-background flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                  <stat.icon className="size-4" />
                </div>
              </div>
              <p className="text-foreground mt-3 text-3xl font-bold tracking-tight">
                {stat.value}
              </p>
              <p className={`mt-1.5 text-xs font-medium ${stat.trendColor}`}>
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active complaints */}
      <section className="space-y-3">
        <h2 className="text-foreground text-lg font-semibold">
          Tugas Aktif
        </h2>
        {activeComplaints.length > 0 ? (
          <div className="flex flex-col gap-3">
            {activeComplaints.map((c) => (
              <Link key={c.id} href={`/complaints/${c.id}`}>
                <div className="group border-border/50 hover:border-border bg-card flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-all">
                  <div className="h-8 w-0.5 shrink-0 rounded-full bg-blue-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium leading-snug">
                      {c.title}
                    </p>
                    <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                      <span>{c.disturbanceType.replace(/_/g, " ")}</span>
                      {c.scheduledAt && (
                        <>
                          <span className="bg-border inline-block h-px w-3" />
                          <span>
                            {format(new Date(c.scheduledAt), "dd MMM yyyy")}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                    Diproses
                  </span>
                  <ChevronRight
                    size={14}
                    className="text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 transition-colors"
                  />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border-border/60 bg-card rounded-2xl border p-8 text-center">
            <p className="text-muted-foreground text-sm">
              Tidak ada tugas aktif saat ini.
            </p>
          </div>
        )}
      </section>

      {/* Past complaints */}
      {pastComplaints.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">
            Riwayat Tugas
          </h2>
          <div className="flex flex-col gap-3">
            {pastComplaints.map((c) => (
              <Link key={c.id} href={`/complaints/${c.id}`}>
                <div className="group border-border/50 hover:border-border bg-card flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-all">
                  <div className="h-8 w-0.5 shrink-0 rounded-full bg-green-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium leading-snug">
                      {c.title}
                    </p>
                    <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                      <span>{c.disturbanceType.replace(/_/g, " ")}</span>
                      <span className="bg-border inline-block h-px w-3" />
                      <span>
                        {format(new Date(c.updatedAt), "dd MMM yyyy")}
                      </span>
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600">
                    Selesai
                  </span>
                  <ChevronRight
                    size={14}
                    className="text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 transition-colors"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
