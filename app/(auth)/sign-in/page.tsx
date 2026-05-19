import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SignInForm from "@/components/auth/sign-in/SignInForm";
import SignInCarousel from "@/components/auth/sign-in/SignInCarousel";
import Link from "next/link";

export default async function SignInPage() {
  const { isAuthenticated } = await auth();

  if (isAuthenticated) redirect("/");

  return (
    <main className="bg-primary flex h-screen items-center justify-center p-12 px-40">
      <div className="bg-background flex h-full w-full overflow-hidden rounded-xl shadow-2xl">
        {/* Left: Form panel */}
        <div className="flex w-full flex-2 flex-col items-center px-24 py-28">
          <p className="text-primary text-xl font-bold tracking-wide">
            Pengaduan PDAM
          </p>

          <div className="mt-10 flex items-baseline gap-4">
            <h1 className="text-2xl font-semibold">Ayo Masuk!</h1>
          </div>

          <p className="text-muted-foreground mt-1 text-sm">
            Silahkan masuk sebelum melangkah lebih lanjut
          </p>

          <SignInForm />

          <p className="text-muted-foreground mt-auto pt-8 text-center text-xs">
            © {new Date().getFullYear()} PDAM. All Rights Reserved
          </p>
        </div>

        <SignInCarousel />
      </div>
    </main>
  );
}
