"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { ComplaintStatus, DisturbanceType } from "@/generated/prisma";
import {
  Calendar,
  Droplet,
  DropletOff,
  Gauge,
  HelpCircle,
  Wrench,
  X,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { useTransition } from "react";
import { cancelComplaint } from "@/app/actions/complaint.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ComplaintType = {
  id: number;
  title: string;
  description: string | null;
  disturbanceType: DisturbanceType;
  status: ComplaintStatus;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  technician: { fullname: string; region: string | null } | null;
  images: { id: number; url: string; filename: string; type: string }[];
};

const disturbanceConfig: Record<
  DisturbanceType,
  { label: string; icon: React.ReactNode }
> = {
  KEBOCORAN_PIPA: { label: "Kebocoran Pipa", icon: <Droplet size={14} /> },
  AIR_TIDAK_MENGALIR: {
    label: "Air Tidak Mengalir",
    icon: <DropletOff size={14} />,
  },
  AIR_KERUH: { label: "Air Keruh", icon: <Droplet size={14} /> },
  TEKANAN_RENDAH: { label: "Tekanan Rendah", icon: <Gauge size={14} /> },
  PIPA_PECAH: { label: "Pipa Pecah", icon: <Wrench size={14} /> },
  METER_RUSAK: { label: "Meter Rusak", icon: <Wrench size={14} /> },
  LAINNYA: { label: "Lainnya", icon: <HelpCircle size={14} /> },
};

const statusConfig: Record<
  ComplaintStatus,
  { label: string; color: string; dot: string }
