import { useState, useEffect } from 'react';
import { X, MapPin, Crosshair, Save } from 'lucide-react';
import { db } from '../../db';
import { useAppContext } from '../../context/AppContext';
import { LAYERS } from '../../config/layers';
import { cn } from '../../lib/utils';

interface AddDataDialogProps {
  open: boolean;
  onClose: () => void;
}

const EMPTY_FORM = {
  category: LAYERS[0].id,
  title: '',
  description: '',
  lat: '',
  lng: '',
  date: '',
};

export default function AddDataDialog({ open, onClose }: AddDataDialogProps) {
  const { state, dispatch } = useAppContext();
  const { pickedCoords, pickingCoords } = state;

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Populate lat/lng when user picks from map
  useEffect(() => {
    if (pickedCoords) {
      setForm((f) => ({
        ...f,
        lat: pickedCoords.lat.toFixed(6),
        lng: pickedCoords.lng.toFixed(6),
      }));
    }
  }, [pickedCoords]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setSaved(false);
      setError('');
    }
  }, [open]);

  function handleField(key: keyof typeof EMPTY_FORM, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (isNaN(lat) || isNaN(lng)) {
      setError('Koordinat tidak valid. Masukkan angka desimal atau pilih dari peta.');
      return;
    }
    if (!form.title.trim()) {
      setError('Judul tidak boleh kosong.');
      return;
    }

    setSaving(true);
    try {
      await db.customPoints.add({
        category: form.category,
        lat,
        lng,
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        createdAt: new Date(),
      });
      setSaved(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch {
      setError('Gagal menyimpan data. Coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  function handlePickFromMap() {
    dispatch({ type: 'SET_PICKING_COORDS', payload: true });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h2 className="text-sm font-semibold text-white uppercase tracking-widest">Tambah Data</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wide mb-1.5">Kategori</label>
            <select
              value={form.category}
              onChange={(e) => handleField('category', e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-md px-3 py-2 outline-none focus:border-emerald-500"
            >
              {LAYERS.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wide mb-1.5">Judul *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleField('title', e.target.value)}
              placeholder="Nama kejadian / lokasi"
              className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-md px-3 py-2 outline-none focus:border-emerald-500 placeholder-slate-500"
            />
          </div>

          {/* Coordinates */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-slate-400 uppercase tracking-wide">Koordinat *</label>
              <button
                type="button"
                onClick={handlePickFromMap}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Crosshair size={11} />
                Pilih dari Peta
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.lat}
                onChange={(e) => handleField('lat', e.target.value)}
                placeholder="Latitude"
                className="flex-1 bg-slate-800 border border-slate-600 text-white text-sm rounded-md px-3 py-2 outline-none focus:border-emerald-500 placeholder-slate-500"
              />
              <input
                type="text"
                value={form.lng}
                onChange={(e) => handleField('lng', e.target.value)}
                placeholder="Longitude"
                className="flex-1 bg-slate-800 border border-slate-600 text-white text-sm rounded-md px-3 py-2 outline-none focus:border-emerald-500 placeholder-slate-500"
              />
            </div>
            {pickedCoords && (
              <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
                <MapPin size={10} /> Diambil dari peta: {pickedCoords.lat.toFixed(4)}, {pickedCoords.lng.toFixed(4)}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wide mb-1.5">Tanggal</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleField('date', e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-md px-3 py-2 outline-none focus:border-emerald-500 [color-scheme:dark]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wide mb-1.5">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={(e) => handleField('description', e.target.value)}
              rows={3}
              placeholder="Keterangan tambahan..."
              className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-md px-3 py-2 outline-none focus:border-emerald-500 placeholder-slate-500 resize-none"
            />
          </div>

          {/* Error */}
          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-xs text-slate-400 hover:text-white border border-slate-600 hover:border-slate-500 rounded-md transition-colors uppercase tracking-wide"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || saved}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-md transition-colors uppercase tracking-wide',
                saved
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-white disabled:opacity-50',
              )}
            >
              <Save size={13} />
              {saved ? 'Tersimpan!' : saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>

        {/* Pick coords mode active indicator (shown when dialog is closed) */}
        {pickingCoords && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-xl">
            <p className="text-sm text-white">Klik pada peta untuk memilih koordinat...</p>
          </div>
        )}
      </div>
    </div>
  );
}
