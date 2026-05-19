"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import DataTable from "../DataTable";
import SearchDataTable from "../SearchDataTable";
import TableSorter from "../TableSorter";
import { UserType } from "@/servers/validators/user.validator";

interface UserTableProps {
  users: UserType[];
}

export default function UserTable({ users }: UserTableProps) {
  return (
    <DataTable
      columns={userColumn}
      data={users}
      filters={(table) => (
        <div className="grid w-full items-end gap-4 p-4 lg:grid-cols-3 lg:gap-6">
          <SearchDataTable
            table={table}
            column="user"
            placeholder="Search User Name..."
          />
          <SearchDataTable
            table={table}
            column="address"
            placeholder="Search Address..."
          />
          <SearchDataTable
            table={table}
            column="phoneNumber"
            placeholder="Search Phone Number..."
          />
        </div>
      )}
    />
  );
}

export const userColumn: ColumnDef<UserType>[] = [
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

  // USER (Avatar + Name + Phone)
  {
    id: "user",
    header: ({ column }) => <TableSorter column={column} header="USER" />,
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
              href={`/users/${row.original.id}`}
              className="font-medium hover:underline"
            >
              {name}
            </Link>
            <span className="text-muted-foreground text-xs">
              {row.original.username}
            </span>
          </div>
        </div>
      );
    },
  },

  // USER ID
  {
    accessorKey: "role",
    header: ({ column }) => <TableSorter column={column} header="ROLE" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-xs">
        {row.original.role}
      </span>
    ),
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
];
