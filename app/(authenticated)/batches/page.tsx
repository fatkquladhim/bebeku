import Link from "next/link";
import { Metadata } from "next";
import { getBatches } from "@/lib/actions/batches";
import { getActiveBarns } from "@/lib/actions/barns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { calculateBirdAge, calculateMortalityRate } from "@/lib/utils/calculations";

export const metadata: Metadata = {
  title: "Manajemen Batch",
  description: "Kelola batch bebek - tracking populasi, mortalitas, dan performa batch peternakan",
};

export default async function BatchesPage() {
  const batches = await getBatches();
  const barns = await getActiveBarns();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Aktif</Badge>;
      case "completed":
        return <Badge variant="secondary">Selesai</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Batch</h1>
          <p className="text-muted-foreground">
            Kelola batch bebek Anda
          </p>
        </div>
        <Link href="/batches/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Batch Baru
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Batch</CardTitle>
          <CardDescription>
            Total {batches.length} batch terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {batches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Belum ada batch. Buat batch pertama Anda!
              </p>
              <Link href="/batches/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Batch
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Tanggal Mulai</TableHead>
                    <TableHead>Umur</TableHead>
                    <TableHead>Populasi</TableHead>
                    <TableHead>Mortalitas</TableHead>
                    <TableHead>Kandang</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => {
                    const age = calculateBirdAge(batch.startDate);
                    const mortalityRate = calculateMortalityRate(
                      batch.initialPopulation - batch.currentPopulation,
                      batch.initialPopulation
                    );
                    const barn = barns.find((b) => b.id === batch.barnId);

                    return (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">
                          {batch.code}
                        </TableCell>
                        <TableCell>{batch.name || "-"}</TableCell>
                        <TableCell>
                          {format(new Date(batch.startDate), "dd MMM yyyy", {
                            locale: id,
                          })}
                        </TableCell>
                        <TableCell>{age} hari</TableCell>
                        <TableCell>
                          {batch.currentPopulation.toLocaleString()} /{" "}
                          {batch.initialPopulation.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              mortalityRate > 5
                                ? "text-red-600 font-medium"
                                : ""
                            }
                          >
                            {mortalityRate.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>{barn?.name || "-"}</TableCell>
                        <TableCell>{getStatusBadge(batch.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/batches/${batch.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
