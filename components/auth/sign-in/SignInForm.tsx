"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useSignIn } from "@clerk/nextjs";
import { toast } from "sonner";
import { Eye, EyeOff, User } from "lucide-react";
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

const loginSchema = z.object({
  username: z.string().min(1, "Username tidak boleh kosong"),
  password: z.string().min(1, "Password tidak boleh kosong"),
});

type LoginFormType = z.infer<typeof loginSchema>;

export default function SignInForm() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { signIn } = useSignIn();
  const { setActive, loaded } = useClerk();
  const router = useRouter();

  const form = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(values: LoginFormType) {
    startTransition(async () => {
      if (!loaded) return;

      try {
        const identifier = /^\d+$/.test(values.username)
          ? `p${values.username}`
          : values.username;

        const { error } = await signIn.password({
          identifier,
          password: values.password,
        });

        if (error) {
          toast.error("Kombinasi username dan password salah");
          console.error(error);
          return;
        }

        if (signIn.status === "complete") {
          await signIn.finalize({
            navigate: ({ decorateUrl }) => {
              router.push(decorateUrl("/"));
            },
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Login gagal, coba lagi");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 w-full">
      <div className="space-y-4">
        <Controller
          control={form.control}
          name="username"
          render={({ field, fieldState }) => (
            <div className="space-y-1">
              <InputGroup className="h-12 bg-muted/60 border-transparent focus-within:border-ring focus-within:bg-background">
                <InputGroupInput
                  {...field}
                  placeholder="Username"
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
          name="password"
          render={({ field, fieldState }) => (
            <div className="space-y-1">
              <InputGroup className="h-12 bg-muted/60 border-transparent focus-within:border-ring focus-within:bg-background">
                <InputGroupInput
                  {...field}
                  type={isVisible ? "text" : "password"}
                  placeholder="Kata Sandi"
                  autoComplete="off"
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
      </div>

      <Button
        type="submit"
        disabled={isPending || !loaded}
        className="mt-6 h-12 w-full text-sm font-semibold tracking-widest uppercase"
      >
        {isPending ? <Spinner /> : "Masuk"}
      </Button>
    </form>
  );
}
