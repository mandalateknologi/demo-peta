# Duplication Categories Reference

Detailed patterns for identifying and classifying each type of code duplication in the Peta Bencana codebase.

## 1. Structural Mirrors

**Definition:** Two or more modules with the same component/hook structure and >60% identical exported function names, indicating they were likely copy-pasted and adapted.

**Detection pattern:**

1. Group components by feature folder (e.g., all files under `components/Sidebar/`)
2. Extract sorted exported symbol lists
3. Compute Jaccard similarity: `|A ∩ B| / |A ∪ B|`
4. Flag pairs with Jaccard ≥ 0.6

**Peta Bencana hotspots:**

- UI panel components (`Sidebar`, `Toolbar`, `TimeFilter`) — may share similar modal/panel structure with Radix primitives
- GIF-type vs circle-type layer handling code — parallel branches that could be unified

**Distinguishing from false positives:**

- Components with the same hook names but genuinely different render output are **not** structural mirrors — they follow the React composition pattern by design
- Only flag as a mirror when the _bodies_ of multiple functions are also similar (verify in Phase 3)

## 2. Signature Clones

**Definition:** Functions or components with identical name and parameter list defined in different modules.

**Detection pattern:**

1. `grep_search` for `export function` and `export const` across the scoped directory
2. For each function name appearing in 2+ files, extract full signatures
3. Compare: same name + same positional/keyword params = signature clone

**Typical examples:**

- `buildPopupHTML` or similar helpers reimplemented in multiple component files
- Coordinate formatting helpers (`formatCoord`) defined in multiple places
- Date formatting utilities appearing in both service and component files

**When it's NOT a clone:**

- Same function name with different type signatures (intentional overload by design)
- A re-export via an index file (`export { X } from './X'`)

## 3. Body Duplicates

**Definition:** Function bodies that are >80% identical line-by-line, indicating copy-paste with minimal adaptation.

**Detection pattern:**

1. For each flagged pair from category 1 or 2, read full function bodies
2. Normalize: strip comments, collapse whitespace, remove blank lines
3. Compare line-by-line; compute: `matching_lines / max(lines_A, lines_B)`
4. Score ≥ 0.8 = body duplicate

**Subcategories:**

| Subcategory             | Difference                       | Example                                                           |
| ----------------------- | -------------------------------- | ----------------------------------------------------------------- |
| **Exact copy**          | Zero differences                 | Same utility function in two files                                |
| **Variable rename**     | Only local variable names differ | `item` vs `point` vs `feature`                                    |
| **String literal swap** | Only string constants differ     | `'hotspot'` vs `'gempa-global'` in otherwise identical flow       |
| **Type reference swap** | Only type names differ           | `DataPoint` vs `CustomPoint` in otherwise identical serialization |

**Peta Bencana hotspots:**

- Loader functions in `dataLoader.ts` — multiple loaders share fetch→null-check→map→`makePoint()` with only the file name and field keys differing
- Popup HTML template strings — repeated structure for different layer popup content
- `useEffect` cleanup blocks across map component event listeners

## 4. Wrapper Families

**Definition:** Multiple React components following an identical composition pattern: wrapping a Radix UI primitive with the same Tailwind classes and forwarding all props with minimal transformation.

**Detection pattern:**

1. Search for components whose entire body is `return <RadixPrimitive className="..." {...props} />`
2. Check if most components simply forward props to the wrapped primitive with minimal transformation
3. Flag groups of 3+ components following the same pattern

**Peta Bencana hotspots:**

- Radix UI wrappers (dialog, label, checkbox, select) — if each is given a `className` wrapper without additional logic
- Icon-button combinations — repeated `<button className="..."><Icon /></button>` patterns in toolbar or sidebar

**Consolidation pattern:** Replace with a single generic wrapper component parameterized by the primitive type, or use a shared `cn()` class config.

## 5. Parallel Data Format Handlers

**Definition:** The same parsing or mapping logic implemented separately for different data source formats (GeoJSON, flat array, single-object) with only the field name/path differing.

