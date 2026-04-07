# Claim Categories Reference

Detailed patterns for extracting and verifying each claim type from documentation.

## 1. Import Path Claims

**Pattern:** `import { X } from '../services/dataLoader'` or `import X from 'maplibre-gl'`

**Extraction regex:** `import\s+(?:\{[^}]+\}|\w+)\s+from\s+['"]([@./][^'"]+)['"]`

**Verification:**

1. Resolve the import path relative to the importing file
2. Check if the module file exists in `src/`
3. Check if the symbol is actually exported from that module (`export function`, `export const`, `export interface`, `export type`)
4. For package imports (no `./`), verify the package is in `package.json` dependencies

**Common AI hallucination patterns:**

- Inventing submodules: `import { parseCoord } from '../services/geoUtils'` (file doesn't exist)
- Wrong export type: importing a non-exported function
- Plausible but non-existent: `import { useLayer } from '../hooks/useLayer'` (hook not created yet)

## 2. Interface / Type Claims

**Pattern:** Any capitalized name used as a type: `DataPoint`, `LayerConfig`, `TimeRange`, `AppState`, `PopupField`

**Verification:**

1. `grep_search` for `interface TypeName` or `type TypeName =` in `src/types/index.ts`
2. If found, note the actual field names and their types
3. Verify claimed fields match actual interface definition
4. Check if it's a union type, mapped type, or plain interface

**Common AI hallucination patterns:**

- Renaming types: `PointData` instead of `DataPoint`
- Inventing fields: `point.title` (not on `DataPoint`; title lives in `CustomPoint` for user-added points)
- Adding optional fields that don't exist: `config.description?`

## 3. Function / Method Signature Claims

**Pattern:** `loadAllData()`, `parseGeoJSONCoord(feature)`, `makePoint(id, layerId, coords, date, props)`, `filterByTime(points, timeRange)`

**Verification:**

1. Find the function definition with `grep_search` for `function functionName` or `export const functionName`
2. Read the full signature including all parameters, types, and defaults
3. Check if the documented params match: names, types, order
4. Check for params documented but not in code (hallucinated params)
5. Verify the return type matches documentation

**Common AI hallucination patterns:**

- Extra parameters: `makePoint(id, layerId, coords, date, props, meta)` — `meta` might not exist
- Wrong param order: `parseSeparateFields(latKey, lngKey, obj)` — actual order is `(obj, latKey, lngKey)`
- Inventing overloads: describing `loadAllData(layerIds?)` with optional filter that doesn't exist

## 4. Component Prop Claims

**Pattern:** `<Sidebar onClose={...} />`, `<TimeFilter initialRange="7d" />`

**Verification:**

1. Find the component file in `src/components/`
2. Read the props interface (or destructured params)
3. Verify documented props exist with correct names and types
4. Check if the component reads from `useAppContext()` instead of taking claimed props

**Common AI hallucination patterns:**

- Describing props that are actually read from global state (`useAppContext()`)
- Incorrect prop types: `theme: string` vs `theme: Theme`
- Inventing callback props that don't exist

## 5. State Shape Claims

**Pattern:** `state.visibleLayers`, `state.timeRange`, `state.rawData`, `state.filteredData`

**Verification:**

1. Read `AppState` interface in `src/context/AppContext.tsx`
2. Verify the field names and types match exactly
3. For action types, verify the type string in the reducer switch
4. Check payload shapes for actions that carry data

**Common AI hallucination patterns:**

- Wrong field name: `state.layerVisibility` vs `state.visibleLayers`
- Missing fields: not mentioning `pickingCoords` or `pickedCoords`
- Wrong action type string: `'TOGGLE_VISIBILITY'` vs `'TOGGLE_LAYER'`

## 6. Layer Config Claims

**Pattern:** Layer ID `"hotspot"`, color `"#ff5500"`, marker type `"circle"`, `defaultVisible: true`

**Verification:**

1. Read `src/config/layers.ts` and find the layer by ID
2. Verify all claimed fields: `id`, `name`, `file`, `markerType`, `color`, `hasDate`, `cluster`, `defaultVisible`
3. Verify `popupFields` array contents match documentation
4. For GIF layers, check `gifSrc` and `pinImageRules`

**Common AI hallucination patterns:**

- Wrong color hex: minor digit errors are common
- Wrong layer IDs: `"earthquake-global"` vs `"gempa-global"`
- Claiming cluster is enabled on a GIF-marker layer (not possible with DOM markers)

## 7. Data File Structure Claims

**Pattern:** "JSON array of objects with `lat` and `lon` fields", "GeoJSON FeatureCollection"

**Verification:**

1. `file_search` to confirm the file exists in `public/data/`
2. Read the first 20-50 lines of the file to inspect actual structure
3. Verify top-level shape (`FeatureCollection`, plain array, single object)
4. Verify claimed field names match actual keys in data

**Common AI hallucination patterns:**

- Wrong top-level key: `json.data` vs `json.features` for GeoJSON
- Fabricated field names: `item.longitude` when actual field is `item.lon` or embedded in nested path
- Claiming fields are always present when they are sometimes null/missing

## 8. NPM Script Claims

**Pattern:** `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`

**Verification:**

1. Read `scripts` section in `package.json`
2. Verify the script name exists and the command matches documentation
3. For build claims, verify `tsc -b && vite build` (not just `vite build`)

## 9. File / Path Reference Claims

**Pattern:** "See `DEVELOPMENT.md`", "data files in `public/data/`", "layer config in `src/config/layers.ts`"

**Verification:**

1. `file_search` for the referenced path
2. If the file exists, optionally verify the content matches what the doc claims it contains

**Common AI hallucination patterns:**

- Wrong directory: `src/data/` vs `public/data/`
- Non-existent files: referencing example scripts or config files that don't exist

## 10. Behavioral Claims

**Pattern:** "fails silently on 404", "clusters enabled", "dark mode via `.dark` class on root", "time filter compares `point.date >= cutoff`"

**Verification:**

1. Read the actual implementation
2. For "fails silently" → look for try/catch with empty array return or `null` check
3. For "clusters" → check `cluster: true` in layer config and `clusterMaxZoom`/`clusterRadius` in `addSource()`
4. For theme → check `document.documentElement.classList` manipulation in `AppContext.tsx`
5. For time filter → read `filterByTime()` in `dataLoader.ts`
