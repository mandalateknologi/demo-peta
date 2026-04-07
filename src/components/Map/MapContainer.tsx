import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAppContext } from '../../context/AppContext';
import { LAYERS, ALERT_COLORS } from '../../config/layers';
import { toGeoJSON } from '../../services/dataLoader';
import { getFeatureBBox } from '../../services/provinceUtils';
import type { DataPoint } from '../../types';
import type { Feature, Polygon, MultiPolygon } from 'geojson';

const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
const GEMPA_LAYER_IDS = new Set(['gempa-global', 'vsi-gempa', 'gempa-alert', 'katalog-gempa']);

function ensureCircleLayerSource(map: maplibregl.Map, layer: typeof LAYERS[number]) {
  const emptyFC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

  if (!map.getSource(layer.id)) {
    map.addSource(layer.id, {
      type: 'geojson',
      data: emptyFC,
      cluster: layer.cluster,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });
  }
}

function ensureCircleLayerLayers(map: maplibregl.Map, layer: typeof LAYERS[number]) {
  const isGempaLayer = GEMPA_LAYER_IDS.has(layer.id);
  const magRadius: maplibregl.ExpressionSpecification = [
    'interpolate', ['linear'],
    ['to-number', ['coalesce', ['get', 'mag'], ['get', 'magnitude'], 3]],
    1, 8, 5, 14, 8, 22,
  ];

  if (layer.cluster && !map.getLayer(`${layer.id}-clusters`)) {
    map.addLayer({
      id: `${layer.id}-clusters`,
      type: 'circle',
      source: layer.id,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': layer.color,
        'circle-radius': ['step', ['get', 'point_count'], 16, 10, 24, 50, 32],
        'circle-opacity': 0.85,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff',
      },
    });

    map.addLayer({
      id: `${layer.id}-cluster-count`,
      type: 'symbol',
      source: layer.id,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-size': 11,
        'text-font': ['Noto Sans Regular'],
      },
      paint: { 'text-color': '#ffffff' },
    });
  }

  if (layer.id === 'gempa-alert') {
    if (!map.getLayer('gempa-alert-ring2')) {
      map.addLayer({
        id: 'gempa-alert-ring2',
        type: 'circle',
        source: layer.id,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': 'rgba(0,0,0,0)',
          'circle-radius': ['interpolate', ['linear'], ['to-number', ['coalesce', ['get', 'mag'], ['get', 'magnitude'], 3]], 1, 21, 5, 37, 8, 57],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': layer.color,
          'circle-stroke-opacity': 0.3,
        },
      });
    }

    if (!map.getLayer('gempa-alert-ring1')) {
      map.addLayer({
        id: 'gempa-alert-ring1',
        type: 'circle',
        source: layer.id,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': 'rgba(0,0,0,0)',
          'circle-radius': ['interpolate', ['linear'], ['to-number', ['coalesce', ['get', 'mag'], ['get', 'magnitude'], 3]], 1, 14, 5, 25, 8, 40],
          'circle-stroke-width': 2,
          'circle-stroke-color': layer.color,
          'circle-stroke-opacity': 0.5,
        },
      });
    }
  }

  if (!map.getLayer(`${layer.id}-points`)) {
    map.addLayer({
      id: `${layer.id}-points`,
      type: 'circle',
      source: layer.id,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': layer.color,
        'circle-radius': isGempaLayer ? magRadius : 7,
        'circle-opacity': 0.85,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff',
      },
    });
  }

  if (isGempaLayer && !map.getLayer(`${layer.id}-mag-label`)) {
    map.addLayer({
      id: `${layer.id}-mag-label`,
      type: 'symbol',
      source: layer.id,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'text-field': ['number-format', ['to-number', ['coalesce', ['get', 'mag'], ['get', 'magnitude'], 0]], { 'min-fraction-digits': 1, 'max-fraction-digits': 1 }],
        'text-size': 10,
        'text-font': ['Noto Sans Bold'],
        'text-allow-overlap': true,
        'text-ignore-placement': true,
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': 'rgba(0,0,0,0.6)',
        'text-halo-width': 1,
      },
    });
  }
}

function ensureMapDataLayers(map: maplibregl.Map) {
  LAYERS.filter((layer) => layer.markerType === 'circle').forEach((layer) => {
    ensureCircleLayerSource(map, layer);
    ensureCircleLayerLayers(map, layer);
  });
}

