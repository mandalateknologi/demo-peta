import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import type { DataPoint } from '../types';

/**
 * Given a province GeoJSON feature and a map of layerId → DataPoint[],
 * returns the count of points that fall inside the province polygon.
 * Only the selected province is tested — computation is lazy.
 */
export function getProvinceDisasterCounts(
  provinceFeature: Feature<Polygon | MultiPolygon>,
  filteredData: Record<string, DataPoint[]>,
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const [layerId, points] of Object.entries(filteredData)) {
    let count = 0;
    for (const p of points) {
      try {
        const pt = point([p.lng, p.lat]);
        if (booleanPointInPolygon(pt, provinceFeature)) {
          count++;
        }
      } catch {
        // Skip malformed coordinates
      }
    }
    counts[layerId] = count;
  }

  return counts;
}

/**
 * Compute the bounding box [west, south, east, north] of a GeoJSON Feature.
 */
export function getFeatureBBox(
  feature: Feature<Polygon | MultiPolygon>,
): [number, number, number, number] {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;

  const processRing = (ring: number[][]) => {
    for (const [lng, lat] of ring) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  };

  const geom = feature.geometry;
  if (geom.type === 'Polygon') {
    geom.coordinates.forEach(processRing);
  } else {
    geom.coordinates.forEach((poly) => poly.forEach(processRing));
  }

  return [minLng, minLat, maxLng, maxLat];
}
