import { describe, it, expect } from 'vitest';
import {
  parseGeoJSONCoord,
  parseSeparateFields,
  parseCommaString,
  parseISODate,
  parseDDMMYYYY,
  parseDDMMYY,
  makePoint,
} from '../coordinateParser';

// ─── parseGeoJSONCoord ────────────────────────────────────────────────────────

describe('parseGeoJSONCoord', () => {
  it('extracts lat/lng from numeric coordinates', () => {
    const feature = { geometry: { coordinates: [106.8, -6.2] } };
    expect(parseGeoJSONCoord(feature)).toEqual({ lat: -6.2, lng: 106.8 });
  });

  it('parses string coordinates', () => {
    const feature = { geometry: { coordinates: ['106.8', '-6.2'] } };
    expect(parseGeoJSONCoord(feature)).toEqual({ lat: -6.2, lng: 106.8 });
  });

  it('returns null when geometry is missing', () => {
    expect(parseGeoJSONCoord({})).toBeNull();
    expect(parseGeoJSONCoord({ geometry: null })).toBeNull();
  });

  it('returns null when coordinates are non-numeric', () => {
    const feature = { geometry: { coordinates: ['abc', 'xyz'] } };
    expect(parseGeoJSONCoord(feature)).toBeNull();
  });
});

// ─── parseSeparateFields ──────────────────────────────────────────────────────

describe('parseSeparateFields', () => {
  it('extracts lat/lng from separate named fields', () => {
    const obj = { lat: -6.2, lon: 106.8 };
    expect(parseSeparateFields(obj, 'lat', 'lon')).toEqual({ lat: -6.2, lng: 106.8 });
  });

  it('parses string numbers', () => {
    const obj = { latitude: '-6.2', longitude: '106.8' };
    expect(parseSeparateFields(obj, 'latitude', 'longitude')).toEqual({ lat: -6.2, lng: 106.8 });
  });

  it('returns null when a key is missing', () => {
    expect(parseSeparateFields({ lat: -6.2 }, 'lat', 'lon')).toBeNull();
  });

  it('returns null when values are non-numeric', () => {
    expect(parseSeparateFields({ lat: 'x', lon: 'y' }, 'lat', 'lon')).toBeNull();
  });
});

// ─── parseCommaString ─────────────────────────────────────────────────────────

describe('parseCommaString', () => {
  it('parses "lon,lat" string', () => {
    expect(parseCommaString('106.8,-6.2')).toEqual({ lat: -6.2, lng: 106.8 });
  });

  it('handles whitespace around values', () => {
    expect(parseCommaString(' 106.8 , -6.2 ')).toEqual({ lat: -6.2, lng: 106.8 });
  });

  it('returns null when fewer than 2 parts', () => {
    expect(parseCommaString('106.8')).toBeNull();
  });

  it('returns null when values are non-numeric', () => {
    expect(parseCommaString('abc,xyz')).toBeNull();
  });
});

// ─── parseISODate ─────────────────────────────────────────────────────────────

describe('parseISODate', () => {
  it('parses a valid ISO 8601 string', () => {
    const d = parseISODate('2024-12-25T10:00:00Z');
    expect(d).toBeInstanceOf(Date);
    expect(d!.getUTCFullYear()).toBe(2024);
    expect(d!.getUTCMonth()).toBe(11); // December is month index 11
    expect(d!.getUTCDate()).toBe(25);
  });

  it('returns null for empty/falsy values', () => {
    expect(parseISODate('')).toBeNull();
    expect(parseISODate(null)).toBeNull();
    expect(parseISODate(undefined)).toBeNull();
  });

  it('returns null for invalid date strings', () => {
    expect(parseISODate('not-a-date')).toBeNull();
  });
});

// ─── parseDDMMYYYY ────────────────────────────────────────────────────────────

describe('parseDDMMYYYY', () => {
  it('parses "DD-MM-YYYY" into a UTC Date', () => {
    const d = parseDDMMYYYY('25-12-2024');
    expect(d).toBeInstanceOf(Date);
    expect(d!.getUTCFullYear()).toBe(2024);
    expect(d!.getUTCMonth()).toBe(11); // December
    expect(d!.getUTCDate()).toBe(25);
  });

  it('returns null for a 2-digit year (wrong format)', () => {
    expect(parseDDMMYYYY('25-12-24')).toBeNull();
  });

  it('returns null for ISO-ordered date (wrong field order)', () => {
    // "2024-12-25": parts[2] = "25" which has length 2, not 4 → null
    expect(parseDDMMYYYY('2024-12-25')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(parseDDMMYYYY('')).toBeNull();
  });
});

// ─── parseDDMMYY ─────────────────────────────────────────────────────────────

describe('parseDDMMYY', () => {
  it('parses "DD-MM-YY" + "HH:MM:SS WIB" into a valid Date', () => {
    // "07-04-26" + "10:30:00 WIB" → 2026-04-07T10:30:00 (local)
    const d = parseDDMMYY('07-04-26', '10:30:00 WIB');
    expect(d).toBeInstanceOf(Date);
    // Year should always be 2026 regardless of local timezone
    expect(d!.getFullYear()).toBe(2026);
  });

  it('returns null for a malformed date string (missing parts)', () => {
    expect(parseDDMMYY('07-04', '10:30:00 WIB')).toBeNull();
  });
});

// ─── makePoint ────────────────────────────────────────────────────────────────

describe('makePoint', () => {
  it('constructs a DataPoint with all fields', () => {
    const coords = { lat: -6.2, lng: 106.8 };
    const date = new Date('2024-12-25T10:00:00Z');
    const props = { mag: 5.5 };

    const p = makePoint('p1', 'hotspot', coords, date, props);

    expect(p.id).toBe('p1');
    expect(p.layerId).toBe('hotspot');
    expect(p.lat).toBe(-6.2);
    expect(p.lng).toBe(106.8);
    expect(p.date).toBe(date);
    expect(p.properties).toBe(props);
  });

  it('accepts null date', () => {
    const p = makePoint('p2', 'hotspot', { lat: 0, lng: 0 }, null, {});
    expect(p.date).toBeNull();
  });
});
