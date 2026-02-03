"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  getFeedInventory,
  createFeedInventory,
  addStockMovement,
  getLowStockAlerts,
} from "@/lib/actions/feed";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, AlertTriangle, Wheat } from "lucide-react";
import { toast } from "sonner";

export default function FeedPage() {
  const { data: feeds, mutate } = useSWR("feeds", getFeedInventory);
  const { data: lowStockAlerts } = useSWR("lowStock", getLowStockAlerts);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      await createFeedInventory({
        name: formData.get("name") as string,
        type: formData.get("type") as string,
        proteinContent: formData.get("proteinContent") as string,
        currentStockKg: parseFloat(formData.get("currentStockKg") as string) || 0,
        minStockAlert: parseFloat(formData.get("minStockAlert") as string) || 100,
        unitPrice: parseFloat(formData.get("unitPrice") as string) || 0,
        supplier: formData.get("supplier") as string,
        notes: formData.get("notes") as string,
      });

      toast.success("Pakan berhasil ditambahkan!");
      setDialogOpen(false);
      mutate();
    } catch (error) {
      toast.error("Gagal menambahkan pakan. Silakan coba lagi.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function onAddStock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFeed) return;

    setIsLoading(true);
    const formData = new FormData(event.currentTarget);

    try {
      await addStockMovement({
        feedId: selectedFeed,
        type: "in",
        quantityKg: parseFloat(formData.get("quantityKg") as string),
        date: new Date(),
        notes: formData.get("notes") as string,
      });

      toast.success("Stok pakan berhasil ditambahkan!");
      setStockDialogOpen(false);
      mutate();
    } catch (error) {
      toast.error("Gagal menambahkan stok. Silakan coba lagi.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Pakan</h1>
          <p className="text-muted-foreground">
            Kelola stok dan inventaris pakan
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pakan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Jenis Pakan</DialogTitle>
              <DialogDescription>
                Tambahkan jenis pakan baru ke inventaris
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Pakan</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Contoh: BR-1 Starter"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipe</Label>
                <Select name="type">
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="grower">Grower</SelectItem>
                    <SelectItem value="finisher">Finisher</SelectItem>
                    <SelectItem value="layer">Layer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proteinContent">Kandungan Protein</Label>
                <Input
                  id="proteinContent"
                  name="proteinContent"
                  placeholder="Contoh: 21%"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentStockKg">Stok Awal (kg)</Label>
                  <Input
                    id="currentStockKg"
                    name="currentStockKg"
                    type="number"
                    step="0.1"
                    min={0}
                    defaultValue={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minStockAlert">Batas Minimum (kg)</Label>
                  <Input
                    id="minStockAlert"
                    name="minStockAlert"
                    type="number"
                    step="0.1"
                    min={0}
                    defaultValue={100}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitPrice">Harga per kg (Rp)</Label>
                <Input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  min={0}
                  placeholder="8000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  name="supplier"
                  placeholder="Nama supplier"
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts && lowStockAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Peringatan Stok Menipis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {lowStockAlerts.map((feed) => (
                <li
                  key={feed.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {feed.name}: {feed.currentStockKg} kg (min: {feed.minStockAlert} kg)
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedFeed(feed.id);
                      setStockDialogOpen(true);
                    }}
                  >
                    Tambah Stok
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Feed Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventaris Pakan</CardTitle>
          <CardDescription>
            Total {feeds?.length || 0} jenis pakan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!feeds ? (
            <p className="text-center py-4">Memuat data...</p>
          ) : feeds.length === 0 ? (
            <div className="text-center py-8">
              <Wheat className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Belum ada data pakan. Tambahkan pakan pertama!
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Pakan
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Protein</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Harga/kg</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeds.map((feed) => (
                    <TableRow key={feed.id}>
                      <TableCell className="font-medium">{feed.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{feed.type}</Badge>
                      </TableCell>
                      <TableCell>{feed.proteinContent || "-"}</TableCell>
                      <TableCell>
                        <span
                          className={
                            feed.currentStockKg <= feed.minStockAlert
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          {feed.currentStockKg} kg
                        </span>
                      </TableCell>
                      <TableCell>
                        {feed.unitPrice
                          ? `Rp ${feed.unitPrice.toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell>{feed.supplier || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedFeed(feed.id);
                            setStockDialogOpen(true);
                          }}
                        >
                          Tambah Stok
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

      {/* Add Stock Dialog */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Stok Pakan</DialogTitle>
            <DialogDescription>
              Tambahkan stok masuk untuk pakan
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onAddStock} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantityKg">Jumlah (kg)</Label>
              <Input
                id="quantityKg"
                name="quantityKg"
                type="number"
                step="0.1"
                min={0.1}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Catatan pembelian"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Menyimpan..." : "Tambah Stok"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
