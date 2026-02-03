import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getBatchById } from "@/lib/actions/batches";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { formatNumber } from "@/lib/utils/calculations";
import { DailyRecordsTab } from "./daily-records-tab";
import { WeightTab } from "./weight-tab";
import { EggsTab } from "./eggs-tab";

interface BatchDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: BatchDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const batch = await getBatchById(id);

  if (!batch) {
    return {
      title: "Batch Tidak Ditemukan",
    };
  }

  return {
    title: `Detail Batch ${batch.code}`,
    description: `Detail dan monitoring batch ${batch.code} - ${batch.name}`,
  };
}

export default async function BatchDetailPage({ params }: BatchDetailPageProps) {
  const { id } = await params;
  const batch = await getBatchById(id);

  if (!batch) {
    notFound();
  }

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
        <div className="flex items-center gap-4">
          <Link href="/batches">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {batch.code}
              </h1>
              {getStatusBadge(batch.status)}
            </div>
            <p className="text-muted-foreground">
              {batch.name || "Batch Bebek"} - {batch.code || "Bebek"}
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Edit2 className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Populasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(batch.currentPopulation)}
            </div>
            <p className="text-xs text-muted-foreground">
              Dari {formatNumber(batch.initialPopulation)} DOC
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Umur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batch.stats.birdAge} hari</div>
            <p className="text-xs text-muted-foreground">
              Target: {batch.targetHarvestAge} hari
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mortalitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                batch.stats.mortalityRate > 5 ? "text-red-600" : ""
              }`}
            >
              {batch.stats.mortalityRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {batch.stats.totalDeaths} ekor mati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              FCR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {batch.stats.fcr > 0 ? batch.stats.fcr.toFixed(2) : "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              {batch.stats.totalFeedKg > 0
                ? `${batch.stats.totalFeedKg.toFixed(0)} kg pakan`
                : "Belum ada data"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Batch Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Batch</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Tanggal Mulai</p>
            <p className="font-medium">
              {format(new Date(batch.startDate), "dd MMMM yyyy", {
                locale: idLocale,
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Kandang</p>
            <p className="font-medium">{batch.barn?.name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Catatan</p>
            <p className="font-medium">{batch.notes || "-"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="daily">Pencatatan Harian</TabsTrigger>
          <TabsTrigger value="weight">Berat Badan</TabsTrigger>
          <TabsTrigger value="eggs">Produksi Telur</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <DailyRecordsTab batchId={batch.id} records={batch.dailyRecords} />
        </TabsContent>

        <TabsContent value="weight">
          <WeightTab batchId={batch.id} records={batch.weightRecords} />
        </TabsContent>

        <TabsContent value="eggs">
          <EggsTab batchId={batch.id} records={batch.eggRecords} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
