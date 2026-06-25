import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { TechnicianService } from "@/servers/services/technician.service";
import DynamicBreadcrumb from "@/components/root/DynamicBreadcrumb";
import PageHeader from "@/components/root/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Hash, Calendar, User } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  RESOLVED: "bg-green-500/10 text-green-600 border-green-500/20",
  CANCELLED: "bg-muted text-muted-foreground border-border",
};

export default async function TechnicianDetailPage({ params }: PageProps) {
  const { id } = await params;
  const technician = await TechnicianService.getById(Number(id));

  if (!technician) notFound();

  const total = technician.complaints.length;
  const resolved = technician.complaints.filter((c) => c.status === "RESOLVED").length;
  const active = technician.complaints.filter(
    (c) => c.status === "PENDING" || c.status === "IN_PROGRESS",
  ).length;

  return (
    <main className="min-h-screen w-full space-y-6">
      <div className="space-y-2">
        <DynamicBreadcrumb />
        <PageHeader
          title={technician.fullname}
          subtitle={`${technician.region ?? "–"} · Terdaftar sejak ${format(new Date(technician.createdAt), "MMMM yyyy")}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: profile */}
        <div className="space-y-5">
          <Card className="border-border/60">
            <CardHeader className="px-5 pt-4 pb-3">
              <CardTitle className="text-foreground text-sm font-medium uppercase tracking-wide">
                Profil Teknisi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold">
                  {technician.fullname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-foreground font-semibold">{technician.fullname}</p>
                  <p className="text-muted-foreground text-xs">{technician.region ?? "–"}</p>
                </div>
              </div>

              <div className="border-border/40 divide-border/40 divide-y rounded-lg border text-sm">
                <InfoRow icon={<Hash size={14} />} label="Technician ID" value={`#${technician.id}`} />
                <InfoRow icon={<MapPin size={14} />} label="Region" value={technician.region ?? "–"} />
                <InfoRow
                  icon={<Calendar size={14} />}
                  label="Terdaftar"
                  value={format(new Date(technician.createdAt), "dd MMM yyyy")}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: total, color: "text-foreground" },
              { label: "Aktif", value: active, color: "text-blue-600" },
              { label: "Selesai", value: resolved, color: "text-green-600" },
            ].map((s) => (
              <Card key={s.label} className="border-border/60">
                <CardContent className="p-3 text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: complaints */}
        <div className="lg:col-span-2">
          <Card className="border-border/60">
            <CardHeader className="px-5 pt-4 pb-3">
              <CardTitle className="text-foreground text-sm font-medium uppercase tracking-wide">
                Keluhan Ditugaskan ({total})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {technician.complaints.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  Belum ada keluhan.
                </p>
              ) : (
                <div className="space-y-2">
                  {technician.complaints.map((c) => (
                    <Link
                      key={c.id}
                      href={`/dashboard/complaints/${c.id}`}
                      className="border-border/60 bg-card hover:bg-accent/30 flex items-center justify-between rounded-xl border px-4 py-3 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-medium">
                          {c.title}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {c.disturbanceType.replace(/_/g, " ")}
                          {c.customer
                            ? ` · ${c.customer.user.fullname}`
                            : " · –"}
                          {" · "}
                          {format(new Date(c.createdAt), "dd MMM yyyy")}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`ml-3 shrink-0 text-xs ${statusStyles[c.status] ?? "bg-muted"}`}
                      >
                        {c.status.replace(/_/g, " ")}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2.5">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-foreground truncate text-sm">{value}</p>
      </div>
    </div>
  );
}
