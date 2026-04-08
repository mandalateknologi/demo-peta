# Management Dashboard — Implementation Tasks

> **Tracking**: FEAT-013
> **Project**: Peta Bencana — Management Dashboard
> **Feature**: Split-view dashboard with summary cards, interactive charts (recharts), and province statistics for management overview
> **Timeline**: 3 weeks (Estimated)
> **Team**: 1 developer
> **Status**: Planning Phase

---

## Progress Summary

### ✅ Completed

_Nothing yet._

### 🔄 In Progress

_Nothing yet._

### ⏳ Pending

**Phase A — Core Types & State**

- [ ] A1: Add `DashboardStats` types to `types/index.ts`
- [ ] A2: Extend AppState with `dashboardVisible` flag
- [ ] A3: Install recharts dependency

**Phase B — Aggregation Service**

- [ ] B1: Create `dashboardStats.ts` aggregation service
- [ ] B2: Unit tests for `dashboardStats.ts`

**Phase C — Dashboard Components**

- [ ] C1: Create `StatCard` component
- [ ] C2: Create `LayerChart` bar chart component
- [ ] C3: Create `TrendChart` area chart component
- [ ] C4: Create `ProvinceTable` component
- [ ] C5: Create `Dashboard` container component

**Phase D — Layout Integration**

- [ ] D1: Add dashboard toggle button to Toolbar
- [ ] D2: Implement split-view layout in App.tsx

**Phase E — Polish & Responsiveness**

- [ ] E1: Mobile responsive behavior
- [ ] E2: Theme compatibility for charts

**Phase F — Testing**

- [ ] F1: Integration & regression tests

**Phase G — Documentation**

- [ ] G1: Full regression suite verification

---

## Metrics

| Metric                  | Target                  |
| ----------------------- | ----------------------- |
| New files created       | 7                       |
| Files modified          | 4                       |
| Unit tests added        | 8–12                    |
| Integration tests added | 2–3                     |
| Bundle size delta       | ~45 KB (recharts)       |
| Data layers affected    | None (reads all layers) |

---

## Issue / Bottleneck Summary

| ID  | Severity | Location                                         | Description                                                                                                    |
| --- | -------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| B-1 | Medium   | `src/services/dashboardStats.ts`                 | Province count computation is O(provinces × points); may be slow with large datasets. Mitigate with `useMemo`. |
| B-2 | Low      | `src/components/ProvincePanel/ProvincePanel.tsx` | `LAYER_ICONS` and `LAYER_COLORS` duplicated — dashboard will duplicate again until FEAT-012 consolidates them. |
| B-3 | Info     | `recharts` dependency                            | Adds ~45KB gzipped to bundle. Tree-shakeable — only import used chart types.                                   |

---

## Architectural Decisions

| Decision             | Choice                                 | Rationale                                                                            |
| -------------------- | -------------------------------------- | ------------------------------------------------------------------------------------ |
| Chart library        | recharts                               | React-native, tree-shakeable, lighter than chart.js (~45KB vs ~60KB)                 |
| Layout model         | Split view 50/50                       | Map stays visible alongside dashboard; management sees spatial + statistical context |
| Mobile behavior      | Full-screen overlay                    | Split view unusable on < 1024px; overlay gives dashboard full space                  |
| Dashboard data scope | All layers (not just visible)          | Management needs complete picture regardless of map layer toggles                    |
| Province counting    | Reuse `@turf/boolean-point-in-polygon` | Already a dependency; proven pattern from `provinceUtils.ts`                         |
| State persistence    | None (memory only)                     | Dashboard is transient — toggle on/off. No IndexedDB needed.                         |

---

## Conflict Analysis

| Area                                       | Risk   | Mitigation                                                                      |
| ------------------------------------------ | ------ | ------------------------------------------------------------------------------- |
| `src/context/AppContext.tsx` modifications | Low    | Adding one field + one action — minimal merge risk                              |
| `src/types/index.ts` additions             | Low    | Appending new interface — no changes to existing types                          |
| `src/App.tsx` layout changes               | Medium | Split-view changes the main layout div — coordinate with any concurrent UI work |
| `src/components/Toolbar/Toolbar.tsx`       | Low    | Adding one button — positional insertion only                                   |
| No active TASK\_\* files                   | None   | No conflicting work in progress                                                 |

---

## Task Assignment Guide

### 🔴 Critical Path

```
A1 (types) → A2 (state) → A3 (install recharts) → B1 (aggregation service) → C5 (Dashboard container) → D2 (split-view layout) → F1 (tests)
```

### 🟡 Parallel Work

- **C1**, **C2**, **C3**, **C4** — all sub-components can develop in parallel once A1 + A3 are done
- **B2** (unit tests) can develop in parallel with B1 (service)
- **D1** (toolbar button) can develop in parallel with C1–C4 once A2 is done

### 🟢 Post-Integration

