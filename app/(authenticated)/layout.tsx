import { Sidebar } from "@/components/sidebar";
import { LogoutButton } from "@/components/logout-button";

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="flex justify-end mb-4">
            <LogoutButton />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
