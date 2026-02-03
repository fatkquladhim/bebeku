"use client";

import { useState } from "react";
import useSWR from "swr";
import { getEggRecords, createEggRecord, getEggProductionSummary } from "@/lib/actions/eggs";
import { getActiveBatches } from "@/lib/actions/batches";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Plus, Egg } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function EggsPage() {
  const { data: eggRecords, mutate } = useSWR("eggRecords", getEggRecords);
  const { data: batches } = useSWR("activeBatches", getActiveBatches);
  const { data: summary } = useSWR("eggSummary", () => getEggProductionSummary());
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState<Date>(new Date());

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    const goodEggs = parseInt(formData.get("goodEggs") as string) || 0;
    const damagedEggs = parseInt(formData.get("damagedEggs") as string) || 0;
    const smallEggs = parseInt(formData.get("smallEggs") as string) || 0;
    const totalEggs = goodEggs + damagedEggs + smallEggs;

    try {
      await createEggRecord({
        batchId: formData.get("batchId") as string,
        recordDate: date,
        totalEggs,
        goodEggs,
        damagedEggs,
        smallEggs,
        notes: formData.get("notes") as string,
      });

      toast.success("Data produksi telur berhasil disimpan!");
      setShowForm(false);
      mutate();
    } catch (error) {
      toast.error("Gagal menyimpan data. Silakan coba lagi.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const pieData = summary
    ? [
        { name: "Bagus", value: summary.goodEggs, color: "#22c55e" },
        { name: "Rusak", value: summary.damagedEggs, color: "#ef4444" },
        { name: "Kecil", value: summary.smallEggs, color: "#f59e0b" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produksi Telur</h1>
          <p className="text-muted-foreground">
            Catat dan pantau produksi telur harian
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? "Batal" : "Tambah Data"}
        </Button>
      </div>

      {/* Stats Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Telur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalEggs}</div>
              <p className="text-xs text-muted-foreground">butir</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                Telur Bagus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.goodEggs}</div>
              <p className="text-xs text-muted-foreground">
                {summary.goodRate}% dari total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">
                Telur Rusak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.damagedEggs}</div>
              <p className="text-xs text-muted-foreground">
                {summary.damagedRate}% dari total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">
                Telur Kecil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.smallEggs}</div>
              <p className="text-xs text-muted-foreground">butir</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Form Produksi Telur</CardTitle>
            <CardDescription>Catat hasil produksi telur</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Batch</Label>
                  <Select name="batchId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches?.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.code} - {batch.name || "Batch"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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

      {/* Charts */}
      {summary && summary.byDate.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Grafik Produksi Harian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.byDate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        format(new Date(value), "dd/MM")
                      }
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="goodEggs" name="Bagus" fill="#22c55e" />
                    <Bar dataKey="damagedEggs" name="Rusak" fill="#ef4444" />
                    <Bar dataKey="smallEggs" name="Kecil" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Komposisi Telur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Produksi</CardTitle>
        </CardHeader>
        <CardContent>
          {!eggRecords ? (
            <p className="text-center py-4">Memuat data...</p>
          ) : eggRecords.length === 0 ? (
            <div className="text-center py-8">
              <Egg className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Belum ada data produksi telur
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-green-600">Bagus</TableHead>
                    <TableHead className="text-red-600">Rusak</TableHead>
                    <TableHead className="text-yellow-600">Kecil</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eggRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {format(new Date(record.recordDate), "dd MMM yyyy", {
                          locale: id,
                        })}
                      </TableCell>
                      <TableCell>{record.batch?.code || "-"}</TableCell>
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
