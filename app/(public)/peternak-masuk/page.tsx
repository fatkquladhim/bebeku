"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Egg, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Login berhasil!");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(data.error || "Login gagal. Periksa kembali username dan password.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-in slide-in-from-top duration-700">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Egg className="w-9 h-9 text-gray-800" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Area Peternak</h1>
          <p className="text-gray-600">Masuk untuk mengelola peternakan Anda</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 animate-in slide-in-from-bottom duration-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-900 font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                className="h-12 border-gray-200 focus:border-gray-800 focus:ring-gray-800 rounded-lg transition-all duration-200 hover:border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900 font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="h-12 pr-10 border-gray-200 focus:border-gray-800 focus:ring-gray-800 rounded-lg transition-all duration-200 hover:border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Masuk
                </span>
              )}
            </Button>
          </form>

          {/* Back to home */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center animate-in fade-in duration-1000">
          <p className="text-sm text-gray-500">
            Area khusus peternak. Tidak memiliki akses?{" "}
            <Link href="/" className="text-gray-800 hover:text-gray-900 font-medium transition-colors duration-200">
              Hubungi kami
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
