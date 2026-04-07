# Peta Bencana Mandala — Developer Documentation

> **Quick links:** [QUICKSTART.md](QUICKSTART.md) · [CONTRIBUTING.md](CONTRIBUTING.md) · [CHANGELOG.md](CHANGELOG.md)

## Overview

Frontend-only interactive hazard map web application for Indonesia. Displays geological and environmental data (earthquakes, volcanoes, landslides, hotspots, gamma irradiators) on a MapLibre GL JS map with toggleable layers, time-based filtering, province info panel, animated GIF markers, a local IndexedDB for user data input, and a running-text news ticker.

---

## Tech Stack

| Tool           | Version                  | Purpose                 |
| -------------- | ------------------------ | ----------------------- |
| React          | 19                       | UI framework            |
| TypeScript     | 6                        | Type safety             |
| Vite           | 8                        | Build tool / dev server |
| MapLibre GL JS | latest                   | Interactive map engine  |
| Tailwind CSS   | v4 (`@tailwindcss/vite`) | Utility-first styling   |
| Dexie.js       | latest                   | IndexedDB wrapper       |
| Lucide React   | latest                   | Icon library            |
| js-yaml        | latest                   | YAML config parsing     |

---

## Project Structure

```
demo-peta/
├── public/
│   ├── data/                              ← All JSON data files (served statically)
│   │   ├── hotspot_sipongi.json
│   │   ├── 3mgempaQL.json
│   │   ├── datagempa.json
│   │   ├── katalog_gempa.json
│   │   ├── vsi-gunung-api.json
│   │   ├── vsi-gempa.json
│   │   ├── vsi-gerakan-tanah.json
│   │   ├── gamma-irradiators.json
│   │   ├── indonesia-provinces.geojson    ← Province boundary polygons
│   │   ├── indonesia-province-info.json  ← Province demographic data
│   │   ├── running_text.json             ← News ticker content
│   │   └── data_list.yml
│   ├── icons/
│   │   ├── erupt2.gif                    ← Animated volcano marker
│   │   └── landslide.gif                 ← Animated landslide marker
│   └── screen/                           ← Screenshots (README / docs)
├── src/
│   ├── types/index.ts                    ← Shared TypeScript interfaces
│   ├── config/layers.ts                  ← Layer definitions & alert color map
│   ├── lib/utils.ts                      ← cn() class merging helper
│   ├── db/index.ts                       ← Dexie IndexedDB schema
│   ├── services/
│   │   ├── coordinateParser.ts           ← Coordinate & date format parsers
│   │   ├── dataLoader.ts                 ← Fetch + normalize all JSON → DataPoint[]
│   │   ├── provinceUtils.ts              ← Point-in-polygon province lookup
│   │   └── __tests__/
│   │       ├── coordinateParser.test.ts  ← Parser unit tests
│   │       └── dataLoader.test.ts        ← Loader / filter unit tests
│   ├── context/AppContext.tsx            ← Global state (useReducer + Context)
│   ├── components/
│   │   ├── Map/MapContainer.tsx          ← MapLibre map + all layer rendering
│   │   ├── Sidebar/Sidebar.tsx           ← Layer toggle panel
│   │   ├── Toolbar/Toolbar.tsx           ← Top navigation bar
│   │   ├── TimeFilter/TimeFilter.tsx     ← Time range filter buttons
│   │   ├── ProvincePanel/ProvincePanel.tsx ← Province info right panel
│   │   ├── RunningText/RunningText.tsx   ← Animated news ticker
│   │   └── DataForm/AddDataDialog.tsx   ← Form to save custom points to IndexedDB
│   ├── App.tsx                           ← Root layout + AppProvider
│   ├── App.css                           ← Empty (all styles via Tailwind)
│   └── index.css                         ← Tailwind import + MapLibre overrides
├── LICENSE
├── CHANGELOG.md
├── QUICKSTART.md
├── CONTRIBUTING.md
├── DEVELOPMENT.md
├── vite.config.ts
├── vitest.config.ts
└── tsconfig.app.json
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Production build (output → dist/)
npm run build

# Preview production build
npm run preview
```

