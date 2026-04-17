# BNPB DIBI Dashboard — Rincian Implementasi

> **Tracking**: FEAT-015
> **Proyek**: Peta Bencana — Dashboard Data Bencana BNPB
> **Fitur**: Dashboard statistik dan tabel list data bencana dari BNPB DIBI dengan status tindak lanjut
> **File Plan**: PLAN_FEAT_015_P01.md
> **Estimasi Timeline**: 2 minggu (80-100 jam)
> **Tim**: 1-2 developer
> **Status**: Fase Perencanaan

---

## Ringkasan Progres

### ✅ Selesai

- [x] A1: Tambahkan interface BNPBRecord ke types/index.ts
- [x] A2: Tambahkan interface BNPBStats ke types/index.ts
- [x] B2: Siapkan file data publik bnpb-dibi.json

### 🔄 Sedang Dikerjakan

_Belum ada._

### ⏳ Tertunda

**Fase A — Tipe & Antarmuka Core**

- [x] A1: Tambahkan interface BNPBRecord ke types/index.ts
- [x] A2: Tambahkan interface BNPBStats ke types/index.ts

**Fase B — Layanan & Data**

- [ ] B1: Buat fungsi loadBNPBData() di services/dataLoader.ts
- [x] B2: Siapkan file data publik bnpb-dibi.json

**Fase C — Komponen & UI**

- [ ] C1: Buat komponen BNPBDashboard.tsx (container utama)
- [ ] C2: Buat komponen BNPBStatCards.tsx (kartu statistik)
- [ ] C3: Buat komponen BNPBTable.tsx (tabel dengan tab)

**Fase D — State & Context**

- [ ] D1: Tambahkan field state bnpbData & bnpbVisible ke AppState
- [ ] D2: Tambahkan action SET_BNPB_DATA & TOGGLE_BNPB ke reducer

**Fase E — Integrasi Toolbar & Layout**

- [ ] E1: Tambahkan tombol BNPB toggle ke Toolbar.tsx
- [ ] E2: Integrasikan BNPBDashboard ke App.tsx dengan layout split/overlay

**Fase F — Pengujian**

- [ ] F1: Tulis unit tests untuk BNPBRecord parsing
- [ ] F2: Tulis integration tests untuk loadBNPBData()
- [ ] F3: Tulis component tests untuk BNPBStatCards & BNPBTable
- [ ] F4: Jalankan full regression suite

**Fase G — Dokumentasi**

- [ ] G1: Update docs untuk penambahan BNPB data
- [ ] G2: Perbarui FEATURES.md dengan status Done

---

## Metrik

| Metrik                 | Target                                       |
| ---------------------- | -------------------------------------------- |
| File baru dibuat       | 4 (3 komponen + loader)                      |
| File dimodifikasi      | 5 (types, context, dataLoader, Toolbar, App) |
| Unit tests ditambahkan | 3                                            |
| Integration tests      | 2                                            |
| Delta bundle size      | < 5 KB (no new deps)                         |
| Data file size         | ~50-500 KB (dari BNPB)                       |

---

## Ringkasan Isu / Bottleneck

| ID  | Severity | Lokasi                       | Deskripsi                                                                                                                |
| --- | -------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| B-1 | High     | External (BNPB DIBI API)     | Pre-scraping script diperlukan untuk menghasilkan bnpb-dibi.json; tidak dapat diakses dari SPA frontend tanpa auth proxy |
| B-2 | Medium   | `src/context/AppContext.tsx` | State BNPB harus diload di useEffect sama seperti data layers — koordinasikan timing dengan loadAllData()                |
| B-3 | Medium   | `src/components/` layout     | BNPBDashboard adalah tabular (non-map) — pastikan layout split/overlay tidak menutupi map atau sidebar secara permanen   |
| B-4 | Low      | `src/types/index.ts`         | Interface BNPBRecord harus exhaustive agar type-safe; validasi semua field di loader                                     |

---

## Keputusan Arsitektur

| Keputusan        | Pilihan              | Alasan                                                                                                 |
| ---------------- | -------------------- | ------------------------------------------------------------------------------------------------------ |
| Data source      | Pre-scraped JSON     | BNPB Superset API memerlukan auth; static JSON mengikuti pola semua layer data lainnya                 |
| State storage    | AppContext           | Konsisten dengan pattern FEAT-013 (Management Dashboard); tidak perlu IndexedDB (non-map)              |
| Tab filtering    | Client-side useState | Filter by `is_bencana` field di local component state — render performa optimal                        |
| Panel visibility | TOGGLE_BNPB action   | Sama seperti dashboardVisible; tombol toggle di Toolbar                                                |
| Table columns    | Fixed set            | Jenis Bencana, Provinsi, Kabupaten, Kejadian, Meninggal, Hilang, Luka/Sakit, Mengungsi, Rusak, Tanggal |

---

## Analisis Konflik

| Area                               | Risiko | Mitigasi                                                                       |
| ---------------------------------- | ------ | ------------------------------------------------------------------------------ |
| `src/context/AppContext.tsx` merge | Medium | State BNPB adalah field baru; tidak perpanjangan existing field — safe merge   |
| FEAT-013 (Management Dashboard)    | Low    | BNPB Dashboard adalah panel terpisah; tidak berkompetisi untuk UI real estate  |
| Data loading timing                | Low    | `loadBNPBData()` dipanggil paralel di `loadAllData()` via Promise.allSettled() |
| Mobile layout                      | Medium | Stat cards dan table harus responsive; test di screen < 640px                  |

---

## Panduan Penugasan Tugas

### 🔴 Critical Path

```
A1 → A2 → B1 → D1 → D2 → E1 → E2 → F1, F2, F3, F4 → G1, G2
```

Fase type, loader, state, dan integrasi UI adalah urutan dependencies.

### 🟡 Parallel Work

- **C1, C2, C3** (komponen) dapat dikerjakan paralel setelah A1/A2 selesai
- **B2** (data file prep) dapat paralel dengan C1/C2/C3

### 🟢 Post-Integration

- **G1, G2** hanya setelah semua fase core dimerge dan ditest

---

## Fase & Tugas

### Fase A — Tipe & Antarmuka Core

