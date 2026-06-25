"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { CustomerType } from "@/servers/validators/customer.validator";
import DataTable from "../../DataTable";
import SearchDataTable from "../../SearchDataTable";
import TableSorter from "../../TableSorter";
import DeleteConfirmDialog from "../../DeleteConfirmDialog";
import { deleteCustomer } from "@/app/actions/customer.actions";

interface CustomerTableProps {
  customers: CustomerType[];
}

export default function CustomerTable({ customers }: CustomerTableProps) {
  return (
    <DataTable
      columns={customerColumn}
      data={customers}
      filters={(table) => (
        <div className="grid w-full items-end gap-4 p-4 lg:grid-cols-2 lg:gap-6">
          <SearchDataTable
            table={table}
            column="customer"
            placeholder="Search Customer Name..."
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

export const customerColumn: ColumnDef<CustomerType>[] = [
  {
    id: "index",
    header: ({ column }) => <TableSorter isFirst column={column} header="#" />,
    cell: ({ row }) => (
      <div className="text-muted-foreground max-w-fit ps-5 text-center text-xs">
        {row.index + 1}
      </div>
    ),
  },

  {
    id: "customer",
    accessorKey: "customer",
    accessorFn: (row) => `${row.user.fullname} ${row.user.username}`,
    header: ({ column }) => <TableSorter column={column} header="CUSTOMER" />,
    cell: ({ row }) => {
      const name = row.original.user.fullname;
      const firstName = name.split(" ")[0];

      return (
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
            {firstName.charAt(0)}
          </div>

          <div className="flex flex-col leading-tight">
            <Link
              href={`/dashboard/customers/${row.original.id}`}
              className="font-medium hover:underline"
            >
              {name}
            </Link>
            <span className="text-muted-foreground text-xs">
              @{row.original.user.username}
            </span>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "address",
    header: ({ column }) => <TableSorter column={column} header="ADDRESS" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-xs">
        {row.original.address}
      </span>
    ),
  },

  {
    accessorKey: "customerId",
    header: ({ column }) => (
      <TableSorter column={column} header="CUSTOMER ID" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-xs">
        {row.original.customerId}
      </span>
    ),
  },

  {
    id: "complaints",
    header: () => <span className="text-xs">COMPLAINTS</span>,
    cell: ({ row }) => {
      const complaints = row.original.complaints;
      const all = complaints.length;
      const done = complaints.filter((c) => c.status === "RESOLVED").length;
      const cancel = complaints.filter((c) => c.status === "CANCELLED").length;
      const hasActive = complaints.some(
        (c) => c.status === "PENDING" || c.status === "IN_PROGRESS",
      );

      if (all === 0) {
        return <span className="text-muted-foreground text-xs">—</span>;
      }

      return (
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap gap-1">
            <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-medium">
              all: {all}
            </span>
            <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
              done: {done}
            </span>
            <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-medium">
              cancel: {cancel}
            </span>
          </div>
          {hasActive && (
            <div className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] text-green-700">active</span>
            </div>
          )}
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

  {
    id: "actions",
    header: () => <span className="sr-only">Aksi</span>,
    cell: ({ row }) => (
      <DeleteConfirmDialog
        onConfirm={() => deleteCustomer(row.original.id)}
        title="Hapus customer ini?"
        description={`Data customer "${row.original.user.fullname}" beserta semua keluhan terkait akan dihapus permanen.`}
      />
    ),
  },
];
