// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PWARegister from "@/components/pwa-register"; // <-- registers the service worker

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pediatric Arrest Calculator (WAAFELSS)",
  description: "Bedside pediatric resuscitation calculator with offline support.",
  // These lines make the manifest & icons available to the browser:
  themeColor: "#111827",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* No manual <head> needed — metadata above handles it */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PWARegister />  {/* <-- this registers /sw.js (only in production) */}
        {children}
      </body>
    </html>
  );
}
