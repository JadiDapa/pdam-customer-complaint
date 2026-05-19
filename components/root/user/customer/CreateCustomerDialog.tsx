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
import { CreateCustomerSchema } from "@/servers/validators/customer.validator";
import { createCustomer } from "@/app/actions/customer.actions";
import { User } from "@/generated/prisma";

type CustomerFormType = z.infer<typeof CreateCustomerSchema>;

interface CreateCustomerDialogProps {
  availableUsers: Pick<User, "id" | "fullname" | "username">[];
}

export default function CreateCustomerDialog({
  availableUsers,
}: CreateCustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<CustomerFormType>({
    resolver: zodResolver(CreateCustomerSchema),
    defaultValues: {
      userId: undefined,
      customerId: "",
      phoneNumber: "",
      address: "",
    },
  });

  async function onSubmit(values: CustomerFormType) {
    startTransition(async () => {
      try {
        await createCustomer({ ...values });
        toast.success("Customer berhasil ditambahkan!");
        setOpen(false);
        form.reset();
      } catch {
        toast.error("Gagal menambahkan customer. Coba lagi.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <p className="text-center font-semibold">Tambah Customer</p>
          <Plus className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Customer</DialogTitle>
          <p className="text-muted-foreground -mt-1 text-sm">
            Hubungkan akun user ke profil pelanggan
          </p>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
          <FieldGroup>
            <Controller
              name="userId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>User Akun</FieldLabel>
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.length === 0 ? (
                        <div className="text-muted-foreground px-3 py-2 text-sm">
                          Tidak ada user tersedia
                        </div>
                      ) : (
                        availableUsers.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.fullname}{" "}
                            <span className="text-muted-foreground text-xs">
                              @{u.username}
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <p className="text-destructive mt-1 text-xs">
                      {fieldState.error.message}
                    </p>
                  )}
                </Field>
              )}
            />

            <Controller
              name="customerId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>ID Pelanggan</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      placeholder="Contoh: CUST00123"
                    />
                  </InputGroup>
                  {fieldState.error && (
                    <p className="text-destructive mt-1 text-xs">
                      {fieldState.error.message}
                    </p>
                  )}
                </Field>
              )}
            />

            <Controller
              name="phoneNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Nomor Telepon</FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...field} placeholder="08xxxxxxxxxx" />
                  </InputGroup>
                  {fieldState.error && (
                    <p className="text-destructive mt-1 text-xs">
                      {fieldState.error.message}
                    </p>
                  )}
                </Field>
              )}
            />

            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Alamat</FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...field} placeholder="Alamat lengkap" />
                  </InputGroup>
                  {fieldState.error && (
                    <p className="text-destructive mt-1 text-xs">
                      {fieldState.error.message}
                    </p>
                  )}
                </Field>
              )}
            />

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
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
