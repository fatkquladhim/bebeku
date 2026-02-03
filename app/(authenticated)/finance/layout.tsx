import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keuangan",
  description: "Pencatatan dan analisis keuangan peternakan - pemasukan, pengeluaran, dan profit",
};

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
