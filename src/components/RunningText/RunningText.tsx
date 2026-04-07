import { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';

interface RunningTextItem {
  event: string;
  date: string;
  time: string;
  headline: string;
  source: string;
}

interface RunningTextData {
  data: string;
  sender: string;
  list: RunningTextItem[];
}

const SOURCE_COLORS: Record<string, string> = {
  BMKG: 'text-blue-400',
  ESDM: 'text-orange-400',
};

export default function RunningText() {
  const { state } = useAppContext();
  const [items, setItems] = useState<RunningTextItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/data/running_text.json');
        if (!res.ok) return;
        const json: RunningTextData = await res.json();
        if (!cancelled && Array.isArray(json.list) && json.list.length > 0) {
          setItems(json.list);
        }
      } catch {
        // fail silently
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (items.length === 0) return null;

  const isDark = state.theme === 'dark';

  // Duplicate content so the loop appears seamless
  const content = [...items, ...items];

  return (
    <div
      role="marquee"
      aria-live="off"
      aria-label="Informasi terkini"
      className={`absolute bottom-0 left-0 right-0 z-20 overflow-hidden flex items-center h-10 border-t
        ${isDark
          ? 'bg-slate-900/85 border-slate-700/60 text-slate-200'
          : 'bg-white/85 border-slate-300/60 text-slate-800'}
        backdrop-blur-sm select-none`}
    >
      {/* Static label */}
      <span className={`flex-shrink-0 px-4 text-sm font-bold tracking-widest uppercase border-r h-full flex items-center
        ${isDark ? 'bg-slate-800/90 border-slate-700/60 text-amber-400' : 'bg-slate-100/90 border-slate-300/60 text-amber-600'}`}>
        INFO
      </span>

      {/* Scrolling track */}
      <div className="relative flex-1 overflow-hidden h-full">
        <div className="ticker-track flex items-center h-full gap-0 whitespace-nowrap">
          {content.map((item, idx) => (
            <span key={idx} className="inline-flex items-center gap-2 px-4 text-sm">
              <span className={`font-semibold ${SOURCE_COLORS[item.source] ?? 'text-slate-400'}`}>
                [{item.source}]
              </span>
              <span className="font-medium">{item.event}</span>
              <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {item.headline}
              </span>
              <span className={`${isDark ? 'text-slate-600' : 'text-slate-300'} mx-2`}>•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
