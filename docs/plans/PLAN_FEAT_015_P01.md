# BNPB DIBI Dashboard — Plan

> **Tracking**: FEAT-015
> **Plan Revision**: P01
> **Requested by**: Bima
> **Reason**: User membutuhkan dashboard data bencana bersumber dari BNPB
> **Date**: 2026-04-17
> **Verdict**: Implement

---

## 1. Feature Description

**BNPB DIBI Dashboard** — a dedicated panel that displays disaster incident data from BNPB's Data Informasi Bencana Indonesia (DIBI) system. The feature has two parts:

1. **Dashboard Statistik**: Three summary stat cards showing **Total Laporan** (total disaster reports), **Sudah Ditindak Lanjuti** (confirmed/followed up — `is_bencana = true`), and **Belum Ditindak Lanjuti** (not yet followed up — `is_bencana = false`).
2. **Tabel List**: A tabbed table view with two tabs — "Belum Tindak Lanjut" and "Sudah Tindak Lanjut" — displaying disaster incident records from BNPB DIBI. Each row shows disaster type (`jenis_bencana`), province, district, casualties, damage, and date.

**Data source**: `https://dibi.bnpb.go.id/api/v1/dashboard/2/datasets` (Apache Superset API). The dataset "Dampak kejadian bencana" contains columns: `jumlah_kejadian`, `jenis_bencana`, `kategori_bencana`, `provinsi`, `kabupaten`, `meninggal`, `hilang`, `luka_sakit`, `menderita`, `mengungsi`, `rumah_rusak*`, `estimasi_kerugian_rumah`, `is_bencana`, `dt`, `tahun`, `bulan`.

## 2. Use Cases

| #   | User Role                      | Scenario                                                                                                           |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| 1   | **Government operator (BNPB)** | Reviews follow-up status of disaster reports — quickly sees how many incidents are confirmed vs pending.           |
| 2   | **Emergency responder**        | Filters the "Belum Tindak Lanjut" tab to identify unconfirmed incidents that may need field verification.          |
| 3   | **Management executive**       | Views summary cards at a glance to assess the ratio of followed-up vs pending reports for accountability tracking. |
| 4   | **Researcher**                 | Browses the full table of BNPB disaster incidents with filtering by follow-up status for research data collection. |
| 5   | **Public information officer** | Screenshots stat cards and table for press briefings on national disaster response status.                         |

## 3. Fit with Project Philosophy

| Principle                   | Question                                                                                                 | Pass/Fail                                                                                                                                                                                                                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data-layer architecture** | Can the feature be expressed as a new data layer with a loader + config entry + popup fields?            | **Partial** — The BNPB data is tabular (no lat/lng coordinates), so it cannot be a map data layer. It is a new data source consumed by a dashboard component.                                                                                                                            |
| **Frontend-only SPA**       | Does this work without a backend server? Data must be fetchable as static JSON or a public API.          | **Conditional Pass** — The BNPB Superset API metadata is publicly accessible (role: "Public"), but the chart data query endpoint likely requires CSRF tokens or authentication. Data must be **pre-scraped to a static JSON file** in `public/data/` to work in the frontend-only model. |
| **Map-centric UI**          | Does it render on/interact with the MapLibre map, or belong in the sidebar/toolbar with a clear purpose? | **Pass** — Lives alongside the existing Management Dashboard (FEAT-013) as a BNPB-specific tab/section. Does not replace the map but supports operational oversight.                                                                                                                     |

**Resolution**: The `is_bencana` field from BNPB maps directly to the "tindak lanjut" concept. The data lacks coordinates so cannot be a map layer, but it complements the existing dashboard feature. The pre-scraping approach follows the same pattern as all other data sources (`public/data/*.json`).

## 4. Integration Approach

| Integration Point   | What                                            | Justification                                    |
| ------------------- | ----------------------------------------------- | ------------------------------------------------ |
| **New component**   | `src/components/BNPBDashboard/` (3–4 files)     | Main BNPB panel with stat cards and tabbed table |
| **Service module**  | New loader function in `services/dataLoader.ts` | Loads and parses pre-scraped BNPB JSON data      |
| **State extension** | New fields in `AppState` for BNPB data          | Stores loaded BNPB data and panel visibility     |

## 5. API / Integration Proposal

### 5.1 Data File (`public/data/bnpb-dibi.json`)

Pre-scraped static JSON with the following schema:

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
  }
]
```

### 5.2 New Types (`src/types/index.ts`)

```typescript
export interface BNPBRecord {
  id: number;
  jenis_bencana: string;
  kategori_bencana: string;
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
  estimasi_kerugian_rumah: number;
  is_bencana: boolean;
  dt: string;
}

export interface BNPBStats {
  total: number;
  ditindakLanjuti: number;
  belumDitindakLanjuti: number;
}
```

### 5.3 State Extension (`src/context/AppContext.tsx`)

```typescript
// AppState additions:
bnpbData: BNPBRecord[];
bnpbVisible: boolean;

