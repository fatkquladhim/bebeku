import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Pakan",
  description: "Kelola inventori pakan dan monitoring stok pakan peternakan",
};

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
