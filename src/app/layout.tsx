import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KasAdmin - Manajemen Uang Kas Kelas",
  description: "Sistem manajemen uang kas kelas yang modern dan transparan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`h-full ${inter.variable}`}>
      <body className={`min-h-full flex flex-col antialiased ${inter.className}`}>{children}</body>
    </html>
  );
}
