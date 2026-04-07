# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

_No unreleased changes yet._

---

## [0.1.0] — 2026-04-08

### Added

#### Data Layers

- **Hotspot SIPONGI** — satellite fire hotspot detections (Sipongi/KLHK), orange circle markers with clustering
- **Gempa Bumi BMKG Global** — 3-month near-Indonesia earthquake catalogue (BMKG), red magnitude-scaled circle markers with clustering
- **Alert Gempa BMKG** — real-time BMKG earthquake alerts with concentric alert ring overlays
- **Katalog Gempa BMKG** — historical BMKG earthquake catalogue, pink magnitude-scaled circle markers with clustering
- **Gunung Api VSI** — active volcano status from VSI/ESDM with animated GIF markers and 4-level alert colour coding (Green / Yellow / Orange / Red)
- **Gempa Bumi VSI** — VSI seismic events, blue magnitude-scaled circle markers with clustering
- **Gerakan Tanah VSI** — VSI landslide events with animated GIF markers
- **Gamma Irradiator IAEA** — licensed gamma irradiation facility locations, purple circle markers with clustering

#### Map Features

- MapLibre GL JS interactive map with dark (Carto Dark Matter) and light (Carto Voyager) basemap themes
- Theme toggle persisted to `localStorage` under key `peta-theme`
- Marker clustering (radius 50 px, maxZoom 14) for high-density layers
- Magnitude-scaled earthquake circle markers (scale 1–8 → radius 8–22 px via MapLibre expressions)
- Animated GIF custom DOM markers for volcanoes (`erupt2.gif`) and landslides (`landslide.gif`)
- Interactive popups with sanitised HTML for all layers
- Province boundary layer from `indonesia-provinces.geojson` with click-to-select behaviour; data point clicks take priority over province boundary clicks

#### Province Info Panel

- Right-side panel showing province name, capital city, population, area, governor, and island group classification
- Per-layer event count within the selected province using Turf.js point-in-polygon
- Province demographic data from `indonesia-province-info.json`

#### Sidebar & Layer Controls

- Collapsible left sidebar listing all data layers with toggle switches and live point counts
- Layers searchable by name within the sidebar

#### Time Filtering

- Time range filter bar with 6 presets: 1 hour, 6 hours, 24 hours, 48 hours, 7 days, All
- Filter applies globally to all layers with `hasDate: true`; date-less layers always show all data
- Filter bar only shown when at least one visible layer supports date filtering

#### Running-Text Ticker

- Animated scrolling news bar at the bottom of the map fed from `public/data/running_text.json`

#### Custom Data Entry

- Add Data dialog for manually reporting a custom hazard point
- Fields: category, title, description, latitude/longitude (manual entry or map click-to-pick), date
- Data persisted locally in IndexedDB (`PetaBencanaDB` via Dexie.js) — no account or backend required

#### Coordinate & Date Parsers (`coordinateParser.ts`)

- `parseGeoJSONCoord()` — numeric and string `[lon, lat]` arrays, 3-element depth arrays
- `parseSeparateFields()` — named lat/lon field pairs (e.g., `lat_lima` / `lon_lima`, `crs_lat` / `crs_lon`, `ga_lat_gapi` / `ga_lon_gapi`)
- `parseCommaString()` — `"lon,lat"` comma-delimited strings
- `parseISODate()` — ISO 8601 timestamps
- `parseDDMMYYYY()` — `DD-MM-YYYY` date strings
- `parseDDMMYY()` — `DD-MM-YY HH:MM:SS WIB` format used in BMKG alert data

#### Developer Infrastructure

- Vitest test suite covering all coordinate parsers, date parsers, time filter, and GeoJSON conversion
- Single-source-of-truth layer configuration in `src/config/layers.ts`
- Global state via `useReducer` + React Context (`AppContext.tsx`)
- Graceful degradation: missing data files at runtime return an empty layer without crashing

[Unreleased]: https://github.com/your-org/demo-peta/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/your-org/demo-peta/releases/tag/v0.1.0