---

## Data Layer Reference

All data is loaded from `public/data/` at runtime via `fetch()`. Files that return 404 are silently skipped (the layer shows empty).

| Layer ID        | File                     | Marker                       | Coordinate Format                           | Has Date                      |
| --------------- | ------------------------ | ---------------------------- | ------------------------------------------- | ----------------------------- |
| `hotspot`       | `hotspot_sipongi.json`   | Orange circle                | GeoJSON `[lon, lat]` numbers                | ✓ ISO 8601                    |
| `gempa-global`  | `3mgempaQL.json`         | Red circle (mag-scaled)      | GeoJSON `[lon, lat, depth]` strings         | ✓ `YYYY-MM-DD HH:MM:SS`       |
| `gempa-alert`   | `datagempa.json`         | Red circle                   | `info.point.coordinates` `"lon,lat"` string | ✓ `DD-MM-YY` + `HH:MM:SS WIB` |
| `katalog-gempa` | `katalog_gempa.json`     | Pink circle (mag-scaled)     | GeoJSON `[lon, lat]` strings                | ✓ `DD-MM-YYYY`                |
| `gunung-api`    | `vsi-gunung-api.json`    | `erupt2.gif` (DOM marker)    | `ga_lat_gapi` / `ga_lon_gapi`               | ✓ VONA `issued_time`          |
| `vsi-gempa`     | `vsi-gempa.json`         | Blue circle (mag-scaled)     | `lat_lima` / `lon_lima`                     | ✓ `YYYY-MM-DD HH:MM:SS`       |
| `gerakan-tanah` | `vsi-gerakan-tanah.json` | `landslide.gif` (DOM marker) | `crs_lat` / `crs_lon`                       | ✓ `YYYY-MM-DD`                |
| `gamma-irrad`   | `gamma-irradiators.json` | Purple circle                | `lat` / `lon` in `facilities[]`             | ✗ Always visible              |

### Adding a New Data Source

1. Add the JSON file to `public/data/`
2. Add a `LayerConfig` entry in `src/config/layers.ts`
3. Write a loader function in `src/services/dataLoader.ts` and add it to `loadAllData()`
4. Add the layer icon to `LAYER_ICONS` in `Sidebar.tsx`

---

## Coordinate Formats Handled

The parser in `src/services/coordinateParser.ts` handles all formats present in the datasets:

| Format                            | Example                               | Parser                  |
| --------------------------------- | ------------------------------------- | ----------------------- |
| GeoJSON array (numbers)           | `[112.93, -8.11]`                     | `parseGeoJSONCoord()`   |
| GeoJSON array (strings)           | `["112.93", "-8.11"]`                 | `parseGeoJSONCoord()`   |
| GeoJSON 3-element (depth ignored) | `["125.67", "6.42", 1]`               | `parseGeoJSONCoord()`   |
| Separate object fields            | `{ lat_lima: 1.42, lon_lima: 126.4 }` | `parseSeparateFields()` |
| Comma string                      | `"103.73,-6.20"`                      | `parseCommaString()`    |

---

## State Management

Global state lives in `src/context/AppContext.tsx` using `useReducer`.

### State Shape

```typescript
interface AppState {
  visibleLayers: Record<string, boolean>; // layer toggle state
  timeRange: TimeRange; // active time filter
  theme: "dark" | "light"; // map + UI theme
  rawData: Record<string, DataPoint[]>; // all loaded points (unfiltered)
  filteredData: Record<string, DataPoint[]>; // time-filtered points
  loading: boolean; // initial data load indicator
  errors: Record<string, string>; // per-layer load errors
  pickingCoords: boolean; // map click-to-pick mode for form
  pickedCoords: { lat: number; lng: number } | null;
}
```