---

### Task A1: Tambahkan BNPBRecord interface 🔴

**Priority**: Critical
**Estimasi waktu**: 1.5 jam
**Dependencies**: None
**Status**: ✅ Selesai
**Assigned To**: GitHub Copilot

**Deskripsi**: Tambahkan interface `BNPBRecord` ke `src/types/index.ts` untuk merepresentasikan satu record kejadian bencana dari dataset BNPB DIBI. Interface harus mencakup semua field dari JSON schema yang didefinisikan di plan (jenis_bencana, kategori_bencana, provinsi, kabupaten, casualty counts, damage fields, is_bencana flag, datetime).

**File yang dimodifikasi**:

- `src/types/index.ts` — Tambahkan BNPBRecord interface

**Perubahan yang diperlukan**:

```typescript
// Tambahkan di akhir src/types/index.ts

export interface BNPBRecord {
  id: number;
  jenis_bencana: string; // e.g., "Banjir", "Gempa"
  kategori_bencana: string; // e.g., "Banjir", "Gempabumi"
  provinsi: string;
  kabupaten: string;
  jumlah_kejadian: number;
  meninggal: number;
  hilang: number;
  luka_sakit: number;
  menderita: number;
  mengungsi: number;
  rumah_rusak_berat: number;
  rumah_rusak_sedang: number;
  rumah_rusak_ringan: number;
  rumah_terendam: number;
  estimasi_kerugian_rumah: number; // dalam Rupiah
  is_bencana: boolean; // true = Sudah Tindak Lanjuti, false = Belum
  dt: string; // ISO date string "YYYY-MM-DD"
}
```

**Constraints**:

- Semua field harus typed secara strict (no `any`)
- Field `is_bencana` adalah boolean discriminator utama untuk tab filtering
- Field `dt` harus string (tetap sesuai JSON source); parsing datetime done di loader jika perlu
- Jangan modifikasi atau export existing interfaces

**Acceptance Criteria**:

- ✅ Interface `BNPBRecord` ter-export dari `types/index.ts`
- ✅ `npm run typecheck` passes tanpa error
- ✅ Tidak ada warning dari ESLint
- ✅ Semua field memiliki tipe yang jelas (no `any` atau `unknown`)

**After Implementation**: Interface BNPBRecord telah ditambahkan ke shared types dengan semua field strict sesuai schema BNPB DIBI. Build proyek tetap sukses; lint saat ini masih memiliki isu lama di file lain yang tidak terkait Task A1.

---

### Task A2: Tambahkan BNPBStats interface 🔴

**Priority**: Critical
**Estimasi waktu**: 0.5 jam
**Dependencies**: Task A1
**Status**: ✅ Selesai
**Assigned To**: GitHub Copilot

**Deskripsi**: Tambahkan interface `BNPBStats` untuk merepresentasikan hasil agregasi tiga stat tingkat atas (Total, Ditindak Lanjuti, Belum Ditindak Lanjuti). Interface ini digunakan oleh komponen BNPBStatCards untuk render kartu statistik.

**File yang dimodifikasi**:

- `src/types/index.ts` — Tambahkan BNPBStats interface (setelah BNPBRecord)

**Perubahan yang diperlukan**:

```typescript
// Tambahkan di src/types/index.ts setelah BNPBRecord

export interface BNPBStats {
  total: number;
  ditindakLanjuti: number; // count where is_bencana === true
  belumDitindakLanjuti: number; // count where is_bencana === false
}
```

**Constraints**:

- Interface minimal — hanya 3 field
- Field names harus match dengan variable names di komponen BNPBStatCards

**Acceptance Criteria**:

- ✅ Interface `BNPBStats` ter-export dari `types/index.ts`
- ✅ Berjalan bersama task A1 without conflicts
- ✅ `npm run typecheck` passes

**After Implementation**: Interface BNPBStats telah ditambahkan ke shared types dengan tiga field minimal sesuai kebutuhan komponen statistik. Verifikasi berhasil melalui `npm run typecheck`.

---

### Fase B — Layanan & Data

---

### Task B1: Buat fungsi loadBNPBData() 🔴

**Priority**: Critical
**Estimasi waktu**: 3 jam
**Dependencies**: Task A1, A2
**Status**: ⏳ Tertunda
**Assigned To**: [Akan ditugaskan]

**Deskripsi**: Implementasikan fungsi async `loadBNPBData()` di `src/services/dataLoader.ts` untuk memuat dan mem-parse file `public/data/bnpb-dibi.json`. Fungsi harus handle error gracefully (missing file returns empty array) dan kompatibel dengan pattern existing loader functions seperti `loadHotspot()`, `loadGempaGlobal()`, dll.

**File yang dimodifikasi**:

- `src/services/dataLoader.ts` — Tambahkan loadBNPBData function

**Perubahan yang diperlukan**:

```typescript
// Tambahkan di src/services/dataLoader.ts (di section "Per-layer loaders")
// Letakkan sebelum loadProvinceGeoJSON()

export async function loadBNPBData(): Promise<BNPBRecord[]> {
  const json = await fetchJSON("/data/bnpb-dibi.json");
  if (!json) return [];

  const records = (json as BNPBRecord[]) ?? [];

  // Map each record untuk ensure id field selalu ada
  return records.map((item, i) => ({
    ...item,
    id: item.id ?? i,
  }));
}
```

Pastikan:

- Import BNPBRecord dari types
- Error handling (missing file, malformed JSON) return []
- Tidak throws exception
- Comment menjelaskan bahwa BNPB data tidak memiliki lat/lng (bukan map layer)

**Constraints**:

- Fungsi harus follow existing pattern dari loader lainnya
- Tidak boleh modify existing loaders (hotspot, gempa, dll.)
- Return type HARUS `Promise<BNPBRecord[]>`

**Acceptance Criteria**:

- ✅ Fungsi `loadBNPBData()` ter-export dan ter-import di komponen yang membutuhkan
- ✅ Handle missing file gracefully (return [])
- ✅ Handle malformed JSON (catch parse errors, return [])
- ✅ Unit test untuk loading & parsing melalui Task F1
- ✅ TypeScript strict: no `any` casts tanpa reason

