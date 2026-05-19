import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "../components/ui/sonner";
import Providers from "../providers/Providers";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Laporan Meteran Air | PDAM Tirta Musi",
  description: "Layanan Pelaporan Meteran Air PDAM Tirta Musi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body suppressHydrationWarning className={montserrat.className}>
        <Providers>
          <Toaster richColors position="top-right" />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
