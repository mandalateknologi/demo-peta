import Dexie, { type EntityTable } from 'dexie';
import type { CustomPoint } from '../types';

interface LayerSetting {
  id?: number;
  layerName: string;
  visible: boolean;
  opacity: number;
}

interface UserPreference {
  id?: number;
  key: string;
  value: string;
}

const db = new Dexie('PetaBencanaDB') as Dexie & {
  customPoints: EntityTable<CustomPoint, 'id'>;
  layerSettings: EntityTable<LayerSetting, 'id'>;
  userPreferences: EntityTable<UserPreference, 'id'>;
};

db.version(1).stores({
  customPoints: '++id, category, lat, lng, title, description, date, createdAt',
  layerSettings: '++id, &layerName, visible, opacity',
  userPreferences: '++id, &key, value',
});

export { db };
export type { LayerSetting, UserPreference };
