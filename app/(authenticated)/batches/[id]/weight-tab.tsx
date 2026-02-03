"use client";

import { useState } from "react";
import { createWeightRecord } from "@/lib/actions/weight";
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
import type { WeightRecord } from "@/lib/db/schema";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WeightTabProps {
  batchId: string;
  records: WeightRecord[];
}

export function WeightTab({ batchId, records }: WeightTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      await createWeightRecord({
        batchId,
        recordDate: date,
        averageWeightGr: parseFloat(formData.get("averageWeightGr") as string),
        sampleSize: parseInt(formData.get("sampleSize") as string) || 10,
        birdAgeDays: parseInt(formData.get("birdAgeDays") as string),
        notes: formData.get("notes") as string,
      });

      toast.success("Data berat badan berhasil disimpan!");
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
    .sort((a, b) => a.birdAgeDays - b.birdAgeDays)
    .map((record) => ({
      age: record.birdAgeDays,
      weight: record.averageWeightGr,
    }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Pencatatan Berat Badan</h3>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? "Batal" : "Tambah Data"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Form Sampling Berat</CardTitle>
            <CardDescription>Catat hasil timbang sampling</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
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

                <div className="space-y-2">
                  <Label htmlFor="birdAgeDays">Umur Bebek (hari)</Label>
                  <Input
                    id="birdAgeDays"
                    name="birdAgeDays"
                    type="number"
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="averageWeightGr">Berat Rata-rata (gram)</Label>
                  <Input
                    id="averageWeightGr"
                    name="averageWeightGr"
                    type="number"
                    step="0.1"
                    min={1}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sampleSize">Jumlah Sampel (ekor)</Label>
                  <Input
                    id="sampleSize"
                    name="sampleSize"
                    type="number"
                    min={1}
                    defaultValue={10}
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
            <CardTitle>Grafik Pertumbuhan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="age"
                    label={{ value: "Umur (hari)", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis
                    label={{ value: "Berat (gram)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} gram`, "Berat"]}
                    labelFormatter={(label) => `Umur: ${label} hari`}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: "#2563eb" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Timbang</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Belum ada data timbangan
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Umur</TableHead>
                    <TableHead>Berat Rata-rata</TableHead>
                    <TableHead>Jumlah Sampel</TableHead>
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
                      <TableCell>{record.birdAgeDays} hari</TableCell>
                      <TableCell className="font-medium">
                        {record.averageWeightGr} gram
                      </TableCell>
                      <TableCell>{record.sampleSize} ekor</TableCell>
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