**Detection pattern:**

1. Identify loader pairs that handle similar data shapes but different sources (e.g., `loadGempaGlobal` vs `loadKatalogGempa`)
2. Compare coordinate extraction logic
3. Compare date parsing logic
4. If both are >80% identical and only the field keys differ → parallel implementation

**Peta Bencana hotspots:**

- BMKG earthquake loaders: `loadGempaGlobal`, `loadKatalogGempa`, `loadGempaAlert` — all parse earthquake data but from differently structured JSON
- VSI earthquake loaders — similar parsing to BMKG but different field names
- GeoJSON-format loaders: any loaders reading `FeatureCollection` with `feature.geometry.coordinates` and `feature.properties`

**Consolidation pattern:** Config-driven factory — extract a `makeGeoJSONLoader(layerId, file, fieldMap)` factory function that accepts a field mapping config and returns a typed loader function.

## 6. Utility Scattering

**Definition:** The same helper function (or equivalent logic) implemented inline in 2+ modules instead of being centralized in `lib/utils.ts` or `services/coordinateParser.ts`.

**Detection pattern:**

1. Search for common operations across all scanned files:
   - Date formatting: `new Date(...)`, `.toLocaleDateString`, `.toISOString`
   - Coordinate formatting: `parseFloat(...)`, `.toFixed(N)`
   - HTML string building: template literals constructing `<div>...</div>`
   - Class merging: repeated `cn('base-class', ...)` with identical base
   - GeoJSON construction: `{ type: 'FeatureCollection', features: ... }`
2. For each pattern found in 3+ files, compare the surrounding logic
3. Flag cases where the full helper (not just a single call) is repeated

**Peta Bencana hotspots:**

- Coordinate display formatting (lat/lng to fixed decimal) if used in both popup HTML and data form
- Time comparison logic (`point.date >= cutoff`) if reimplemented outside `filterByTime()`
- HTML sanitization patterns if applied inconsistently across popup builders

**Consolidation pattern:** Extract into `lib/utils.ts` (for UI utilities) or `services/coordinateParser.ts` (for data utilities) and import from there.

## 7. Boilerplate Repetition

**Definition:** Identical setup or cleanup blocks repeated across component `useEffect` hooks, event listeners, or data loading calls — not full function duplication but repeated multi-line code blocks.

**Detection pattern:**

1. Read `useEffect` hooks across all components in target scope
2. Identify repeated blocks of ≥ 10 lines:
   - MapLibre event listener registration + cleanup
   - AppContext destructuring + derived variable construction
   - Radix UI state management (`open`, `setOpen`) wiring
   - Error boundary / loading state handling
3. Compare blocks pairwise; flag when >80% of lines match

**Peta Bencana hotspots:**

- MapLibre map event listeners in `MapContainer.tsx` — `map.on('click', ...)` / `map.off('click', ...)` pairs may follow identical structure for each layer
- `useAppContext()` destructuring blocks — if multiple components destructure the same subset of state with the same derived values
- Theme class toggling — if dark/light mode class manipulation appears in multiple places

**Consolidation pattern:** Pull common blocks into custom hooks (`useMapLayer`, `useTheme`, `useLayerData`) and call from components.

---

## Severity Mapping

| Category                      | Typical Severity  | Rationale                                  |
| ----------------------------- | ----------------- | ------------------------------------------ |
| Structural Mirrors            | Moderate–Critical | Depends on body similarity (Phase 3)       |
| Signature Clones              | Moderate          | Same interface suggests shared logic       |
| Body Duplicates               | Critical          | Direct maintenance burden                  |
| Wrapper Families              | Moderate          | High file count, low per-file LOC          |
| Parallel Data Format Handlers | Moderate          | Parsing/mapping duplication is extractable |
| Utility Scattering            | Low–Moderate      | Small per-instance but compounds           |
| Boilerplate Repetition        | Moderate          | Noise in diffs, maintenance drag           |
