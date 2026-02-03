import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Batch Baru",
  description: "Tambah batch bebek baru ke sistem manajemen peternakan",
};

export default function NewBatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
