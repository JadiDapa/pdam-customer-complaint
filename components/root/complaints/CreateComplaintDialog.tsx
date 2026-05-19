"use client";

import { useState, useTransition } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

import { CreateComplaintSchema } from "@/servers/validators/complaint.validator";
import { createComplaint } from "@/app/actions/complaint.actions";
import { DisturbanceType } from "@/generated/prisma";

const disturbanceLabels: Record<DisturbanceType, string> = {
  KEBOCORAN_PIPA: "Kebocoran Pipa",
  AIR_TIDAK_MENGALIR: "Air Tidak Mengalir",
  AIR_KERUH: "Air Keruh",
  TEKANAN_RENDAH: "Tekanan Rendah",
  PIPA_PECAH: "Pipa Pecah",
  METER_RUSAK: "Meter Rusak",
  LAINNYA: "Lainnya",
};

type ComplaintFormType = z.infer<typeof CreateComplaintSchema>;

export default function CreateComplaintDialog({
  technicianId,
  customerId,
}: {
  technicianId: number;
  customerId: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ComplaintFormType>({
    resolver: zodResolver(CreateComplaintSchema),
    defaultValues: {
      technicianId: technicianId,
      customerId: customerId,
      title: "",
      description: "",
    },
  });

  async function onSubmit(values: ComplaintFormType) {
    startTransition(async () => {
      try {
        const formData = new FormData();
        if (values.technicianId != null)
          formData.append("technicianId", String(values.technicianId));
        if (values.customerId != null)
          formData.append("customerId", String(values.customerId));
        formData.append("title", values.title);
        formData.append("disturbanceType", values.disturbanceType);
        if (values.description)
          formData.append("description", values.description);

        await createComplaint(formData);
        toast.success("Complaint created!");
        setOpen(false);
        form.reset();
      } catch {
        toast.error("Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <p className="font-semibold">Tambah Complaint</p>
          <Plus />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Complaint</DialogTitle>
          <p className="text-muted-foreground text-sm">Masukkan data keluhan</p>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
          <FieldGroup>
            <Controller
              name="disturbanceType"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Jenis Gangguan</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis gangguan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(disturbanceLabels).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              name="title"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Alasan Keluhan</FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...field} placeholder="Alasan keluhan" />
                  </InputGroup>
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Deskripsi</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      placeholder="Deskripsi Lengkap"
                    />
                  </InputGroup>
                </Field>
              )}
            />

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>

              <Button
                type="submit"
                disabled={isPending || !form.formState.isValid}
              >
                {isPending ? <Spinner /> : "Tambahkan"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
