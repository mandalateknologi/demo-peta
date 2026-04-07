import { useAppContext } from '../../context/AppContext';
import type { TimeRange } from '../../types';
import { LAYERS } from '../../config/layers';
import { cn } from '../../lib/utils';

const TIME_RANGES: TimeRange[] = ['1h', '6h', '24h', '48h', '7d', 'ALL'];

export default function TimeFilter() {
  const { state, dispatch } = useAppContext();
  const { timeRange, visibleLayers } = state;

  // Only show if at least one visible layer has date support
  const hasDateLayer = LAYERS.some((l) => l.hasDate && visibleLayers[l.id]);
  if (!hasDateLayer) return null;

  return (
    <div className="flex items-center gap-0.5 bg-slate-900/90 dark:bg-slate-900/90 backdrop-blur border border-slate-700/60 rounded-md px-1.5 py-1 shadow-lg">
      {TIME_RANGES.map((range) => (
        <button
          key={range}
          onClick={() => dispatch({ type: 'SET_TIME_RANGE', payload: range })}
          className={cn(
            'px-2.5 py-1 text-xs font-semibold rounded transition-all duration-150 uppercase',
            range === timeRange
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
          )}
        >
          {range}
        </button>
      ))}
    </div>
  );
}