### Available Actions

| Action               | Payload              | Effect                           |
| -------------------- | -------------------- | -------------------------------- |
| `TOGGLE_LAYER`       | `layerId: string`    | Toggle layer on/off              |
| `SET_TIME_RANGE`     | `TimeRange`          | Set time filter + re-filter data |
| `SET_THEME`          | `'dark' \| 'light'`  | Switch map tiles + UI theme      |
| `SET_PICKING_COORDS` | `boolean`            | Enable/disable map click-to-pick |
| `SET_PICKED_COORDS`  | `{lat, lng} \| null` | Store picked coordinates         |

---

## Map Rendering

**Circle layers** (earthquakes, hotspots, gamma) use MapLibre GeoJSON sources with built-in clustering (`cluster: true` for dense layers). Earthquake circles are data-driven sized by magnitude using MapLibre expressions.

**GIF markers** (volcanoes, landslides) use MapLibre `Marker` instances with custom HTML `<img>` elements. These are managed imperatively in React via `useRef<Map<string, Marker[]>>`.

### Theme Switching

On theme change, `map.setStyle()` is called. All GeoJSON sources and layers are re-added in the `style.load` event callback since a full style reload clears all custom layers.

### Map Tile Sources

| Theme | Style URL                                                          |
| ----- | ------------------------------------------------------------------ |
| Dark  | `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json` |
| Light | `https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json`     |

Both are free (Carto, no API key required). Free tier: ~75k tile requests/month.

---

## Local Database (IndexedDB)

Managed by Dexie.js. Schema defined in `src/db/index.ts`.

**Database name:** `PetaBencanaDB`

| Table             | Primary Key | Fields                                                                |
| ----------------- | ----------- | --------------------------------------------------------------------- |
| `customPoints`    | `++id`      | `category`, `lat`, `lng`, `title`, `description`, `date`, `createdAt` |
| `layerSettings`   | `++id`      | `layerName`, `visible`, `opacity`                                     |
| `userPreferences` | `++id`      | `key`, `value`                                                        |

Access via DevTools → Application → IndexedDB → PetaBencanaDB.

### Adding Form Fields

To extend the data entry form:

1. Add fields to `EMPTY_FORM` in `AddDataDialog.tsx`
2. Update the Dexie schema version in `src/db/index.ts` (increment version number, update `.stores()`)
3. Update `CustomPoint` interface in `src/types/index.ts`

---

## Time Filter

Available ranges: `1h`, `6h`, `24h`, `48h`, `7d`, `ALL`.

Only shown when at least one visible layer has `hasDate: true` in its `LayerConfig`. Filters are applied globally to all dated layers simultaneously. Layers without dates (`gamma-irrad`) always show all data regardless of filter.

Filter implementation: `filterByTime()` in `dataLoader.ts` compares `point.date >= new Date(now - durationMs)`.

---

## Volcano Alert Status Colors

| Code     | Color     | Meaning              |
| -------- | --------- | -------------------- |
| `GREEN`  | `#38a169` | Normal activity      |
| `YELLOW` | `#d69e2e` | Elevated activity    |
| `ORANGE` | `#dd6b20` | High activity        |
| `RED`    | `#e53e3e` | Very high / eruption |

---

## Environment Notes

- No API keys required — all map tiles and data sources are free or self-served
- All data files in `public/data/` are fetched client-side via `fetch()`
- Files missing at runtime are silently skipped (graceful degradation)
- Theme preference is persisted to `localStorage` under key `peta-theme`
- No backend, no build-time data processing, pure static deployment

---

## Province Features

Province boundaries are rendered as a GeoJSON fill layer from `public/data/indonesia-provinces.geojson`. Clicking inside a province opens the **Province Info Panel**.

### Province Info Panel

The panel is rendered by `src/components/ProvincePanel/ProvincePanel.tsx`. It displays:

