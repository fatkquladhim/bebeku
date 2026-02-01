"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  getFinanceRecords,
  createFinanceRecord,
  getFinanceSummary,
} from "@/lib/actions/finance";
import { getBatches } from "@/lib/actions/batches";
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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Plus, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils/calculations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const expenseCategories = [
  { value: "doc", label: "DOC (Anak Bebek)" },
  { value: "pakan", label: "Pakan" },
  { value: "obat", label: "Obat-obatan" },
  { value: "tenaga_kerja", label: "Tenaga Kerja" },
  { value: "listrik", label: "Listrik" },
  { value: "peralatan", label: "Peralatan" },
  { value: "lainnya", label: "Lainnya" },
];

const incomeCategories = [
  { value: "penjualan_bebek", label: "Penjualan Bebek" },
  { value: "penjualan_telur", label: "Penjualan Telur" },
  { value: "penjualan_limbah", label: "Penjualan Limbah" },
  { value: "lainnya", label: "Lainnya" },
];

export default function FinancePage() {
  const { data: records, mutate } = useSWR("financeRecords", getFinanceRecords);
  const { data: summary } = useSWR("financeSummary", () =>
    getFinanceSummary()
  );
  const { data: batches } = useSWR("batches", getBatches);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const batchIdValue = formData.get("batchId") as string;
      await createFinanceRecord({
        batchId: batchIdValue === "none" ? null : batchIdValue,
        transactionDate: date,
        type: transactionType,
        category: formData.get("category") as string,
        amount: parseFloat(formData.get("amount") as string),
        description: formData.get("description") as string,
      });

      toast.success("Transaksi berhasil disimpan!");
      setShowForm(false);
      mutate();
    } catch (error) {
      toast.error("Gagal menyimpan transaksi. Silakan coba lagi.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const chartData = summary?.byCategory.map((item) => ({
    name: item.category,
    amount: item.amount,
    type: item.type,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Keuangan</h1>
          <p className="text-muted-foreground">
            Catat dan pantau pemasukan & pengeluaran
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? "Batal" : "Tambah Transaksi"}
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Total Pemasukan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.income)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                Total Pengeluaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.expense)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Saldo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  summary.balance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(summary.balance)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Tambah Transaksi</CardTitle>
            <CardDescription>Catat pemasukan atau pengeluaran</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipe Transaksi</Label>
                  <Select
                    value={transactionType}
                    onValueChange={(value: "income" | "expense") =>
                      setTransactionType(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Pemasukan</SelectItem>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
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

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {(transactionType === "expense"
                        ? expenseCategories
                        : incomeCategories
                      ).map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Jumlah (Rp)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    min={0}
                    required
                    placeholder="100000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Batch (Opsional)</Label>
                <Select name="batchId">
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih batch (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Umum</SelectItem>
                    {batches?.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Keterangan</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Keterangan transaksi"
                />
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      {chartData && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Grafik Keuangan per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#8884d8"
                    name="Jumlah"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          {!records ? (
            <p className="text-center py-4">Memuat data...</p>
          ) : records.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {format(new Date(record.transactionDate), "dd MMM yyyy", {
                          locale: id,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.type === "income" ? "default" : "destructive"
                          }
                        >
                          {record.type === "income" ? "Pemasukan" : "Pengeluaran"}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        {record.category.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell>{record.batch?.code || "Umum"}</TableCell>
                      <TableCell
                        className={`font-medium ${
                          record.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {record.type === "income" ? "+" : "-"}
                        {formatCurrency(record.amount)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {record.description || "-"}
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
