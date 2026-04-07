import { useState } from 'react';
import {
  Flame, Activity, AlertTriangle, BookOpen, Mountain,
  Layers, Wind, Radiation, ChevronLeft, ChevronRight,
  Search, PlusCircle, MapPin, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { LAYERS } from '../../config/layers';
import { cn } from '../../lib/utils';

const LAYER_ICONS: Record<string, React.ReactNode> = {
  'hotspot': <Flame size={14} />,
  'gempa-global': <Activity size={14} />,
  'gempa-alert': <AlertTriangle size={14} />,
  'katalog-gempa': <BookOpen size={14} />,
  'gunung-api': <Mountain size={14} />,
  'vsi-gempa': <Activity size={14} />,
  'gerakan-tanah': <Wind size={14} />,
  'gamma-irrad': <Radiation size={14} />,
};

const LAYER_DOT: Record<string, string> = {
  'hotspot': '#ff5500',
  'gempa-global': '#e53e3e',
  'gempa-alert': '#fc4349',
  'katalog-gempa': '#f687b3',
  'gunung-api': '#f6ad55',
  'vsi-gempa': '#4299e1',
  'gerakan-tanah': '#c05621',
  'gamma-irrad': '#9b59b6',
};

interface SidebarProps {
  onAddData: () => void;
}

export default function Sidebar({ onAddData }: SidebarProps) {
  const { state, dispatch } = useAppContext();
  const { visibleLayers, filteredData, loading, selectedProvince, provinceGeoJSON, provinceInfo } = state;
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [provincesOpen, setProvincesOpen] = useState(true);

  const filtered = LAYERS.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Build sorted province list from loaded GeoJSON features
  const provinceList = provinceGeoJSON
    ? (provinceGeoJSON.features as unknown as { properties: { province_id: string; name: string } }[])
        .map((f) => ({
          id: f.properties.province_id,
          name: provinceInfo[f.properties.province_id]?.name ?? f.properties.name,
        }))
        .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <div
      className={cn(
        'relative flex flex-col h-full transition-all duration-300 ease-in-out',
        collapsed ? 'w-10' : 'w-64',
      )}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-16 z-10 bg-slate-800 dark:bg-slate-800 border border-slate-600 rounded-full p-0.5 text-slate-300 hover:text-white shadow-md"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Panel */}
      <div className={cn(
        'flex flex-col h-full bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur border-r border-slate-700/50 overflow-hidden transition-all duration-300',
        collapsed ? 'w-10' : 'w-64',
      )}>
        {!collapsed && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-3 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-300 tracking-widest uppercase">Layers</span>
                {loading && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
              <span className="text-xs text-slate-500">?</span>
            </div>

            {/* Search */}
            <div className="px-3 py-2 border-b border-slate-700/50">
              <div className="flex items-center gap-2 bg-slate-800 rounded px-2 py-1.5">
                <Search size={11} className="text-slate-500" />
                <input
                  className="bg-transparent text-xs text-slate-300 placeholder-slate-500 outline-none w-full"
                  placeholder="Search layers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Layer list */}
            <div className="flex-1 overflow-y-auto py-1">
              {filtered.map((layer) => {
                const count = filteredData[layer.id]?.length ?? 0;
                const isVisible = visibleLayers[layer.id];

                return (
                  <button
                    key={layer.id}
                    onClick={() => dispatch({ type: 'TOGGLE_LAYER', payload: layer.id })}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-slate-800/60 transition-colors group',
                      !isVisible && 'opacity-50',
                    )}
                  >
                    {/* Checkbox */}
                    <div className={cn(
                      'flex-shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors',
                      isVisible ? 'border-transparent' : 'border-slate-500',
                    )}
                      style={{ backgroundColor: isVisible ? LAYER_DOT[layer.id] : 'transparent' }}
                    >
                      {isVisible && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>

                    {/* Icon */}
                    <span style={{ color: LAYER_DOT[layer.id] }} className="flex-shrink-0">
                      {LAYER_ICONS[layer.id]}
                    </span>

                    {/* Name */}
                    <span className="text-xs text-slate-200 font-medium tracking-wide uppercase leading-tight flex-1">
                      {layer.name}
                    </span>

                    {/* Count badge */}
                    {count > 0 && isVisible && (
                      <span className="text-xs text-slate-500 tabular-nums">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Separator */}
            <div className="border-t border-slate-700/50" />

            {/* Province list */}
            {provinceList.length > 0 && (
              <>
                <button
                  onClick={() => setProvincesOpen((o) => !o)}
                  className="flex items-center justify-between px-3 py-2.5 border-b border-slate-700/50 w-full hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-300 tracking-widest uppercase">Provinces</span>
                  </div>
                  {provincesOpen ? <ChevronUp size={12} className="text-slate-500" /> : <ChevronDown size={12} className="text-slate-500" />}
                </button>
                {provincesOpen && (
                  <div className="flex-1 overflow-y-auto py-1 max-h-48">
                    {provinceList.map((province) => (
                      <button
                        key={province.id}
                        onClick={() => dispatch({ type: 'SELECT_PROVINCE', payload: selectedProvince === province.id ? null : province.id })}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-800/60 transition-colors',
                          selectedProvince === province.id && 'bg-sky-900/40 border-l-2 border-sky-400',
                          selectedProvince !== province.id && 'border-l-2 border-transparent',
                        )}
                      >
                        <MapPin
                          size={12}
                          className={cn(
                            'flex-shrink-0',
                            selectedProvince === province.id ? 'text-sky-400' : 'text-slate-500',
                          )}
                        />
                        <span className={cn(
                          'text-xs font-medium leading-tight flex-1',
                          selectedProvince === province.id ? 'text-sky-300' : 'text-slate-300',
                        )}>
                          {province.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Separator */}
            <div className="border-t border-slate-700/50" />

            {/* Add Data button */}
            <button
              onClick={onAddData}
              className="flex items-center gap-2 px-3 py-3 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/60 transition-colors w-full"
            >
              <PlusCircle size={14} />
              <span className="font-medium uppercase tracking-wide">Tambah Data</span>
            </button>
          </>
        )}

        {/* Collapsed icons strip */}
        {collapsed && (
          <div className="flex flex-col items-center py-3 gap-3 mt-1">
            {LAYERS.map((layer) => (
              <button
                key={layer.id}
                title={layer.name}
                onClick={() => dispatch({ type: 'TOGGLE_LAYER', payload: layer.id })}
                style={{ color: visibleLayers[layer.id] ? LAYER_DOT[layer.id] : '#475569' }}
                className="transition-colors hover:opacity-80"
              >
                {LAYER_ICONS[layer.id]}
              </button>
            ))}
            {provinceList.length > 0 && (
              <button
                title="Provinces"
                onClick={() => setCollapsed(false)}
                className={cn(
                  'transition-colors hover:opacity-80',
                  selectedProvince ? 'text-sky-400' : 'text-slate-500',
                )}
              >
                <MapPin size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
