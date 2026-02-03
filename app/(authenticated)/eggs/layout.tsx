import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Produksi Telur",
  description: "Pencatatan dan monitoring produksi telur bebek harian",
};

export default function EggsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
