"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Search, Loader2, CalendarIcon, X } from "lucide-react";
import { ComplaintStatus, DisturbanceType } from "@/generated/prisma";
import { format } from "date-fns";

const statusLabels: Record<ComplaintStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CANCELLED: "Cancelled",
};

const disturbanceLabels: Record<DisturbanceType, string> = {
  KEBOCORAN_PIPA: "Kebocoran Pipa",
  AIR_TIDAK_MENGALIR: "Air Tidak Mengalir",
  AIR_KERUH: "Air Keruh",
  TEKANAN_RENDAH: "Tekanan Rendah",
  PIPA_PECAH: "Pipa Pecah",
  METER_RUSAK: "Meter Rusak",
  LAINNYA: "Lainnya",
};

interface Technician {
  id: number;
  fullname: string;
}

interface ComplaintSearchBarProps {
  search?: string;
  status?: string;
  customerName?: string;
  technicianId?: number;
  disturbanceType?: string;
  dateFrom?: string;
  dateTo?: string;
  technicians: Technician[];
}

export default function ComplaintSearchBar({
  search = "",
  status = "",
  customerName = "",
  technicianId,
  disturbanceType = "",
  dateFrom,
  dateTo,
  technicians,
}: ComplaintSearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [titleValue, setTitleValue] = useState(search);
  const [customerValue, setCustomerValue] = useState(customerName);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      params.set("page", "1");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams],
  );

  // Debounce title search — 600 ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get("search") ?? "";
      if (titleValue !== current) {
        updateParams({ search: titleValue });
      }
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleValue]);

  // Debounce customer name search — 600 ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get("customerName") ?? "";
      if (customerValue !== current) {
        updateParams({ customerName: customerValue });
      }
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerValue]);

  const selectedDateFrom = dateFrom ? new Date(dateFrom) : undefined;
  const selectedDateTo = dateTo ? new Date(dateTo) : undefined;

  return (
    <div className="space-y-3">
      {/* Row 1: title search, customer name, status */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          {isPending ? (
            <Loader2
              size={16}
              className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 animate-spin"
            />
          ) : (
            <Search
              size={16}
              className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
            />
          )}
          <Input
            value={titleValue}
            placeholder="Cari berdasarkan judul keluhan..."
            className="pl-9"
            onChange={(e) => setTitleValue(e.target.value)}
          />
        </div>

        <div className="relative flex-1">
          <Search
            size={16}
            className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
          />
          <Input
            value={customerValue}
            placeholder="Cari nama customer..."
            className="pl-9"
            onChange={(e) => setCustomerValue(e.target.value)}
          />
        </div>

        <Select
          value={status || "ALL"}
          onValueChange={(v) => updateParams({ status: v === "ALL" ? "" : v })}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={technicianId?.toString() ?? "ALL"}
          onValueChange={(v) =>
            updateParams({ technicianId: v === "ALL" ? "" : v })
          }
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Semua Teknisi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Teknisi</SelectItem>
            {technicians.map((t) => (
              <SelectItem key={t.id} value={t.id.toString()}>
                {t.fullname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={disturbanceType || "ALL"}
          onValueChange={(v) =>
            updateParams({ disturbanceType: v === "ALL" ? "" : v })
          }
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Semua Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Tipe</SelectItem>
            {Object.entries(disturbanceLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DatePickerButton
          value={selectedDateFrom}
          placeholder="Dari tanggal"
          onChange={(date) =>
            updateParams({
              dateFrom: date ? format(date, "yyyy-MM-dd") : "",
            })
          }
        />

        <DatePickerButton
          value={selectedDateTo}
          placeholder="Sampai tanggal"
          onChange={(date) =>
            updateParams({
              dateTo: date ? format(date, "yyyy-MM-dd") : "",
            })
          }
        />
      </div>
    </div>
  );
}

function DatePickerButton({
  value,
  placeholder,
  onChange,
}: {
  value?: Date;
  placeholder: string;
  onChange: (date: Date | undefined) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start font-normal sm:w-44"
        >
          <CalendarIcon size={14} className="text-muted-foreground mr-2" />
          {value ? (
            <span>{format(value, "dd MMM yyyy")}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {value && (
            <X
              size={14}
              className="text-muted-foreground hover:text-foreground ml-auto"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  );
}
