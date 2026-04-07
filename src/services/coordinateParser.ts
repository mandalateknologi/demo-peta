import type { DataPoint } from '../types';

// ─── Coordinate Parsers ───────────────────────────────────────────────────────

/** GeoJSON FeatureCollection with geometry.coordinates [lon, lat] (numbers or strings) */
export function parseGeoJSONCoord(feature: Record<string, unknown>): { lat: number; lng: number } | null {
  const geom = feature.geometry as { coordinates?: (string | number)[] } | null;
  if (!geom?.coordinates || geom.coordinates.length < 2) return null;
  const lng = parseFloat(String(geom.coordinates[0]));
  const lat = parseFloat(String(geom.coordinates[1]));
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}

/** Objects with separate named lat/lng fields (various naming conventions) */
export function parseSeparateFields(
  obj: Record<string, unknown>,
  latKey: string,
  lngKey: string,
): { lat: number; lng: number } | null {
  const lat = parseFloat(String(obj[latKey] ?? ''));
  const lng = parseFloat(String(obj[lngKey] ?? ''));
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}

/** "lon,lat" comma-separated string */
export function parseCommaString(coordStr: string): { lat: number; lng: number } | null {
  const parts = coordStr.split(',');
  if (parts.length < 2) return null;
  const lng = parseFloat(parts[0].trim());
  const lat = parseFloat(parts[1].trim());
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}

// ─── Date Parsers ─────────────────────────────────────────────────────────────

export function parseISODate(val: unknown): Date | null {
  if (!val) return null;
  const d = new Date(String(val));
  return isNaN(d.getTime()) ? null : d;
}

/** "DD-MM-YYYY" → Date */
export function parseDDMMYYYY(val: unknown): Date | null {
  if (!val) return null;
  const str = String(val);
  const parts = str.split('-');
  if (parts.length !== 3 || parts[2].length !== 4) return null;
  return parseISODate(`${parts[2]}-${parts[1]}-${parts[0]}`);
}

/** "DD-MM-YY" → Date (for datagempa: "07-04-26") */
export function parseDDMMYY(dateStr: string, timeStr: string): Date | null {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const time = timeStr.replace(/\s*WIB/i, '').trim();
  return parseISODate(`20${parts[2]}-${parts[1]}-${parts[0]}T${time}`);
}

// ─── Feature → DataPoint helpers ─────────────────────────────────────────────

export function makePoint(
  id: string,
  layerId: string,
  coords: { lat: number; lng: number },
  date: Date | null,
  properties: Record<string, unknown>,
): DataPoint {
  return { id, lat: coords.lat, lng: coords.lng, date, layerId, properties };
}
