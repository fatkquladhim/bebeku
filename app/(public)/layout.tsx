import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bebeku - Peternakan Bebek Berkualitas",
  description: "Peternakan bebek terpercaya dengan pengalaman bertahun-tahun. Menyediakan telur segar, daging bebek, dan DOC berkualitas.",
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
