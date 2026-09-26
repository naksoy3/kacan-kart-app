import type { Metadata } from "next";
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${baloo.variable} ${inter.variable}`}>
      <body className="font-govde antialiased min-h-screen">{children}</body>
    </html>
  );
}