import { ComplaintService } from "@/servers/services/complaint.service";
import { CustomerService } from "@/servers/services/customer.service";
import { getCurrentUser } from "../actions/user.actions";
import PageHeader from "@/components/root/PageHeader";
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
} from "lucide-react";
import { format } from "date-fns";
import CustomerComplaintDetail from "@/components/root/complaints/CustomerComplaintDetail";

export default async function CustomerHomePage() {
  const user = await getCurrentUser();
  const customer = await CustomerService.getByUserId(user.id);

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
      label: "Total Submitted",
      value: total,
      icon: FileText,
      color: "text-foreground",
    },
    {
      label: "Active",
      value: active,
      icon: Clock,
      color: "text-blue-600",
    },
    {
      label: "Resolved",
      value: resolved,
      icon: CheckCircle2,
      color: "text-green-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title={`Selamat datang, ${user.fullname}!`}
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
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/60">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="bg-muted flex h-11 w-11 items-center justify-center rounded-full">
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">{stat.label}</p>
                <p className="text-foreground text-2xl font-bold">
                  {stat.value}
                </p>
              </div>
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
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold">
              Riwayat Keluhan
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {pastComplaints.map((c) => (
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
                      <span>
                        {format(new Date(c.updatedAt), "dd MMM yyyy")}
                      </span>
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
        </section>
      )}
    </div>
  );
}
