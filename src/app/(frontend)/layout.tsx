import config from "@payload-config";
import type { Metadata } from "next";
import { Archivo, Archivo_Black, Lily_Script_One, Poppins } from "next/font/google";
import localFont from "next/font/local";
import { getPayload } from "payload";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
});

const lilyScriptOne = Lily_Script_One({
  variable: "--font-lily",
  subsets: ["latin"],
  weight: "400",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Elementor custom font "Marker" (Atomic Marker) — blauwe schetsannotaties
const marker = localFont({
  src: "../../fonts/atomic-marker-regular.woff2",
  variable: "--font-marker",
});

// Elementor custom font "Handwritten" (Feisty) — handgeschreven accenten/namen
const handwritten = localFont({
  src: "../../fonts/feisty.woff2",
  variable: "--font-handwritten",
});

export const metadata: Metadata = {
  title: { default: "Human Margin", template: "%s - Human Margin" },
  icons: {
    icon: [
      { url: "/seo/human-margin-favicon-full-color-rgb-900px-w-72ppi-150x150.png", sizes: "32x32" },
      { url: "/seo/human-margin-favicon-full-color-rgb-900px-w-72ppi-300x300.png", sizes: "192x192" },
    ],
    apple: "/seo/human-margin-favicon-full-color-rgb-900px-w-72ppi-300x300.png",
  },
  openGraph: { locale: "nl_NL", type: "website", siteName: "Human Margin" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const payload = await getPayload({ config });
  const [header, footer] = await Promise.all([
    payload.findGlobal({ slug: "header" }),
    payload.findGlobal({ slug: "footer" }),
  ]);

  return (
    <html
      lang="nl"
      className={`${archivo.variable} ${archivoBlack.variable} ${marker.variable} ${handwritten.variable} ${lilyScriptOne.variable} ${poppins.variable} h-full antialiased`}
    >
      {/* Geen sticky footer: net als humanmargin.eu stapelt de inhoud bovenaan en
          valt de resterende viewport-hoogte als witruimte ónder de footer (body
          min-height 100vh, geen flex-1 die de main oprekt). */}
      <body className="min-h-full">
        <SiteHeader header={header} />
        <main>{children}</main>
        <SiteFooter footer={footer} />
      </body>
    </html>
  );
}
