import { tool } from "ai";
import { z } from "zod";

// Import all server actions for database access
import { getDashboardStats, getAlerts, getRecentActivities } from "@/lib/actions/dashboard";
import { getBatches, getActiveBatches, getBatchById, createBatch, getBatchStats } from "@/lib/actions/batches";
import { getBarns, getActiveBarns, getBarnById, createBarn } from "@/lib/actions/barns";
import { getFinanceSummary, createFinanceRecord, getFinanceRecords } from "@/lib/actions/finance";
import { getEggRecords, createEggRecord, getEggProductionSummary, getTodayEggProduction } from "@/lib/actions/eggs";
import { getFeedInventory, getLowStockAlerts, createFeedInventory, addStockMovement, getFeedConsumptionSummary } from "@/lib/actions/feed";
import { createDailyRecord, getDailyRecords, getTodayMortality } from "@/lib/actions/daily-records";
import { getWeightRecordsByBatch, createWeightRecord, calculateADG } from "@/lib/actions/weight";

// ============================================
// READ TOOLS - Untuk membaca data dari database
// ============================================

export const getDashboardSummaryTool = tool({
  description: "Mendapatkan ringkasan dashboard peternakan: jumlah batch aktif, total populasi, mortalitas hari ini, produksi telur hari ini, ringkasan keuangan bulanan, dan jumlah peringatan stok rendah. Gunakan tool ini ketika user bertanya tentang kondisi peternakan secara umum atau 'bagaimana kondisi peternakan'.",
  inputSchema: z.object({}),
  execute: async () => {
    const stats = await getDashboardStats();
    const alerts = await getAlerts();
    return {
      ...stats,
      alerts: alerts.map((a) => ({ severity: a.severity, message: a.message })),
      alertCount: alerts.length,
    };
  },
});

export const getBatchListTool = tool({
  description: "Mendapatkan daftar semua batch peternakan (aktif maupun selesai). Gunakan tool ini ketika user bertanya tentang batch, daftar batch, atau status batch.",
  inputSchema: z.object({
    activeOnly: z.boolean().nullable().describe("Jika true, hanya tampilkan batch aktif"),
  }),
  execute: async ({ activeOnly }) => {
    const batches = activeOnly ? await getActiveBatches() : await getBatches();
    return batches.map((b) => ({
      id: b.id,
      code: b.code,
      name: b.name,
      status: b.status,
      startDate: b.startDate,
      initialPopulation: b.initialPopulation,
      currentPopulation: b.currentPopulation,
      targetHarvestAge: b.targetHarvestAge,
      barnId: b.barnId,
    }));
  },
});

export const getBatchDetailTool = tool({
  description: "Mendapatkan detail lengkap batch tertentu termasuk statistik mortalitas, FCR, dan data historis. Gunakan ketika user bertanya detail batch spesifik berdasarkan kode batch (misal B-2026-001) atau ID batch.",
  inputSchema: z.object({
    batchId: z.string().describe("ID atau kode batch yang ingin dilihat detailnya"),
  }),
  execute: async ({ batchId }) => {
    // Try to find by ID first, then by code
    let batch = await getBatchById(batchId);
    if (!batch) {
      // Search by code
      const allBatches = await getBatches();
      const found = allBatches.find(
        (b) => b.code.toLowerCase() === batchId.toLowerCase()
      );
      if (found) {
        batch = await getBatchById(found.id);
      }
    }
    if (!batch) return { error: "Batch tidak ditemukan" };
    return {
      id: batch.id,
      code: batch.code,
      name: batch.name,
      status: batch.status,
      startDate: batch.startDate,
      initialPopulation: batch.initialPopulation,
      currentPopulation: batch.currentPopulation,
      targetHarvestAge: batch.targetHarvestAge,
      barn: batch.barn,
      stats: batch.stats,
      recentDailyRecords: batch.dailyRecords.slice(0, 7),
      recentEggRecords: batch.eggRecords.slice(0, 7),
      totalFinanceRecords: batch.financeRecords.length,
    };
  },
});

export const getBarnListTool = tool({
  description: "Mendapatkan daftar semua kandang beserta kapasitasnya. Gunakan ketika user bertanya tentang kandang, kapasitas, atau ketersediaan kandang.",
  inputSchema: z.object({}),
  execute: async () => {
    const barns = await getBarns();
    const barnsWithDetail = await Promise.all(
      barns.map(async (barn) => {
        const detail = await getBarnById(barn.id);
        return {
          id: barn.id,
          code: barn.code,
          name: barn.name,
          capacity: barn.capacity,
          location: barn.location,
          status: barn.status,
          stats: detail?.stats,
        };
      })
    );
    return barnsWithDetail;
  },
});

