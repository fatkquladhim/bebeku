import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Kandang",
  description: "Kelola data kandang dan kapasitas peternakan bebek",
};

export default function BarnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
