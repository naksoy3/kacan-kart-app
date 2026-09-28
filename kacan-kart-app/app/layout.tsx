import type { Metadata } from "next";
import Link from "next/link";
import { Baloo_2, Inter } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-baloo",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Cardasks ile soru gönder",
  description: "Cardasks platformu üzerinden kolayca soru gönderin ve yönetin.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${baloo.variable} ${inter.variable}`}>
      <body className="font-govde antialiased min-h-screen">
        <nav className="fixed left-2 top-2 z-50 flex w-[calc(100%-1rem)] flex-row gap-2 sm:left-8 sm:top-4 sm:w-36 sm:flex-col">
          <a
            href="/"
            className="flex h-10 flex-1 items-center justify-center rounded-xl border border-white/10 bg-slate-900/90 px-3 text-xs font-semibold text-slate-200 shadow-lg backdrop-blur transition hover:bg-slate-800 sm:flex-none"
          >
            Anasayfa
          </a>
          <Link
            href="/bildirimler"
            className="flex h-10 flex-1 items-center justify-center rounded-xl border border-white/10 bg-slate-900/90 px-3 text-xs font-semibold text-slate-200 shadow-lg backdrop-blur transition hover:bg-slate-800 sm:flex-none"
          >
            Bildirimler
          </Link>
          <Link
            href="/mesajlar"
            className="flex h-10 flex-1 items-center justify-center rounded-xl border border-white/10 bg-slate-900/90 px-3 text-xs font-semibold text-slate-200 shadow-lg backdrop-blur transition hover:bg-slate-800 sm:flex-none"
          >
            Mesajlar
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}