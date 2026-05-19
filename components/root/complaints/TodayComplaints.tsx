"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ComplaintStatus, DisturbanceType } from "@/generated/prisma";
import {
  Droplet,
  DropletOff,
  Gauge,
  Pipette,
  HelpCircle,
  Wrench,
} from "lucide-react";
import { format } from "date-fns";
import { useRef } from "react";
import Link from "next/link";

type TodayComplaint = {
  id: number;
  title: string;
  status: ComplaintStatus;
  disturbanceType: DisturbanceType;
  scheduledAt: Date | null;
  createdAt: Date;
  customer: {
    customerId: string;
    user: {
      fullname: string;
    };
  } | null;
};

const disturbanceConfig: Record<
  DisturbanceType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  KEBOCORAN_PIPA: {
    label: "Pipe Leakage",
    icon: <Droplet size={16} />,
    color: "text-blue-500 bg-blue-500/10",
  },
  AIR_TIDAK_MENGALIR: {
    label: "No Water Flow",
    icon: <DropletOff size={16} />,
    color: "text-red-500 bg-red-500/10",
  },
  AIR_KERUH: {
    label: "Turbid Water",
    icon: <Droplet size={16} />,
    color: "text-yellow-500 bg-yellow-500/10",
  },
  TEKANAN_RENDAH: {
    label: "Low Pressure",
    icon: <Gauge size={16} />,
    color: "text-orange-500 bg-orange-500/10",
  },
  PIPA_PECAH: {
    label: "Burst Pipe",
    icon: <Pipette size={16} />,
    color: "text-red-600 bg-red-600/10",
  },
  METER_RUSAK: {
    label: "Broken Meter",
    icon: <Wrench size={16} />,
    color: "text-purple-500 bg-purple-500/10",
  },
  LAINNYA: {
    label: "Other",
    icon: <HelpCircle size={16} />,
    color: "text-muted-foreground bg-muted",
  },
};

const statusConfig: Record<
  ComplaintStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  RESOLVED: {
    label: "Resolved",
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-border",
  },
};

interface TodayComplaintsProps {
  complaints: TodayComplaint[];
  linkBase?: string;
}

export default function TodayComplaints({
  complaints,
  linkBase = "/dashboard/complaints",
}: TodayComplaintsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const pending = complaints.filter((c) => c.status === "PENDING").length;
  const inProgress = complaints.filter(
    (c) => c.status === "IN_PROGRESS",
  ).length;
  const resolved = complaints.filter((c) => c.status === "RESOLVED").length;

  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-xl font-medium tracking-tight">
            Today&apos;s Complaints
          </h2>
          <p className="text-muted-foreground text-sm">
            {format(new Date(), "EEEE, dd MMMM yyyy")} ·{" "}
            <span className="text-yellow-600">{pending} pending</span>
            {" · "}
            <span className="text-blue-600">{inProgress} in progress</span>
            {" · "}
            <span className="text-green-600">{resolved} resolved</span>
          </p>
        </div>
        <span className="text-muted-foreground text-sm">
          {complaints.length} total
        </span>
      </div>

      {/* Scrollable Cards */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-3 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {complaints.map((complaint) => {
          const disturbance = disturbanceConfig[complaint.disturbanceType];
          const status = statusConfig[complaint.status];

          return (
            <Link href={`${linkBase}/${complaint.id}`} key={complaint.id}>
              <Card
                key={complaint.id}
                className="bg-card border-border/60 hover:border-border w-80 shrink-0 cursor-pointer transition-all duration-200 hover:shadow-md"
                style={{ scrollSnapAlign: "start" }}
              >
                <CardContent className="space-y-3 p-4">
                  {/* Top row: disturbance type + status */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${disturbance.color}`}
                    >
                      {disturbance.icon}
                      {disturbance.label}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${status.className}`}
                    >
                      {status.label}
                    </Badge>
                  </div>

                  {/* Title */}
                  <div>
                    <p className="text-foreground line-clamp-2 h-16 text-sm leading-snug font-medium">
                      {complaint.title}
                    </p>
                  </div>

                  {/* Customer */}
                  {complaint.customer && (
                    <div className="flex items-center gap-2">
                      <div className="bg-muted flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold uppercase">
                        {complaint.customer.user.fullname.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-xs font-medium">
                          {complaint.customer.user.fullname}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {complaint.customer.customerId}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Footer: time */}
                  <div className="border-border/50 flex items-center justify-between border-t pt-2">
                    <span className="text-muted-foreground text-xs">
                      {format(new Date(complaint.createdAt), "HH:mm")}
                    </span>
                    {complaint.scheduledAt && (
                      <span className="text-muted-foreground text-xs">
                        Scheduled{" "}
                        {format(new Date(complaint.scheduledAt), "HH:mm")}
                      </span>
                    )}
                    <span className="text-muted-foreground text-xs">
                      #{complaint.id}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
