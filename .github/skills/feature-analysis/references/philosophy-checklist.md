# Peta Bencana Philosophy Checklist

Quick reference for evaluating whether a feature belongs in Peta Bencana.

## Core Principles

### 1. Data-Layer Architecture

- New hazard data sources should map to a layer entry in `config/layers.ts`
- Each layer has a loader function in `services/dataLoader.ts` that returns `DataPoint[]`
- Popup fields are declared in config, not hardcoded — the map renders from config
- Red flag: Feature requires significant hardcoded logic tied to a specific layer ID

### 2. Frontend-Only SPA

- No backend server — data must be static JSON in `public/data/` or fetched from a public API
- Feature must work by loading the built `dist/` folder in a browser (no server-side rendering)
- IndexedDB (via Dexie.js) is available for client-side persistence
- Red flag: Feature requires a database, authentication server, or user-generated content pipeline

### 3. Map-Centric UI

- Primary interaction surface is the MapLibre GL map
- Sidebar, Toolbar, and TimeFilter support the map — they don't replace it
- New UI should be a component in the appropriate `components/<Feature>/` folder
- Red flag: Feature is purely tabular/list-based with no map connection at all

## Type Contracts

| Type          | Location                 | Key Fields                                                                                                             |
| ------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `DataPoint`   | `types/index.ts`         | `id`, `lat`, `lng`, `date?`, `layerId`, `properties`                                                                   |
| `LayerConfig` | `types/index.ts`         | `id`, `name`, `file`, `markerType`, `color`, `hasDate`, `cluster`, `popupFields`, `defaultVisible`                     |
| `PopupField`  | `types/index.ts`         | `key`, `label`, `format?`                                                                                              |
| `TimeRange`   | `types/index.ts`         | `'1h' \| '6h' \| '24h' \| '48h' \| '7d' \| 'ALL'`                                                                      |
| `AppState`    | `context/AppContext.tsx` | `visibleLayers`, `timeRange`, `theme`, `rawData`, `filteredData`, `loading`, `errors`, `pickingCoords`, `pickedCoords` |
| `CustomPoint` | `types/index.ts`         | `id?`, `category`, `lat`, `lng`, `title`, `description`, `date`, `createdAt`                                           |

## Integration Hierarchy (prefer higher)

1. Config extension only — add `popupFields` format type or layer attribute (no new files)
2. New layer — add config entry + loader function in existing files
3. New service function — add parser or helper to `services/` (no new component)
4. New component — add feature folder under `components/` and wire into App
5. State extension — extend `AppState`, add reducer action, update context
6. New dependency — add npm package (last resort; justify bundle size impact)

## API Convention Checklist

- [ ] Layer config entry follows `LayerConfig` shape in `types/index.ts`
- [ ] Loader function signature: `export async function load<Name>(): Promise<DataPoint[]>`
- [ ] Loader registered in `loadAllData()` — both `loaders[]` and `layerIds[]` arrays
- [ ] `makePoint(id, layerId, coords, date, properties)` used for constructing points
- [ ] Components use `const { state, dispatch } = useAppContext()` for global state
- [ ] Components use `cn()` from `lib/utils` for conditional Tailwind class merging
- [ ] New icons imported from `lucide-react`
- [ ] Dark mode via `dark:` Tailwind variant (no manual class manipulation in components)
- [ ] Popup HTML values sanitized before insertion (no raw user input in HTML strings)

## Existing Layers Reference

| Layer ID        | Name                    | Source  | Marker | Has Date | Cluster | Default |
| --------------- | ----------------------- | ------- | ------ | -------- | ------- | ------- |
| `hotspot`       | HOTSPOT SIPONGI         | SIPONGI | circle | ✓        | ✓       | ✓       |
| `gempa-global`  | GEMPA (BMKG)            | BMKG    | circle | ✓        | ✓       | ✗       |
| `gempa-alert`   | ALERT GEMPA (BMKG)      | BMKG    | circle | ✓        | ✗       | ✗       |
| `katalog-gempa` | KATALOG GEMPA (BMKG)    | BMKG    | circle | ✓        | ✓       | ✗       |
| `gunung-api`    | GUNUNG API (VSI)        | VSI     | gif    | ✓        | ✗       | ✓       |
| `vsi-gempa`     | GEMPA BUMI (VSI)        | VSI     | circle | ✓        | ✓       | ✓       |
| `gerakan-tanah` | GERAKAN TANAH (VSI)     | VSI     | gif    | ✓        | ✗       | ✓       |
| `gamma-irrad`   | GAMMA IRRADIATOR (IAEA) | IAEA    | circle | ✗        | ✓       | ✗       |
