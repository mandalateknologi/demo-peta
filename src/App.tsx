import { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import MapContainer from './components/Map/MapContainer';
import Toolbar from './components/Toolbar/Toolbar';
import Sidebar from './components/Sidebar/Sidebar';
import TimeFilter from './components/TimeFilter/TimeFilter';
import AddDataDialog from './components/DataForm/AddDataDialog';
import RunningText from './components/RunningText/RunningText';
import ProvincePanel from './components/ProvincePanel/ProvincePanel';
import './App.css';

function PickCoordsOverlay() {
  const { state, dispatch } = useAppContext();
  if (!state.pickingCoords) return null;
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
      <div className="bg-slate-900/90 border border-emerald-500 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        Klik pada peta untuk memilih koordinat
        <button
          className="pointer-events-auto ml-2 text-slate-400 hover:text-white"
          onClick={() => dispatch({ type: 'SET_PICKING_COORDS', payload: false })}
        >✕</button>
      </div>
    </div>
  );
}

function AppInner() {
  const { state } = useAppContext();
  const [addDataOpen, setAddDataOpen] = useState(false);

  return (
    <div className={`flex flex-col w-screen h-screen overflow-hidden ${state.theme === 'dark' ? 'dark' : ''}`}>
      {/* Toolbar */}
      <Toolbar />

      {/* Map + Sidebar layout */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Map fills entire area */}
        <div className="absolute inset-0 z-0">
          <MapContainer />
        </div>

        {/* Sidebar overlay (left) */}
        <div className="relative z-10 flex-shrink-0 h-full" style={{ pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto', height: '100%' }}>
            <Sidebar onAddData={() => setAddDataOpen(true)} />
          </div>
        </div>

        {/* Top-right controls (TimeFilter) */}
        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2">
          <TimeFilter />
        </div>

        {/* Province info panel (right sidebar) */}
        <ProvincePanel />

        {/* Pick coords overlay */}
        <PickCoordsOverlay />

        {/* Loading indicator */}
        {state.loading && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-slate-900/90 border border-slate-700 text-slate-300 text-xs px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Memuat data...
          </div>
        )}

        {/* Running text ticker */}
        <RunningText />
      </div>

      {/* Add Data Dialog */}
      <AddDataDialog open={addDataOpen} onClose={() => setAddDataOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

export default App;