**After Implementation**: [Akan diisi setelah selesai]

---

### Task B2: Siapkan file data publik bnpb-dibi.json 🟡

**Priority**: High
**Estimasi waktu**: 2 jam
**Dependencies**: Task A1 (interface definition)
**Status**: ✅ Selesai
**Assigned To**: GitHub Copilot

**Deskripsi**: Buat file contoh `public/data/bnpb-dibi.json` dengan struktur sesuai schema BNPBRecord sebagai referensi dan testing. File ini akan diisi dengan data dari BNPB DIBI melalui pre-scraping script yang terpisah dari SPA.

**File yang dibuat**:

- `public/data/bnpb-dibi.json` — Contoh data BNPB DIBI

**Struktur file**:

```json
[
  {
    "id": 1,
    "jenis_bencana": "Banjir",
    "kategori_bencana": "Banjir",
    "provinsi": "Jawa Barat",
    "kabupaten": "Bandung",
    "jumlah_kejadian": 5,
    "meninggal": 0,
    "hilang": 0,
    "luka_sakit": 3,
    "menderita": 50,
    "mengungsi": 25,
    "rumah_rusak_berat": 2,
    "rumah_rusak_sedang": 5,
    "rumah_rusak_ringan": 10,
    "rumah_terendam": 30,
    "estimasi_kerugian_rumah": 150000000,
    "is_bencana": true,
    "dt": "2026-04-01"
  },
  {
    "id": 2,
    "jenis_bencana": "Gempa Bumi",
    "kategori_bencana": "Gempabumi",
    "provinsi": "Sumatera Utara",
    "kabupaten": "Nias",
    "jumlah_kejadian": 1,
    "meninggal": 0,
    "hilang": 0,
    "luka_sakit": 5,
    "menderita": 20,
    "mengungsi": 50,
    "rumah_rusak_berat": 15,
    "rumah_rusak_sedang": 30,
    "rumah_rusak_ringan": 50,
    "rumah_terendam": 0,
    "estimasi_kerugian_rumah": 500000000,
    "is_bencana": false,
    "dt": "2026-04-02"
  },
  {
    "id": 3,
    "jenis_bencana": "Banjir",
    "kategori_bencana": "Banjir",
    "provinsi": "Jawa Timur",
    "kabupaten": "Surabaya",
    "jumlah_kejadian": 2,
    "meninggal": 1,
    "hilang": 0,
    "luka_sakit": 2,
    "menderita": 100,
    "mengungsi": 45,
    "rumah_rusak_berat": 5,
    "rumah_rusak_sedang": 12,
    "rumah_rusak_ringan": 25,
    "rumah_terendam": 60,
    "estimasi_kerugian_rumah": 250000000,
    "is_bencana": true,
    "dt": "2026-03-28"
  }
]
```

**Constraints**:

- File harus valid JSON (no trailing commas, etc.)
- Minimum 3 records: beberapa dengan `is_bencana = true` dan beberapa `false` untuk testing tab filter
- Tanggal harus realistic dan diverse untuk demo
- Field numerik harus sejelas dengan real-world BNPB data ranges

**Acceptance Criteria**:

- ✅ File `public/data/bnpb-dibi.json` exists dan valid JSON
- ✅ Minimal 3 records dengan mixed is_bencana values
- ✅ Semua record valid terhadap BNPBRecord interface (check via Task F1)
- ✅ loadBNPBData() sukses parse file tanpa error

**After Implementation**: File placeholder BNPB DIBI telah disiapkan sebagai JSON valid berisi 5 record contoh lintas provinsi dengan nilai `is_bencana` campuran untuk mendukung demo dan pengujian filter tab. Salinan sumber juga ditambahkan ke folder `data/` agar mengikuti konvensi data repo.

---

### Fase C — Komponen & UI

---

### Task C1: Buat BNPBDashboard.tsx (container) 🟡

**Priority**: High
**Estimasi waktu**: 4 jam
**Dependencies**: Task A1, A2, B1 (setelah interface & loader ready)
**Status**: ⏳ Tertunda
**Assigned To**: [Akan ditugaskan]

**Deskripsi**: Buat komponen React functional `BNPBDashboard.tsx` sebagai container utama. Komponen ini membaca `state.bnpbData` dari AppContext, menghitung statistik via `useMemo`, dan meng-compose sub-komponen BNPBStatCards & BNPBTable. Render layout split atau full-width sesuai `state.bnpbVisible`.

**File yang dibuat**:

- `src/components/BNPBDashboard/BNPBDashboard.tsx`

**Struktur komponen**:

```typescript
import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { BNPBRecord, BNPBStats } from '../../types';
import BNPBStatCards from './BNPBStatCards';
import BNPBTable from './BNPBTable';

export default function BNPBDashboard() {
  const { state } = useAppContext();
  const { bnpbData, bnpbVisible } = state;

  // Compute stats via useMemo to avoid recalc on every render
  const stats: BNPBStats = useMemo(() => {
    const total = bnpbData.length;
    const ditindakLanjuti = bnpbData.filter(r => r.is_bencana === true).length;
    const belumDitindakLanjuti = bnpbData.filter(r => r.is_bencana === false).length;
    return { total, ditindakLanjuti, belumDitindakLanjuti };
  }, [bnpbData]);

  if (!bnpbVisible) return null;

  return (
    <div className="fixed inset-0 bg-white/95 dark:bg-slate-900/95 z-40 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Dashboard BNPB DIBI
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Status dan ringkasan data bencana dari BNPB Informasi Bencana Indonesia
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* Stat Cards */}
          <BNPBStatCards stats={stats} />

          {/* Table */}
          <BNPBTable data={bnpbData} />
        </div>
      </div>
    </div>
  );
}
```

**Constraints**:

- Harus use Tailwind only (no Radix UI untuk panel ini — simple divs)
- Use `dark:` variant untuk dark theme support
- Stat calculation harus memoized
- Render return null jika tidak visible

**Acceptance Criteria**:

- ✅ Komponen render dan tidak throw error
- ✅ useMemo correctly computes stats dari bnpbData
- ✅ Dark mode styling works
- ✅ Return null saat bnpbVisible = false
- ✅ Component tests di Task F3

