import type { Metadata } from "next";
import Link from "next/link";
import { Baloo_2, Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import SiteHeader from "@/components/SiteHeader";

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
  metadataBase: new URL("https://cardasks.com"),
  title: "Cardasks ile soru gönder",
  description: "Cardasks platformu üzerinden kolayca soru gönderin ve yönetin.",
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Cardasks ile soru gönder",
    description: "Sana özel bir soru kartı 💌",
    siteName: "Cardasks",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Cardasks" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cardasks ile soru gönder",
    description: "Sana özel bir soru kartı 💌",
    images: ["/opengraph-image"],
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
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}