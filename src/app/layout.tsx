import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
