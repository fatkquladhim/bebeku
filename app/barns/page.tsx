"use client";

import { useState } from "react";
import useSWR from "swr";
import { getBarns, createBarn, deleteBarn } from "@/lib/actions/barns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Warehouse } from "lucide-react";
import { toast } from "sonner";

export default function BarnsPage() {
  const { data: barns, mutate } = useSWR("barns", getBarns);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      await createBarn({
        name: formData.get("name") as string,
        capacity: parseInt(formData.get("capacity") as string),
        location: formData.get("location") as string,
        description: formData.get("description") as string,
        status: "active",
      });

      toast.success("Kandang berhasil ditambahkan!");
      setDialogOpen(false);
      mutate();
    } catch (error) {
      toast.error("Gagal menambahkan kandang. Silakan coba lagi.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus kandang ini?")) return;

    try {
      await deleteBarn(id);
      toast.success("Kandang berhasil dihapus!");
      mutate();
    } catch (error) {
      toast.error("Gagal menghapus kandang. Pastikan tidak ada batch aktif.");
      console.error(error);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Aktif</Badge>;
      case "inactive":
        return <Badge variant="secondary">Nonaktif</Badge>;
      case "maintenance":
        return <Badge variant="destructive">Perbaikan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Kandang</h1>
          <p className="text-muted-foreground">
            Kelola data kandang dan kapasitas
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kandang
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kandang Baru</DialogTitle>
              <DialogDescription>
                Isi informasi kandang baru
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Kandang</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Contoh: Kandang Utara"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Kapasitas (ekor)</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min={1}
                  placeholder="1000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lokasi</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Contoh: Blok A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Deskripsi kandang (opsional)"
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kandang</CardTitle>
          <CardDescription>
            Total {barns?.length || 0} kandang terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!barns ? (
            <p className="text-center py-4">Memuat data...</p>
          ) : barns.length === 0 ? (
            <div className="text-center py-8">
              <Warehouse className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Belum ada kandang. Tambahkan kandang pertama Anda!
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Kandang
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kapasitas</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {barns.map((barn) => (
                    <TableRow key={barn.id}>
                      <TableCell className="font-medium">{barn.code}</TableCell>
                      <TableCell>{barn.name}</TableCell>
                      <TableCell>{barn.capacity.toLocaleString()} ekor</TableCell>
                      <TableCell>{barn.location || "-"}</TableCell>
                      <TableCell>{getStatusBadge(barn.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(barn.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
