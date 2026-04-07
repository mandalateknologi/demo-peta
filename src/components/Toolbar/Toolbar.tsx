import { Sun, Moon, Menu, MapPin } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const MENU_ITEMS = [
  { label: 'Gunung Api', href: '#' },
  { label: 'Gerakan Tanah', href: '#' },
  { label: 'Gempa Bumi', href: '#' },
  { label: 'Evaluasi', href: '#' },
  { label: 'Press Release', href: '#' },
  { label: 'Cari Lokasi', href: '#' },
];

export default function Toolbar() {
  const { state, dispatch } = useAppContext();
  const { theme } = state;

  return (
    <header className="flex items-center h-11 bg-sky-700 dark:bg-slate-900 border-b border-slate-700/50 px-3 gap-4 shadow-lg z-20 relative">
      {/* Logo / Title */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <MapPin size={16} className="text-white" />
        <span className="text-white font-bold text-sm tracking-wider uppercase Select-none">
          Peta Bencana
        </span>
        <span className="hidden sm:inline text-sky-300 dark:text-slate-500 text-xs ml-1">
          Indonesia
        </span>
      </div>

      {/* Nav divider */}
      <div className="w-px h-5 bg-white/20 flex-shrink-0" />

      {/* Menu items (dummy) */}
      <nav className="hidden md:flex items-center gap-0 flex-1 overflow-x-auto scrollbar-none">
        {MENU_ITEMS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={(e) => e.preventDefault()}
            className="px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors whitespace-nowrap uppercase tracking-wide"
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* Mobile hamburger (dummy) */}
      <button className="md:hidden ml-auto text-white/70 hover:text-white p-1 rounded">
        <Menu size={16} />
      </button>

      {/* Theme toggle */}
      <button
        onClick={() => dispatch({ type: 'SET_THEME', payload: theme === 'dark' ? 'light' : 'dark' })}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="ml-auto md:ml-0 flex-shrink-0 text-white/70 hover:text-white p-1.5 rounded hover:bg-white/10 transition-colors"
      >
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>
    </header>
  );
}
