import { Suspense } from "react";
import { Metadata } from "next";
import { StatsCard } from "@/components/stats-card";
import { Alerts } from "@/components/alerts";
import {
  getDashboardStats,
  getRecentActivities,
  getAlerts,
} from "@/lib/actions/dashboard";

import { formatCurrency, formatNumber } from "@/lib/utils/calculations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Ringkasan kondisi peternakan bebek hari ini - statistik populasi, mortalitas, produksi telur, dan profit",
};

async function DashboardStats() {
  const stats = await getDashboardStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Populasi Aktif"
        value={formatNumber(stats.totalActivePopulation)}
        description={`${stats.activeBatches} batch aktif`}
        iconName="users"
      />
      <StatsCard
        title="Mortalitas Hari Ini"
        value={stats.todayMortality}
        description={`Rate: ${stats.mortalityRate}%`}
        iconName="skull"
        alert={stats.todayMortality > 5}
      />
      <StatsCard
        title="Produksi Telur Hari Ini"
        value={formatNumber(stats.todayEggs)}
        description="butir telur"
        iconName="egg"
      />
      <StatsCard
        title="Profit Bulan Ini"
        value={formatCurrency(stats.monthProfit)}
        description={`Pemasukan: ${formatCurrency(stats.monthIncome)}`}
        iconName="trendingUp"
      />
    </div>
  );
}

async function DashboardAlerts() {
  const alerts = await getAlerts();

  if (alerts.length === 0) return null;

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <span className="h-5 w-5">⚠️</span>
          Peringatan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alerts alerts={alerts} />
      </CardContent>
    </Card>
  );
}

async function RecentActivities() {
  const activities = await getRecentActivities(5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada aktivitas</p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.batchName} •{" "}
                    {format(new Date(activity.date), "dd MMM yyyy HH:mm", {
                      locale: id,
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

async function FeedStockAlert() {
  const stats = await getDashboardStats();

  if (stats.lowStockCount === 0) return null;

  return (
    <Card className="border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-600">
          <span className="h-5 w-5">🌾</span>
          Stok Pakan Menipis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          {stats.lowStockCount} jenis pakan memiliki stok di bawah batas minimum.
          Silakan lakukan pemesanan.
        </p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Ringkasan kondisi peternakan Anda hari ini.
        </p>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <DashboardStats />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2">
        <Suspense fallback={<div>Loading alerts...</div>}>
          <DashboardAlerts />
        </Suspense>
        <Suspense fallback={<div>Loading feed alerts...</div>}>
          <FeedStockAlert />
        </Suspense>
      </div>

      <Suspense fallback={<div>Loading activities...</div>}>
        <RecentActivities />
      </Suspense>
    </div>
  );
}