export const getFinanceSummaryTool = tool({
  description: "Mendapatkan ringkasan keuangan peternakan: total pemasukan, pengeluaran, profit/rugi, dan breakdown per kategori. Gunakan ketika user bertanya tentang keuangan, profit, pemasukan, pengeluaran, laba, rugi.",
  inputSchema: z.object({
    batchId: z.string().nullable().describe("Opsional: ID batch untuk filter keuangan batch tertentu"),
  }),
  execute: async ({ batchId }) => {
    const summary = await getFinanceSummary(
      undefined,
      undefined,
      batchId || undefined
    );
    return {
      income: summary.income,
      expense: summary.expense,
      balance: summary.balance,
      byCategory: summary.byCategory,
      totalRecords: summary.records.length,
    };
  },
});

export const getEggProductionTool = tool({
  description: "Mendapatkan data produksi telur: total telur, telur baik, rusak, kecil, dan rate produksi. Gunakan ketika user bertanya tentang produksi telur, telur hari ini, statistik telur.",
  inputSchema: z.object({
    batchId: z.string().nullable().describe("Opsional: ID batch untuk filter produksi telur batch tertentu"),
  }),
  execute: async ({ batchId }) => {
    const summary = await getEggProductionSummary(batchId || undefined);
    const today = await getTodayEggProduction();
    return {
      overall: summary,
      today: {
        totalEggs: today.totalEggs,
        recordCount: today.records.length,
      },
    };
  },
});

export const getFeedStockTool = tool({
  description: "Mendapatkan data stok pakan: inventori pakan, stok saat ini, peringatan stok rendah, dan ringkasan konsumsi. Gunakan ketika user bertanya tentang stok pakan, pakan habis, konsumsi pakan.",
  inputSchema: z.object({}),
  execute: async () => {
    const inventory = await getFeedInventory();
    const lowStock = await getLowStockAlerts();
    const consumption = await getFeedConsumptionSummary();
    return {
      inventory: inventory.map((f) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        currentStockKg: f.currentStockKg,
        minStockAlert: f.minStockAlert,
        unitPrice: f.unitPrice,
        supplier: f.supplier,
      })),
      lowStockAlerts: lowStock.map((f) => ({
        name: f.name,
        currentStockKg: f.currentStockKg,
        minStockAlert: f.minStockAlert,
      })),
      consumption,
    };
  },
});

export const getAlertsTool = tool({
  description: "Mendapatkan semua peringatan aktif: mortalitas tinggi, stok pakan rendah, batch siap panen. Gunakan ketika user bertanya tentang peringatan, masalah, atau hal yang perlu diperhatikan.",
  inputSchema: z.object({}),
  execute: async () => {
    const alerts = await getAlerts();
    return {
      alerts,
      totalAlerts: alerts.length,
      highPriority: alerts.filter((a) => a.severity === "high").length,
      mediumPriority: alerts.filter((a) => a.severity === "medium").length,
    };
  },
});

export const getRecentActivityTool = tool({
  description: "Mendapatkan aktivitas terbaru di peternakan: pencatatan harian, penimbangan, transaksi keuangan. Gunakan ketika user bertanya tentang aktivitas terbaru atau apa yang baru terjadi.",
  inputSchema: z.object({
    limit: z.number().nullable().describe("Jumlah aktivitas yang ditampilkan, default 10"),
  }),
  execute: async ({ limit }) => {
    const activities = await getRecentActivities(limit || 10);
    return activities;
  },
});

// ============================================
// WRITE TOOLS - Untuk menginput data ke database
// ============================================

export const addEggRecordTool = tool({
  description: "Mencatat produksi telur harian. Gunakan ketika user ingin menginput atau mencatat data telur. User mungkin bilang 'catat 500 telur' atau 'hari ini 300 butir telur'. PENTING: Selalu tanyakan/cari batchId dari daftar batch aktif jika user tidak menyebutkan batch tertentu.",
  inputSchema: z.object({
    batchId: z.string().describe("ID batch (bukan kode batch). Gunakan tool getBatchList terlebih dahulu untuk mendapatkan ID dari kode batch"),
    totalEggs: z.number().describe("Total jumlah telur"),
    goodEggs: z.number().nullable().describe("Jumlah telur baik/utuh"),
    damagedEggs: z.number().nullable().describe("Jumlah telur rusak/pecah"),
    smallEggs: z.number().nullable().describe("Jumlah telur kecil"),
    notes: z.string().nullable().describe("Catatan tambahan"),
  }),
  execute: async ({ batchId, totalEggs, goodEggs, damagedEggs, smallEggs, notes }) => {
    const result = await createEggRecord({
      batchId,
      recordDate: new Date(),
      totalEggs,
      goodEggs: goodEggs ?? totalEggs,
      damagedEggs: damagedEggs ?? 0,
      smallEggs: smallEggs ?? 0,
      notes,
    });
    return { success: true, id: result.id, message: `Berhasil mencatat ${totalEggs} telur` };
  },
});