- **E1**, **E2** — polish work after core dashboard is functional
- **G1** — final regression only after all phases merged

---

## Phases & Tasks

### Phase A — Core Types & State

---

### Task A1: Add `DashboardStats` types 🔴

**Developer**: Bima
**Priority**: Critical
**Estimated time**: 1 hour
**Dependencies**: None
**Status**: ⏳ Pending

**Description**: Define the `DashboardStats` interface and supporting types in `types/index.ts`. These types are used by the aggregation service and dashboard components.

**Files to modify**:

- `src/types/index.ts` — Append new interfaces after the existing `ProvinceInfo` interface (after line 47)

**Changes required**:

```typescript
// Append to src/types/index.ts

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
  bucket: string; // ISO date string for the bucket start
  counts: Record<string, number>; // layerId → count
}

export interface DashboardStats {
  layerCounts: Record<string, LayerCount>;
  provinceCounts: ProvinceCount[];
  timeSeries: TimeSeriesBucket[];
}
```

**Constraints**:

- No `any` types — use `Record<string, unknown>` for dynamic shapes per project convention
- All interfaces must be exported

**Acceptance Criteria**:

- ✅ `LayerCount`, `ProvinceCount`, `TimeSeriesBucket`, and `DashboardStats` are exported from `types/index.ts`
- ✅ `npm run build` passes with no TypeScript errors
- ✅ No changes to existing type definitions

**After Implementation**: [To be filled after completion]

---

### Task A2: Extend AppState with `dashboardVisible` 🔴

**Priority**: Critical
**Estimated time**: 2 hours
**Dependencies**: Task A1
**Status**: ⏳ Pending

**Description**: Add `dashboardVisible: boolean` to `AppState` and a `TOGGLE_DASHBOARD` action to the reducer. This controls dashboard visibility from the Toolbar and App layout.

**Files to modify**:

- `src/context/AppContext.tsx` — Extend `AppState` (line 8), `Action` union (line 23), `initialState` (line 54), and reducer (line 69)

**Changes required**:

```typescript
// 1. AppState interface — add after `provinceInfo` field (line 20):
dashboardVisible: boolean;

// 2. Action union — add new member (after line 33):
| { type: 'TOGGLE_DASHBOARD' }

// 3. initialState — add field (after line 66):
dashboardVisible: false,

// 4. reducer — add case before default (after line 106):
case 'TOGGLE_DASHBOARD':
  return { ...state, dashboardVisible: !state.dashboardVisible };
```

**Constraints**:

- Reducer must remain a pure function — no side effects
- `dashboardVisible` defaults to `false` — dashboard is hidden on app load
- Toggle action has no payload — it flips the current boolean

**Acceptance Criteria**:

- ✅ `state.dashboardVisible` is accessible via `useAppContext()`
- ✅ Dispatching `{ type: 'TOGGLE_DASHBOARD' }` toggles the value
- ✅ Initial render starts with `dashboardVisible: false`
- ✅ `npm run build` passes with no TypeScript errors

**After Implementation**: [To be filled after completion]

---

### Task A3: Install recharts dependency 🔴

**Priority**: Critical
**Estimated time**: 0.5 hours
**Dependencies**: None
**Status**: ⏳ Pending

**Description**: Install recharts as a runtime dependency. This is used for `BarChart`, `AreaChart`, `ResponsiveContainer`, and related chart components.

**Files to modify**:

- `package.json` — Add `recharts` to `dependencies`

**Changes required**:

```bash
npm install recharts
```

**Constraints**:

- Use latest stable version of recharts
- Verify that recharts is compatible with React 19 (check peer dependencies)
- Tree-shake: only import specific components (e.g., `import { BarChart, Bar } from 'recharts'`) — not the entire library

**Acceptance Criteria**:

- ✅ `recharts` appears in `package.json` dependencies
- ✅ `npm run build` passes — no peer dependency conflicts
- ✅ Test import: `import { BarChart } from 'recharts'` compiles without errors

**After Implementation**: [To be filled after completion]

---

### Phase B — Aggregation Service

---

### Task B1: Create `dashboardStats.ts` aggregation service 🔴

**Priority**: High
**Estimated time**: 4 hours
**Dependencies**: Task A1
**Status**: ⏳ Pending

**Description**: Create a service module with three pure functions that aggregate existing `DataPoint[]` data into dashboard statistics. These functions are called from the `Dashboard` component via `useMemo`.

**Files to modify**:

- `src/services/dashboardStats.ts` — Create new file

**Changes required**:

