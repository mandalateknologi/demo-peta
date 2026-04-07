---
description: "Use when working on the MapLibre map component, adding map layers, popups, markers, clustering, or map interactions."
applyTo: "src/components/Map/**"
---
# Map Component Guidelines

## MapLibre GL JS
- Single map instance managed in `MapContainer.tsx` via `useRef`
- Initialize on mount inside `useEffect`; clean up with `map.remove()` on unmount
- Base style: use `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json` (dark) or `positron` (light)

## GeoJSON Sources & Layers
- Each data layer is a GeoJSON source added via `map.addSource(layerId, { type: 'geojson', data })`
- Clustering enabled per layer config: `cluster: true` with `clusterMaxZoom` and `clusterRadius`
- Three sublayers per clustered source: cluster circles, cluster count labels, unclustered points

## Markers
- `markerType: 'circle'` → rendered as MapLibre circle layers (not DOM markers)
- `markerType: 'gif'` → rendered as HTML `<img>` inside `maplibregl.Marker` DOM elements
- GIF markers tracked in a ref pool; update/remove on data change to avoid memory leaks

## Popups
- Built as HTML strings from `popupFields` in layer config
- Sanitize property values before inserting into HTML to prevent XSS
- Attach via `map.on('click', layerId, ...)` for circle layers
- Attach via `marker.getElement().addEventListener('click', ...)` for GIF markers

## Theme Switching
- Swap map style URL when theme changes
- Re-add all GeoJSON sources and layers after style load (`map.on('style.load', ...)`)

## Controls
- `NavigationControl` (zoom +/−) at top-right
- `ScaleControl` at bottom-left
- Add controls once during initialization