> = {
  PENDING: {
    label: "Menunggu",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    dot: "bg-yellow-500",
  },
  IN_PROGRESS: {
    label: "Diproses",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    dot: "bg-blue-500",
  },
  RESOLVED: {
    label: "Selesai",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    dot: "bg-green-500",
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
};

const timelineSteps: {
  key: ComplaintStatus;
  label: string;
  sub: string;
}[] = [
  { key: "PENDING", label: "Dikirim", sub: "Keluhan diterima" },
  { key: "IN_PROGRESS", label: "Diproses", sub: "Teknisi ditugaskan" },
  { key: "RESOLVED", label: "Selesai", sub: "Pekerjaan selesai" },
];

const stepOrder: Partial<Record<ComplaintStatus, number>> = {
  PENDING: 0,
  IN_PROGRESS: 1,
  RESOLVED: 2,
};

interface Props {
  complaint: ComplaintType;
}

export default function CustomerComplaintDetail({ complaint }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const disturbance = disturbanceConfig[complaint.disturbanceType];
  const status = statusConfig[complaint.status];

  const complaintImages = complaint.images.filter(
    (img) => img.type === "COMPLAINT",
  );
  const evidenceImages = complaint.images.filter(
    (img) => img.type === "EVIDENCE",
  );

  function handleCancel() {
    startTransition(async () => {
      try {
        await cancelComplaint(complaint.id);
        toast.success("Keluhan berhasil dibatalkan");
        router.push("/");
      } catch {
        toast.error("Gagal membatalkan keluhan");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Main column */}
      <div className="space-y-5 lg:col-span-2">
        {/* Info card */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 bg-muted text-muted-foreground"
              >
                {disturbance.icon}
                {disturbance.label}
              </Badge>
              <Badge variant="outline" className={`flex items-center gap-1.5 ${status.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </Badge>
              <span className="text-muted-foreground ml-auto text-xs">
                #{complaint.id} ·{" "}
                {format(new Date(complaint.createdAt), "dd MMM yyyy, HH:mm")}
              </span>
            </div>

            <h3 className="text-foreground mb-1 text-lg font-semibold">
              {complaint.title}
            </h3>
            {complaint.description ? (
              <p className="text-muted-foreground text-sm">
                {complaint.description}
              </p>
            ) : (
              <p className="text-muted-foreground/50 text-sm italic">
                Tidak ada deskripsi.
              </p>
            )}

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">Dikirim:</span>
                <span>
                  {format(new Date(complaint.createdAt), "dd MMMM yyyy")}
                </span>
              </div>
              {complaint.scheduledAt && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Dijadwalkan:</span>
                  <span>
                    {format(
                      new Date(complaint.scheduledAt),
                      "dd MMMM yyyy, HH:mm",
                    )}
                  </span>
                </div>
              )}
              {complaint.technician && (
                <div className="flex items-center gap-2">
                  <Wrench size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Teknisi:</span>
                  <span>
                    {complaint.technician.fullname}
                    {complaint.technician.region
                      ? ` · ${complaint.technician.region}`
                      : ""}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Complaint photos */}
        {complaintImages.length > 0 && (
          <Card className="border-border/60">
            <CardHeader className="px-5 pt-4 pb-3">
              <CardTitle className="text-foreground text-sm font-medium tracking-wide uppercase">
                Foto Keluhan ({complaintImages.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {complaintImages.map((img) => (
                  <div
                    key={img.id}
                    className="border-border/50 bg-muted relative aspect-square overflow-hidden rounded-xl border"
                  >
                    <Image
                      src={img.url}
                      alt={img.filename}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Evidence photos */}
        {evidenceImages.length > 0 && (
          <Card className="border border-green-500/20">
            <CardHeader className="px-5 pt-4 pb-3">
              <CardTitle className="text-sm font-medium tracking-wide text-green-600 uppercase">
                Bukti Penyelesaian ({evidenceImages.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {evidenceImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square overflow-hidden rounded-xl border border-green-500/20 bg-green-500/5"
                  >
                    <Image
                      src={img.url}
                      alt={img.filename}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right column */}
      <div className="space-y-5">
        {/* Status timeline */}
        <Card className="border-border/60">
          <CardHeader className="px-5 pt-4 pb-3">
            <CardTitle className="text-foreground text-sm font-medium tracking-wide uppercase">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {complaint.status === "CANCELLED" ? (
              <p className="text-muted-foreground text-sm">
                Keluhan ini telah dibatalkan.
              </p>
            ) : (
              <div className="space-y-0">
                {timelineSteps.map((step, i) => {
                  const current = stepOrder[complaint.status] ?? 0;
                  const isDone = (stepOrder[step.key] ?? 0) < current;
                  const isCurrent = step.key === complaint.status;
                  const isUpcoming = (stepOrder[step.key] ?? 0) > current;
                  const isLast = i === timelineSteps.length - 1;

                  return (
                    <div key={step.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-3 w-3 shrink-0 rounded-full border-2 transition-colors ${
                            isDone
                              ? "border-green-500 bg-green-500"
                              : isCurrent
                                ? "border-blue-500 bg-blue-500"
                                : "border-border bg-background"
                          }`}
                        />
                        {!isLast && (
                          <div
                            className={`my-1 w-0.5 flex-1 ${isDone ? "bg-green-500/40" : "bg-border"}`}
                            style={{ minHeight: "28px" }}
                          />
                        )}
                      </div>
                      <div className="pb-4">
                        <p
                          className={`text-sm font-medium leading-tight ${isUpcoming ? "text-muted-foreground/50" : "text-foreground"}`}
                        >
                          {step.label}
                        </p>
                        <p
                          className={`text-xs ${isUpcoming ? "text-muted-foreground/40" : "text-muted-foreground"}`}
                        >
                          {step.sub}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cancel button — PENDING only */}
        {complaint.status === "PENDING" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10 w-full cursor-pointer"
              >
                <X className="size-4" />
                Batalkan Keluhan
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Batalkan Keluhan?</AlertDialogTitle>
                <AlertDialogDescription>
                  Keluhan yang dibatalkan tidak dapat diaktifkan kembali. Anda
                  perlu mengajukan keluhan baru jika masalah masih berlanjut.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Kembali</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancel}
                  disabled={isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isPending ? "Membatalkan..." : "Ya, Batalkan"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