**After Implementation**: [Akan diisi setelah selesai]

---

### Task C2: Buat BNPBStatCards.tsx 🟡

**Priority**: High
**Estimasi waktu**: 3 jam
**Dependencies**: Task A2 (BNPBStats interface)
**Status**: ⏳ Tertunda
**Assigned To**: [Akan ditugaskan]

**Deskripsi**: Buat komponen React `BNPBStatCards.tsx` yang render tiga stat cards dalam layout grid. Setiap card menampilkan nilai dan label. Cards harus punya accent color yang berbeda: biru (Total), hijau (Ditindak Lanjuti), merah/amber (Belum Ditindak Lanjuti). Use Lucide React icons untuk visual.

**File yang dibuat**:

- `src/components/BNPBDashboard/BNPBStatCards.tsx`

**Struktur komponen**:

```typescript
import React from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { BNPBStats } from '../../types';

interface BNPBStatCardsProps {
  stats: BNPBStats;
}

export default function BNPBStatCards({ stats }: BNPBStatCardsProps) {
  const cards = [
    {
      title: 'Total Laporan',
      value: stats.total,
      icon: AlertCircle,
      color: 'blue',
    },
    {
      title: 'Sudah Ditindak Lanjuti',
      value: stats.ditindakLanjuti,
      icon: CheckCircle,
      color: 'green',
    },
    {
      title: 'Belum Ditindak Lanjuti',
      value: stats.belumDitindakLanjuti,
      icon: Clock,
      color: 'amber',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const bgColor = {
          blue: 'bg-blue-50 dark:bg-blue-900/20',
          green: 'bg-green-50 dark:bg-green-900/20',
          amber: 'bg-amber-50 dark:bg-amber-900/20',
        }[card.color];
        const borderColor = {
          blue: 'border-l-4 border-blue-500',
          green: 'border-l-4 border-green-500',
          amber: 'border-l-4 border-amber-500',
        }[card.color];
        const iconColor = {
          blue: 'text-blue-600 dark:text-blue-400',
          green: 'text-green-600 dark:text-green-400',
          amber: 'text-amber-600 dark:text-amber-400',
        }[card.color];

        return (
          <div
            key={card.title}
            className={cn(
              'p-4 rounded-lg',
              bgColor,
              borderColor,
              'flex items-start gap-3'
            )}
          >
            <Icon size={20} className={iconColor} />
            <div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {card.value.toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

**Constraints**:

- Use Lucide React icons (AlertCircle, CheckCircle, Clock)
- Use cn() dari lib/utils untuk conditional classes
- Responsive grid: 1 col pada mobile, 3 col pada md+
- Numbers harus formatted dengan toLocaleString()

**Acceptance Criteria**:

- ✅ Render 3 stat cards dengan correct values
- ✅ Icons render dan styling correct
- ✅ Dark mode works
- ✅ Grid responsive (1 col mobile, 3 col tablet+)
- ✅ Component tests di Task F3

**After Implementation**: [Akan diisi setelah selesai]

---

### Task C3: Buat BNPBTable.tsx (tabbed table) 🟡

**Priority**: High
**Estimasi waktu**: 5 jam
**Dependencies**: Task A1 (BNPBRecord interface)
**Status**: ⏳ Tertunda
**Assigned To**: [Akan ditugaskan]

**Deskripsi**: Buat komponen React `BNPBTable.tsx` yang render tabel dengan dua tab: "Belum Tindak Lanjut" dan "Sudah Tindak Lanjut". Setiap tab filter data berdasarkan `is_bencana` field. Tabel menampilkan kolom: Jenis Bencana, Provinsi, Kabupaten, Kejadian, Meninggal, Hilang, Luka/Sakit, Mengungsi, Rumah Rusak (total), Tanggal. Tabel harus scrollable di mobile.

**File yang dibuat**:

- `src/components/BNPBDashboard/BNPBTable.tsx`

**Struktur komponen**:

```typescript
import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import type { BNPBRecord } from '../../types';

interface BNPBTableProps {
  data: BNPBRecord[];
}

type TabType = 'pending' | 'completed';

