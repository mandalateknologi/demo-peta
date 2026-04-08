# PLAN: Management Dashboard [FEAT-013] — P01

> **Tracking**: FEAT-013
> **Revision**: P01 (Initial)
> **Date**: 2026-04-08
> **Verdict**: **Implement**

---

## 1. Feature Description

**Management Dashboard** — a split-view panel that presents aggregated hazard data as summary cards, interactive charts, and province-level statistics alongside the map. Management and decision-makers get a high-level national snapshot without interacting with individual map markers.

**Inputs**: existing `rawData`/`filteredData` from all 8 loaded layers, `provinceGeoJSON`, `provinceInfo`, active `timeRange`.

**Outputs**: summary cards (counts per layer, total vs filtered), horizontal bar chart (layer breakdown), area chart (event frequency over time), and top-10 province ranking table with per-layer breakdown.

---

## 2. Use Cases

| #   | User Role                  | Scenario                                                                                                            |
| --- | -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1   | Government operator        | Opens dashboard at start of shift to see a national snapshot: total hotspots, active volcanoes, recent earthquakes. |
| 2   | Emergency responder        | Compares disaster counts across provinces to prioritize field deployment.                                           |
| 3   | Management executive       | Views trend cards (hotspot count 24h vs 7d) to assess whether the situation is escalating or stabilizing.           |
| 4   | Researcher                 | Uses province-level statistics and per-layer breakdowns for periodic reporting without counting markers manually.   |
| 5   | Public information officer | Screenshots dashboard cards and charts for press briefings or social media updates.                                 |

---

## 3. Fit with Project Philosophy

| Principle                   | Question                                                               | Verdict                                                                                |
| --------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Data-layer architecture** | Can it be expressed as a new data layer with loader + config + popup?  | **N/A** — Dashboard aggregates existing layers; not a new data layer itself.           |
| **Frontend-only SPA**       | Does it work without a backend?                                        | **Pass** — All data already loaded client-side; aggregation is pure computation.       |
| **Map-centric UI**          | Does it render on/interact with the map, or belong in sidebar/toolbar? | **Pass** — Split view keeps map visible (50%); province table row clicks zoom the map. |

**Resolution**: The dashboard is not a data layer but a **presentation component** that consumes existing layers. Map-centricity is preserved via the 50/50 split view and province-to-map interaction.

---

## 4. Integration Approach

| Integration Point   | What                                             | Justification                                                    |
| ------------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| **New component**   | `src/components/Dashboard/` (5 files)            | Main dashboard panel with sub-components (cards, charts, table)  |
| **State extension** | `dashboardVisible: boolean` + `TOGGLE_DASHBOARD` | Controls dashboard visibility, toggled from Toolbar              |
| **Service module**  | `src/services/dashboardStats.ts`                 | Pure aggregation functions consuming existing `DataPoint[]` data |

---

## 5. API / Integration Proposal

### 5.1 New Types (`src/types/index.ts`)

```typescript
export interface LayerCount {
  total: number;
  filtered: number;
}

export interface ProvinceCount {
  provinceId: string;
  name: string;
  total: number;
  breakdown: Record<string, number>;
}

export interface TimeSeriesBucket {
  bucket: string;
  counts: Record<string, number>;
}

export interface DashboardStats {
  layerCounts: Record<string, LayerCount>;
  provinceCounts: ProvinceCount[];
  timeSeries: TimeSeriesBucket[];
}
```

### 5.2 State Extension (`src/context/AppContext.tsx`)

```typescript
// AppState addition:
dashboardVisible: boolean;  // default: false

// New action:
| { type: 'TOGGLE_DASHBOARD' }

// Reducer case:
case 'TOGGLE_DASHBOARD':
  return { ...state, dashboardVisible: !state.dashboardVisible };
```

### 5.3 Aggregation Service (`src/services/dashboardStats.ts`)

```typescript
export function computeLayerCounts(
  rawData: Record<string, DataPoint[]>,
  filteredData: Record<string, DataPoint[]>,
): Record<string, LayerCount>;

export function computeProvinceCounts(
  filteredData: Record<string, DataPoint[]>,
  provinceGeoJSON: FeatureCollection | null,
  topN?: number,
): ProvinceCount[];

export function computeTimeSeries(
  filteredData: Record<string, DataPoint[]>,
  bucketSize: "hour" | "day",
): TimeSeriesBucket[];
```

### 5.4 Dashboard Components

```
src/components/Dashboard/
  ├── Dashboard.tsx       — Main container (reads state, computes stats via useMemo, composes sub-components)
  ├── StatCard.tsx         — Reusable summary card (icon, label, filtered count, total count, color accent)
  ├── LayerChart.tsx       — Horizontal bar chart (recharts BarChart, colored per layer)
  ├── TrendChart.tsx       — Area chart (recharts AreaChart, time-bucketed event frequency)
  └── ProvinceTable.tsx    — Top 10 province ranking table (clickable rows → SELECT_PROVINCE)
```

