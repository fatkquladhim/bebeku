"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Logout berhasil");
        router.push("/peternak-masuk");
        router.refresh();
      } else {
        toast.error("Gagal logout");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="text-muted-foreground hover:text-destructive"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Keluar
    </Button>
  );
}
