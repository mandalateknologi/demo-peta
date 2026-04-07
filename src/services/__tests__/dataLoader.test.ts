import { describe, it, expect } from 'vitest';
import { filterByTime, toGeoJSON } from '../dataLoader';
import type { DataPoint } from '../../types';

// ─── Fixture helpers ──────────────────────────────────────────────────────────

/** Build a minimal DataPoint. Pass msAgo = null to get a point with no date. */
function makePoint(id: string, msAgo: number | null): DataPoint {
  return {
    id,
    lat: 0,
    lng: 0,
    layerId: 'test',
    date: msAgo !== null ? new Date(Date.now() - msAgo) : null,
    properties: {},
  };
}

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

// ─── filterByTime ─────────────────────────────────────────────────────────────

describe('filterByTime', () => {
  it('returns all points (including undated) when timeRange is "ALL"', () => {
    const points = [makePoint('a', ONE_DAY_MS * 10), makePoint('b', 0), makePoint('c', null)];
    expect(filterByTime(points, 'ALL')).toHaveLength(3);
  });

  it('keeps a point inside the 1h window and drops one outside', () => {
    const recent = makePoint('recent', ONE_HOUR_MS * 0.5); // 30 min ago — inside 1h
    const old = makePoint('old', ONE_HOUR_MS * 2);         // 2h ago   — outside 1h
    const result = filterByTime([recent, old], '1h');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('recent');
  });

  it('keeps a point inside the 7d window and drops one outside', () => {
    const recent = makePoint('recent', ONE_DAY_MS * 3);  // 3 days ago — inside 7d
    const old = makePoint('old', ONE_DAY_MS * 10);       // 10 days ago — outside 7d
    const result = filterByTime([recent, old], '7d');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('recent');
  });

  it('drops points with null date for any non-ALL range', () => {
    const withDate = makePoint('a', ONE_HOUR_MS * 0.5); // recent, has date
    const noDate = makePoint('b', null);
    const result = filterByTime([withDate, noDate], '24h');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a');
  });

  it('returns an empty array for empty input', () => {
    expect(filterByTime([], '24h')).toEqual([]);
  });
});

// ─── toGeoJSON ────────────────────────────────────────────────────────────────

describe('toGeoJSON', () => {
  it('produces a valid GeoJSON FeatureCollection', () => {
    const points: DataPoint[] = [
      { id: 'p1', lat: -6.2, lng: 106.8, date: null, layerId: 'hotspot', properties: {} },
    ];
    const fc = toGeoJSON(points);

    expect(fc.type).toBe('FeatureCollection');
    expect(fc.features).toHaveLength(1);
    expect(fc.features[0].type).toBe('Feature');
    expect(fc.features[0].geometry).toEqual({ type: 'Point', coordinates: [106.8, -6.2] });
    expect(fc.features[0].properties?.id).toBe('p1');
    expect(fc.features[0].properties?.layerId).toBe('hotspot');
  });

  it('sets mag to null when neither mag nor magnitude is present', () => {
    const points: DataPoint[] = [
      { id: 'p1', lat: 0, lng: 0, date: null, layerId: 'test', properties: {} },
    ];
    expect(toGeoJSON(points).features[0].properties?.mag).toBeNull();
  });

  it('uses the mag property when present', () => {
    const points: DataPoint[] = [
      { id: 'p1', lat: 0, lng: 0, date: null, layerId: 'test', properties: { mag: 5.5 } },
    ];
    expect(toGeoJSON(points).features[0].properties?.mag).toBe(5.5);
  });

  it('falls back to magnitude when mag is absent', () => {
    const points: DataPoint[] = [
      { id: 'p1', lat: 0, lng: 0, date: null, layerId: 'test', properties: { magnitude: 4.2 } },
    ];
    expect(toGeoJSON(points).features[0].properties?.mag).toBe(4.2);
  });

  it('serialises date as ISO string in properties', () => {
    const date = new Date('2024-12-25T10:00:00Z');
    const points: DataPoint[] = [
      { id: 'p1', lat: 0, lng: 0, date, layerId: 'test', properties: {} },
    ];
    expect(toGeoJSON(points).features[0].properties?.date).toBe(date.toISOString());
  });

  it('returns an empty FeatureCollection for empty input', () => {
    const fc = toGeoJSON([]);
    expect(fc.type).toBe('FeatureCollection');
    expect(fc.features).toHaveLength(0);
  });
});
