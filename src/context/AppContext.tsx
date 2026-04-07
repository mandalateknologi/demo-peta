import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { DataPoint, ProvinceInfo, Theme, TimeRange } from '../types';
import { LAYERS } from '../config/layers';
import { loadAllData, filterByTime, loadProvinceGeoJSON, loadProvinceInfo } from '../services/dataLoader';

// ─── State ────────────────────────────────────────────────────────────────────

interface AppState {
  visibleLayers: Record<string, boolean>;
  timeRange: TimeRange;
  theme: Theme;
  rawData: Record<string, DataPoint[]>;
  filteredData: Record<string, DataPoint[]>;
  loading: boolean;
  errors: Record<string, string>;
  pickingCoords: boolean; // map click-to-pick mode for form
  pickedCoords: { lat: number; lng: number } | null;
  selectedProvince: string | null;
  provinceGeoJSON: GeoJSON.FeatureCollection | null;
  provinceInfo: Record<string, ProvinceInfo>;
}

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: Record<string, DataPoint[]> }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'TOGGLE_LAYER'; payload: string }
  | { type: 'SET_TIME_RANGE'; payload: TimeRange }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_PICKING_COORDS'; payload: boolean }
  | { type: 'SET_PICKED_COORDS'; payload: { lat: number; lng: number } | null }
  | { type: 'SELECT_PROVINCE'; payload: string | null }
  | { type: 'SET_PROVINCE_DATA'; payload: { geoJSON: GeoJSON.FeatureCollection; info: Record<string, ProvinceInfo> } };

function buildFilteredData(raw: Record<string, DataPoint[]>, timeRange: TimeRange) {
  const filtered: Record<string, DataPoint[]> = {};
  for (const [layerId, points] of Object.entries(raw)) {
    const layer = LAYERS.find((l) => l.id === layerId);
    filtered[layerId] = layer?.hasDate ? filterByTime(points, timeRange) : points;
  }
  return filtered;
}

function buildDefaultVisible(): Record<string, boolean> {
  return Object.fromEntries(LAYERS.map((l) => [l.id, l.defaultVisible]));
}

const initialState: AppState = {
  visibleLayers: buildDefaultVisible(),
  timeRange: 'ALL',
  theme: 'dark',
  rawData: {},
  filteredData: {},
  loading: true,
  errors: {},
  pickingCoords: false,
  pickedCoords: null,
  selectedProvince: null,
  provinceGeoJSON: null,
  provinceInfo: {},
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_DATA': {
      const filtered = buildFilteredData(action.payload, state.timeRange);
      return { ...state, rawData: action.payload, filteredData: filtered, loading: false };
    }

    case 'SET_ERRORS':
      return { ...state, errors: action.payload };

    case 'TOGGLE_LAYER':
      return {
        ...state,
        visibleLayers: {
          ...state.visibleLayers,
          [action.payload]: !state.visibleLayers[action.payload],
        },
      };

    case 'SET_TIME_RANGE': {
      const filtered = buildFilteredData(state.rawData, action.payload);
      return { ...state, timeRange: action.payload, filteredData: filtered };
    }

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'SET_PICKING_COORDS':
      return { ...state, pickingCoords: action.payload, pickedCoords: null };

    case 'SET_PICKED_COORDS':
      return { ...state, pickedCoords: action.payload, pickingCoords: false };

    case 'SELECT_PROVINCE':
      return { ...state, selectedProvince: action.payload };

    case 'SET_PROVINCE_DATA':
      return { ...state, provinceGeoJSON: action.payload.geoJSON, provinceInfo: action.payload.info };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    Promise.all([loadProvinceGeoJSON(), loadProvinceInfo()]).then(([geoJSON, info]) => {
      if (geoJSON && info) {
        dispatch({ type: 'SET_PROVINCE_DATA', payload: { geoJSON, info } });
      }
    });
  }, []);

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    loadAllData().then((results) => {
      const rawData: Record<string, DataPoint[]> = {};
      const errors: Record<string, string> = {};
      for (const r of results) {
        rawData[r.layerId] = r.points;
        if (r.error) errors[r.layerId] = r.error;
      }
      dispatch({ type: 'SET_DATA', payload: rawData });
      if (Object.keys(errors).length > 0) {
        dispatch({ type: 'SET_ERRORS', payload: errors });
      }
    });
  }, []);

  // Persist theme to localStorage
  useEffect(() => {
    localStorage.setItem('peta-theme', state.theme);
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Restore theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('peta-theme') as Theme | null;
    if (saved) dispatch({ type: 'SET_THEME', payload: saved });
  }, []);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
