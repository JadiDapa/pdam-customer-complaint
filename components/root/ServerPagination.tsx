"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface ServerPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export default function ServerPagination({
  page,
  totalPages,
  total,
  pageSize,
}: ServerPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function buildHref(targetPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    return `${pathname}?${params.toString()}`;
  }

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-1 py-2">
      <p className="text-muted-foreground text-sm">
        Menampilkan {from}–{to} dari {total} keluhan
      </p>

      <div className="flex items-center gap-1">
        <Button asChild size="icon" variant="outline" disabled={page <= 1}>
          <Link href={buildHref(1)} aria-label="Halaman pertama">
            <ChevronsLeft strokeWidth={1.5} className="size-4" />
          </Link>
        </Button>
        <Button asChild size="icon" variant="outline" disabled={page <= 1}>
          <Link href={buildHref(page - 1)} aria-label="Halaman sebelumnya">
            <ChevronLeft strokeWidth={1.5} className="size-4" />
          </Link>
        </Button>

        <span className="text-muted-foreground min-w-20 text-center text-sm">
          {page} / {totalPages}
        </span>

        <Button
          asChild
          size="icon"
          variant="outline"
          disabled={page >= totalPages}
        >
          <Link href={buildHref(page + 1)} aria-label="Halaman berikutnya">
            <ChevronRight strokeWidth={1.5} className="size-4" />
          </Link>
        </Button>
        <Button
          asChild
          size="icon"
          variant="outline"
          disabled={page >= totalPages}
        >
          <Link href={buildHref(totalPages)} aria-label="Halaman terakhir">
            <ChevronsRight strokeWidth={1.5} className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
