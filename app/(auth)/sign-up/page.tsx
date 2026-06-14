import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignUpForm from "@/components/auth/sign-up/SignUpForm";
import SignInCarousel from "@/components/auth/sign-in/SignInCarousel";
import { UserService } from "@/servers/services/user.service";

export default async function SignUpPage() {
  const { userId } = await auth();

  if (userId) {
    const clerkUser = await currentUser();
    if (clerkUser?.username) {
      const dbUser = await UserService.getByUsername(clerkUser.username);
      if (dbUser) redirect("/");
    }
  }

  return (
    <main className="bg-primary flex min-h-screen items-center justify-center p-4 lg:p-12 lg:px-40">
      <div className="bg-background flex w-full overflow-hidden rounded-xl shadow-2xl lg:h-[calc(100dvh-6rem)]">
        {/* Left: Carousel (flipped from sign-in) */}
        <SignInCarousel />

        {/* Right: Form panel */}
        <div className="flex h-full w-full flex-col items-center justify-between overflow-y-auto px-6 py-12 sm:px-12 sm:py-16 lg:flex-2 lg:px-24 lg:py-20">
          <p className="text-primary text-2xl font-semibold tracking-wide">
            Pengaduan PDAM
          </p>
          <p className="text-primary text-lg tracking-wide">Tirta Musi</p>

          <div className="mt-10 flex items-baseline gap-4">
            <h1 className="text-2xl font-semibold">Ayo Daftar!</h1>
          </div>

          <p className="text-muted-foreground mt-1 text-sm">
            Buat akun untuk melaporkan gangguan air Anda
          </p>

          <SignUpForm />

          <p className="text-muted-foreground mt-6 text-center text-sm">
            Sudah punya akun?{" "}
            <Link href="/sign-in" className="text-primary font-medium hover:underline">
              Masuk
            </Link>
          </p>

          <p className="text-muted-foreground mt-auto pt-8 text-center text-xs">
            © {new Date().getFullYear()} PDAM. All Rights Reserved
          </p>
        </div>
      </div>
    </main>
  );
}
