import type { Metadata } from "next";
import Link from "next/link";
import { Baloo_2, Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import SiteHeader from "@/components/SiteHeader";
import { LanguageProvider } from "@/components/LanguageProvider";

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
  title: "Kaçan Kart | Soru kartı, istediğin cevabı al.",
  description: "Sevdiklerine eğlenceli, kişiye özel soru kartları gönder. Hayır butonu kaçar, evet cevabı konfetiyle gelir!",
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Kaçan Kart | Soru kartı, istediğin cevabı al.",
    description: "Sevdiklerine eğlenceli, kişiye özel soru kartları gönder. Hayır butonu kaçar, evet cevabı konfetiyle gelir!",
    siteName: "Kaçan Kart",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Cardasks" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaçan Kart | Soru kartı, istediğin cevabı al.",
    description: "Sevdiklerine eğlenceli, kişiye özel soru kartları gönder. Hayır butonu kaçar, evet cevabı konfetiyle gelir!",
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
        <LanguageProvider>
          <SiteHeader />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}