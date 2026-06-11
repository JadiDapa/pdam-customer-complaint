"use client";

import { useRef, useState, useTransition } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  importCustomers,
  type ImportRow,
  type ImportResult,
} from "@/app/actions/customer.actions";

const REQUIRED_COLS = ["fullname", "username", "customerId", "address"];

export default function ImportCustomersDialog() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setParseError(null);
    setRows(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
          defval: "",
        });

        if (json.length === 0) {
          setParseError("File kosong atau tidak ada data.");
          return;
        }

        const headers = Object.keys(json[0]).map((h) => h.trim().toLowerCase());
        const missing = REQUIRED_COLS.filter(
          (c) => !headers.includes(c.toLowerCase()),
        );
        if (missing.length > 0) {
          setParseError(`Kolom tidak ditemukan: ${missing.join(", ")}`);
          return;
        }

        const parsed: ImportRow[] = json.map((r) => ({
          fullname: String(r["fullname"] ?? "").trim(),
          username: String(r["username"] ?? "").trim(),
          customerId: String(r["customerId"] ?? "").trim(),
          phoneNumber: String(r["phoneNumber"] ?? "").trim() || undefined,
          address: String(r["address"] ?? "").trim(),
        }));

        setRows(parsed);
      } catch {
        setParseError("Gagal membaca file. Pastikan format .xlsx atau .csv.");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleImport() {
    if (!rows) return;
    setImportResult(null);
    startTransition(async () => {
      const result = await importCustomers(rows);
      if (result.failed.length === 0) {
        toast.success(`${result.success} customer berhasil diimpor!`);
        setOpen(false);
        reset();
      } else {
        setImportResult(result);
        toast.error(
          `${result.success} berhasil, ${result.failed.length} gagal.`,
        );
      }
    });
  }

  function reset() {
    setRows(null);
    setParseError(null);
    setImportResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer gap-2">
          <FileSpreadsheet className="size-4" />
          Import Excel / CSV
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl!">
        <DialogHeader>
          <DialogTitle>Import Customer dari File</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template hint */}
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">
              Kolom wajib:{" "}
              <span className="text-foreground font-mono">
                {REQUIRED_COLS.join(", ")}
              </span>
            </p>
            <p className="text-muted-foreground text-xs">
              Kolom opsional:{" "}
              <span className="text-foreground font-mono">phoneNumber</span>
            </p>
            <p className="text-muted-foreground text-xs">
              Login pelanggan:{" "}
              <span className="text-foreground">username = username</span>,{" "}
              <span className="text-foreground">password = customerId</span>
            </p>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border-border/60 hover:border-primary/50 hover:bg-accent/20 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition-colors"
          >
            <Upload className="text-muted-foreground mb-2 size-8" />
            <p className="text-foreground text-sm font-medium">
              Klik atau drag &amp; drop file di sini
            </p>
            <p className="text-muted-foreground text-xs">.xlsx atau .csv</p>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleChange}
            />
          </div>

          {/* Parse error */}
          {parseError && (
            <div className="flex items-start gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {parseError}
            </div>
          )}

          {/* Preview */}
          {rows && !parseError && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="size-4" />
                <span>{rows.length} baris siap diimpor</span>
              </div>
              <div className="border-border/60 max-h-48 overflow-auto rounded-lg border text-xs">
                <table className="w-full">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      {REQUIRED_COLS.map((c) => (
                        <th key={c} className="px-3 py-2 text-left font-medium">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((r, i) => (
                      <tr key={i} className="border-border/40 border-t">
                        <td className="px-3 py-1.5">{r.fullname}</td>
                        <td className="px-3 py-1.5">{r.username}</td>
                        <td className="px-3 py-1.5">{r.customerId}</td>
                        <td className="max-w-30 truncate px-3 py-1.5">
                          {r.address}
                        </td>
                      </tr>
                    ))}
                    {rows.length > 5 && (
                      <tr className="border-border/40 border-t">
                        <td
                          colSpan={4}
                          className="text-muted-foreground px-3 py-1.5 text-center"
                        >
                          +{rows.length - 5} baris lagi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import failure details */}
          {importResult && importResult.failed.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-red-600">
                {importResult.success} berhasil, {importResult.failed.length}{" "}
                baris gagal:
              </p>
              <div className="max-h-36 overflow-auto rounded-lg border border-red-200 bg-red-500/5 text-xs">
                {importResult.failed.map((f) => (
                  <div
                    key={f.row}
                    className="flex gap-2 border-b border-red-100 px-3 py-1.5 last:border-0"
                  >
                    <span className="shrink-0 font-medium text-red-500">
                      Baris {f.row}
                    </span>
                    <span className="text-red-700">{f.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              onClick={handleImport}
              disabled={!rows || isPending || !!parseError}
              className="cursor-pointer"
            >
              {isPending ? "Mengimpor..." : "Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
