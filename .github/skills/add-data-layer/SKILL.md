---
name: add-data-layer
description: "Add a new hazard data layer to the map. Use when adding a new data source, creating a new map layer, or integrating a new JSON data feed into Peta Bencana."
---
# Add a New Data Layer

End-to-end procedure for adding a new hazard/data layer to the Peta Bencana map.

## Prerequisites
- A JSON data file with geographic coordinates
- Know the coordinate format (GeoJSON, separate fields, comma string)
- Know the date format (ISO 8601, dd-mm-yyyy, or none)

## Procedure

### 1. Add the Data File
Place the JSON file in both locations:
- `public/data/<filename>.json` (served by Vite)
- `data/<filename>.json` (source copy)

### 2. Define the Layer Config
Add an entry to the `LAYERS` array in [config/layers.ts](./references/layer-config-template.md):

```ts
{
  id: '<kebab-case-id>',          // unique, used as key everywhere
  name: '<DISPLAY NAME>',         // shown in sidebar
  file: '/data/<filename>.json',  // path served by Vite
  markerType: 'circle',           // 'circle' or 'gif'
  gifSrc: '/icons/<name>.gif',    // only if markerType is 'gif'
  color: '#hexcolor',             // marker color
  hasDate: true,                  // set false if data has no timestamps
  cluster: true,                  // enable MapLibre clustering
  defaultVisible: false,          // visible on load?
  popupFields: [
    { key: 'property_key', label: 'Display Label' },
    // add fields shown in popup
  ],
}
```

### 3. Create the Loader Function
In `src/services/dataLoader.ts`, add a new async loader:

```ts
async function loadNewLayer(): Promise<DataPoint[]> {
  const json = await fetchJSON('/data/<filename>.json');
  if (!json) return [];

  // Choose the right parser for the data format:
  // GeoJSON FeatureCollection:
  const fc = json as { features?: Record<string, unknown>[] };
  return (fc.features ?? []).flatMap((f, i) => {
    const coords = parseGeoJSONCoord(f);
    if (!coords) return [];
    const props = (f.properties ?? {}) as Record<string, unknown>;
    return [makePoint(`<layer-id>-${i}`, '<layer-id>', coords, parseISODate(props.date_field), props)];
  });

  // OR plain array:
  const arr = json as Record<string, unknown>[];
  return arr.flatMap((item, i) => {
    const coords = parseSeparateFields(item, 'lat_key', 'lng_key');
    if (!coords) return [];
    return [makePoint(`<layer-id>-${i}`, '<layer-id>', coords, parseISODate(item.date_key), item)];
  });
}
```

### 4. Register in `loadAllData()`
Add the loader call and layer ID to both arrays in `loadAllData()`:

```ts
const results = await Promise.allSettled([
  // ... existing loaders
  loadNewLayer(),         // ← add here
]);

const layerIds = [
  // ... existing IDs
  '<layer-id>',          // ← add here (same index)
];
```

### 5. Add Reducer State (if needed)
The layer is automatically picked up by `AppContext.tsx` via the `SET_DATA` action — no changes needed unless the layer requires custom state.

### 6. Verify
- `npm run dev` — check the sidebar shows the new layer with toggle
- Enable the layer — markers should appear on the map
- Click a marker — popup should show the configured fields
- If `hasDate: true`, test time filter ranges

## Data Format Reference

| Format | Parser | Example |
|--------|--------|---------|
| GeoJSON FeatureCollection | `parseGeoJSONCoord(feature)` | hotspot, gempa-global, katalog-gempa |
| Separate lat/lng fields | `parseSeparateFields(obj, latKey, lngKey)` | gunung-api, vsi-gempa, gerakan-tanah |
| Comma string `"lon,lat"` | `parseCommaString(str)` | gempa-alert (fallback) |
| ISO 8601 date | `parseISODate(value)` | Most layers |
| dd-mm-yyyy date | `parseDDMMYYYY(value)` | katalog-gempa |
| dd-mm-yy + time | `parseDDMMYY(dateStr, timeStr)` | gempa-alert |
| No dates | Return `null` for date | gamma-irrad |

## Checklist
- [ ] JSON file in `public/data/` and `data/`
- [ ] Layer config in `config/layers.ts`
- [ ] Loader function in `services/dataLoader.ts`
- [ ] Loader registered in `loadAllData()` with matching index
- [ ] `npm run build` passes
- [ ] Layer toggle appears in sidebar
- [ ] Markers render on map
- [ ] Popup displays correct fields
