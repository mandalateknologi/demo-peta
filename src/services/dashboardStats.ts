import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import type {
  DataPoint,
  LayerCount,
  ProvinceCount,
  TimeSeriesBucket,
} from '../types';

type ProvinceFeature = Feature<Polygon | MultiPolygon>;

interface PointWithLayer {
  lat: number;
  lng: number;
  layerId: string;
}

function isProvinceFeature(
  feature: Feature,
): feature is ProvinceFeature {
  return feature.geometry?.type === 'Polygon' || feature.geometry?.type === 'MultiPolygon';
}

function getBucketKey(date: Date, bucketSize: 'hour' | 'day'): string {
  if (bucketSize === 'hour') {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
    ).toISOString();
  }

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).toISOString();
}

/**
 * Count total and filtered points per layer.
 */
export function computeLayerCounts(
  rawData: Record<string, DataPoint[]>,
  filteredData: Record<string, DataPoint[]>,
): Record<string, LayerCount> {
  const counts: Record<string, LayerCount> = {};
  const layerIds = new Set([
    ...Object.keys(rawData),
    ...Object.keys(filteredData),
  ]);

  for (const layerId of layerIds) {
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
  if (!provinceGeoJSON || topN <= 0) {
    return [];
  }

  const provinceCounts: ProvinceCount[] = [];
  const allPoints: PointWithLayer[] = Object.entries(filteredData).flatMap(
    ([layerId, points]) => points.map((item) => ({
      lat: item.lat,
      lng: item.lng,
      layerId,
    })),
  );

  for (const feature of provinceGeoJSON.features) {
    if (!isProvinceFeature(feature)) {
      continue;
    }

    const props = feature.properties as {
      province_id?: string;
      name?: string;
    } | null;

    if (!props?.province_id || !props.name) {
      continue;
    }

    const breakdown: Record<string, number> = {};
    let total = 0;

    for (const item of allPoints) {
      try {
        const pt = point([item.lng, item.lat]);
        if (booleanPointInPolygon(pt, feature)) {
          breakdown[item.layerId] = (breakdown[item.layerId] ?? 0) + 1;
          total++;
        }
      } catch {
        // Skip malformed coordinates.
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

  provinceCounts.sort((left, right) => right.total - left.total);
  return provinceCounts.slice(0, topN);
}

/**
 * Bucket filtered data points by time intervals for trend visualization.
 */
export function computeTimeSeries(
  filteredData: Record<string, DataPoint[]>,
  bucketSize: 'hour' | 'day',
): TimeSeriesBucket[] {
  const bucketMap = new Map<string, Record<string, number>>();

  for (const [layerId, points] of Object.entries(filteredData)) {
    for (const item of points) {
      if (!item.date) {
        continue;
      }

      const date = new Date(item.date);
      if (Number.isNaN(date.getTime())) {
        continue;
      }

      const bucketKey = getBucketKey(date, bucketSize);
      const counts = bucketMap.get(bucketKey) ?? {};
      counts[layerId] = (counts[layerId] ?? 0) + 1;
      bucketMap.set(bucketKey, counts);
    }
  }

  return Array.from(bucketMap.entries())
    .map(([bucket, counts]) => ({ bucket, counts }))
    .sort((left, right) => left.bucket.localeCompare(right.bucket));
}