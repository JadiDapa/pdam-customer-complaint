"use client";

import { useTransition, useState, useRef, useCallback } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { CreateComplaintSchema } from "@/servers/validators/complaint.validator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DisturbanceType, Prisma } from "@/generated/prisma";

type CustomerWithUser = Prisma.CustomerGetPayload<{ include: { user: true } }>;
import { useRouter } from "next/navigation";
import { X, ImagePlus, UploadCloud } from "lucide-react";
import { createComplaint } from "@/app/actions/complaint.actions";

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

interface ImagePreview {
  file: File;
  url: string;
}

export default function CreateComplaintForm({
  technicianId,
  customerId,
  customers,
}: {
  technicianId?: number;
  customerId?: number;
  customers?: CustomerWithUser[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ComplaintFormType>({
    resolver: zodResolver(CreateComplaintSchema),
    defaultValues: {
      technicianId: technicianId ?? undefined,
      customerId: customerId ?? undefined,
      title: "",
      description: "",
    },
  });

  const syncFilesToInput = (previews: ImagePreview[]) => {
    if (!fileInputRef.current) return;
    const dt = new DataTransfer();
    previews.forEach((p) => dt.items.add(p.file));
    fileInputRef.current.files = dt.files;
  };

  const addImages = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    const newPreviews: ImagePreview[] = fileArray.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => {
      const next = [...prev, ...newPreviews];
      syncFilesToInput(next); // ← keep input in sync
      return next;
    });
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      const next = prev.filter((_, i) => i !== index);
      syncFilesToInput(next); // ← keep input in sync
      return next;
    });
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addImages(e.dataTransfer.files);
  };

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

        images.forEach((img) => formData.append("images", img.file));

        const result = await createComplaint(formData);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Keluhan berhasil dibuat!");
        router.push("/");
      } catch {
        toast.error("Something went wrong");
      }
    });
  }

  return (
    <section className="max-w-lg">
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
        <FieldGroup>
          {customers && (
            <Controller
              name="customerId"
              control={form.control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Customer</FieldLabel>
                  <Select
                    value={String(field.value ?? "")}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Customer..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.user.fullname}{" "}
                          <span className="text-muted-foreground">
                            ({c.customerId})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <p className="text-destructive mt-1 text-xs">
                      Pilih customer terlebih dahulu
                    </p>
                  )}
                </Field>
              )}
            />
          )}

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
                    {Object.entries(disturbanceLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
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
                  <InputGroupTextarea
                    {...field}
                    placeholder="Deskripsi Lengkap"
                  />
                </InputGroup>
              </Field>
            )}
          />

          {/* Image Uploader */}
          <Field>
            <FieldLabel>
              Foto{" "}
              <span className="text-muted-foreground ml-1 text-xs font-normal">
                (opsional, bisa lebih dari 1)
              </span>
            </FieldLabel>

            {/* Drop Zone */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) =>
                e.key === "Enter" && fileInputRef.current?.click()
              }
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={[
                "relative flex flex-col items-center justify-center gap-2",
                "cursor-pointer rounded-xl border-2 border-dashed px-4 py-6",
                "transition-colors duration-150 select-none",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/40",
              ].join(" ")}
            >
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                <UploadCloud className="text-muted-foreground h-5 w-5" />
              </div>
              <p className="text-foreground text-sm font-medium">
                Klik atau seret foto ke sini
              </p>
              <p className="text-muted-foreground text-xs">
                PNG, JPG, WEBP — bisa lebih dari satu
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => e.target.files && addImages(e.target.files)}
              />
            </div>

            {/* Previews */}
            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {images.map((img, i) => (
                  <div
                    key={img.url}
                    className="group border-border bg-muted relative aspect-square overflow-hidden rounded-lg border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`Preview ${i + 1}`}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className={[
                        "absolute top-1 right-1 flex h-5 w-5 items-center justify-center",
                        "rounded-full bg-black/60 text-white opacity-0 transition-opacity",
                        "group-hover:opacity-100 hover:bg-black/80",
                      ].join(" ")}
                      aria-label="Hapus foto"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* Add more button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={[
                    "flex aspect-square flex-col items-center justify-center gap-1",
                    "border-border rounded-lg border-2 border-dashed",
                    "text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors",
                  ].join(" ")}
                  aria-label="Tambah foto"
                >
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-[10px] font-medium">Tambah</span>
                </button>
              </div>
            )}
          </Field>

          <div className="mt-6">
            <Button
              type="submit"
              disabled={isPending || !form.formState.isValid}
            >
              {isPending ? <Spinner /> : "Tambahkan"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </section>
  );
}
