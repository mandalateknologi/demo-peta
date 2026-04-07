---
name: data-parser
description: "Write coordinate and date parsers for new Indonesian hazard data sources. Use when parsing BMKG, VSI, SIPONGI, or other government data feeds with non-standard formats."
---

# Data Parser Skill

Write coordinate and date parsers for Indonesian hazard data sources that use non-standard formats.

## When to Use

- Integrating a new JSON data feed from BMKG, VSI, SIPONGI, BPBD, or similar agencies
- Data has coordinates in unusual formats (cardinal suffixes, comma strings, nested GeoJSON)
- Dates use Indonesian conventions (dd-mm-yyyy, WIB timezone, split date+time fields)

## Existing Parsers

All parsers live in `src/services/coordinateParser.ts`. Check if an existing parser fits before creating a new one.

### Coordinate Parsers

| Function                                   | Input                                      | Example                                       |
| ------------------------------------------ | ------------------------------------------ | --------------------------------------------- |
| `parseGeoJSONCoord(feature)`               | GeoJSON `geometry.coordinates: [lon, lat]` | `[106.85, -6.21]` or `["106.85", "-6.21"]`    |
| `parseSeparateFields(obj, latKey, lngKey)` | Named fields on object                     | `{ ga_lat_gapi: -7.54, ga_lon_gapi: 110.44 }` |
| `parseCommaString(str)`                    | `"lon,lat"` string                         | `"106.85,-6.21"`                              |

### Date Parsers

| Function                        | Input                                        | Example                        |
| ------------------------------- | -------------------------------------------- | ------------------------------ |
| `parseISODate(val)`             | ISO 8601 / any `new Date()`-parseable string | `"2026-04-07T07:51:57Z"`       |
| `parseDDMMYYYY(val)`            | `DD-MM-YYYY`                                 | `"07-04-2026"`                 |
| `parseDDMMYY(dateStr, timeStr)` | `DD-MM-YY` + `HH:MM:SS WIB`                  | `"07-04-26"`, `"20:40:17 WIB"` |

### Helper

| Function                                           | Purpose                                    |
| -------------------------------------------------- | ------------------------------------------ |
| `makePoint(id, layerId, coords, date, properties)` | Construct a `DataPoint` from parsed values |

## Procedure for New Parsers

### 1. Analyze the Data Format

Inspect the JSON file to identify:

- Where coordinates live (nested path, field names, format)
- Where dates live (field name, format, timezone)
- Any cardinal direction suffixes (`LS` = South, `LU` = North, `BT` = East, `BB` = West)

### 2. Add Parser to `coordinateParser.ts`

Follow existing patterns:

- Accept `unknown` or `string` input, coerce with `String()`
- Return `{ lat: number; lng: number } | null` for coords or `Date | null` for dates
- Return `null` on failure — never throw
- Handle string-encoded numbers (`parseFloat(String(...))`)
- Indonesian cardinal suffixes: negate for `LS` (Lintang Selatan / South) and `BB` (Bujur Barat / West)

```ts
// Example: "6.20 LS", "110.44 BT"
export function parseCardinalCoord(
  latStr: string,
  lngStr: string,
): { lat: number; lng: number } | null {
  let lat = parseFloat(latStr.replace(/[^\d.-]/g, ""));
  let lng = parseFloat(lngStr.replace(/[^\d.-]/g, ""));
  if (isNaN(lat) || isNaN(lng)) return null;
  if (/LS/i.test(latStr)) lat = -Math.abs(lat);
  if (/BB/i.test(lngStr)) lng = -Math.abs(lng);
  return { lat, lng };
}
```

### 3. Export and Use in Loader

- Export the new function from `coordinateParser.ts`
- Import it in `dataLoader.ts` in the loader function for the new layer

## Common Indonesian Data Quirks

- Coordinates often come as **strings**, not numbers
- GeoJSON depth sometimes in coordinates array: `[lon, lat, depth]`
- Latitude south of equator may be positive with `LS` suffix instead of negative
- Time fields may include `WIB` (UTC+7), `WITA` (UTC+8), or `WIT` (UTC+9)
- Date separators vary: `-`, `/`, or space
- Some sources return a single object (gempa-alert), not an array
