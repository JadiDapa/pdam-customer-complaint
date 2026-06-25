"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ComplaintStatus, DisturbanceType } from "@/generated/prisma";
import {
  Calendar,
  Droplet,
  DropletOff,
  Gauge,
  Hash,
  MapPin,
  HelpCircle,
  Wrench,
  User,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ScheduleActionPanel from "./ScheduleActionPanel";
import EvidenceActionPanel from "./EvidenceActionPanel";
import DeleteConfirmDialog from "@/components/root/DeleteConfirmDialog";
import { deleteComplaint } from "@/app/actions/complaint.actions";

type ComplaintDetailType = {
  id: number;
  title: string;
  description: string | null;
  disturbanceType: DisturbanceType;
  status: ComplaintStatus;
  technicianId: number | null;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: number;
    customerId: string;
    address: string;
    user: {
      fullname: string;
    };
  } | null;
  technician: {
    id: number;
    fullname: string;
    region: string | null;
  } | null;
  images: {
    id: number;
    url: string;
    filename: string;
    type: "COMPLAINT" | "EVIDENCE";
  }[];
};

type Technician = { id: number; fullname: string; region: string | null };

interface ComplaintDetailProps {
  complaint: ComplaintDetailType;
  technicians: Technician[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const disturbanceConfig: Record<
  DisturbanceType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  KEBOCORAN_PIPA: {
    label: "Pipe Leakage",
    icon: <Droplet size={14} />,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  AIR_TIDAK_MENGALIR: {
    label: "No Water Flow",
    icon: <DropletOff size={14} />,
    color: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  AIR_KERUH: {
    label: "Turbid Water",
    icon: <Droplet size={14} />,
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  },
  TEKANAN_RENDAH: {
    label: "Low Pressure",
    icon: <Gauge size={14} />,
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  PIPA_PECAH: {
    label: "Burst Pipe",
    icon: <Wrench size={14} />,
    color: "bg-red-600/10 text-red-700 border-red-600/20",
  },
  METER_RUSAK: {
    label: "Broken Meter",
    icon: <Wrench size={14} />,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  LAINNYA: {
    label: "Other",
    icon: <HelpCircle size={14} />,
    color: "bg-muted text-muted-foreground",
  },
};

const statusConfig: Record<
  ComplaintStatus,
  { label: string; color: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    dot: "bg-yellow-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    dot: "bg-blue-500",
  },
  RESOLVED: {
    label: "Resolved",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    dot: "bg-green-500",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ComplaintDetail({
  complaint,
  technicians,
}: ComplaintDetailProps) {
  const router = useRouter();
  const disturbance = disturbanceConfig[complaint.disturbanceType];
  const status = statusConfig[complaint.status];

  const complaintImages = complaint.images.filter(
    (img) => img.type === "COMPLAINT",
  );
  const evidenceImages = complaint.images.filter(
    (img) => img.type === "EVIDENCE",
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* ── LEFT / MAIN COLUMN ───────────────────────────────── */}
      <div className="space-y-5 lg:col-span-2">
        {/* Report Info Card */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            {/* Top meta row */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={`flex items-center gap-1.5 ${disturbance.color}`}
              >
                {disturbance.icon}
                {disturbance.label}
              </Badge>
              <Badge
                variant="outline"
                className={`flex items-center gap-1.5 ${status.color}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </Badge>
              <span className="text-muted-foreground ml-auto text-xs">
                #{complaint.id} ·{" "}
                {format(new Date(complaint.createdAt), "dd MMM yyyy, HH:mm")}
              </span>
            </div>

            {/* Title + Description */}
            <h3 className="text-foreground mb-1 text-lg leading-snug font-semibold">
              {complaint.title}
            </h3>
            {complaint.description ? (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {complaint.description}
              </p>
            ) : (
              <p className="text-muted-foreground/50 text-sm italic">
                No description provided.
              </p>
            )}

            <Separator className="my-5" />

            {/* Info Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow
                icon={<Hash size={14} />}
                label="Complaint ID"
                value={`#${complaint.id}`}
              />
              <InfoRow
                icon={<Calendar size={14} />}
                label="Submitted"
                value={format(new Date(complaint.createdAt), "dd MMMM yyyy")}
              />
              {complaint.scheduledAt && (
                <InfoRow
                  icon={<Calendar size={14} />}
                  label="Scheduled"
                  value={format(
                    new Date(complaint.scheduledAt),
                    "dd MMMM yyyy, HH:mm",
                  )}
                />
              )}
              {complaint.technician && (
                <InfoRow
                  icon={<User size={14} />}
                  label="Technician"
                  value={`${complaint.technician.fullname} · ${complaint.technician.region ?? "–"}`}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Card */}
        {complaint.customer && (
          <Card className="border-border/60">
            <CardHeader className="px-5 pt-4 pb-3">
              <CardTitle className="text-foreground text-sm font-medium tracking-wide uppercase">
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold">
                  {complaint.customer.user.fullname.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-foreground font-semibold">
                      {complaint.customer.user.fullname}
                    </p>
                    <p className="text-muted-foreground font-mono text-xs">
                      {complaint.customer.customerId}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                      <MapPin size={13} />
                      <span className="line-clamp-1">
                        {complaint.customer.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complaint Photos */}
        <Card className="border-border/60">
          <CardHeader className="px-5 pt-4 pb-3">
            <CardTitle className="text-foreground flex items-center justify-between text-sm font-medium tracking-wide uppercase">
              Complaint Photos
              <span className="text-muted-foreground text-xs font-normal normal-case">
                {complaintImages.length} photo
                {complaintImages.length !== 1 ? "s" : ""}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {complaintImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {complaintImages.map((img) => (
                  <div
                    key={img.id}
                    className="border-border/50 bg-muted group relative aspect-square overflow-hidden rounded-xl border"
                  >
                    <Image
                      src={img.url}
                      alt={img.filename}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground/60 py-6 text-center text-sm italic">
                No photos attached to this complaint.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Evidence Photos (only when exists) */}
        {evidenceImages.length > 0 && (
          <Card className="border border-green-500/20">
            <CardHeader className="px-5 pt-4 pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-medium tracking-wide text-green-600 uppercase">
                Follow-up Evidence
                <span className="text-xs font-normal text-green-600/70 normal-case">
                  {evidenceImages.length} photo
                  {evidenceImages.length !== 1 ? "s" : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {evidenceImages.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-green-500/20 bg-green-500/5"
                  >
                    <Image
                      src={img.url}
                      alt={img.filename}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── RIGHT / ACTION COLUMN ────────────────────────────── */}
      <div className="space-y-5">
        {/* Status Timeline */}
        <Card className="border-border/60">
          <CardHeader className="px-5 pt-4 pb-3">
            <CardTitle className="text-foreground text-sm font-medium tracking-wide uppercase">
              Status Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <StatusTimeline status={complaint.status} />
          </CardContent>
        </Card>

        {/* Action Panel — conditional by status */}
        {complaint.status === "PENDING" && (
          <ScheduleActionPanel
            complaintId={complaint.id}
            technicians={technicians}
          />
        )}

        {complaint.status === "IN_PROGRESS" && (
          <EvidenceActionPanel complaintId={complaint.id} />
        )}

        {complaint.status === "RESOLVED" && (
          <Card className="border border-green-500/20 bg-green-500/5">
            <CardContent className="px-5 py-5 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <Wrench size={22} className="text-green-600" />
              </div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Complaint resolved
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Last updated{" "}
                {format(new Date(complaint.updatedAt), "dd MMM yyyy")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Delete — available at any status */}
        <div className="flex justify-end">
          <DeleteConfirmDialog
            onConfirm={async () => {
              await deleteComplaint(complaint.id);
              router.push("/dashboard/complaints");
            }}
            title="Hapus keluhan ini?"
            description={`Keluhan "#${complaint.id} — ${complaint.title}" beserta semua foto akan dihapus permanen.`}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-foreground text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

const timelineSteps: { key: ComplaintStatus; label: string; sub: string }[] = [
  { key: "PENDING", label: "Submitted", sub: "Complaint received" },
  { key: "IN_PROGRESS", label: "In Progress", sub: "Technician assigned" },
  { key: "RESOLVED", label: "Resolved", sub: "Work completed" },
];

const stepOrder: Record<ComplaintStatus, number> = {
  PENDING: 0,
  IN_PROGRESS: 1,
  RESOLVED: 2,
  CANCELLED: 0,
};

function StatusTimeline({ status }: { status: ComplaintStatus }) {
  const currentStep = stepOrder[status];

  return (
    <div className="space-y-0">
      {timelineSteps.map((step, i) => {
        const isDone = stepOrder[step.key] < currentStep;
        const isCurrent = step.key === status;
        const isUpcoming = stepOrder[step.key] > currentStep;
        const isLast = i === timelineSteps.length - 1;

        return (
          <div key={step.key} className="flex gap-3">
            {/* Dot + line */}
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

            {/* Text */}
            <div className="pb-4">
              <p
                className={`text-sm leading-tight font-medium ${
                  isUpcoming ? "text-muted-foreground/50" : "text-foreground"
                }`}
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
  );
}