```typescript
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import type {
  Feature,
  Polygon,
  MultiPolygon,
  FeatureCollection,
} from "geojson";
import type {
  DataPoint,
  LayerCount,
  ProvinceCount,
  TimeSeriesBucket,
} from "../types";

/**
 * Count total and filtered points per layer.
 */
export function computeLayerCounts(
  rawData: Record<string, DataPoint[]>,
  filteredData: Record<string, DataPoint[]>,
): Record<string, LayerCount> {
  const counts: Record<string, LayerCount> = {};
  for (const layerId of Object.keys(rawData)) {
    counts[layerId] = {
      total: rawData[layerId]?.length ?? 0,
      filtered: filteredData[layerId]?.length ?? 0,
    };
  }
  return counts;
}

/**
 * Count disasters per province across all layers, return top N sorted by total descending.
 */
export function computeProvinceCounts(
  filteredData: Record<string, DataPoint[]>,
  provinceGeoJSON: FeatureCollection | null,
  topN: number = 10,
): ProvinceCount[] {
  if (!provinceGeoJSON) return [];

  const provinceCounts: ProvinceCount[] = [];
  // Flatten all points once
  const allPoints = Object.entries(filteredData).flatMap(([layerId, points]) =>
    points.map((p) => ({ ...p, layerId })),
  );

  for (const feature of provinceGeoJSON.features) {
    const props = feature.properties as {
      province_id: string;
      name: string;
    } | null;
    if (!props) continue;
    const breakdown: Record<string, number> = {};
    let total = 0;
    for (const p of allPoints) {
      try {
        const pt = point([p.lng, p.lat]);
        if (
          booleanPointInPolygon(pt, feature as Feature<Polygon | MultiPolygon>)
        ) {
          breakdown[p.layerId] = (breakdown[p.layerId] ?? 0) + 1;
          total++;
        }
      } catch {
        // Skip malformed coordinates
      }
    }
    if (total > 0) {
      provinceCounts.push({
        provinceId: props.province_id,
        name: props.name,
        total,
        breakdown,
      });
    }
  }

  provinceCounts.sort((a, b) => b.total - a.total);
  return provinceCounts.slice(0, topN);
}

/**
 * Bucket filtered data points by time intervals for trend visualization.
 * Auto-selects bucket size: 'hour' for timeRange <= 48h, 'day' for 7d/ALL.
 */
export function computeTimeSeries(
  filteredData: Record<string, DataPoint[]>,
  bucketSize: "hour" | "day",
): TimeSeriesBucket[] {
  const bucketMap = new Map<string, Record<string, number>>();

  for (const [layerId, points] of Object.entries(filteredData)) {
    for (const p of points) {
      if (!p.date) continue;
      const d = new Date(p.date);
      let bucketKey: string;
      if (bucketSize === "hour") {
        bucketKey = new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
          d.getHours(),
        ).toISOString();
      } else {
        bucketKey = new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
        ).toISOString();
      }
      if (!bucketMap.has(bucketKey)) {
        bucketMap.set(bucketKey, {});
      }
      const counts = bucketMap.get(bucketKey)!;
      counts[layerId] = (counts[layerId] ?? 0) + 1;
    }
  }

  return Array.from(bucketMap.entries())
    .map(([bucket, counts]) => ({ bucket, counts }))
    .sort((a, b) => a.bucket.localeCompare(b.bucket));
}
```

**Constraints**:

- All functions must be pure — no side effects, no state access
- Use `@turf/boolean-point-in-polygon` and `@turf/helpers` (already installed)
- Handle empty data gracefully — return empty arrays/objects
- Skip points with `null` dates in `computeTimeSeries`

**Acceptance Criteria**:

- ✅ `computeLayerCounts` returns correct counts for each layer
- ✅ `computeProvinceCounts` returns top 10 provinces sorted by total descending
- ✅ `computeTimeSeries` correctly buckets by hour or day
- ✅ All functions handle empty inputs without errors
- ✅ `npm run build` passes
- ✅ Test requirements: see Task B2

**After Implementation**: [To be filled after completion]

---

### Task B2: Unit tests for `dashboardStats.ts` 🟡

**Priority**: High
**Estimated time**: 3 hours
**Dependencies**: Task B1
**Status**: ⏳ Pending

**Description**: Write unit tests for all three aggregation functions. Follow existing test patterns from `src/services/__tests__/coordinateParser.test.ts` and `src/services/__tests__/dataLoader.test.ts`.

**Files to modify**:

- `src/services/__tests__/dashboardStats.test.ts` — Create new file

**Changes required**:

Test cases to cover:

1. **`computeLayerCounts`**:
   - Returns correct total and filtered counts for multiple layers
   - Handles empty `rawData` and `filteredData`
   - Returns 0 for layers present in rawData but missing from filteredData

2. **`computeProvinceCounts`**:
   - Returns provinces sorted by total descending
   - Respects `topN` parameter
   - Returns empty array when `provinceGeoJSON` is null
   - Correctly assigns points to provinces via point-in-polygon
   - Skips points with malformed coordinates

3. **`computeTimeSeries`**:
   - Buckets by hour correctly
   - Buckets by day correctly
   - Skips points with null dates
   - Returns sorted by bucket key ascending
   - Handles empty input

