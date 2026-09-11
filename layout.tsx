import type { Metadata } from "next";
import { Archivo, Manrope } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-archivo",
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: `${site.name} — Türk BoxMining Sunucusu`,
  description: `${site.tagline} ${site.ip} adresinden bağlan. ${site.version}.`,
  openGraph: {
    title: `${site.name} — ${site.mode}`,
    description: `${site.tagline} IP: ${site.ip}`,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${archivo.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