export const addDailyRecordTool = tool({
  description: "Mencatat data harian batch: mortalitas (kematian) dan pemberian pakan. Gunakan ketika user ingin mencatat kematian bebek, jumlah pakan, atau data harian. User mungkin bilang 'hari ini 3 ekor mati' atau 'pakan pagi 50kg sore 45kg'.",
  inputSchema: z.object({
    batchId: z.string().describe("ID batch. Gunakan tool getBatchList terlebih dahulu untuk mendapatkan ID"),
    mortalityCount: z.number().describe("Jumlah kematian hari ini"),
    mortalityCause: z.string().nullable().describe("Penyebab kematian jika diketahui"),
    feedMorningKg: z.number().describe("Jumlah pakan pagi dalam kg"),
    feedEveningKg: z.number().describe("Jumlah pakan sore dalam kg"),
    feedType: z.string().nullable().describe("Jenis pakan (Starter 21%, Grower 19%, Finisher 17%)"),
    notes: z.string().nullable().describe("Catatan tambahan"),
  }),
  execute: async ({ batchId, mortalityCount, mortalityCause, feedMorningKg, feedEveningKg, feedType, notes }) => {
    const result = await createDailyRecord({
      batchId,
      recordDate: new Date(),
      mortalityCount,
      mortalityCause,
      feedMorningKg,
      feedEveningKg,
      feedType,
      notes,
    });
    return {
      success: true,
      id: result.id,
      message: `Berhasil mencatat: ${mortalityCount} mortalitas, pakan ${feedMorningKg}kg (pagi) + ${feedEveningKg}kg (sore)`,
    };
  },
});

export const addFinanceRecordTool = tool({
  description: "Mencatat transaksi keuangan: pemasukan atau pengeluaran. Gunakan ketika user ingin mencatat pembelian pakan, penjualan telur/bebek, biaya operasional, dll. User mungkin bilang 'catat pengeluaran pakan 5 juta' atau 'pemasukan jual telur 2 juta'.",
  inputSchema: z.object({
    type: z.enum(["income", "expense"]).describe("Jenis transaksi: income (pemasukan) atau expense (pengeluaran)"),
    category: z.string().describe("Kategori: pakan, obat, doc, tenaga_kerja, listrik, penjualan_bebek, penjualan_telur, lainnya"),
    amount: z.number().describe("Jumlah uang dalam Rupiah"),
    description: z.string().nullable().describe("Deskripsi transaksi"),
    batchId: z.string().nullable().describe("Opsional: ID batch terkait"),
  }),
  execute: async ({ type, category, amount, description, batchId }) => {
    const result = await createFinanceRecord({
      type,
      category,
      amount,
      description,
      batchId,
      transactionDate: new Date(),
    });
    const typeLabel = type === "income" ? "Pemasukan" : "Pengeluaran";
    return {
      success: true,
      id: result.id,
      message: `Berhasil mencatat ${typeLabel}: ${category} - Rp ${amount.toLocaleString("id-ID")}`,
    };
  },
});

export const addFeedStockTool = tool({
  description: "Menambahkan stok pakan baru atau mencatat pembelian pakan. Gunakan ketika user ingin mencatat pembelian pakan atau menambah stok pakan. User mungkin bilang 'beli pakan 500kg' atau 'tambah stok pakan starter'.",
  inputSchema: z.object({
    feedId: z.string().nullable().describe("ID pakan yang sudah ada. Gunakan getFeedStock terlebih dahulu. Jika null, buat inventori baru"),
    name: z.string().nullable().describe("Nama pakan (diperlukan jika membuat inventori baru)"),
    type: z.string().nullable().describe("Tipe: starter, grower, finisher (diperlukan jika baru)"),
    quantityKg: z.number().describe("Jumlah pakan dalam kg"),
    notes: z.string().nullable().describe("Catatan tambahan"),
  }),
  execute: async ({ feedId, name, type, quantityKg, notes }) => {
    if (feedId) {
      // Add stock movement to existing feed
      const result = await addStockMovement({
        feedId,
        type: "in",
        quantityKg,
        date: new Date(),
        notes,
      });
      return { success: true, id: result.id, message: `Berhasil menambah ${quantityKg}kg stok pakan` };
    } else {
      // Create new feed inventory
      const result = await createFeedInventory({
        name: name || "Pakan Baru",
        type: type || "starter",
        currentStockKg: quantityKg,
        minStockAlert: 100,
        notes,
      });
      return { success: true, id: result.id, message: `Berhasil membuat inventori pakan baru: ${name} (${quantityKg}kg)` };
    }
  },
});

