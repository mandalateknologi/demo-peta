import type { DataPoint } from '../types';
import {
  parseGeoJSONCoord,
  parseSeparateFields,
  parseCommaString,
  parseISODate,
  parseDDMMYYYY,
  parseDDMMYY,
  makePoint,
} from './coordinateParser';

async function fetchJSON(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Per-layer loaders ────────────────────────────────────────────────────────

async function loadHotspot(): Promise<DataPoint[]> {
  const json = await fetchJSON('/data/hotspot_sipongi.json');
  if (!json) return [];
  const fc = json as { features?: Record<string, unknown>[] };
  return (fc.features ?? []).flatMap((f, i) => {
    const coords = parseGeoJSONCoord(f);
    if (!coords) return [];
    const props = (f.properties ?? {}) as Record<string, unknown>;
    return [makePoint(`hotspot-${i}`, 'hotspot', coords, parseISODate(props.date_hotspot_ori), props)];
  });
}

async function loadGempaGlobal(): Promise<DataPoint[]> {
  const json = await fetchJSON('/data/3mgempaQL.json');
  if (!json) return [];
  const fc = json as { features?: Record<string, unknown>[] };
  return (fc.features ?? []).flatMap((f, i) => {
    const coords = parseGeoJSONCoord(f);
    if (!coords) return [];
    const props = (f.properties ?? {}) as Record<string, unknown>;
    return [makePoint(
      `gempa-global-${props.id ?? i}`,
      'gempa-global',
      coords,
      parseISODate(props.time),
      props,
    )];
  });
}

async function loadGempaAlert(): Promise<DataPoint[]> {
  const json = await fetchJSON('/data/datagempa.json');
  if (!json) return [];

  // datagempa.json is a single alert object: { info: { ... } }
  const root = json as Record<string, unknown>;
  const info = (root.info ?? root) as Record<string, unknown>;

  let coords = null;

  // Try info.point.coordinates "lon,lat" string
  const point = info.point as { coordinates?: string } | undefined;
  if (point?.coordinates) {
    coords = parseCommaString(point.coordinates);
  }

  // Fallback: separate lon/lat fields
  if (!coords) {
    coords = parseSeparateFields(info, 'lat', 'lon') ?? parseSeparateFields(info, 'latitude', 'longitude');
    // BMKG uses cardinal strings like "6.20 LS" — strip suffix
    if (!coords) {
      const latRaw = String(info.lat ?? info.latitude ?? '').replace(/[^\d.-]/g, '');
      const lngRaw = String(info.lon ?? info.longitude ?? '').replace(/[^\d.-]/g, '');
      const lat = parseFloat(latRaw);
      const lng = parseFloat(lngRaw);
      if (!isNaN(lat) && !isNaN(lng)) coords = { lat, lng };
    }
  }

  if (!coords) return [];

  // Date: "07-04-26" + "20:40:17 WIB"
  const dateStr = String(info.date ?? '');
  const timeStr = String(info.time ?? '');
  const date = dateStr && timeStr ? parseDDMMYY(dateStr, timeStr) : parseISODate(info.datetime);

  return [makePoint('gempa-alert-0', 'gempa-alert', coords, date, info)];
}

async function loadKatalogGempa(): Promise<DataPoint[]> {
  const json = await fetchJSON('/data/katalog_gempa.json');
  if (!json) return [];
  const fc = json as { features?: Record<string, unknown>[] };
  return (fc.features ?? []).flatMap((f, i) => {
    const coords = parseGeoJSONCoord(f);
    if (!coords) return [];
    const props = (f.properties ?? {}) as Record<string, unknown>;
    return [makePoint(`katalog-gempa-${i}`, 'katalog-gempa', coords, parseDDMMYYYY(props.date), props)];
  });
}

async function loadGunungApi(): Promise<DataPoint[]> {
  const json = await fetchJSON('/data/vsi-gunung-api.json');
  if (!json) return [];
  const arr = json as Record<string, unknown>[];
  return arr.flatMap((volcano, i) => {
    const coords = parseSeparateFields(volcano, 'ga_lat_gapi', 'ga_lon_gapi');
    if (!coords) return [];

    // Merge latest VONA data into properties for popup
    const vonArray = (volcano.vona ?? []) as Record<string, unknown>[];
    const latestVona = vonArray[0] ?? {};
    const props: Record<string, unknown> = {
      ...volcano,
      cu_avcode: latestVona.cu_avcode,
      volcanic_act_summ: latestVona.volcanic_act_summ,
      date_time: latestVona.date_time,
    };

    const date = parseISODate(latestVona.issued_time);
    return [makePoint(`gunung-api-${volcano.ga_code ?? i}`, 'gunung-api', coords, date, props)];
  });
}

async function loadVsiGempa(): Promise<DataPoint[]> {
  const json = await fetchJSON('/data/vsi-gempa.json');
  if (!json) return [];
  const arr = json as Record<string, unknown>[];
  return arr.flatMap((item, i) => {
    const coords = parseSeparateFields(item, 'lat_lima', 'lon_lima');
    if (!coords) return [];
    return [makePoint(`vsi-gempa-${item.no ?? i}`, 'vsi-gempa', coords, parseISODate(item.datetime_wib), item)];
  });
}

async function loadGerakanTanah(): Promise<DataPoint[]> {
  const json = await fetchJSON('/data/vsi-gerakan-tanah.json');
  if (!json) return [];
  const arr = json as Record<string, unknown>[];
  return arr.flatMap((item, i) => {
    const coords = parseSeparateFields(item, 'crs_lat', 'crs_lon');
    if (!coords) return [];

    // Flatten tanggapan nested object fields into properties for popup
    const tanggapan = (item.tanggapan ?? {}) as Record<string, unknown>;
    const props: Record<string, unknown> = {
      ...item,
      qls_tgt: tanggapan.qls_tgt,
      qls_zkg: Array.isArray(tanggapan.qls_zkg) ? (tanggapan.qls_zkg as string[]).join(', ') : tanggapan.qls_zkg,
    };

    return [makePoint(`gerakan-tanah-${item.crs_ids ?? i}`, 'gerakan-tanah', coords, parseISODate(item.date), props)];
  });
}

async function loadGammaIrrad(): Promise<DataPoint[]> {
  const json = await fetchJSON('/data/gamma-irradiators.json');
  if (!json) return [];
  const root = json as { facilities?: Record<string, unknown>[] };
  return (root.facilities ?? []).flatMap((item) => {
    const coords = parseSeparateFields(item, 'lat', 'lon');
    if (!coords) return [];
    return [makePoint(`gamma-${item.id}`, 'gamma-irrad', coords, null, item)];
  });
}

// ─── Province loaders ─────────────────────────────────────────────────────────

export async function loadProvinceGeoJSON(): Promise<GeoJSON.FeatureCollection | null> {
  const json = await fetchJSON('/data/indonesia-provinces.geojson');
  if (!json) return null;
  return json as GeoJSON.FeatureCollection;
}

export async function loadProvinceInfo(): Promise<Record<string, import('../types').ProvinceInfo> | null> {
  const json = await fetchJSON('/data/indonesia-province-info.json');
  if (!json) return null;
  return json as Record<string, import('../types').ProvinceInfo>;
}

// ─── Main loader ──────────────────────────────────────────────────────────────

export type LoadResult = { layerId: string; points: DataPoint[]; error?: string };

export async function loadAllData(): Promise<LoadResult[]> {
  const results = await Promise.allSettled([
    loadHotspot(),
    loadGempaGlobal(),
    loadGempaAlert(),
    loadKatalogGempa(),
    loadGunungApi(),
    loadVsiGempa(),
    loadGerakanTanah(),
    loadGammaIrrad(),
  ]);

  const layerIds = [
    'hotspot',
    'gempa-global',
    'gempa-alert',
    'katalog-gempa',
    'gunung-api',
    'vsi-gempa',
    'gerakan-tanah',
    'gamma-irrad',
  ];

  return results.map((res, i) => ({
    layerId: layerIds[i],
    points: res.status === 'fulfilled' ? res.value : [],
    error: res.status === 'rejected' ? String(res.reason) : undefined,
  }));
}

// ─── Time filter ──────────────────────────────────────────────────────────────

import type { TimeRange } from '../types';

const DURATION_MS: Record<TimeRange, number> = {
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '48h': 48 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  ALL: 0,
};

export function filterByTime(points: DataPoint[], timeRange: TimeRange): DataPoint[] {
  if (timeRange === 'ALL') return points;
  const cutoff = new Date(Date.now() - DURATION_MS[timeRange]);
  return points.filter((p) => p.date && p.date >= cutoff);
}

// ─── Points → GeoJSON ────────────────────────────────────────────────────────

export function toGeoJSON(points: DataPoint[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: points.map((p) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: {
        id: p.id,
        layerId: p.layerId,
        date: p.date?.toISOString() ?? null,
        mag: p.properties.mag ?? p.properties.magnitude ?? null,
        ...p.properties,
      },
    })),
  };
}
