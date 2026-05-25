import type { Metadata } from "next";
import { Geist_Mono, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { PriceTicker } from "@/components/layout/PriceTicker";
import { Footer } from "@/components/layout/Footer";
import { SearchOverlay } from "@/components/layout/SearchOverlay";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "REKT — Crypto Intelligence",
  description: "Track crypto prices, manage your portfolio, and discover agent-native opportunities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${geistSans.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <Providers>
          <Navbar />
          <PriceTicker />
          <main className="flex-1">{children}</main>
          <Footer />
          <SearchOverlay />
        </Providers>
      </body>
    </html>
  );
}
