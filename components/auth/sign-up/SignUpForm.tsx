"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useSignIn } from "@clerk/nextjs";
import { toast } from "sonner";
import { AtSign, Eye, EyeOff, IdCard, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpCustomerSchema } from "@/servers/validators/customer.validator";
import { signUpCustomer } from "@/app/actions/customer.actions";

type SignUpFormType = z.infer<typeof SignUpCustomerSchema>;

const inputClass =
  "h-12 bg-muted/60 border-transparent focus-within:border-ring focus-within:bg-background";

export default function SignUpForm() {
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { signIn } = useSignIn();
  const { loaded } = useClerk();
  const router = useRouter();

  const form = useForm<SignUpFormType>({
    resolver: zodResolver(SignUpCustomerSchema),
    defaultValues: {
      fullname: "",
      customerId: "",
      address: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignUpFormType) {
    startTransition(async () => {
      if (!loaded) return;

      try {
        await signUpCustomer(values);

        const { error } = await signIn.password({
          identifier: values.username,
          password: values.password,
        });

        if (error) {
          toast.success("Akun berhasil dibuat, silahkan masuk");
          router.push("/sign-in");
          return;
        }

        if (signIn.status === "complete") {
          await signIn.finalize({
            navigate: ({ decorateUrl }) => {
              router.push(decorateUrl("/"));
            },
          });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Pendaftaran gagal, coba lagi";
        toast.error(msg);
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 w-full">
      <div className="space-y-4">
        <Controller
          control={form.control}
          name="fullname"
          render={({ field, fieldState }) => (
            <div className="space-y-1">
              <InputGroup className={inputClass}>
                <InputGroupInput
                  {...field}
                  placeholder="Nama Lengkap"
                  autoComplete="off"
                  aria-invalid={!!fieldState.error}
                />
                <InputGroupAddon align="inline-end">
                  <User size={17} />
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={[fieldState.error]} />
            </div>
          )}
        />

        <Controller
          control={form.control}
          name="customerId"
          render={({ field, fieldState }) => (
            <div className="space-y-1">
              <InputGroup className={inputClass}>
                <InputGroupInput
                  {...field}
                  placeholder="ID Pelanggan"
                  autoComplete="off"
                  aria-invalid={!!fieldState.error}
                />
                <InputGroupAddon align="inline-end">
                  <IdCard size={17} />
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={[fieldState.error]} />
            </div>
          )}
        />

        <Controller
          control={form.control}
          name="address"
          render={({ field, fieldState }) => (
            <div className="space-y-1">
              <InputGroup className={inputClass}>
                <InputGroupInput
                  {...field}
                  placeholder="Alamat"
                  autoComplete="off"
                  aria-invalid={!!fieldState.error}
                />
                <InputGroupAddon align="inline-end">
                  <MapPin size={17} />
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={[fieldState.error]} />
            </div>
          )}
        />

        <Controller
          control={form.control}
          name="username"
          render={({ field, fieldState }) => (
            <div className="space-y-1">
              <InputGroup className={inputClass}>
                <InputGroupInput
                  {...field}
                  placeholder="Username"
                  autoComplete="off"
                  aria-invalid={!!fieldState.error}
                />
                <InputGroupAddon align="inline-end">
                  <AtSign size={17} />
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={[fieldState.error]} />
            </div>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <div className="space-y-1">
                <InputGroup className={inputClass}>
                  <InputGroupInput
                    {...field}
                    type={isVisible ? "text" : "password"}
                    placeholder="Kata Sandi"
                    autoComplete="new-password"
                    aria-invalid={!!fieldState.error}
                  />
                  <InputGroupAddon
                    align="inline-end"
                    className="cursor-pointer"
                    onClick={() => setIsVisible((v) => !v)}
                  >
                    {isVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                  </InputGroupAddon>
                </InputGroup>
                <FieldError errors={[fieldState.error]} />
              </div>
            )}
          />

          <Controller
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <div className="space-y-1">
                <InputGroup className={inputClass}>
                  <InputGroupInput
                    {...field}
                    type={isConfirmVisible ? "text" : "password"}
                    placeholder="Konfirmasi Kata Sandi"
                    autoComplete="new-password"
                    aria-invalid={!!fieldState.error}
                  />
                  <InputGroupAddon
                    align="inline-end"
                    className="cursor-pointer"
                    onClick={() => setIsConfirmVisible((v) => !v)}
                  >
                    {isConfirmVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                  </InputGroupAddon>
                </InputGroup>
                <FieldError errors={[fieldState.error]} />
              </div>
            )}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending || !loaded}
        className="mt-6 h-12 w-full text-sm font-semibold tracking-widest uppercase"
      >
        {isPending ? <Spinner /> : "Daftar"}
      </Button>
    </form>
  );
}