### 5.5 Layout Integration (`src/App.tsx`)

```
Dashboard OFF:                        Dashboard ON:
┌─ Toolbar ─────────────────┐         ┌─ Toolbar ─────────────────┐
│ Map (w-full)              │         │ Map (w-1/2) │ Dashboard   │
│ ┌─ Sidebar   ┌─ TimeFilter│         │ ┌─ Sidebar  │ (w-1/2)    │
│ │            │            │    →    │ │           │ ┌─ Cards ─┐ │
│ │            │            │         │ │           │ │ Charts  │ │
│ │            └────────────│         │ │           │ │ Table   │ │
│ └─────────────────────────│         │ └───────────│ └─────────┘ │
│ RunningText               │         │ RunningText │             │
└───────────────────────────┘         └─────────────┴─────────────┘

Mobile (< 1024px): Dashboard is a full-screen overlay (fixed inset-0 z-50)
```

### 5.6 Toolbar Toggle (`src/components/Toolbar/Toolbar.tsx`)

```typescript
// New button before theme toggle:
<button onClick={() => dispatch({ type: 'TOGGLE_DASHBOARD' })} ...>
  <LayoutDashboard size={15} />
</button>
```

---

## 6. Compatibility Matrix

| Dimension                 | Compatible? | Notes                                                                              |
| ------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| Dark theme                | Yes         | All components use `dark:` Tailwind variants; chart axes/grid adapt to theme       |
| Light theme               | Yes         | Same as above                                                                      |
| Mobile viewport           | Partial     | Full-screen overlay on < 1024px; card grid stacks (1→2→4 cols). Charts responsive. |
| Time filter (1h–7d / ALL) | Yes         | Dashboard respects `state.timeRange`; stats update reactively on change            |
| Clustering (GeoJSON)      | N/A         | Dashboard doesn't render map markers                                               |
| GIF markers (DOM-based)   | N/A         | Same                                                                               |
| Circle markers (GL layer) | N/A         | Same                                                                               |
| Popup display             | N/A         | No popups in dashboard                                                             |
| Layer toggle (visibility) | Yes         | Dashboard shows **all layers** regardless of toggle (management full picture)      |
| IndexedDB / offline data  | N/A         | Not needed — aggregates in-memory data only                                        |

---

## 7. Performance Impact

- **Map render cost**: None — dashboard is a React overlay, no additional map layers.
- **Bundle size**: +~45 KB gzipped (recharts). Tree-shakeable — only import `BarChart`, `AreaChart`, `ResponsiveContainer`, etc.
- **Network requests**: Zero additional — aggregates already-loaded `rawData`/`filteredData`.
- **State update frequency**: Low — recomputes only when `timeRange` changes or data reloads. All aggregation via `useMemo`.
- **Province counting**: O(provinces × points) via `@turf/boolean-point-in-polygon`. Mitigated by `useMemo` keyed on `filteredData` reference. Top-10 limit caps output size.
- **IndexedDB usage**: None.

---

## 8. Final Recommendation

### **Implement**

**Justification**:

- Clear value for management/decision-maker users — provides at-a-glance national disaster overview.
- Fully feasible as frontend-only: pure client-side aggregation of already-loaded data.
- Map-centricity preserved via 50/50 split view and province table → map zoom interaction.
- Single new dependency (recharts, ~45KB gzipped) — acceptable trade-off for interactive charts.
- Reuses existing patterns: `@turf/boolean-point-in-polygon` (already installed), `useAppContext()`, `LAYERS` config, `dark:` Tailwind variants.

**Integration points**: New component (5 files), state extension (1 field + 1 action), service module (1 file), Toolbar button, App layout modification.

**Estimated scope**: ~34 hours, 7 new files, 4 modified files.

---

## 9. Architectural Decisions

| Decision                   | Choice                                 | Rationale                                                                             |
| -------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------- |
| Chart library              | recharts                               | React-native, tree-shakeable, lighter than chart.js (~45KB vs ~60KB gzipped)          |
| Layout model               | Split view 50/50                       | Map stays visible alongside dashboard — spatial + statistical context for management  |
| Mobile behavior            | Full-screen overlay                    | Split view unusable on < 1024px; overlay gives dashboard full space with close button |
| Dashboard data scope       | All layers (not just visible)          | Management needs complete picture regardless of map layer toggles                     |
| Province counting          | Reuse `@turf/boolean-point-in-polygon` | Already a dependency; proven pattern from `provinceUtils.ts`                          |
| State persistence          | None (memory only)                     | Dashboard is transient — toggle on/off. No need for IndexedDB.                        |
| Layer icon source          | Duplicate `LAYER_ICONS` map            | Matches ProvincePanel pattern; consolidation deferred to FEAT-012                     |
| Time bucket auto-selection | hour ≤ 48h, day for 7d/ALL             | Appropriate granularity per time range — avoid noisy hourly data at weekly scale      |

