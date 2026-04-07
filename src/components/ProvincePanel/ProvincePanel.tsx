import { useMemo } from 'react';
import {
  X, MapPin, Users, SquareStack, Globe, User, Flame,
  Activity, AlertTriangle, BookOpen, Mountain, Wind, Radiation,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { LAYERS } from '../../config/layers';
import { getProvinceDisasterCounts } from '../../services/provinceUtils';
import { cn } from '../../lib/utils';
import type { Feature, Polygon, MultiPolygon } from 'geojson';

const LAYER_ICONS: Record<string, React.ReactNode> = {
  'hotspot': <Flame size={13} />,
  'gempa-global': <Activity size={13} />,
  'gempa-alert': <AlertTriangle size={13} />,
  'katalog-gempa': <BookOpen size={13} />,
  'gunung-api': <Mountain size={13} />,
  'vsi-gempa': <Activity size={13} />,
  'gerakan-tanah': <Wind size={13} />,
  'gamma-irrad': <Radiation size={13} />,
};

const LAYER_COLORS: Record<string, string> = {
  'hotspot': '#ff5500',
  'gempa-global': '#e53e3e',
  'gempa-alert': '#fc4349',
  'katalog-gempa': '#f687b3',
  'gunung-api': '#f6ad55',
  'vsi-gempa': '#4299e1',
  'gerakan-tanah': '#c05621',
  'gamma-irrad': '#9b59b6',
};

function formatPopulation(pop: number): string {
  if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)} juta`;
  if (pop >= 1_000) return `${(pop / 1_000).toFixed(0)} ribu`;
  return String(pop);
}

function formatArea(area: number): string {
  return area.toLocaleString('id-ID') + ' km²';
}

export default function ProvincePanel() {
  const { state, dispatch } = useAppContext();
  const { selectedProvince, provinceGeoJSON, provinceInfo, filteredData } = state;

  const info = selectedProvince ? provinceInfo[selectedProvince] : null;

  const provinceFeature = useMemo(() => {
    if (!selectedProvince || !provinceGeoJSON) return null;
    return (provinceGeoJSON.features.find(
      (f) => (f.properties as { province_id: string }).province_id === selectedProvince,
    ) ?? null) as Feature<Polygon | MultiPolygon> | null;
  }, [selectedProvince, provinceGeoJSON]);

  const disasterCounts = useMemo(() => {
    if (!provinceFeature) return {} as Record<string, number>;
    return getProvinceDisasterCounts(provinceFeature, filteredData);
  }, [provinceFeature, filteredData]);

  const totalDisasters = Object.values(disasterCounts).reduce((a, b) => a + b, 0);

  if (!selectedProvince) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-72 z-10 flex flex-col bg-slate-900/95 backdrop-blur border-l border-slate-700/50 shadow-2xl overflow-hidden">
      {/* Push header below the TimeFilter (top-3 + ~40px tall = ~52px). Use pt-14 (56px). */}
      <div className="flex items-start justify-between px-4 py-3 border-b border-slate-700/50 flex-shrink-0 pt-14">
        <div className="flex items-start gap-2 min-w-0">
          <MapPin size={15} className="text-sky-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-400 tracking-widest uppercase">Provinsi</div>
            <div className="text-sm font-bold text-white leading-tight mt-0.5 break-words">
              {info?.name ?? selectedProvince}
            </div>
            {info?.island_group && (
              <div className="text-xs text-slate-500 mt-0.5">{info.island_group}</div>
            )}
          </div>
        </div>
        <button
          onClick={() => dispatch({ type: 'SELECT_PROVINCE', payload: null })}
          className="text-slate-500 hover:text-white transition-colors flex-shrink-0 ml-2 mt-0.5"
        >
          <X size={15} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Province metadata */}
        {info && (
          <div className="px-4 py-3 border-b border-slate-700/50">
            <div className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-3">Info Wilayah</div>
            <div className="space-y-2.5">
              <InfoRow
                icon={<Globe size={12} className="text-slate-500" />}
                label="Ibukota"
                value={info.capital}
              />
              <InfoRow
                icon={<Users size={12} className="text-slate-500" />}
                label="Penduduk"
                value={formatPopulation(info.population)}
              />
              <InfoRow
                icon={<SquareStack size={12} className="text-slate-500" />}
                label="Luas Wilayah"
                value={formatArea(info.area_km2)}
              />
              <InfoRow
                icon={<User size={12} className="text-slate-500" />}
                label="Gubernur"
                value={info.governor}
              />
            </div>
          </div>
        )}

        {/* Disaster counts */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-slate-400 tracking-widest uppercase">Data Bencana</div>
            {totalDisasters > 0 && (
              <span className="text-xs font-bold text-amber-400 tabular-nums">{totalDisasters} total</span>
            )}
          </div>

          {totalDisasters === 0 ? (
            <div className="text-xs text-slate-500 italic py-2">Tidak ada data di wilayah ini.</div>
          ) : (
            <div className="space-y-1.5">
              {LAYERS.map((layer) => {
                const count = disasterCounts[layer.id] ?? 0;
                return (
                  <div
                    key={layer.id}
                    className={cn(
                      'flex items-center gap-2.5 py-1.5 px-2 rounded',
                      count > 0 ? 'bg-slate-800/50' : 'opacity-30',
                    )}
                  >
                    <span style={{ color: LAYER_COLORS[layer.id] }} className="flex-shrink-0">
                      {LAYER_ICONS[layer.id]}
                    </span>
                    <span className="text-xs text-slate-300 flex-1 leading-tight">{layer.name}</span>
                    <span
                      className={cn(
                        'text-xs font-bold tabular-nums',
                        count > 0 ? 'text-white' : 'text-slate-600',
                      )}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-3 text-xs text-slate-600 italic">
            Berdasarkan filter waktu aktif
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs text-slate-200 font-medium break-words">{value}</span>
      </div>
    </div>
  );
}