**Constraints**:

- Use vitest (`describe`, `it`, `expect`)
- Create mock `DataPoint[]` arrays and mock GeoJSON features for testing
- Do not import real data files

**Acceptance Criteria**:

- ✅ All tests pass with `npx vitest run src/services/__tests__/dashboardStats.test.ts`
- ✅ At least 8 test cases covering the three functions
- ✅ Edge cases (empty data, null values) are covered

**After Implementation**: [To be filled after completion]

---

### Phase C — Dashboard Components

---

### Task C1: Create `StatCard` component 🟡

**Priority**: Medium
**Estimated time**: 2 hours
**Dependencies**: Task A1
**Status**: ⏳ Pending

**Description**: Create a reusable summary card component that displays a layer's icon, name, filtered count, and total count. One card is rendered per data layer in the dashboard.

**Files to modify**:

- `src/components/Dashboard/StatCard.tsx` — Create new file

**Changes required**:

```typescript
// Props interface
interface StatCardProps {
  icon: React.ReactNode; // Lucide icon element
  label: string; // Layer display name
  filtered: number; // Filtered count (prominent)
  total: number; // Total count (subtitle)
  color: string; // Layer color (hex string for accent)
}
```

Component layout:

- Left side: icon with colored background circle
- Right side: label (small text), filtered count (large bold), `dari {total} total` subtitle
- Card border: uses `color` prop as left border accent
- Tailwind: `bg-white dark:bg-slate-700/50`, `rounded-lg`, `shadow-sm`, `p-3`
- Uses `cn()` from `../../lib/utils` for conditional classes

**Constraints**:

- No state access — pure presentational component via props
- Dark mode via `dark:` Tailwind variants only
- Icon size should be consistent (16px)

**Acceptance Criteria**:

- ✅ Renders layer name, filtered count, total count, and icon
- ✅ Correct styling in both dark and light themes
- ✅ Color accent visible on the card (left border or icon background)
- ✅ No TypeScript errors

**After Implementation**: [To be filled after completion]

---

### Task C2: Create `LayerChart` bar chart component 🟡

**Priority**: Medium
**Estimated time**: 3 hours
**Dependencies**: Task A1, Task A3
**Status**: ⏳ Pending

**Description**: Create a horizontal bar chart showing filtered event count per layer, colored by each layer's config color. Uses recharts `BarChart` inside a `ResponsiveContainer`.

**Files to modify**:

- `src/components/Dashboard/LayerChart.tsx` — Create new file

**Changes required**:

```typescript
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { LAYERS } from "../../config/layers";
import type { LayerCount } from "../../types";
```

Props interface:

```typescript
interface LayerChartProps {
  layerCounts: Record<string, LayerCount>;
  theme: "dark" | "light";
}
```

Behavior:

- Transform `layerCounts` into array: `[{ name: layer.name, count: lc.filtered, color: layer.color }]`
- Horizontal bar chart (`layout="vertical"`)
- Each bar colored with the layer's color via `<Cell>` elements
- Axis/grid colors adapt to `theme` prop (gray for light, slate for dark)
- `ResponsiveContainer` with `width="100%"` and `height={300}`
- Custom tooltip shows layer name + exact count

**Constraints**:

- Import layer data from `config/layers.ts` via `LAYERS` constant
- Only import used recharts components (tree-shaking)
- Chart must be responsive — no fixed pixel widths

**Acceptance Criteria**:

- ✅ Bar chart renders with correct bar for each layer
- ✅ Bars are colored according to layer config color
- ✅ Tooltip shows layer name and count on hover
- ✅ Chart adapts to container width via `ResponsiveContainer`
- ✅ Axis labels readable in both dark and light themes
- ✅ No TypeScript errors

**After Implementation**: [To be filled after completion]

---

### Task C3: Create `TrendChart` area chart component 🟡

**Priority**: Medium
**Estimated time**: 3 hours
**Dependencies**: Task A1, Task A3
**Status**: ⏳ Pending

**Description**: Create a time-series area chart showing event frequency over time. One line/area per layer, colored by layer config. Uses recharts `AreaChart`.

**Files to modify**:

- `src/components/Dashboard/TrendChart.tsx` — Create new file

**Changes required**:

```typescript
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LAYERS } from "../../config/layers";
import type { TimeSeriesBucket } from "../../types";
```

Props interface:

```typescript
interface TrendChartProps {
  timeSeries: TimeSeriesBucket[];
  theme: "dark" | "light";
}
```

Behavior:

- Transform `TimeSeriesBucket[]` into recharts-compatible format: each data entry is `{ bucket: formatted-string, [layerId]: count, ... }`
- One `<Area>` per layer in `LAYERS` with `fill` and `stroke` set to `layer.color`
- X-axis: formatted date/time labels (short format, e.g., "Apr 8 14:00" for hours, "Apr 8" for days)
- Y-axis: event count
- `ResponsiveContainer` with `width="100%"` and `height={300}`
- Custom tooltip shows all layer counts for the hovered time bucket

