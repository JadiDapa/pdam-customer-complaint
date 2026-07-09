"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Loader2 } from "lucide-react";
import { scheduleComplaint } from "@/app/actions/complaint.actions";
import { toast } from "sonner";

interface ScheduleActionPanelProps {
  complaintId: number;
}

export default function ScheduleActionPanel({
  complaintId,
}: ScheduleActionPanelProps) {
  const router = useRouter();
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!scheduledAt) {
      setError("Isi tanggal eksekusi terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await scheduleComplaint(complaintId, {
        scheduledAt: new Date(scheduledAt),
      });
      toast.success("Jadwal berhasil disimpan!");
      router.refresh();
    } catch {
      setError("Gagal menyimpan jadwal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-blue-500/20">
      <CardHeader className="px-5 pt-4 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium tracking-wide text-blue-600 uppercase">
          <Calendar size={15} />
          Jadwalkan Eksekusi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5">
        <p className="text-muted-foreground text-xs">
          Tentukan tanggal eksekusi untuk memindahkan keluhan ini ke{" "}
          <strong>In Progress</strong>.
        </p>

        {/* Date/Time Picker */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Tanggal & Waktu</Label>
          <Input
            type="datetime-local"
            className="h-9 text-sm"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <Button
          className="w-full"
          disabled={loading || !scheduledAt}
          onClick={handleSubmit}
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            "Jadwalkan"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
