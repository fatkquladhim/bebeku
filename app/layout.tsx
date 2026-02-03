import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Bebeku",
    template: "%s | Bebeku",
  },
  description: "Aplikasi manajemen peternakan bebek untuk tracking batch, pencatatan harian, dan analisis performa",
  keywords: ["peternakan bebek", "manajemen peternakan", "tracking batch", "telur bebek", "dashboard peternakan"],
  authors: [{ name: "Bebeku" }],
  creator: "Bebeku",
  publisher: "Bebeku",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Bebeku - Manajemen Peternakan Bebek",
    description: "Aplikasi manajemen peternakan bebek untuk tracking batch, pencatatan harian, dan analisis performa",
    type: "website",
    locale: "id_ID",
    siteName: "Bebeku",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bebeku - Manajemen Peternakan Bebek",
    description: "Aplikasi manajemen peternakan bebek untuk tracking batch, pencatatan harian, dan analisis performa",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/duck-icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/duck-icon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