function addProvinceBaseLayersIfNeeded(map: maplibregl.Map) {
  const emptyFC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };
  if (!map.getSource('provinces')) {
    map.addSource('provinces', { type: 'geojson', data: emptyFC });
  }
  if (!map.getLayer('province-clickzone')) {
    map.addLayer({
      id: 'province-clickzone',
      type: 'fill',
      source: 'provinces',
      paint: { 'fill-color': 'rgba(0,0,0,0)', 'fill-opacity': 0 },
    });
  }
  if (!map.getLayer('province-fill')) {
    map.addLayer({
      id: 'province-fill',
      type: 'fill',
      source: 'provinces',
      paint: { 'fill-color': '#1e3a8a', 'fill-opacity': 0.4 },
      layout: { visibility: 'none' },
    });
  }
  if (!map.getLayer('province-border')) {
    map.addLayer({
      id: 'province-border',
      type: 'line',
      source: 'provinces',
      paint: { 'line-color': '#60a5fa', 'line-width': 2, 'line-opacity': 0.9 },
      layout: { visibility: 'none' },
    });
  }
}

function buildPopupHTML(point: DataPoint): string {
  const layer = LAYERS.find((l) => l.id === point.layerId);
  if (!layer) return '';

  const alertCode = String(point.properties.cu_avcode ?? '').toUpperCase();
  const alertColor = ALERT_COLORS[alertCode] ?? null;

  const badge = alertCode
    ? `<span style="display:inline-block;padding:2px 8px;border-radius:4px;background:${alertColor ?? '#555'};color:#fff;font-size:11px;font-weight:700;margin-bottom:6px">${alertCode}</span>`
    : '';

  const rows = layer.popupFields
    .map(({ key, label }) => {
      let val = point.properties[key];
      if (val === undefined || val === null || val === '') return '';
      // For layers with pinImageRules, replace cu_avcode with the localized status name
      if (layer.pinImageRules && key === 'cu_avcode') {
        const gaStatus = Number(point.properties.ga_status);
        const rule = layer.pinImageRules.find((r) => r.value === gaStatus);
        if (rule) val = rule.status;
      }
      return `<div style="display:flex;justify-content:space-between;gap:12px;padding:2px 0;font-size:12px">
        <span style="opacity:0.65;white-space:nowrap">${label}</span>
        <span style="font-weight:500;text-align:right">${val}</span>
      </div>`;
    })
    .filter(Boolean)
    .join('');

  const coords = `<div style="margin-top:6px;opacity:0.45;font-size:10px">${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}</div>`;

  return `<div style="min-width:200px;max-width:280px">
    <div style="font-weight:700;font-size:13px;margin-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.15);padding-bottom:6px">${layer.name}</div>
    ${badge}
    ${rows}
    ${coords}
  </div>`;
}

