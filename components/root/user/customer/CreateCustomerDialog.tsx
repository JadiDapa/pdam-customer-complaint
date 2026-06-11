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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { CreateCustomerSchema } from "@/servers/validators/customer.validator";
import { createCustomer } from "@/app/actions/customer.actions";

type CustomerFormType = z.infer<typeof CreateCustomerSchema>;

export default function CreateCustomerDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<CustomerFormType>({
    resolver: zodResolver(CreateCustomerSchema),
    defaultValues: {
      fullname: "",
      username: "",
      customerId: "",
      phoneNumber: "",
      address: "",
    },
  });

  async function onSubmit(values: CustomerFormType) {
    startTransition(async () => {
      try {
        await createCustomer(values);
        toast.success("Customer berhasil ditambahkan!");
        setOpen(false);
        form.reset();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Gagal menambahkan customer.";
        toast.error(msg);
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
            Buat akun pelanggan baru — login menggunakan username dan ID pelanggan
          </p>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
          <FieldGroup>
            <Controller
              name="fullname"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Nama Lengkap</FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...field} placeholder="Nama lengkap pelanggan" />
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
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Username</FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...field} placeholder="username pelanggan" />
                  </InputGroup>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Digunakan sebagai username login
                  </p>
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
                  <p className="text-muted-foreground mt-1 text-xs">
                    Digunakan sebagai password login
                  </p>
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
                  <FieldLabel>
                    Nomor Telepon{" "}
                    <span className="text-muted-foreground font-normal">(opsional)</span>
                  </FieldLabel>
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