---

## 10. Dependencies & Prerequisites

| Dependency                       | Status     | Impact                                                   |
| -------------------------------- | ---------- | -------------------------------------------------------- |
| recharts npm package             | To install | Required for BarChart, AreaChart, ResponsiveContainer    |
| `@turf/boolean-point-in-polygon` | Installed  | Already used by `provinceUtils.ts`                       |
| `@turf/helpers`                  | Installed  | Already used by `provinceUtils.ts`                       |
| FEAT-012 (icon consolidation)    | Proposed   | **Soft dependency** — dashboard duplicates icons for now |

---

## 11. Scope Boundaries

### In Scope

- Summary cards per layer (filtered + total counts)
- Horizontal bar chart (layer breakdown by filtered count)
- Time-series area chart (event frequency by time bucket)
- Top-10 province ranking table with per-layer breakdown
- Province row click → map zoom + ProvincePanel integration
- Toolbar toggle button with active state
- Split-view layout (50/50 desktop, full overlay mobile)
- Dark/light theme support for all components
- Responsive card grid (1→2→4 columns)

### Out of Scope

- Saved dashboard states / bookmarks
- PDF / image export of dashboard
- Custom date range picker (uses existing TimeFilter)
- Real-time data refresh / auto-update
- Drill-down into individual data points from dashboard
- Dashboard-specific data filters (uses global `timeRange`)
- Print-optimized styles

---

## 12. Risk Analysis

| Risk                                        | Likelihood | Impact | Mitigation                                                                |
| ------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------- |
| Province count computation slow             | Medium     | Medium | `useMemo` keyed on `filteredData` ref; top-10 limit; web worker if needed |
| recharts incompatible with React 19         | Low        | High   | Check peer deps before install; fallback: CSS-only charts                 |
| Split view breaks existing map interactions | Low        | High   | Map stays in its own container; TimeFilter/ProvincePanel anchored inside  |
| Bundle size concern                         | Low        | Low    | recharts is tree-shakeable; only import specific components               |
| LAYER_ICONS duplication (3rd copy)          | Certain    | Low    | Acceptable until FEAT-012 consolidates; simple to merge later             |

---

## 13. Implementation Phases

| Phase | Theme                   | Files                                                                                              | Effort |
| ----- | ----------------------- | -------------------------------------------------------------------------------------------------- | ------ |
| A     | Core Types & State      | `types/index.ts`, `AppContext.tsx`, `package.json`                                                 | 3.5h   |
| B     | Aggregation Service     | `services/dashboardStats.ts`, `services/__tests__/dashboardStats.test.ts`                          | 7h     |
| C     | Dashboard Components    | `Dashboard/StatCard.tsx`, `LayerChart.tsx`, `TrendChart.tsx`, `ProvinceTable.tsx`, `Dashboard.tsx` | 15h    |
| D     | Layout Integration      | `Toolbar/Toolbar.tsx`, `App.tsx`                                                                   | 4.5h   |
| E     | Polish & Responsiveness | Dashboard components (responsive + theme tweaks)                                                   | 3.5h   |
| F     | Testing                 | Test files, build/lint verification                                                                | 4h     |
| G     | Documentation           | `FEATURES.md` update, manual verification                                                          | 2h     |

**Total estimated effort**: ~34 hours

**Critical path**: `A1 → A2 → A3 → B1 → C5 → D2 → F1`

**Parallel work**: C1–C4 (sub-components), D1 (toolbar button), B2 (unit tests)

---

## 14. Verification Plan

| #   | Type   | Check                                                                    |
| --- | ------ | ------------------------------------------------------------------------ |
| 1   | Build  | `npm run build` — TypeScript compiles with no errors                     |
| 2   | Lint   | `npm run lint` — No ESLint violations                                    |
| 3   | Test   | `npx vitest run` — All existing + new tests pass                         |
| 4   | Manual | Toggle dashboard → map shrinks to 50%, dashboard shows on right 50%      |
| 5   | Manual | Change time range → cards and charts update reactively                   |
| 6   | Manual | Click province row → map zooms to province, ProvincePanel opens          |
| 7   | Manual | Toggle dark/light theme → dashboard colors and chart axes update         |
| 8   | Manual | Resize to < 1024px → dashboard becomes full-screen overlay               |
| 9   | Manual | Close dashboard → map returns to full width with smooth 300ms transition |
| 10  | Manual | Verify no console errors throughout all interactions                     |
