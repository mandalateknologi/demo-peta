import { describe, it, expect } from 'vitest';
import { getFeatureBBox } from '../provinceUtils';
import type { Feature, Polygon, MultiPolygon } from 'geojson';

// ─── getFeatureBBox ───────────────────────────────────────────────────────────

describe('getFeatureBBox', () => {
  it('computes [west, south, east, north] for a simple Polygon', () => {
    const feature: Feature<Polygon> = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        // Outer ring: a rectangle from 100°E–110°E, 5°S–5°N
        coordinates: [
          [
            [100.0, -5.0],
            [110.0, -5.0],
            [110.0, 5.0],
            [100.0, 5.0],
            [100.0, -5.0], // closed ring
          ],
        ],
      },
      properties: {},
    };

    const [west, south, east, north] = getFeatureBBox(feature);

    expect(west).toBe(100.0);
    expect(south).toBe(-5.0);
    expect(east).toBe(110.0);
    expect(north).toBe(5.0);
  });

  it('spans across both polygons in a MultiPolygon', () => {
    // Two separate islands: one in north-west, one in south-east
    const feature: Feature<MultiPolygon> = {
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [[[95.0, 5.0], [96.0, 5.0], [96.0, 6.0], [95.0, 6.0], [95.0, 5.0]]],  // NW island
          [[[105.0, -8.0], [106.0, -8.0], [106.0, -7.0], [105.0, -7.0], [105.0, -8.0]]], // SE island
        ],
      },
      properties: {},
    };

    const [west, south, east, north] = getFeatureBBox(feature);

    expect(west).toBe(95.0);
    expect(south).toBe(-8.0);
    expect(east).toBe(106.0);
    expect(north).toBe(6.0);
  });

  it('handles a degenerate polygon where all vertices are the same point', () => {
    const feature: Feature<Polygon> = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[106.8, -6.2], [106.8, -6.2], [106.8, -6.2]]],
      },
      properties: {},
    };

    const [west, south, east, north] = getFeatureBBox(feature);

    expect(west).toBe(106.8);
    expect(south).toBe(-6.2);
    expect(east).toBe(106.8);
    expect(north).toBe(-6.2);
  });
});
