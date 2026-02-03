import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chatbot Asisten",
  description: "Asisten AI untuk perhitungan dan konsultasi peternakan bebek",
};

export default function ChatbotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
