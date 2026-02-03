"use client";

import { useState } from "react";
import { createDailyRecord } from "@/lib/actions/daily-records";
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
import type { DailyRecord } from "@/lib/db/schema";

interface DailyRecordsTabProps {
  batchId: string;
  records: DailyRecord[];
}

export function DailyRecordsTab({ batchId, records }: DailyRecordsTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      await createDailyRecord({
        batchId,
        recordDate: date,
        mortalityCount: parseInt(formData.get("mortalityCount") as string) || 0,
        mortalityCause: formData.get("mortalityCause") as string,
        feedMorningKg: parseFloat(formData.get("feedMorningKg") as string) || 0,
        feedEveningKg: parseFloat(formData.get("feedEveningKg") as string) || 0,
        feedType: formData.get("feedType") as string,
        notes: formData.get("notes") as string,
      });

      toast.success("Pencatatan harian berhasil disimpan!");
      setShowForm(false);
      // Refresh page to show new data
      window.location.reload();
    } catch (error) {
      toast.error("Gagal menyimpan pencatatan. Silakan coba lagi.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Pencatatan Harian</h3>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? "Batal" : "Tambah Catatan"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Form Pencatatan Harian</CardTitle>
            <CardDescription>Catat mortalitas dan pakan harian</CardDescription>
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
                  <Label htmlFor="mortalityCount">Jumlah Mortalitas (ekor)</Label>
                  <Input
                    id="mortalityCount"
                    name="mortalityCount"
                    type="number"
                    min={0}
                    defaultValue={0}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mortalityCause">Penyebab Mortalitas</Label>
                <Input
                  id="mortalityCause"
                  name="mortalityCause"
                  placeholder="Opsional"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="feedMorningKg">Pakan Pagi (kg)</Label>
                  <Input
                    id="feedMorningKg"
                    name="feedMorningKg"
                    type="number"
                    step="0.1"
                    min={0}
                    defaultValue={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedEveningKg">Pakan Sore (kg)</Label>
                  <Input
                    id="feedEveningKg"
                    name="feedEveningKg"
                    type="number"
                    step="0.1"
                    min={0}
                    defaultValue={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedType">Jenis Pakan</Label>
                  <Input
                    id="feedType"
                    name="feedType"
                    defaultValue="Starter 21%"
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

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pencatatan</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Belum ada pencatatan harian
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Mortalitas</TableHead>
                    <TableHead>Pakan Pagi</TableHead>
                    <TableHead>Pakan Sore</TableHead>
                    <TableHead>Total Pakan</TableHead>
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
                      <TableCell>
                        {record.mortalityCount > 0 ? (
                          <span className="text-red-600 font-medium">
                            {record.mortalityCount} ekor
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{record.feedMorningKg} kg</TableCell>
                      <TableCell>{record.feedEveningKg} kg</TableCell>
                      <TableCell>
                        {(record.feedMorningKg + record.feedEveningKg).toFixed(1)}{" "}
                        kg
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
