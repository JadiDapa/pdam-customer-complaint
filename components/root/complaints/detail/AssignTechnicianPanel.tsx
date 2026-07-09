"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserCog, Wrench } from "lucide-react";
import { assignTechnician } from "@/app/actions/complaint.actions";
import { toast } from "sonner";

type Technician = { id: number; fullname: string; region: string | null };

interface AssignTechnicianPanelProps {
  complaintId: number;
  technicians: Technician[];
  currentTechnicianId?: number | null;
}

export default function AssignTechnicianPanel({
  complaintId,
  technicians,
  currentTechnicianId,
}: AssignTechnicianPanelProps) {
  const router = useRouter();
  const [technicianId, setTechnicianId] = useState<string>(
    currentTechnicianId ? String(currentTechnicianId) : "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!technicianId) {
      setError("Pilih petugas lapangan terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await assignTechnician(complaintId, Number(technicianId));
      toast.success("Petugas lapangan berhasil ditugaskan!");
      router.refresh();
    } catch {
      setError("Gagal menugaskan petugas. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const isReassign = Boolean(currentTechnicianId);

  return (
    <Card className="border border-blue-500/20">
      <CardHeader className="px-5 pt-4 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium tracking-wide text-blue-600 uppercase">
          <UserCog size={15} />
          {isReassign ? "Ganti Petugas" : "Tugaskan Petugas"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5">
        <p className="text-muted-foreground text-xs">
          Pilih petugas lapangan. Petugas yang ditugaskan akan menjadwalkan dan
          mengerjakan keluhan ini.
        </p>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Petugas Lapangan</Label>
          <Select value={technicianId} onValueChange={setTechnicianId}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Pilih petugas..." />
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

        {error && <p className="text-xs text-red-500">{error}</p>}

        <Button
          className="w-full"
          disabled={loading || !technicianId}
          onClick={handleSubmit}
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : isReassign ? (
            "Ganti Petugas"
          ) : (
            "Tugaskan"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
