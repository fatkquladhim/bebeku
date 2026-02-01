# 🦆 BEBEKU - Aplikasi Manajemen Peternakan Bebek

BEBEKU adalah aplikasi web untuk manajemen peternakan bebek yang membantu peternak melacak batch, mencatat data harian, mengelola keuangan, dan menganalisis performa peternakan.

## ✨ Fitur Utama

### 📊 Dashboard
- Ringkasan real-time kondisi peternakan
- Statistik populasi, mortalitas, dan produksi telur
- Alert otomatis untuk mortalitas tinggi dan stok pakan menipis
- Aktivitas terakhir

### 🏷️ Manajemen Batch
- CRUD batch bebek dengan kode otomatis (B-YYYY-NNN)
- Tracking populasi dan mortalitas
- Perhitungan FCR otomatis
- Status batch (Aktif/Selesai/Dibatalkan)

### 📝 Pencatatan Harian
- Input mortalitas dengan penyebab
- Pencatatan konsumsi pakan (2x sehari)
- Perhitungan total pakan otomatis
- Riwayat pencatatan

### ⚖️ Pencatatan Berat Badan
- Form sampling berat badan
- Grafik pertumbuhan dengan Recharts
- Perhitungan ADG (Average Daily Gain)
- Riwayat timbangan

### 🥚 Produksi Telur
- Pencatatan produksi telur harian
- Kategorisasi: Bagus, Rusak, Kecil
- Grafik produksi harian
- Analisis komposisi telur

### 🏠 Manajemen Kandang
- CRUD data kandang
- Kapasitas dan lokasi
- Tracking performa per kandang
- Status kandang (Aktif/Nonaktif/Perbaikan)

### 🌾 Manajemen Pakan
- Inventaris jenis pakan
- Stok masuk dan keluar
- Alert stok menipis
- Tracking konsumsi

### 💰 Keuangan
- Pencatatan pemasukan dan pengeluaran
- Kategorisasi transaksi
- Grafik keuangan
- Perhitungan laba/rugi

### 🤖 AI Chatbot
- Kalkulasi estimasi laba/rugi
- Perhitungan FCR
- Analisis mortalitas
- Biaya pakan per kg

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: SQLite dengan Drizzle ORM
- **Charts**: Recharts
- **Date**: date-fns

## 🚀 Cara Menjalankan

### 1. Install Dependencies

```bash
cd bebeku
npm install
```

### 2. Setup Database

```bash
# Generate dan jalankan migrasi
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### 4. Build untuk Production

```bash
npm run build
npm start
```

## 📁 Struktur Folder

```
bebeku/
├── app/                      # Next.js App Router
│   ├── batches/              # Manajemen batch
│   │   ├── page.tsx          # List batch
│   │   ├── new/page.tsx      # Form batch baru
│   │   └── [id]/             # Detail batch
│   │       ├── page.tsx
│   │       ├── daily-records-tab.tsx
│   │       ├── weight-tab.tsx
│   │       └── eggs-tab.tsx
│   ├── barns/                # Manajemen kandang
│   ├── feed/                 # Manajemen pakan
│   ├── eggs/                 # Produksi telur
│   ├── finance/              # Keuangan
│   ├── chatbot/              # AI Chatbot
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Dashboard
├── components/               # Shared components
│   ├── sidebar.tsx           # Navigation sidebar
│   ├── stats-card.tsx        # Statistic cards
│   └── alerts.tsx            # Alert components
├── lib/                      # Utilities
│   ├── db/                   # Database
│   │   ├── index.ts          # DB connection
│   │   └── schema.ts         # Drizzle schema
│   ├── actions/              # Server actions
│   │   ├── batches.ts
│   │   ├── barns.ts
│   │   ├── daily-records.ts
│   │   ├── eggs.ts
│   │   ├── feed.ts
│   │   ├── finance.ts
│   │   ├── weight.ts
│   │   └── dashboard.ts
│   └── utils/                # Helper functions
│       └── calculations.ts   # FCR, mortality calc
├── drizzle.config.ts         # Drizzle config
└── package.json
```

## 📊 Database Schema

### Tabel Utama:

1. **barns** - Data kandang
2. **batches** - Data batch bebek
3. **daily_records** - Pencatatan harian (mortalitas, pakan)
4. **weight_records** - Pencatatan berat badan
5. **egg_records** - Produksi telur
6. **finance_records** - Transaksi keuangan
7. **feed_inventory** - Inventaris pakan
8. **feed_stock_movements** - Pergerakan stok pakan

## 🧮 Perhitungan

### FCR (Feed Conversion Ratio)
```
FCR = Total Pakan (kg) / Total Weight Gain (kg)
```

### Mortality Rate
```
Mortalitas = (Total Mati / Populasi Awal) × 100%
```

### Biaya per Kg
```
Biaya/kg = Total Biaya / Total Bobot (kg)
```

## 🔔 Alert System

Aplikasi akan memberikan peringatan untuk:
- Mortalitas > 5% (medium), > 10% (high)
- Stok pakan di bawah batas minimum
- Batch siap panen (umur mendekati target)

## 📱 Mobile Friendly

BEBEKU dirancang mobile-first dengan:
- Responsive sidebar (drawer di mobile)
- Touch-friendly inputs
- Optimized tables dengan horizontal scroll
- Large tap targets

## 🔒 Keamanan

- Server-side rendering untuk data sensitif
- Input validation
- SQL injection prevention (Drizzle ORM)
- XSS protection (React built-in)

## 📝 Catatan

- Database SQLite tersimpan di `sqlite.db`
- Backup database secara berkala
- Export data ke Excel dapat ditambahkan di masa depan

## 🤝 Kontribusi

Silakan fork dan submit pull request untuk kontribusi.

## 📄 Lisensi

MIT License

---

*Dibuat untuk peternak bebek Indonesia 🇮🇩*