export const addBatchTool = tool({
  description: "Membuat batch peternakan baru. Gunakan ketika user ingin membuat batch baru atau memulai periode baru. User mungkin bilang 'buat batch baru 1000 ekor' atau 'mulai batch baru'.",
  inputSchema: z.object({
    name: z.string().nullable().describe("Nama batch (opsional)"),
    initialPopulation: z.number().describe("Jumlah populasi awal (ekor)"),
    barnId: z.string().nullable().describe("ID kandang. Gunakan getBarnList terlebih dahulu"),
    targetHarvestAge: z.number().nullable().describe("Target umur panen dalam hari, default 45"),
    notes: z.string().nullable().describe("Catatan tambahan"),
  }),
  execute: async ({ name, initialPopulation, barnId, targetHarvestAge, notes }) => {
    const result = await createBatch({
      name,
      startDate: new Date(),
      initialPopulation,
      currentPopulation: initialPopulation,
      barnId,
      targetHarvestAge: targetHarvestAge ?? 45,
      notes,
      status: "active",
    });
    return {
      success: true,
      id: result.id,
      code: result.code,
      message: `Berhasil membuat batch ${result.code} dengan ${initialPopulation} ekor`,
    };
  },
});

export const addBarnTool = tool({
  description: "Membuat kandang baru. Gunakan ketika user ingin menambah kandang baru. User mungkin bilang 'tambah kandang kapasitas 2000 ekor'.",
  inputSchema: z.object({
    name: z.string().describe("Nama kandang"),
    capacity: z.number().describe("Kapasitas kandang (ekor)"),
    location: z.string().nullable().describe("Lokasi kandang"),
    description: z.string().nullable().describe("Deskripsi kandang"),
  }),
  execute: async ({ name, capacity, location, description }) => {
    const result = await createBarn({
      name,
      capacity,
      location,
      description,
      status: "active",
    });
    return {
      success: true,
      id: result.id,
      code: result.code,
      message: `Berhasil membuat kandang ${result.code} (${name}) kapasitas ${capacity} ekor`,
    };
  },
});

export const addWeightRecordTool = tool({
  description: "Mencatat data penimbangan/sampling berat badan bebek. Gunakan ketika user ingin mencatat berat bebek. User mungkin bilang 'berat rata-rata 1500 gram' atau 'catat timbangan'.",
  inputSchema: z.object({
    batchId: z.string().describe("ID batch. Gunakan tool getBatchList terlebih dahulu"),
    averageWeightGr: z.number().describe("Berat rata-rata dalam gram"),
    sampleSize: z.number().nullable().describe("Jumlah sampel yang ditimbang, default 10"),
    birdAgeDays: z.number().describe("Umur bebek dalam hari"),
    notes: z.string().nullable().describe("Catatan tambahan"),
  }),
  execute: async ({ batchId, averageWeightGr, sampleSize, birdAgeDays, notes }) => {
    const result = await createWeightRecord({
      batchId,
      recordDate: new Date(),
      averageWeightGr,
      sampleSize: sampleSize ?? 10,
      birdAgeDays,
      notes,
    });
    return {
      success: true,
      id: result.id,
      message: `Berhasil mencatat berat rata-rata ${averageWeightGr}g (${sampleSize ?? 10} sampel, umur ${birdAgeDays} hari)`,
    };
  },
});

// ============================================
// Export all tools
// ============================================

export const bebekuTools = {
  getDashboardSummary: getDashboardSummaryTool,
  getBatchList: getBatchListTool,
  getBatchDetail: getBatchDetailTool,
  getBarnList: getBarnListTool,
  getFinanceSummary: getFinanceSummaryTool,
  getEggProduction: getEggProductionTool,
  getFeedStock: getFeedStockTool,
  getAlerts: getAlertsTool,
  getRecentActivity: getRecentActivityTool,
  addEggRecord: addEggRecordTool,
  addDailyRecord: addDailyRecordTool,
  addFinanceRecord: addFinanceRecordTool,
  addFeedStock: addFeedStockTool,
  addBatch: addBatchTool,
  addBarn: addBarnTool,
  addWeightRecord: addWeightRecordTool,
} as const;
