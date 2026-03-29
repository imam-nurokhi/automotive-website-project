import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoFlow - Sistem Manajemen Bengkel Premium",
  description:
    "Platform manajemen bengkel otomotif komprehensif dengan portal pelanggan dan CMS internal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

