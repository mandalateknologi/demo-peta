export interface DataPoint {
  id: string;
  lat: number;
  lng: number;
  date: Date | null;
  layerId: string;
  properties: Record<string, unknown>;
}

export type TimeRange = '1h' | '6h' | '24h' | '48h' | '7d' | 'ALL';

export type MarkerType = 'circle' | 'gif';

export interface PopupField {
  key: string;
  label: string;
  format?: 'date' | 'magnitude';
}

export interface PinImageRule {
  field: string;
  value: number;
  image: string;
  status: string;
}

export interface LayerConfig {
  id: string;
  name: string;
  file: string;
  markerType: MarkerType;
  gifSrc?: string;
  pinImageRules?: PinImageRule[];
  color: string;
  hasDate: boolean;
  cluster: boolean;
  popupFields: PopupField[];
  defaultVisible: boolean;
}

export interface CustomPoint {
  id?: number;
  category: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  date: string;
  createdAt: Date;
}

export type Theme = 'dark' | 'light';

export interface ProvinceInfo {
  name: string;
  capital: string;
  population: number;
  area_km2: number;
  island_group: string;
  governor: string;
}

export interface LayerCount {
  total: number;
  filtered: number;
}

export interface ProvinceCount {
  provinceId: string;
  name: string;
  total: number;
  breakdown: Record<string, number>;
}

export interface TimeSeriesBucket {
  bucket: string;
  counts: Record<string, number>;
}

export interface DashboardStats {
  layerCounts: Record<string, LayerCount>;
  provinceCounts: ProvinceCount[];
  timeSeries: TimeSeriesBucket[];
}