**Constraints**:

- Format X-axis labels to be human-readable (not raw ISO strings)
- Handle empty `timeSeries` gracefully — show "Tidak ada data" message
- Axis/grid colors adapt to `theme` prop

**Acceptance Criteria**:

- ✅ Area chart renders with one area per layer
- ✅ Areas are colored per layer config
- ✅ X-axis shows formatted date/time labels
- ✅ Tooltip shows all layer counts at hovered bucket
- ✅ Handles empty data without errors
- ✅ Responsive via `ResponsiveContainer`
- ✅ No TypeScript errors

**After Implementation**: [To be filled after completion]

---

### Task C4: Create `ProvinceTable` component 🟡

**Priority**: Medium
**Estimated time**: 3 hours
**Dependencies**: Task A1
**Status**: ⏳ Pending

**Description**: Create a table showing the top 10 provinces ranked by total disaster count. Clicking a province row dispatches `SELECT_PROVINCE` to zoom the map and open the ProvincePanel.

**Files to modify**:

- `src/components/Dashboard/ProvinceTable.tsx` — Create new file

**Changes required**:

```typescript
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useAppContext } from "../../context/AppContext";
import { LAYERS } from "../../config/layers";
import { cn } from "../../lib/utils";
import type { ProvinceCount } from "../../types";
```

Props interface:

```typescript
interface ProvinceTableProps {
  provinceCounts: ProvinceCount[];
}
```

Behavior:

