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
        <nav className="fixed left-8 top-4 z-50 flex w-36 flex-col gap-2">
          <a
            href="/"
            className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900/90 px-3 text-xs font-semibold text-slate-200 shadow-lg backdrop-blur transition hover:bg-slate-800"
          >
            Anasayfa
          </a>
          <Link
            href="/bildirimler"
            className="h-10 rounded-xl border border-white/10 bg-slate-900/90 px-3 text-xs font-semibold text-slate-200 shadow-lg backdrop-blur transition hover:bg-slate-800"
          >
            Bildirimler
          </Link>
          <button
            type="button"
            className="h-10 rounded-xl border border-white/10 bg-slate-900/90 px-3 text-xs font-semibold text-slate-200 shadow-lg backdrop-blur transition hover:bg-slate-800"
          >
            Mesajlar
          </button>
        </nav>
        {children}
      </body>
    </html>
  );
}