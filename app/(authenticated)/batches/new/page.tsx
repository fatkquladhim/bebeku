"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBatch } from "@/lib/actions/batches";
import { getActiveBarns } from "@/lib/actions/barns";
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
import { CalendarIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useSWR from "swr";

export default function NewBatchPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());

  const { data: barns, isLoading: barnsLoading } = useSWR(
    "activeBarns",
    getActiveBarns
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await createBatch({
        name: formData.get("name") as string,
        startDate: date,
        initialPopulation: parseInt(formData.get("initialPopulation") as string),
        currentPopulation: parseInt(formData.get("initialPopulation") as string),
        targetHarvestAge: parseInt(formData.get("targetHarvestAge") as string) || 45,
        barnId: formData.get("barnId") as string,
        status: "active",
        notes: formData.get("notes") as string,
      });

      toast.success("Batch berhasil dibuat!");
      router.push(`/batches/${result.id}`);
    } catch (error) {
      toast.error("Gagal membuat batch. Silakan coba lagi.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/batches">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Batch Baru</h1>
          <p className="text-muted-foreground">
            Buat batch pemeliharaan bebek baru
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informasi Batch</CardTitle>
          <CardDescription>
            Isi detail batch pemeliharaan baru
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Batch</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Contoh: Batch Januari 2026"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Tanggal Mulai</Label>
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
                <Label htmlFor="initialPopulation">Jumlah DOC (ekor)</Label>
                <Input
                  id="initialPopulation"
                  name="initialPopulation"
                  type="number"
                  min={1}
                  placeholder="1000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetHarvestAge">Target Umur Panen (hari)</Label>
                <Input
                  id="targetHarvestAge"
                  name="targetHarvestAge"
                  type="number"
                  min={1}
                  defaultValue={45}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="barnId">Kandang</Label>
              <Select name="barnId">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kandang" />
                </SelectTrigger>
                <SelectContent>
                  {barnsLoading ? (
                    <SelectItem value="loading" disabled>
                      Memuat kandang...
                    </SelectItem>
                  ) : barns?.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Tidak ada kandang aktif
                    </SelectItem>
                  ) : (
                    barns?.map((barn) => (
                      <SelectItem key={barn.id} value={barn.id}>
                        {barn.name} ({barn.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Catatan tambahan (opsional)"
              />
            </div>

            <div className="flex gap-4">
              <Link href="/batches">
                <Button variant="outline" type="button">
                  Batal
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan Batch"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
