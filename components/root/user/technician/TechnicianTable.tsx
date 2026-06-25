"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import DataTable from "../../DataTable";
import SearchDataTable from "../../SearchDataTable";
import { TechnicianType } from "@/servers/validators/technician.validator";
import TableSorter from "../../TableSorter";
import DeleteConfirmDialog from "../../DeleteConfirmDialog";
import { deleteTechnician } from "@/app/actions/technician.action";

interface TechnicianTableProps {
  technicians: TechnicianType[];
}

export default function TechnicianTable({ technicians }: TechnicianTableProps) {
  return (
    <DataTable
      columns={technicianColumn}
      data={technicians}
      filters={(table) => (
        <div className="grid w-full items-end gap-4 p-4 lg:grid-cols-2 lg:gap-6">
          <SearchDataTable
            table={table}
            column="technician"
            placeholder="Search Technician Name..."
          />
          <SearchDataTable
            table={table}
            column="address"
            placeholder="Search Address..."
          />
        </div>
      )}
    />
  );
}

export const technicianColumn: ColumnDef<TechnicianType>[] = [
  // INDEX
  {
    id: "index",
    header: ({ column }) => <TableSorter isFirst column={column} header="#" />,
    cell: ({ row }) => (
      <div className="text-muted-foreground max-w-fit ps-5 text-center text-xs">
        {row.index + 1}
      </div>
    ),
  },

  // CUSTOMER (Avatar + Name + Phone)
  {
    id: "technician",
    header: ({ column }) => <TableSorter column={column} header="CUSTOMER" />,
    cell: ({ row }) => {
      const name = row.original.fullname;
      const firstName = name.split(" ")[0];

      return (
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
            {firstName.charAt(0)}
          </div>

          {/* Info */}
          <div className="flex flex-col leading-tight">
            <Link
              href={`/dashboard/technicians/${row.original.id}`}
              className="font-medium hover:underline"
            >
              {name}
            </Link>
            <span className="text-muted-foreground text-xs">
              {row.original.region ?? "–"}
            </span>
          </div>
        </div>
      );
    },
  },

  // CUSTOMER ID
  {
    accessorKey: "region",
    header: ({ column }) => <TableSorter column={column} header="REGION" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-xs">
        {row.original.region}
      </span>
    ),
  },

  {
    id: "complaints",
    header: () => <span className="text-xs">COMPLAINTS</span>,
    cell: ({ row }) => {
      const complaints = row.original.complaints.length;

      return (
        <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
          {complaints}
        </span>
      );
    },
  },

  // CREATED DATE
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

  {
    id: "actions",
    header: () => <span className="sr-only">Aksi</span>,
    cell: ({ row }) => (
      <DeleteConfirmDialog
        onConfirm={() => deleteTechnician(row.original.id)}
        title="Hapus teknisi ini?"
        description={`Data teknisi "${row.original.fullname}" akan dihapus permanen. Keluhan yang ditugaskan ke teknisi ini akan kehilangan penugasannya.`}
      />
    ),
  },
];