- Table columns: Rank (#), Province Name, Total Count, mini per-layer breakdown (colored dots or small numbers)
- Rows are clickable: `onClick={() => dispatch({ type: 'SELECT_PROVINCE', payload: item.provinceId })}`
- Hover state: `hover:bg-slate-100 dark:hover:bg-slate-600/50`
- Scrollable via Radix `ScrollArea` (max-height ~300px)
- Show "Belum ada data" if `provinceCounts` is empty

**Constraints**:

- Must use `useAppContext()` for dispatch (province selection)
- Layer colors for breakdown from `LAYERS` config
- Compact design — table should not be wider than its container

**Acceptance Criteria**:

- ✅ Table renders top 10 provinces sorted by total count
- ✅ Clicking a row dispatches `SELECT_PROVINCE` with correct `provinceId`
- ✅ Per-layer breakdown is visible (colored indicators or numbers)
- ✅ Scrollable when content exceeds max-height
- ✅ Correct styling in dark and light themes
- ✅ Shows empty state message when no data
- ✅ No TypeScript errors

**After Implementation**: [To be filled after completion]

---

### Task C5: Create `Dashboard` container component 🔴

**Priority**: High
**Estimated time**: 4 hours
**Dependencies**: Task A2, Task B1, Task C1, Task C2, Task C3, Task C4
**Status**: ⏳ Pending

**Description**: Create the main Dashboard container that composes all sub-components (`StatCard`, `LayerChart`, `TrendChart`, `ProvinceTable`) and aggregates data using `useMemo` with functions from `dashboardStats.ts`.

**Files to modify**:

- `src/components/Dashboard/Dashboard.tsx` — Create new file

**Changes required**:

```typescript
import { useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import { cn } from "../../lib/utils";
import { LAYERS } from "../../config/layers";
import {
  X,
  Flame,
  Activity,
  AlertTriangle,
  BookOpen,
  Mountain,
  Wind,
  Radiation,
} from "lucide-react";
import {
  computeLayerCounts,
  computeProvinceCounts,
  computeTimeSeries,
} from "../../services/dashboardStats";
import { StatCard } from "./StatCard";
import { LayerChart } from "./LayerChart";
import { TrendChart } from "./TrendChart";
import { ProvinceTable } from "./ProvinceTable";
import type { TimeRange } from "../../types";
```

Local `LAYER_ICONS` map (same pattern as `ProvincePanel.tsx` lines 8–16):

```typescript
const LAYER_ICONS: Record<string, React.ReactNode> = {
  'hotspot': <Flame size={16} />,
  'gempa-global': <Activity size={16} />,
  'gempa-alert': <AlertTriangle size={16} />,
  'katalog-gempa': <BookOpen size={16} />,
  'gunung-api': <Mountain size={16} />,
  'vsi-gempa': <Activity size={16} />,
  'gerakan-tanah': <Wind size={16} />,
  'gamma-irrad': <Radiation size={16} />,
};
```

Component behavior:

- Returns `null` if `!state.dashboardVisible`
- Reads state: `rawData`, `filteredData`, `provinceGeoJSON`, `timeRange`, `theme`
- Computes bucket size: `timeRange` in `['1h', '6h', '24h', '48h']` → `'hour'`, else `'day'`
- `useMemo` for `layerCounts`, `provinceCounts`, `timeSeries` — keyed on `rawData`, `filteredData`, `provinceGeoJSON`, `timeRange`

Layout (vertical scroll):

1. **Header**: "Dashboard" title + subtitle showing active time range + close `X` button
2. **StatCard grid**: `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3` — one `StatCard` per layer from `LAYERS`
3. **Charts row**: `grid grid-cols-1 lg:grid-cols-2 gap-4` — `LayerChart` left, `TrendChart` right
4. **Province table**: full width `ProvinceTable`

Container styling: `h-full overflow-y-auto bg-gray-50 dark:bg-slate-800 p-4 border-l border-slate-200 dark:border-slate-700`

**Constraints**:

- All aggregation computed via `useMemo` — no re-computation on every render
- Close button dispatches `{ type: 'TOGGLE_DASHBOARD' }`
- Show all layers in StatCards regardless of `visibleLayers` state (management full picture)
- Dashboard scrolls independently from the map

**Acceptance Criteria**:

- ✅ Dashboard renders when `dashboardVisible` is true
- ✅ Returns `null` when `dashboardVisible` is false
- ✅ StatCards show correct counts for each layer
- ✅ Charts render with correct data
- ✅ Province table shows top 10 provinces
- ✅ Close button hides the dashboard
- ✅ Data updates reactively when `timeRange` changes
- ✅ Scrolls independently with `overflow-y-auto`
- ✅ Correct dark/light theme styling
- ✅ No TypeScript errors

**After Implementation**: [To be filled after completion]

---

### Phase D — Layout Integration

---

### Task D1: Add dashboard toggle button to Toolbar 🟡

**Priority**: Medium
**Estimated time**: 1.5 hours
**Dependencies**: Task A2
**Status**: ⏳ Pending

**Description**: Add a `LayoutDashboard` icon button to the Toolbar that dispatches `TOGGLE_DASHBOARD`. Button shows active state when dashboard is visible.

**Files to modify**:

- `src/components/Toolbar/Toolbar.tsx` — Add button before theme toggle (line 57)

**Changes required**:

```typescript
// 1. Update imports (line 1):
import { Sun, Moon, Menu, MapPin, LayoutDashboard } from 'lucide-react';

// 2. Read dashboardVisible from state:
const { theme, dashboardVisible } = state;

// 3. Insert before theme toggle button (before line 57):
<button
  onClick={() => dispatch({ type: 'TOGGLE_DASHBOARD' })}
  title={dashboardVisible ? 'Tutup Dashboard' : 'Buka Dashboard'}
  className={cn(
    'ml-auto md:ml-0 flex-shrink-0 text-white/70 hover:text-white p-1.5 rounded hover:bg-white/10 transition-colors',
    dashboardVisible && 'bg-white/20 text-white ring-1 ring-white/30',
  )}
>
  <LayoutDashboard size={15} />
</button>
```

Note: Import `cn` from `../../lib/utils` if not already imported. Check existing imports first.

**Constraints**:

- Use `LayoutDashboard` icon from `lucide-react` — do not add new icon library
- Active state uses `ring` highlight, consistent with existing button styles
- Button position: before the theme toggle, right side of toolbar
- Remove `ml-auto` from theme toggle button if `ml-auto` is on the new dashboard button

**Acceptance Criteria**:

- ✅ Dashboard button appears in toolbar
- ✅ Clicking toggles `dashboardVisible` state
- ✅ Active state (ring highlight) visible when dashboard is open
- ✅ Tooltip text changes based on state ("Buka/Tutup Dashboard")
- ✅ No layout shift — toolbar remains h-11
- ✅ No TypeScript errors

**After Implementation**: [To be filled after completion]

---

### Task D2: Implement split-view layout in App.tsx 🔴

**Priority**: High
**Estimated time**: 3 hours
**Dependencies**: Task A2, Task C5
**Status**: ⏳ Pending

**Description**: Modify `App.tsx` layout so that when `dashboardVisible` is true, the main content area splits 50/50 — map on the left, dashboard on the right — with a smooth CSS transition. On desktop (≥ 1024px) it's a side-by-side split; on mobile (< 1024px) the dashboard becomes a full-screen overlay.

**Files to modify**:

- `src/App.tsx` — Modify layout container and add Dashboard import

**Changes required**:

```typescript
// 1. Import Dashboard component:
import { Dashboard } from './components/Dashboard/Dashboard';

// 2. Read dashboardVisible from state

// 3. Modify the main content area (currently lines 41–42):
//    Wrap map container in a div with conditional width:
<div className={cn(
  'relative overflow-hidden transition-all duration-300',
  state.dashboardVisible ? 'w-1/2' : 'w-full',
)}>
  {/* Existing map container (absolute inset-0) */}
  <div className="absolute inset-0 z-0">
    <MapContainer />
  </div>
  {/* Sidebar stays here */}
  {/* TimeFilter stays here */}
  {/* ProvincePanel stays here */}
  {/* Loading indicator stays here */}
  {/* RunningText stays here */}
  {/* PickCoordsOverlay stays here */}
</div>

// 4. Add Dashboard panel (after map container div):
{state.dashboardVisible && (
  <div className="w-1/2 h-full hidden lg:block">
    <Dashboard />
  </div>
)}

// 5. Mobile full-screen overlay (visible on < lg):
{state.dashboardVisible && (
  <div className="fixed inset-0 z-50 lg:hidden">
    <Dashboard />
  </div>
)}

// 6. Parent container must become flex-row:
<div className="flex flex-row flex-1 overflow-hidden">
```

**Constraints**:

- Map must remain functional (clickable, zoomable) when dashboard is open
- TimeFilter, ProvincePanel, RunningText remain anchored **inside** the map container div
- Sidebar remains on the left edge of the map, unaffected
- `transition-all duration-300` for smooth width animation
- Mobile overlay uses `fixed inset-0 z-50` to cover everything including toolbar
- Import `cn` from `./lib/utils` if not already imported

**Acceptance Criteria**:

- ✅ Dashboard toggle: map shrinks to 50%, dashboard fills right 50%
- ✅ Dashboard close: map returns to full width with smooth 300ms transition
- ✅ Map remains interactive (pan, zoom, click) when split
- ✅ TimeFilter remains positioned top-right of the map area, not top-right of viewport
- ✅ ProvincePanel remains anchored within the map area
- ✅ Sidebar unaffected by split
- ✅ On mobile (< 1024px): dashboard is a full-screen overlay
- ✅ On mobile: close button dismisses overlay and returns to map
- ✅ No TypeScript errors

**After Implementation**: [To be filled after completion]

---

### Phase E — Polish & Responsiveness

---

### Task E1: Mobile responsive behavior 🟢

**Priority**: Medium
**Estimated time**: 2 hours
**Dependencies**: Task D2
**Status**: ⏳ Pending

**Description**: Ensure all dashboard components are responsive on small screens. StatCard grid adjusts columns, charts resize, and the province table remains scrollable.

**Files to modify**:

- `src/components/Dashboard/Dashboard.tsx` — Verify responsive grid classes
- `src/components/Dashboard/StatCard.tsx` — Verify compact layout on small screens
- `src/components/Dashboard/ProvinceTable.tsx` — Verify horizontal scroll for wide tables

**Changes required**:

- StatCard grid: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4` (already set in C5; verify)
- Charts: `ResponsiveContainer` handles width automatically; verify `height` is reasonable at small widths
- Province table: wrap in `overflow-x-auto` if columns exceed container width
- Mobile overlay dashboard: add its own close button and scroll padding for safe area

**Constraints**:

- Test at 320px, 768px, 1024px, 1440px viewport widths
- No fixed pixel widths in dashboard components

**Acceptance Criteria**:

- ✅ StatCards stack in 1 column on mobile, 2 on tablet, 4 on desktop
- ✅ Charts resize without overflow or clipping
- ✅ Province table scrolls horizontally if needed
- ✅ Mobile overlay is scrollable and dismissible
- ✅ No layout overflow at 320px viewport

**After Implementation**: [To be filled after completion]

---

### Task E2: Theme compatibility for charts 🟢

**Priority**: Medium
**Estimated time**: 1.5 hours
**Dependencies**: Task C2, Task C3
**Status**: ⏳ Pending

**Description**: Ensure recharts components render correctly in both dark and light themes. Axis labels, grid lines, tooltips, and backgrounds must adapt to the theme.

**Files to modify**:

- `src/components/Dashboard/LayerChart.tsx` — Theme-aware axis/grid/tooltip colors
- `src/components/Dashboard/TrendChart.tsx` — Same treatment

**Changes required**:

Define theme-dependent colors:

```typescript
const axisColor = theme === "dark" ? "#94a3b8" : "#64748b"; // slate-400 / slate-500
const gridColor = theme === "dark" ? "#334155" : "#e2e8f0"; // slate-700 / slate-200
const tooltipBg = theme === "dark" ? "#1e293b" : "#ffffff"; // slate-800 / white
const tooltipBorder = theme === "dark" ? "#475569" : "#cbd5e1"; // slate-600 / slate-300
```

Apply to recharts components:

- `<CartesianGrid stroke={gridColor} />`
- `<XAxis tick={{ fill: axisColor }} />`
- `<YAxis tick={{ fill: axisColor }} />`
- `<Tooltip contentStyle={{ backgroundColor: tooltipBg, border: \`1px solid ${tooltipBorder}\` }} />`

**Constraints**:

- Use Tailwind color scale values (slate-X00) for consistency
- Do not use CSS variables — recharts accepts inline style values

**Acceptance Criteria**:

- ✅ Grid lines visible but subtle in both themes
- ✅ Axis labels readable in both themes
- ✅ Tooltip background and border match theme
- ✅ No harsh color clashes when switching themes

**After Implementation**: [To be filled after completion]

---

### Phase F — Testing

---

### Task F1: Integration & regression tests 🟢

**Priority**: High
**Estimated time**: 4 hours
**Dependencies**: Task B2, Task C5, Task D2
**Status**: ⏳ Pending

**Description**: Run full test suite and add integration-level tests to verify dashboard functionality end-to-end. Ensure no regressions in existing tests.

**Files to modify**:

- `src/services/__tests__/dashboardStats.test.ts` — Already created in B2; verify completeness
- Run existing test files: `coordinateParser.test.ts`, `dataLoader.test.ts`, `provinceUtils.test.ts`

**Changes required**:

1. Run `npx vitest run` — all existing tests must pass
2. Run `npm run build` — no TypeScript errors
3. Run `npm run lint` — no ESLint violations
4. Verify `dashboardStats.test.ts` covers edge cases:
   - Empty datasets
   - Single-layer data
   - All layers with data
   - Time ranges producing no time-series buckets

**Constraints**:

- Do not modify existing tests
- New tests follow vitest conventions (`describe`/`it`/`expect`)

**Acceptance Criteria**:

- ✅ All existing tests pass (`coordinateParser`, `dataLoader`, `provinceUtils`)
- ✅ All new `dashboardStats` tests pass
- ✅ `npm run build` succeeds with no errors
- ✅ `npm run lint` passes with no violations
- ✅ No runtime console errors when toggling dashboard on/off

**After Implementation**: [To be filled after completion]

---

### Phase G — Documentation

---

### Task G1: Full regression suite verification 🟢

**Priority**: Low
**Estimated time**: 2 hours
**Dependencies**: Task F1
**Status**: ⏳ Pending

**Description**: Final manual verification of all dashboard functionality across themes, viewports, and interactions. Verify the FEAT-013 entry in FEATURES.md is updated to `Done`.

**Files to modify**:

- `docs/plans/FEATURES.md` — Update FEAT-013 status to `Done`, set Plan File to `TASK_FEAT_013_DASHBOARD.md`

**Changes required**:

Manual verification checklist:

1. Toggle dashboard from toolbar → map shrinks to 50%, dashboard shows on right
2. Change time range → dashboard cards and charts update reactively
3. Click province row in table → map zooms to province, ProvincePanel opens
4. Toggle dark/light theme → dashboard colors and chart axes update correctly
5. Resize browser to < 1024px → dashboard switches to full-screen overlay
6. Close dashboard → map returns to full width with smooth transition
7. All layer stat cards show correct counts (compare against sidebar layer counters)
8. Province table shows provinces sorted by total disaster count descending
9. Trend chart shows time-bucketed data with correct layer colors
10. No console errors, no layout overflow, no broken hover states

Update FEATURES.md:

```markdown
| FEAT-013 | Management Dashboard | ... | High | Done | TASK_FEAT_013_DASHBOARD.md | 2026-04-08 |
```

**Constraints**:

- Test in Chrome and Firefox minimum
- Test both dark and light themes
- Test at 320px, 768px, 1024px, 1440px viewport widths

**Acceptance Criteria**:

- ✅ All 10 manual verification items pass
- ✅ FEAT-013 status in FEATURES.md is `Done`
- ✅ Plan File column contains `TASK_FEAT_013_DASHBOARD.md`
- ✅ No regressions in existing functionality (layers, popups, sidebar, provinces)

**After Implementation**: [To be filled after completion]

---

## Testing Checklist

- [ ] Unit tests: `computeLayerCounts`, `computeProvinceCounts`, `computeTimeSeries` (8+ cases)
- [ ] Integration: Dashboard renders with real layer data structure
- [ ] Regression: Existing tests pass (`npx vitest run`)
- [ ] Build: `npm run build` succeeds
- [ ] Lint: `npm run lint` passes
- [ ] Manual: Dashboard toggle, split view, theme, mobile overlay
- [ ] Manual: Province table → map integration (SELECT_PROVINCE dispatch)
- [ ] Manual: Time range changes → dashboard updates

---

## Definition of Done

- [ ] All tasks have status ✅ Completed
- [ ] `npm run build` passes with no errors
- [ ] `npm run lint` passes with no violations
- [ ] `npx vitest run` passes all tests (existing + new)
- [ ] Dashboard toggles correctly from Toolbar
- [ ] Split view 50/50 on desktop, full overlay on mobile
- [ ] All stat cards, charts, and province table render with correct data
- [ ] Dark and light themes render correctly
- [ ] No console errors or warnings
- [ ] FEAT-013 marked as `Done` in `docs/plans/FEATURES.md`
