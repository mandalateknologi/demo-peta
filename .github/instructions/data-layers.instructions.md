---
description: "Use when working on data loaders, coordinate parsers, layer configuration, or adding new data sources. Covers services/, config/layers.ts, and data file conventions."
applyTo: ["src/services/**", "src/config/**"]
---
# Data Layer & Services Guidelines

## Layer Configuration (`config/layers.ts`)
- Every data layer must be registered in the `LAYERS` array
- Required fields: `id`, `name`, `file`, `markerType`, `color`, `hasDate`, `cluster`, `popupFields`, `defaultVisible`
- `id` must be unique and kebab-case (e.g., `'hotspot'`, `'gempa-global'`)
- `file` is the filename in `public/data/` (e.g., `'hotspot_sipongi.json'`)
- `popupFields` defines which properties appear in map popups and their display labels

## Data Loaders (`services/dataLoader.ts`)
- Each layer has a dedicated `async function load<LayerName>(): Promise<DataPoint[]>`
- Fetch from `/data/<filename>` — use relative URL so Vite serves from `public/`
- Wrap fetch in try/catch; return empty array `[]` on failure (fail silently)
- Normalize all records to `DataPoint` interface:
  ```ts
  { id, lat, lng, date: Date | null, layerId, properties: Record<string, unknown> }
  ```
- Register loader in `loadAllData()` keyed by layer `id`

## Coordinate Parsing (`services/coordinateParser.ts`)
- Use `parseGeoJSONCoord()` for GeoJSON `geometry.coordinates`
- Use `parseSeparateFields(latKey, lngKey)` for separate lat/lng properties
- Use `parseCommaString()` for `"lon,lat"` string fields
- Handle string-encoded numbers (`parseFloat`) — many data sources serve coords as strings
- Strip cardinal suffixes (`LS`, `LU`, `BT`, `BB`) and negate for South/West

## Date Parsing
- Use `parseISODate()` for ISO 8601 / RFC 3339 dates
- Use `parseDDMMYYYY()` for `dd-mm-yyyy` format
- Use `parseDDMMYY(dateStr, timeStr)` for split date+time fields
- Return `null` for unparseable dates — never throw

## Data Files
- Served from `public/data/*.json`
- Also mirrored in `data/` (source copies)
- Formats vary: GeoJSON FeatureCollection, plain arrays, nested objects
- New data files go in both `public/data/` and `data/`
