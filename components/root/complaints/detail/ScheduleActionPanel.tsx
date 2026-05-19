"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Loader2, Wrench } from "lucide-react";
import { scheduleComplaint } from "@/app/actions/complaint.actions";
import { toast } from "sonner";

type Technician = { id: number; fullname: string; region: string | null };

interface ScheduleActionPanelProps {
  complaintId: number;
  technicians: Technician[];
}

export default function ScheduleActionPanel({
  complaintId,
  technicians,
}: ScheduleActionPanelProps) {
  const router = useRouter();
  const [technicianId, setTechnicianId] = useState<string>("");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!technicianId || !scheduledAt) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await scheduleComplaint(complaintId, {
        technicianId: Number(technicianId),
        scheduledAt: new Date(scheduledAt),
      });
      toast.success("Jadwal berhasil disimpan!");
      router.refresh();
    } catch {
      setError("Failed to schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-blue-500/20">
      <CardHeader className="px-5 pt-4 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium tracking-wide text-blue-600 uppercase">
          <Calendar size={15} />
          Schedule Execution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5">
        <p className="text-muted-foreground text-xs">
          Assign a technician and set the execution date to move this complaint
          to <strong>In Progress</strong>.
        </p>

        {/* Technician Select */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Technician</Label>
          <Select value={technicianId} onValueChange={setTechnicianId}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select technician..." />
            </SelectTrigger>
            <SelectContent>
              {technicians.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  <span className="flex items-center gap-2">
                    <Wrench size={13} />
                    {t.fullname}
                    {t.region && (
                      <span className="text-muted-foreground text-xs">
                        · {t.region}
                      </span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date/Time Picker */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Scheduled Date & Time</Label>
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
          disabled={loading || !technicianId || !scheduledAt}
          onClick={handleSubmit}
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            "Schedule"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