// New actions:
| { type: 'SET_BNPB_DATA'; payload: BNPBRecord[] }
| { type: 'TOGGLE_BNPB' }

// Reducer cases:
case 'SET_BNPB_DATA':
  return { ...state, bnpbData: action.payload };
case 'TOGGLE_BNPB':
  return { ...state, bnpbVisible: !state.bnpbVisible };
```

### 5.4 Loader Function (`src/services/dataLoader.ts`)

```typescript
export async function loadBNPBData(): Promise<BNPBRecord[]> {
  const json = await fetchJSON("/data/bnpb-dibi.json");
  if (!json) return [];
  return (json as BNPBRecord[]).map((item, i) => ({
    ...item,
    id: item.id ?? i,
  }));
}
```

### 5.5 Dashboard Components

```
src/components/BNPBDashboard/
  ├── BNPBDashboard.tsx     — Main container (reads bnpbData, computes stats, composes sub-components)
  ├── BNPBStatCards.tsx      — Three stat cards: Total, Sudah Tindak Lanjut, Belum Tindak Lanjut
  └── BNPBTable.tsx          — Tabbed table (tab selection filters by is_bencana)
```

**BNPBDashboard.tsx** — reads `state.bnpbData` via `useAppContext()`, computes `BNPBStats` via `useMemo`, renders stat cards + tabbed table.

**BNPBStatCards.tsx** — three colored cards:

- **Total Laporan** (blue accent) — `stats.total`
- **Sudah Ditindak Lanjuti** (green accent) — `stats.ditindakLanjuti`
- **Belum Ditindak Lanjuti** (red/amber accent) — `stats.belumDitindakLanjuti`

**BNPBTable.tsx** — two tabs controlled by local `useState`:

- Tab "Belum Tindak Lanjut": filters `bnpbData.filter(r => !r.is_bencana)`
- Tab "Sudah Tindak Lanjut": filters `bnpbData.filter(r => r.is_bencana)`
- Table columns: Jenis Bencana, Provinsi, Kabupaten, Kejadian, Meninggal, Hilang, Luka/Sakit, Mengungsi, Rumah Rusak, Tanggal

### 5.6 Toolbar Toggle (`src/components/Toolbar/Toolbar.tsx`)

```typescript
// New button:
<button onClick={() => dispatch({ type: 'TOGGLE_BNPB' })} ...>
  <ShieldAlert size={15} />
</button>
```

### 5.7 Layout Integration (`src/App.tsx`)

Panel renders as an overlay or split-view when `state.bnpbVisible` is true, similar to the existing Management Dashboard pattern.

## 6. Compatibility Matrix

| Dimension                 | Compatible? | Notes                                                    |
| ------------------------- | ----------- | -------------------------------------------------------- |
| Dark theme                | Yes         | Tailwind `dark:` variants for cards and table            |
| Light theme               | Yes         | Same                                                     |
| Mobile viewport           | Yes         | Stat cards stack vertically; table scrolls horizontally  |
| Time filter (1h–7d / ALL) | N/A         | BNPB data is historical; not filtered by app's TimeRange |
| Clustering (GeoJSON)      | N/A         | No map markers — tabular data only                       |
| GIF markers (DOM-based)   | N/A         | No map markers                                           |
| Circle markers (GL layer) | N/A         | No map markers                                           |
| Popup display             | N/A         | No popups                                                |
| Layer toggle (visibility) | N/A         | Panel toggle via dedicated button                        |
| IndexedDB / offline data  | N/A         | Not needed — loads from static JSON                      |

## 7. Performance Impact

- **Map render cost**: None — purely a React overlay panel, no map layers.
- **Bundle size**: ~0 KB additional. No new npm packages — uses existing Tailwind for cards and native HTML table.
- **Network requests**: +1 fetch to `/data/bnpb-dibi.json`. Size depends on data volume (~50–500 KB typical for annual BNPB data).
- **State update frequency**: Low — data loaded once on mount. Tab switching is client-side filter only.
- **IndexedDB usage**: None.

## 8. Final Recommendation

### **Implement**

**Justification**:

- Clear operational value — provides BNPB disaster report follow-up tracking directly within the hazard-mapping tool.
- Fits the frontend-only model via pre-scraped static JSON (same pattern as all other data sources).
- The `is_bencana` field from BNPB naturally maps to the "tindak lanjut" concept.
- Minimal complexity — 3 new component files, 1 type definition, 1 loader function, 2 state fields.
- Zero new dependencies — builds on existing Tailwind + React patterns.
- Complements FEAT-013 (Management Dashboard) without conflicting.

**Prerequisites**:

- A **scraping script** (outside the SPA, e.g., Node.js cron job or Python script) must be created to fetch data from `https://dibi.bnpb.go.id` and produce `public/data/bnpb-dibi.json`. This is out of scope for the SPA feature but is a hard dependency.

**Integration points**: New component (3 files), state extension (2 fields + 2 actions), loader function, Toolbar button.