export default function MapContainer() {
  const { state, dispatch } = useAppContext();
  const { filteredData, visibleLayers, theme, pickingCoords, selectedProvince, provinceGeoJSON } = state;

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const gifMarkersRef = useRef<Map<string, maplibregl.Marker[]>>(new Map());
  const mapReadyRef = useRef(false);
  const pickingCoordsRef = useRef(pickingCoords);
  const didMountRef = useRef(false);
  const currentStyleRef = useRef(DARK_STYLE);

  useEffect(() => { pickingCoordsRef.current = pickingCoords; }, [pickingCoords]);

  // ─── Init map ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DARK_STYLE,
      center: [118, -2],
      zoom: 5,
      minZoom: 2,
    });

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      // Province layers (underneath everything else)
      addProvinceBaseLayersIfNeeded(map);

      // Province polygon click → select province (data points take priority)
      map.on('click', 'province-clickzone', (e) => {
        if (pickingCoordsRef.current) return;
        const pointLayerIds = LAYERS
          .filter((l) => l.markerType === 'circle')
          .flatMap((l) => [
            `${l.id}-points`,
            ...(l.cluster ? [`${l.id}-clusters`] : []),
          ])
          .filter((id) => !!map.getLayer(id));
        if (pointLayerIds.length > 0) {
          const pointFeatures = map.queryRenderedFeatures(e.point, { layers: pointLayerIds });
          if (pointFeatures.length > 0) return;
        }
        const provinceId = e.features?.[0]?.properties?.province_id as string | undefined;
        if (provinceId) dispatch({ type: 'SELECT_PROVINCE', payload: provinceId });
      });

      map.on('mouseenter', 'province-clickzone', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'province-clickzone', () => { map.getCanvas().style.cursor = ''; });

      ensureMapDataLayers(map);

      LAYERS.filter((l) => l.markerType === 'circle').forEach((layer) => {
        // Click → popup
        map.on('click', `${layer.id}-points`, (e) => {
          if (!e.features?.length) return;
          const feat = e.features[0];
          const coords = (feat.geometry as GeoJSON.Point).coordinates as [number, number];
          const props = feat.properties as Record<string, unknown>;
          const pointId = String(props.id ?? '');
          const allPoints = filteredData[layer.id] ?? [];
          const point = allPoints.find((p) => p.id === pointId) ?? {
            id: pointId,
            lat: coords[1],
            lng: coords[0],
            date: null,
            layerId: layer.id,
            properties: props,
          };

          new maplibregl.Popup({ offset: 10 })
            .setLngLat(coords)
            .setHTML(buildPopupHTML(point))
            .addTo(map);
        });

        // Cluster click → zoom in
        if (layer.cluster) {
          map.on('click', `${layer.id}-clusters`, (e) => {
            if (!e.features?.length) return;
            const clusterId = e.features[0].properties?.cluster_id as number;
            const src = map.getSource(layer.id) as maplibregl.GeoJSONSource;
            src.getClusterExpansionZoom(clusterId).then((zoom) => {
              const coords = (e.features![0].geometry as GeoJSON.Point).coordinates as [number, number];
              map.easeTo({ center: coords, zoom });
            });
          });
          map.on('mouseenter', `${layer.id}-clusters`, () => { map.getCanvas().style.cursor = 'pointer'; });
          map.on('mouseleave', `${layer.id}-clusters`, () => { map.getCanvas().style.cursor = ''; });
        }

        map.on('mouseenter', `${layer.id}-points`, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', `${layer.id}-points`, () => { map.getCanvas().style.cursor = ''; });
      });

      mapReadyRef.current = true;
      mapRef.current = map;
      // Force a re-render to trigger data/visibility effects
      window.dispatchEvent(new Event('mapready'));
    });

    mapRef.current = map;

    return () => {
      gifMarkersRef.current.forEach((markers) => markers.forEach((m) => m.remove()));
      map.remove();
      mapRef.current = null;
      mapReadyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Update province source data ─────────────────────────────────────────────
  const updateProvinceSource = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current || !provinceGeoJSON) return;
    const src = map.getSource('provinces') as maplibregl.GeoJSONSource | undefined;
    src?.setData(provinceGeoJSON);
  }, [provinceGeoJSON]);

  // ─── Update province highlight + fit bounds ──────────────────────────────────
  const updateProvinceHighlight = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;

    if (!selectedProvince || !provinceGeoJSON) {
      if (map.getLayer('province-fill')) map.setLayoutProperty('province-fill', 'visibility', 'none');
      if (map.getLayer('province-border')) map.setLayoutProperty('province-border', 'visibility', 'none');
      return;
    }

    const feature = provinceGeoJSON.features.find(
      (f) => (f.properties as { province_id: string }).province_id === selectedProvince,
    ) as Feature<Polygon | MultiPolygon> | undefined;
    if (!feature) return;

    if (map.getLayer('province-fill')) {
      map.setFilter('province-fill', ['==', ['get', 'province_id'], selectedProvince]);
      map.setLayoutProperty('province-fill', 'visibility', 'visible');
    }
    if (map.getLayer('province-border')) {
      map.setFilter('province-border', ['==', ['get', 'province_id'], selectedProvince]);
      map.setLayoutProperty('province-border', 'visibility', 'visible');
    }

    const bbox = getFeatureBBox(feature);
    map.fitBounds(bbox, { padding: 60, duration: 1200, maxZoom: 10 });
  }, [selectedProvince, provinceGeoJSON]);

  // ─── Update circle layer data ────────────────────────────────────────────────
  const updateCircleLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;

    LAYERS.filter((l) => l.markerType === 'circle').forEach((layer) => {
      const src = map.getSource(layer.id) as maplibregl.GeoJSONSource | undefined;
      if (!src) return;
      const points = filteredData[layer.id] ?? [];
      src.setData(toGeoJSON(points));
    });
  }, [filteredData]);

  // ─── Update GIF markers ──────────────────────────────────────────────────────
  const updateGifMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;

    LAYERS.filter((l) => l.markerType === 'gif').forEach((layer) => {
      // Remove old markers
      gifMarkersRef.current.get(layer.id)?.forEach((m) => m.remove());
      gifMarkersRef.current.set(layer.id, []);

      if (!visibleLayers[layer.id]) return;

      const points = filteredData[layer.id] ?? [];
      const markers: maplibregl.Marker[] = points.map((point) => {
        const el = document.createElement('div');
        el.style.cssText = 'width:36px;height:36px;cursor:pointer';
        const img = document.createElement('img');
        let imgSrc = layer.gifSrc ?? '';
        if (layer.pinImageRules) {
          const matched = layer.pinImageRules.find(
            (rule) => Number(point.properties[rule.field]) === rule.value
          );
          if (matched) imgSrc = matched.image;
        }
        img.src = imgSrc;
        img.style.cssText = 'width:100%;height:100%;object-fit:contain';
        img.title = String(point.properties.ga_nama_gapi ?? point.properties.crs_cty ?? '');
        el.appendChild(img);

        const popup = new maplibregl.Popup({ offset: 18 }).setHTML(buildPopupHTML(point));

        return new maplibregl.Marker({ element: el })
          .setLngLat([point.lng, point.lat])
          .setPopup(popup)
          .addTo(map);
      });

      gifMarkersRef.current.set(layer.id, markers);
    });
  }, [filteredData, visibleLayers]);

  // ─── Update circle layer visibility ─────────────────────────────────────────
  const updateCircleVisibility = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;

    LAYERS.filter((l) => l.markerType === 'circle').forEach((layer) => {
      const vis = visibleLayers[layer.id] ? 'visible' : 'none';
      const layerIds = [`${layer.id}-points`];
      if (layer.cluster) layerIds.push(`${layer.id}-clusters`, `${layer.id}-cluster-count`);
      if (GEMPA_LAYER_IDS.has(layer.id)) layerIds.push(`${layer.id}-mag-label`);
      if (layer.id === 'gempa-alert') layerIds.push('gempa-alert-ring1', 'gempa-alert-ring2');
      layerIds.forEach((id) => {
        if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', vis);
      });
    });
  }, [visibleLayers]);

  // Listen for mapready event and trigger initial updates
  useEffect(() => {
    const handler = () => {
      updateCircleLayers();
      updateGifMarkers();
      updateCircleVisibility();
      updateProvinceSource();
      updateProvinceHighlight();
    };
    window.addEventListener('mapready', handler);
    return () => window.removeEventListener('mapready', handler);
  }, [updateCircleLayers, updateGifMarkers, updateCircleVisibility, updateProvinceSource, updateProvinceHighlight]);

  useEffect(() => {
    if (!mapReadyRef.current) return;
    updateProvinceSource();
  }, [updateProvinceSource]);

  useEffect(() => {
    if (!mapReadyRef.current) return;
    updateProvinceHighlight();
  }, [updateProvinceHighlight]);

  // Re-run when data or filters change
  useEffect(() => {
    if (!mapReadyRef.current) return;
    updateCircleLayers();
    updateGifMarkers();
  }, [updateCircleLayers, updateGifMarkers]);

  useEffect(() => {
    if (!mapReadyRef.current) return;
    updateCircleVisibility();
    updateGifMarkers();
  }, [updateCircleVisibility, updateGifMarkers]);

  // ─── Theme / style switch ────────────────────────────────────────────────────
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;

    const style = theme === 'dark' ? DARK_STYLE : LIGHT_STYLE;
    if (currentStyleRef.current === style) return;

    mapReadyRef.current = false;
    currentStyleRef.current = style;
    map.setStyle(style);
    map.once('style.load', () => {
      ensureMapDataLayers(map);

      // Re-add province layers after style switch
      addProvinceBaseLayersIfNeeded(map);

      mapReadyRef.current = true;
      updateCircleLayers();
      updateCircleVisibility();
      updateGifMarkers();
      updateProvinceSource();
      updateProvinceHighlight();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // ─── Pick-coords click handler ───────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handler = (e: maplibregl.MapMouseEvent) => {
      if (!pickingCoords) return;
      dispatch({ type: 'SET_PICKED_COORDS', payload: { lat: e.lngLat.lat, lng: e.lngLat.lng } });
    };

    map.on('click', handler);
    map.getCanvas().style.cursor = pickingCoords ? 'crosshair' : '';

    return () => { map.off('click', handler); };
  }, [pickingCoords, dispatch]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ cursor: pickingCoords ? 'crosshair' : undefined }}
    />
  );
}