| Field                 | Source                          |
| --------------------- | ------------------------------- |
| Province name         | GeoJSON feature property        |
| Capital city          | `indonesia-province-info.json`  |
| Governor              | `indonesia-province-info.json`  |
| Population            | `indonesia-province-info.json`  |
| Area (km²)            | `indonesia-province-info.json`  |
| Island group          | `indonesia-province-info.json`  |
| Per-layer event count | Computed via `provinceUtils.ts` |

Per-layer counts are computed by `src/services/provinceUtils.ts` using Turf.js `@turf/boolean-point-in-polygon` against the clicked province polygon.

### Click Priority

Map click events use the following priority order:

1. Data point markers (popups take focus)
2. Province boundary fill (opens Province Panel)

This ensures markers are always clickable even when they overlap a province boundary.

---

## Running Text

A scrolling news ticker is rendered at the bottom of the screen by `src/components/RunningText/RunningText.tsx`.

Content is fetched from `public/data/running_text.json` at startup. The file contains an array of text items. If the file is missing, the ticker renders empty and does not throw.

---

## Custom Data Entry

The **Add Data** dialog (`src/components/DataForm/AddDataDialog.tsx`) lets users manually record a hazard point without any account or backend.

### Form Fields

| Field                | Type     | Notes                             |
| -------------------- | -------- | --------------------------------- |
| Category             | Select   | Matches existing layer categories |
| Title                | Text     | Short label for the point         |
| Description          | Textarea | Free-form notes                   |
| Latitude / Longitude | Number   | Manual entry or map click-to-pick |
| Date                 | Date     | Optional event date               |

### Map Click-to-Pick

When the user clicks **Pick from map**, the app dispatches `SET_PICKING_COORDS: true` to `AppContext`. The next map click fires `SET_PICKED_COORDS` with `{ lat, lng }`, which the form reads to populate its coordinate fields. The mode is cleared after a pick or on dialog close.

### Persistence

Points are saved to the `customPoints` table in `PetaBencanaDB` (IndexedDB via Dexie.js). See [Local Database (IndexedDB)](#local-database-indexeddb) for the full schema.

### Extending the Form

1. Add fields to `EMPTY_FORM` in `AddDataDialog.tsx`.
2. Update the Dexie schema version in `src/db/index.ts` (increment version number, update `.stores()`).
3. Update the `CustomPoint` interface in `src/types/index.ts`.

---

## Test Suite

Tests are run by [Vitest](https://vitest.dev/) in a Node.js environment (configured in `vitest.config.ts`).

### Commands

```bash
npm test               # Single run — used in CI and pre-push checks
npm run test:watch     # Watch mode — re-runs on file save during development
```

### Test Files

| File                                              | What It Covers                                                                                                                            |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `src/services/__tests__/coordinateParser.test.ts` | `parseGeoJSONCoord()`, `parseSeparateFields()`, `parseCommaString()`, `parseISODate()`, `parseDDMMYYYY()`, `parseDDMMYY()`, `makePoint()` |
| `src/services/__tests__/dataLoader.test.ts`       | `filterByTime()` for all 6 time ranges + null date handling, `toGeoJSON()` GeoJSON conversion + magnitude fallback                        |

### Adding New Tests

Co-locate test files in a `__tests__/` subdirectory next to the module under test. Follow the Vitest `describe` / `it` / `expect` pattern used in the existing files. Any new coordinate parser or loader function must have corresponding tests before a PR can be merged.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide covering bug reports, pull request workflow, code style rules, and how to add a new data layer.

---

## Deployment

The app is a pure static site. After `npm run build`, deploy the `dist/` folder to any static host (Nginx, Apache, Vercel, Netlify, GitHub Pages).

```bash
npm run build
# Upload dist/ to your hosting provider
```

No server-side configuration needed. All routing is single-page (no SPA redirect rules required since there's no client-side routing).
