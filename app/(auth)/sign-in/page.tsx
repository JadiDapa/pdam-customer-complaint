import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SignInForm from "@/components/auth/sign-in/SignInForm";
import SignInCarousel from "@/components/auth/sign-in/SignInCarousel";
import { UserService } from "@/servers/services/user.service";

export default async function SignInPage() {
  const { userId } = await auth();

  if (userId) {
    const clerkUser = await currentUser();
    if (clerkUser?.username) {
      const dbUser = await UserService.getByUsername(clerkUser.username);
      if (dbUser) redirect("/");
    }
    // Authenticated in Clerk but no username or missing DB record —
    // fall through to show the sign-in form and avoid a redirect loop
  }

  return (
    <main className="bg-primary flex min-h-screen items-center justify-center p-4 lg:p-12 lg:px-40">
      <div className="bg-background flex w-full overflow-hidden rounded-xl shadow-2xl lg:h-[calc(100dvh-6rem)]">
        {/* Left: Form panel */}
        <div className="flex h-full w-full flex-col items-center justify-between px-6 py-12 sm:px-12 sm:py-16 lg:flex-2 lg:px-24 lg:py-28">
          <p className="text-primary text-2xl font-semibold tracking-wide">
            Pengaduan PDAM
          </p>
          <p className="text-primary text-lg tracking-wide">Tirta Musi</p>

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