export default function BNPBTable({ data }: BNPBTableProps) {
  const [tab, setTab] = useState<TabType>('pending');

  const filteredData = data.filter((record) => {
    if (tab === 'pending') return !record.is_bencana;
    return record.is_bencana;
  });

  const tabs = [
    { id: 'pending', label: 'Belum Tindak Lanjut', count: data.filter(r => !r.is_bencana).length },
    { id: 'completed', label: 'Sudah Tindak Lanjut', count: data.filter(r => r.is_bencana).length },
  ];

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      {/* Tab buttons */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as TabType)}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              tab === t.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
            )}
          >
            {t.label}
            <span className="ml-2 font-bold text-xs">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50">
              <th className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-white">Jenis Bencana</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-white">Provinsi</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-white">Kabupaten</th>
              <th className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-white">Kejadian</th>
              <th className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-white">Meninggal</th>
              <th className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-white">Hilang</th>
              <th className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-white">Luka/Sakit</th>
              <th className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-white">Mengungsi</th>
              <th className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-white">Rumah Rusak</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-white">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              filteredData.map((record) => (
                <tr key={record.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-100 font-medium">{record.jenis_bencana}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{record.provinsi}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{record.kabupaten}</td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{record.jumlah_kejadian}</td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{record.meninggal}</td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{record.hilang}</td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{record.luka_sakit}</td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{record.mengungsi}</td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                    {(record.rumah_rusak_berat + record.rumah_rusak_sedang + record.rumah_rusak_ringan).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-xs">{record.dt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**Constraints**:

- Tab filtering via local useState (tidak perlu state global)
- Tabel harus fully scrollable di mobile
- Column "Rumah Rusak" adalah sum dari \_berat, \_sedang, \_ringan
- Empty state message jika filtered data kosong

**Acceptance Criteria**:

- ✅ Dua tab render dan switch correctly
- ✅ Data filter correctly berdasarkan is_bencana
- ✅ Tab counts update dynamically
- ✅ Table scrolls horizontally pada mobile
- ✅ Dark mode all cells
- ✅ Component tests di Task F3

**After Implementation**: [Akan diisi setelah selesai]

---

### Fase D — State & Context

---

### Task D1: Tambahkan field state bnpbData & bnpbVisible 🔴

**Priority**: Critical
**Estimasi waktu**: 2 jam
**Dependencies**: Task A1 (BNPBRecord interface)
**Status**: ⏳ Tertunda
**Assigned To**: [Akan ditugaskan]

**Deskripsi**: Perluas AppState interface dan initialState di `src/context/AppContext.tsx` dengan dua field baru: `bnpbData: BNPBRecord[]` (menyimpan loaded BNPB records) dan `bnpbVisible: boolean` (kontrol panel visibility).

**File yang dimodifikasi**:

- `src/context/AppContext.tsx` — Extend AppState interface dan initialState

**Perubahan yang diperlukan**:

```typescript
// Dalam AppContext.tsx, di section "State"

interface AppState {
  visibleLayers: Record<string, boolean>;
  timeRange: TimeRange;
  theme: Theme;
  rawData: Record<string, DataPoint[]>;
  filteredData: Record<string, DataPoint[]>;
  loading: boolean;
  errors: Record<string, string>;
  pickingCoords: boolean;
  pickedCoords: { lat: number; lng: number } | null;
  selectedProvince: string | null;
  provinceGeoJSON: GeoJSON.FeatureCollection | null;
  provinceInfo: Record<string, ProvinceInfo>;
  dashboardVisible: boolean;
  // ↓ NEW FIELDS
  bnpbData: BNPBRecord[];
  bnpbVisible: boolean;
}

// Dalam initialState:

const initialState: AppState = {
  visibleLayers: buildDefaultVisible(),
  timeRange: "ALL",
  theme: "dark",
  rawData: {},
  filteredData: {},
  loading: true,
  errors: {},
  pickingCoords: false,
  pickedCoords: null,
  selectedProvince: null,
  provinceGeoJSON: null,
  provinceInfo: {},
  dashboardVisible: false,
  // ↓ NEW
  bnpbData: [],
  bnpbVisible: false,
};
```

**Constraints**:

- Hanya extend interface — tidak modifikasi existing fields
- Initial nilai: bnpbData = [], bnpbVisible = false
- Import BNPBRecord type dari types/index

**Acceptance Criteria**:

- ✅ AppState interface includes both new fields
- ✅ initialState sets them to correct default values
- ✅ `npm run typecheck` passes
- ✅ No other reducer logic yet (D2 handles that)

**After Implementation**: [Akan diisi setelah selesai]

---

### Task D2: Tambahkan action SET_BNPB_DATA & TOGGLE_BNPB ke reducer 🔴

**Priority**: Critical
**Estimasi waktu**: 1.5 jam
**Dependencies**: Task D1
**Status**: ⏳ Tertunda
**Assigned To**: [Akan ditugaskan]

**Deskripsi**: Tambahkan dua action type ke Action union: `SET_BNPB_DATA` (untuk set bnpbData saat loaded) dan `TOGGLE_BNPB` (untuk toggle panel visibility). Implementasikan reducer cases untuk masing-masing.

**File yang dimodifikasi**:

- `src/context/AppContext.tsx` — Extend Action type dan reducer function

**Perubahan yang diperlukan**:

```typescript
// Dalam AppContext.tsx, di section "State"

type Action =
  // ... existing actions ...
  | { type: "TOGGLE_DASHBOARD" }
  // ↓ NEW
  | { type: "SET_BNPB_DATA"; payload: BNPBRecord[] }
  | { type: "TOGGLE_BNPB" };

// Dalam reducer function, di switch statement:

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    // ... existing cases ...

    case "TOGGLE_BNPB":
      return { ...state, bnpbVisible: !state.bnpbVisible };

    case "SET_BNPB_DATA":
      return { ...state, bnpbData: action.payload };

    default:
      return state;
  }
}
```

**Constraints**:

- Hanya dua cases — tidak perlu complex logic
- Import BNPBRecord type
- Follow existing pattern (spread state, update target field)

**Acceptance Criteria**:

- ✅ Both actions in Action union type
- ✅ Both reducer cases implemented
- ✅ SET_BNPB_DATA sets state.bnpbData to payload
- ✅ TOGGLE_BNPB toggles boolean
- ✅ `npm run typecheck` passes

**After Implementation**: [Akan diisi setelah selesai]

---

### Fase E — Integrasi Toolbar & Layout

---

### Task E1: Tambahkan tombol BNPB toggle ke Toolbar 🔴

**Priority**: High
**Estimasi waktu**: 1.5 jam
**Dependencies**: Task D1, D2 (actions ready)
**Status**: ⏳ Tertunda
**Assigned To**: [Akan ditugaskan]

**Deskripsi**: Tambahkan tombol BNPB dashboard toggle ke `src/components/Toolbar/Toolbar.tsx` sebelum theme toggle. Button harus dispatch `TOGGLE_BNPB` action. Use Lucide React icon `ShieldAlert` untuk visual.

**File yang dimodifikasi**:

- `src/components/Toolbar/Toolbar.tsx` — Tambahkan BNPB button

**Perubahan yang diperlukan**:

```typescript
// Di Toolbar.tsx, import section:
import { Sun, Moon, Menu, MapPin, ShieldAlert } from 'lucide-react';

// Di Toolbar return, sebelum theme toggle button:
<button
  onClick={() => dispatch({ type: 'TOGGLE_BNPB' })}
  title="Toggle BNPB Dashboard"
  className="text-white/70 hover:text-white p-1.5 rounded hover:bg-white/10 transition-colors flex-shrink-0"
>
  <ShieldAlert size={15} />
</button>
```

**Constraints**:

- Button harus punya className matching existing theme button
- Icon size = 15px (konsisten dengan existing buttons)
- Title untuk tooltip
- Terletak sebelum theme toggle

**Acceptance Criteria**:

- ✅ Button render di Toolbar
- ✅ Click dispatch TOGGLE_BNPB action
- ✅ Styling match existing buttons
- ✅ Icon visible dan appropriate
- ✅ Tooltip works

**After Implementation**: [Akan diisi setelah selesai]

---

### Task E2: Integrasikan BNPBDashboard ke App.tsx dengan layout 🔴

**Priority**: High
**Estimasi waktu**: 3 jam
**Dependencies**: Task C1 (BNPBDashboard ready), Task E1 (toggle button), Task B1 (loader)
**Status**: ⏳ Tertunda
**Assigned To**: [Akan ditugaskan]

**Deskripsi**: Integrasikan BNPBDashboard komponen ke `src/App.tsx`. Load BNPB data saat app mount via dispatch(SET_BNPB_DATA). Render dashboard sebagai full-screen overlay ketika `bnpbVisible` true. Ensure dashboard dapat di-close dengan tombol atau backdrop click.

**File yang dimodifikasi**:

- `src/App.tsx` — Import komponen, load data, render di layout

**Perubahan yang diperlukan**:

```typescript
// Di App.tsx

import BNPBDashboard from './components/BNPBDashboard/BNPBDashboard';
import { loadBNPBData } from './services/dataLoader';
// ... other imports

function App() {
  const { state, dispatch } = useAppContext();
  const { bnpbVisible } = state;

  // Load BNPB data on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await loadBNPBData();
        dispatch({ type: 'SET_BNPB_DATA', payload: data });
      } catch (err) {
        console.error('Failed to load BNPB data:', err);
      }
    })();
  }, [dispatch]);

  return (
    <div className="...">
      <Toolbar />
      {/* Existing map, sidebar, etc. */}
      <MapContainer />
      <Sidebar />
      {/* ... */}

      {/* BNPB Dashboard overlay */}
      {bnpbVisible && (
        <>
          {/* Backdrop to close */}
          <div
            onClick={() => dispatch({ type: 'TOGGLE_BNPB' })}
            className="fixed inset-0 bg-black/20 z-30"
          />
          <BNPBDashboard />
        </>
      )}
    </div>
  );
}
```

**Constraints**:

- Load data dalam useEffect pada mount
- Render dashboard as overlay (z-index 40 untuk dashboard, 30 untuk backdrop)
- Backdrop click closes panel
- Koordinasikan dengan existing dashboard (FEAT-013) jika overlap Z-index

**Acceptance Criteria**:

- ✅ BNPBDashboard imports and renders
- ✅ BNPB data loads on mount via loadBNPBData()
- ✅ dispatch(SET_BNPB_DATA) sets state correctly
- ✅ Panel visibility toggles with TOGGLE_BNPB action
- ✅ Backdrop click closes panel
- ✅ No Z-index conflicts with other overlays
- ✅ Mobile responsive (full-screen overlay)

**After Implementation**: [Akan diisi setelah selesai]

---

### Fase F — Pengujian

---

### Task F1: Unit tests untuk BNPBRecord parsing 🟢

**Priority**: High
**Estimasi waktu**: 2 jam
**Dependencies**: Task B1 (loadBNPBData ready)
**Status**: ⏳ Tertunda
**Assigned To**: [Akan ditugaskan]

**Deskripsi**: Tulis unit tests untuk `loadBNPBData()` function. Test cases: (1) Valid JSON loads without error, (2) Missing file returns [], (3) Malformed JSON returns [], (4) Returned records match BNPBRecord interface. Gunakan file contoh dari Task B2 untuk test data.

**File yang dibuat**:

- `src/services/__tests__/bnpbLoader.test.ts` (atau sesuai existing pattern)

**Test cases**:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { loadBNPBData } from "../dataLoader";

describe("loadBNPBData", () => {
  it("should load valid BNPB JSON data", async () => {
    // Mock fetch atau use actual public/data/bnpb-dibi.json
    const data = await loadBNPBData();
    expect(Array.isArray(data)).toBe(true);
  });

  it("should handle missing file gracefully", async () => {
    // Mock fetch to return 404 or null
    // Verify returns []
  });

  it("should validate BNPBRecord fields", async () => {
    const data = await loadBNPBData();
    if (data.length > 0) {
      const record = data[0];
      expect(record.id).toBeDefined();
      expect(typeof record.jenis_bencana).toBe("string");
      expect(typeof record.is_bencana).toBe("boolean");
      expect(typeof record.meninggal).toBe("number");
    }
  });

  it("should handle malformed JSON", async () => {
    // Mock fetch to return invalid JSON
    // Verify returns []
  });
});
```

**Constraints**:

- Gunakan existing test framework (vitest / jest / mocha)
- Follow existing test pattern dari coordinateParser.test.ts atau dataLoader.test.ts
- Mock fetch jika needed
- Test semua error paths

**Acceptance Criteria**:

- ✅ 4+ test cases cover happy path, missing file, malformed JSON, field validation
- ✅ All tests pass: `npm run test:data`
- ✅ No console errors
- ✅ Line coverage ≥ 80% untuk loadBNPBData function

**After Implementation**: [Akan diisi setelah selesai]

---

### Task F2: Integration test untuk data loading flow 🟢

**Priority**: Medium
**Estimasi waktu**: 2 jam
**Dependencies**: Task F1, Task D2 (reducer actions ready)
**Status**: ⏳ Tertunda
**Assigned To**: [Akan ditugaskan]

**Deskripsi**: Tulis integration test yang verify full flow: load data → dispatch SET_BNPB_DATA → state.bnpbData populated → components can access it. Test context integration.

**File yang dibuat**:

- `src/__tests__/bnpbIntegration.test.ts` (atau sesuai pattern)

**Test scenarios**:

```typescript
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAppContext } from "../context/AppContext";
import { loadBNPBData } from "../services/dataLoader";

describe("BNPB data loading integration", () => {
  it("should load and dispatch BNPB data to state", async () => {
    const { result } = renderHook(() => useAppContext());

    let data: any;
    await act(async () => {
      data = await loadBNPBData();
      result.current.dispatch({ type: "SET_BNPB_DATA", payload: data });
    });

    expect(result.current.state.bnpbData).toEqual(data);
  });

  it("should toggle BNPB visibility", () => {
    const { result } = renderHook(() => useAppContext());
    expect(result.current.state.bnpbVisible).toBe(false);

    act(() => {
      result.current.dispatch({ type: "TOGGLE_BNPB" });
    });

    expect(result.current.state.bnpbVisible).toBe(true);
  });
});
```

**Constraints**:

- Test AppContext integration
- Use React Testing Library for rendering hooks
- Follow existing integration test patterns

**Acceptance Criteria**:

- ✅ Data loads and dispatches successfully
- ✅ State updates correctly after dispatch
- ✅ Toggle action works
- ✅ All tests pass: `npm run test:data`

**After Implementation**: [Akan diisi setelah selesai]

---

### Task F3: Component tests untuk BNPBStatCards & BNPBTable 🟢

**Priority**: Medium
**Estimasi waktu**: 3 jam
**Dependencies**: Task C2 (BNPBStatCards), Task C3 (BNPBTable)
**Status**: ⏳ Tertunda
**Assigned To**: [Akan ditugaskan]

**Deskripsi**: Tulis component tests untuk BNPBStatCards dan BNPBTable. Verify: (1) Cards render correct values, (2) Table tabs filter correctly, (3) Empty state displays when no data, (4) Dark mode styles apply.

**File yang dibuat**:

- `src/components/BNPBDashboard/__tests__/BNPBStatCards.test.tsx`
- `src/components/BNPBDashboard/__tests__/BNPBTable.test.tsx`

**Test cases BNPBStatCards**:

```typescript
import { render, screen } from '@testing-library/react';
import BNPBStatCards from '../BNPBStatCards';

describe('BNPBStatCards', () => {
  it('should render three stat cards', () => {
    const stats = { total: 10, ditindakLanjuti: 6, belumDitindakLanjuti: 4 };
    render(<BNPBStatCards stats={stats} />);

    expect(screen.getByText('Total Laporan')).toBeInTheDocument();
    expect(screen.getByText('Sudah Ditindak Lanjuti')).toBeInTheDocument();
    expect(screen.getByText('Belum Ditindak Lanjuti')).toBeInTheDocument();
  });

  it('should display correct numeric values', () => {
    const stats = { total: 100, ditindakLanjuti: 75, belumDitindakLanjuti: 25 };
    render(<BNPBStatCards stats={stats} />);

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });
});
```

**Test cases BNPBTable**:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BNPBTable from '../BNPBTable';
import type { BNPBRecord } from '../../../types';

describe('BNPBTable', () => {
  const mockData: BNPBRecord[] = [
    {
      id: 1,
      jenis_bencana: 'Banjir',
      // ... other fields
      is_bencana: true,
      // ...
    },
    {
      id: 2,
      jenis_bencana: 'Gempa',
      // ... other fields
      is_bencana: false,
      // ...
    },
  ];

  it('should render both tabs', () => {
    render(<BNPBTable data={mockData} />);
    expect(screen.getByText(/Belum Tindak Lanjut/)).toBeInTheDocument();
    expect(screen.getByText(/Sudah Tindak Lanjut/)).toBeInTheDocument();
  });

  it('should filter data by tab', async () => {
    const user = userEvent.setup();
    render(<BNPBTable data={mockData} />);

    // Initially "Belum" tab active
    expect(screen.getByText('Gempa')).toBeInTheDocument();
    expect(screen.queryByText('Banjir')).not.toBeInTheDocument();

    // Click "Sudah" tab
    await user.click(screen.getByText(/Sudah Tindak Lanjut/));

    expect(screen.getByText('Banjir')).toBeInTheDocument();
    expect(screen.queryByText('Gempa')).not.toBeInTheDocument();
  });

  it('should show empty state when no data', () => {
    render(<BNPBTable data={[]} />);
    expect(screen.getByText('Tidak ada data')).toBeInTheDocument();
  });
});
```

**Constraints**:

- Use React Testing Library
- Follow existing component test patterns
- Test user interactions (tab clicks)
- Verify rendered output, not implementation details

**Acceptance Criteria**:

- ✅ BNPBStatCards: 3 cards render, values correct
- ✅ BNPBTable: tabs render, filtering works, empty state displays
- ✅ Tab counts update dynamically
- ✅ All tests pass: `npm run test:data`
- ✅ Coverage ≥ 80% for both components

**After Implementation**: [Akan diisi setelah selesai]

---

### Task F4: Full regression suite & build verification 🟢

**Priority**: High
**Estimasi waktu**: 2 jam
**Dependencies**: F1, F2, F3 (all tests written)
**Status**: ⏳ Tertunda
**Assigned To**: [Akan ditugaskan]

**Deskripsi**: Jalankan full suite pengujian untuk memastikan tidak ada regresi. Verify: (1) Semua unit/integration/component tests pass, (2) `npm run build` succeeds, (3) TypeScript typecheck passes, (4) ESLint no errors/warnings pada files yang dimodifikasi.

**Verification checklist**:

```bash
npm run typecheck
npm run lint
npm run test:data
npm run build
npm run preview  # optional: manual smoke test
```

**Constraints**:

- Semua existing tests harus tetap pass
- No new TypeScript errors
- No new ESLint violations
- Build harus succeed
- Bundle size delta < 5 KB (no new npm deps)

**Acceptance Criteria**:

- ✅ `npm run typecheck` passes (no errors)
- ✅ `npm run lint` passes on src/components/BNPBDashboard/\*, src/context/AppContext.tsx, src/services/dataLoader.ts
- ✅ `npm run test:data` passes (all tests including F1-F3)
- ✅ `npm run build` succeeds
- ✅ No regressions di existing tests
- ✅ Bundle size delta measured & acceptable

**After Implementation**: [Akan diisi setelah selesai]

---

### Fase G — Dokumentasi & Release

---

### Task G1: Dokumentasi fitur BNPB 🟢

**Priority**: Medium
**Estimasi waktu**: 2 jam
**Dependencies**: All core features implemented (E2 complete)
**Status**: ⏳ Tertunda
**Assigned To**: [Akan ditugaskan]

**Deskripsi**: Tulis dokumentasi untuk BNPB DIBI Dashboard. Dokumentasi harus mencakup: (1) Apa itu fitur dan use cases, (2) Bagaimana data dimuat & pre-scraping flow, (3) UI walkthrough (stat cards, table tabs), (4) Future enhancements (real-time updates, export, drill-downs).

**File yang dibuat / dimodifikasi**:

- `docs/BNPB_DASHBOARD.md` (new)
- atau update existing docs/ jika ada file central

**Konten dokumentasi**:

```markdown
# BNPB DIBI Dashboard

## Overview

Dashboard statistik untuk data bencana dari BNPB Informasi Bencana Indonesia (DIBI).

## Features

- **Stat Cards**: Total laporan, sudah ditindak lanjuti, belum ditindak lanjuti
- **Tabel Interaktif**: Dua tab untuk memfilter status tindak lanjut
- **Dark/Light Mode**: Full support
- **Responsive**: Mobile-optimized

## Data Source

Data berasal dari BNPB DIBI Apache Superset API:

- Endpoint: `https://dibi.bnpb.go.id/api/v1/dashboard/2/datasets`
- Dataset: "Dampak kejadian bencana"

### Pre-scraping Flow

Karena BNPB API memerlukan autentikasi untuk data queries, data harus di-scrape ke `public/data/bnpb-dibi.json` via external script.

## Column Definitions

| Kolom         | Tipe    | Deskripsi                                |
| ------------- | ------- | ---------------------------------------- |
| jenis_bencana | string  | Tipe bencana (e.g., Banjir, Gempa)       |
| provinsi      | string  | Nama provinsi                            |
| kabupaten     | string  | Nama kabupaten/kota                      |
| meninggal     | number  | Jumlah korban meninggal                  |
| is_bencana    | boolean | true = sudah diverifikasi, false = belum |
```

**Constraints**:

- Dokumentasi harus jelas untuk non-technical users
- Include screenshots atau diagrams jika applicable
- Dokumentasi en/id bilingual atau sesuai project standard

**Acceptance Criteria**:

- ✅ Dokumentasi ditulis dan jelas
- ✅ Data source & pre-scraping process dijelaskan
- ✅ Column definitions lengkap
- ✅ No broken links atau references
- ✅ Markdown valid

**After Implementation**: [Akan diisi setelah selesai]

---

### Task G2: Update FEATURES.md dan merge checklist 🟢

**Priority**: High
**Estimasi waktu**: 1 jam
**Dependencies**: All tasks completed (F4 done)
**Status**: ⏳ Tertunda
**Assigned To**: [Akan ditugaskan]

**Deskripsi**: Update file `docs/features/FEATURES.md` untuk set FEAT-015 status dari "Approved" menjadi "Done". Buat merge checklist terakhir: verify semua tests pass, build clean, documentation complete, CHANGELOG updated.

**File yang dimodifikasi**:

- `docs/features/FEATURES.md` — Update FEAT-015 row

**Perubahan**:

```markdown
| FEAT-015 | BNPB DIBI Dashboard | Dashboard statistik & tabel data bencana BNPB | High | Done | PLAN_FEAT_015_P01.md |
```

**Merge checklist**:

```markdown
## FEAT-015 Merge Checklist

- [ ] All tasks in TASK_FEAT_015_BNPB_DASHBOARD.md marked completed
- [ ] npm run typecheck passes
- [ ] npm run lint passes
- [ ] npm run test:data passes (all tests)
- [ ] npm run build succeeds
- [ ] Bundle size delta < 5 KB
- [ ] Documentation complete (G1)
- [ ] CHANGELOG updated with FEAT-015
- [ ] Code review approved
- [ ] Merge to main branch
```

**Constraints**:

- Hanya update status dan checklist jika semua tasks selesai
- CHANGELOG harus sesuai project convention

**Acceptance Criteria**:

- ✅ FEAT-015 status = "Done"
- ✅ Merge checklist complete & all items ✅
- ✅ CHANGELOG updated
- ✅ Ready untuk merge

**After Implementation**: [Akan diisi setelah selesai]

---

## Checklist Pengujian

### Unit Testing

- [ ] BNPBRecord parsing tests (F1)
- [ ] loadBNPBData edge cases (F1)
- [ ] State reducer actions (F2)

### Integration Testing

- [ ] Data loading flow (F2)
- [ ] Context dispatch & state updates (F2)

### Component Testing

- [ ] BNPBStatCards renders & values (F3)
- [ ] BNPBTable tab filtering (F3)
- [ ] Empty state handling (F3)
- [ ] Dark/light mode (F3)

### Regression Testing

- [ ] Existing tests pass (F4)
- [ ] No TypeScript errors (F4)
- [ ] Build succeeds (F4)
- [ ] ESLint clean (F4)

---

## Definisi Selesai (DoD)

Fitur BNPB DIBI Dashboard dianggap selesai jika:

- ✅ Semua task di Fase A–G completed dan tested
- ✅ `npm run test:data` passes tanpa warning
- ✅ `npm run build` produces valid dist/
- ✅ `npm run typecheck` passes
- ✅ `npm run lint` passes
- ✅ Code review approved
- ✅ Documentation complete
- ✅ CHANGELOG updated
- ✅ FEATURES.md status = "Done"
- ✅ No known issues atau TODOs

---

## Catatan Implementation

### Pre-scraping Script (Out of Scope SPA)

File `public/data/bnpb-dibi.json` diperlukan tetapi belum ada. Tim perlu membuat external scraping script (Node.js atau Python) untuk:

1. Fetch dari `https://dibi.bnpb.go.id/api/v1/dashboard/2/datasets`
2. Parse Apache Superset response untuk extract data rows
3. Transform ke schema BNPBRecord
4. Write ke `public/data/bnpb-dibi.json`
5. Schedule periodic updates (cron job)

**Jika pre-scraping script belum tersedia di awal implementation, task B2 akan mempersiapkan placeholder data untuk development/testing.**

### Mobile Responsiveness Priority

Tab besar di mobile (< 640px) — pastikan:

- Stat cards stack 1 col
- Table columns mungkin perlu horizontal scroll
- Touch targets ≥ 44px

### Performance Notes

- BNPBStatCards: useMemo memoizes stat calculation
- BNPBTable: local useState untuk tab filtering (no global state re-renders)
- Data file size: expect 50–500 KB; acceptable trade-off vs API latency
