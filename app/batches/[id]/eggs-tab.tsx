"use client";

import { useState } from "react";
import { createEggRecord } from "@/lib/actions/eggs";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { EggRecord } from "@/lib/db/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface EggsTabProps {
  batchId: string;
  records: EggRecord[];
}

export function EggsTab({ batchId, records }: EggsTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    const totalEggs =
      parseInt(formData.get("goodEggs") as string) || 0 +
      parseInt(formData.get("damagedEggs") as string) || 0 +
      parseInt(formData.get("smallEggs") as string) || 0;

    try {
      await createEggRecord({
        batchId,
        recordDate: date,
        totalEggs,
        goodEggs: parseInt(formData.get("goodEggs") as string) || 0,
        damagedEggs: parseInt(formData.get("damagedEggs") as string) || 0,
        smallEggs: parseInt(formData.get("smallEggs") as string) || 0,
        notes: formData.get("notes") as string,
      });

      toast.success("Data produksi telur berhasil disimpan!");
      setShowForm(false);
      window.location.reload();
    } catch (error) {
      toast.error("Gagal menyimpan data. Silakan coba lagi.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // Prepare chart data
  const chartData = [...records]
    .sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime())
    .slice(-14) // Last 14 days
    .map((record) => ({
      date: format(new Date(record.recordDate), "dd/MM"),
      good: record.goodEggs,
      damaged: record.damagedEggs,
      small: record.smallEggs,
    }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Produksi Telur</h3>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? "Batal" : "Tambah Data"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Form Produksi Telur</CardTitle>
            <CardDescription>Catat hasil produksi telur harian</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? (
                        format(date, "PPP", { locale: id })
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="goodEggs">Telur Bagus (butir)</Label>
                  <Input
                    id="goodEggs"
                    name="goodEggs"
                    type="number"
                    min={0}
                    defaultValue={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="damagedEggs">Telur Rusak (butir)</Label>
                  <Input
                    id="damagedEggs"
                    name="damagedEggs"
                    type="number"
                    min={0}
                    defaultValue={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smallEggs">Telur Kecil (butir)</Label>
                  <Input
                    id="smallEggs"
                    name="smallEggs"
                    type="number"
                    min={0}
                    defaultValue={0}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Catatan tambahan"
                />
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Grafik Produksi Telur (14 Hari Terakhir)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="good" name="Bagus" fill="#22c55e" />
                  <Bar dataKey="damaged" name="Rusak" fill="#ef4444" />
                  <Bar dataKey="small" name="Kecil" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Produksi</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Belum ada data produksi telur
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-green-600">Bagus</TableHead>
                    <TableHead className="text-red-600">Rusak</TableHead>
                    <TableHead className="text-yellow-600">Kecil</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {format(new Date(record.recordDate), "dd MMM yyyy", {
                          locale: id,
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.totalEggs} butir
                      </TableCell>
                      <TableCell className="text-green-600">
                        {record.goodEggs}
                      </TableCell>
                      <TableCell className="text-red-600">
                        {record.damagedEggs}
                      </TableCell>
                      <TableCell className="text-yellow-600">
                        {record.smallEggs}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {record.notes || "-"}
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
