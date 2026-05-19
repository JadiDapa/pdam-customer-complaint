"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ComplaintType } from "@/servers/validators/complaint.validator";
import DataTable from "../DataTable";
import TableSorter from "../TableSorter";

interface ComplaintTableProps {
  complaints: ComplaintType[];
  linkBase?: string;
  hidePagination?: boolean;
}

type CustomerStats = {
  all: number;
  done: number;
  cancel: number;
  hasActive: boolean;
};

function buildCustomerStats(
  complaints: ComplaintType[],
): Map<number, CustomerStats> {
  const map = new Map<number, CustomerStats>();

  for (const c of complaints) {
    const id = c.customer?.id;
    if (!id) continue;

    const prev = map.get(id) ?? {
      all: 0,
      done: 0,
      cancel: 0,
      hasActive: false,
    };
    map.set(id, {
      all: prev.all + 1,
      done: prev.done + (c.status === "RESOLVED" ? 1 : 0),
      cancel: prev.cancel + (c.status === "CANCELLED" ? 1 : 0),
      hasActive:
        prev.hasActive || c.status === "PENDING" || c.status === "IN_PROGRESS",
    });
  }

  return map;
}

export default function ComplaintTable({
  complaints,
  linkBase = "/dashboard/complaints",
  hidePagination = false,
}: ComplaintTableProps) {
  const customerStats = buildCustomerStats(complaints);
  const columns = buildComplaintColumns(linkBase, customerStats);

  return (
    <DataTable
      columns={columns}
      data={complaints}
      hidePagination={hidePagination}
    />
  );
}

function buildComplaintColumns(
  linkBase: string,
  customerStats: Map<number, CustomerStats>,
): ColumnDef<ComplaintType>[] {
  return [
    {
      id: "index",
      header: ({ column }) => (
        <TableSorter isFirst column={column} header="#" />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground max-w-fit ps-5 text-center text-xs">
          {row.index + 1}
        </div>
      ),
    },
    {
      id: "customer",
      accessorFn: (row) =>
        `${row.customer?.user?.fullname ?? ""} ${row.customer?.customerId ?? ""}`,
      header: ({ column }) => <TableSorter column={column} header="CUSTOMER" />,
      cell: ({ row }) => {
        const name = row.original.customer?.user?.fullname;
        const customerId = row.original.customer?.customerId;
        const stats = customerStats.get(row.original.customer?.id ?? -1);

        if (!name) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }

        return (
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col leading-tight">
              <Link
                href={`${linkBase}/${row.original.id}`}
                className="font-medium hover:underline"
              >
                {name}
              </Link>
              <span className="text-muted-foreground text-xs">
                {customerId}
              </span>
              {stats && (
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px]">
                    all: {stats.all}
                  </span>
                  <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] text-green-700">
                    done: {stats.done}
                  </span>
                  <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px]">
                    cancel: {stats.cancel}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "technician",
      accessorFn: (row) =>
        `${row.technician?.fullname ?? ""} ${row.technician?.region ?? ""}`,
      header: ({ column }) => (
        <TableSorter column={column} header="TECHNICIAN" />
      ),
      cell: ({ row }) => {
        const technician = row.original.technician;

        if (!technician) {
          return (
            <span className="text-muted-foreground text-xs">Unassigned</span>
          );
        }

        return (
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
              {technician.fullname.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-medium">{technician.fullname}</span>
              <span className="text-muted-foreground text-xs">
                {technician.region}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "title",
      header: () => <span className="text-xs">TITLE</span>,
      cell: ({ row }) => (
        <p className="line-clamp-2 text-sm">{row.original.title}</p>
      ),
    },
    {
      accessorKey: "disturbanceType",
      header: ({ column }) => <TableSorter column={column} header="TYPE" />,
      cell: ({ row }) => (
        <span className="bg-muted rounded-md px-2 py-1 text-xs font-medium">
          {row.original.disturbanceType.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <TableSorter column={column} header="STATUS" />,
      cell: ({ row }) => {
        const statusStyles: Record<string, string> = {
          PENDING: "bg-yellow-500/10 text-yellow-600",
          IN_PROGRESS: "bg-blue-500/10 text-blue-600",
          RESOLVED: "bg-green-500/10 text-green-600",
          CANCELLED: "bg-muted text-muted-foreground",
        };
        const s = row.original.status;
        return (
          <span
            className={`rounded-md px-2 py-1 text-xs font-medium ${statusStyles[s] ?? "bg-muted"}`}
          >
            {s.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      id: "active",
      header: () => <span className="text-xs">ACTIVE</span>,
      cell: ({ row }) => {
        const id = row.original.customer?.id;
        const hasActive = id
          ? (customerStats.get(id)?.hasActive ?? false)
          : false;

        return (
          <div className="flex justify-center">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                hasActive ? "bg-green-500" : "bg-muted-foreground/30"
              }`}
              title={hasActive ? "Has active complaint" : "No active complaint"}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <TableSorter column={column} header="CREATED" />,
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <div className="flex flex-col text-sm leading-tight">
            <span>{date.toLocaleDateString()}</span>
            <span className="text-muted-foreground text-xs">
              {date.toLocaleTimeString()}
            </span>
          </div>
        );
      },
    },
  ];
}

export const complaintColumn = buildComplaintColumns(
  "/dashboard/complaints",
  new Map(),
);
