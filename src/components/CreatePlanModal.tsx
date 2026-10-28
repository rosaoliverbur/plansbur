import { useState } from 'react';
import type { Plan, PlanCategory, UserProfile } from '../lib/types';
import { BURRIANA_PRESET_PLACES, CATEGORY_MAP, SCHOOLS_BURRIANA } from '../lib/constants';
import { X, MapPin, Sparkles, Plus, Calendar, Clock, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onCreatePlan: (plan: Omit<Plan, 'id' | 'chatMessages' | 'ratings' | 'photos' | 'attendees'>) => void;
  onRequestPickLocation?: () => void;
  pickedCoords?: [number, number] | null;
  theme?: 'dark' | 'light';
}

export default function CreatePlanModal({
  currentUser,
  isOpen,
  onClose,
  onCreatePlan,
  onRequestPickLocation,
  pickedCoords,
  theme = 'dark',
}: Props) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PlanCategory>('deporte');
  const [selectedPresetPlace, setSelectedPresetPlace] = useState(BURRIANA_PRESET_PLACES[0].name);
  const [customPlaceName, setCustomPlaceName] = useState('');
  const [date, setDate] = useState('Hoy');
  const [time, setTime] = useState('18:00');
  const [customCover, setCustomCover] = useState('');

  const currentPreset = BURRIANA_PRESET_PLACES.find((p) => p.name === selectedPresetPlace);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let lat = currentPreset?.lat ?? 39.8890;
    let lng = currentPreset?.lng ?? -0.0845;
    let placeName = selectedPresetPlace;
    let placeAddress = currentPreset?.address ?? 'Burriana (Castellón)';

    if (pickedCoords) {
      lat = pickedCoords[0];
      lng = pickedCoords[1];
      if (customPlaceName.trim()) {
        placeName = customPlaceName.trim();
        placeAddress = 'Ubicación seleccionada en Burriana';
      }
    }

    // Default covers based on category if custom not provided
    const defaultCovers: Record<PlanCategory, string> = {
      playa: '/src/assets/images/burriana_port_sunset_1793047722291.jpg',
      deporte: '/src/assets/images/burriana_beach_volleyball_1793047719879.jpg',
      naturaleza: '/src/assets/images/burriana_clot_walk_1793047720961.jpg',
      tardeo: '/src/assets/images/burriana_plaza_tardeo_1793047721725.jpg',
      musica: '/src/assets/images/burriana_port_sunset_1793047722291.jpg',
      estudio: '/src/assets/images/burriana_plaza_tardeo_1793047721725.jpg',
      videojuegos: '/src/assets/images/burriana_beach_volleyball_1793047719879.jpg',
      quedada: '/src/assets/images/burriana_plaza_tardeo_1793047721725.jpg',
    };

    const coverPhoto = customCover.trim() || defaultCovers[category] || defaultCovers.deporte;

    onCreatePlan({
      title: title.trim(),
      description: description.trim() || '¡Quedada en Burriana! Abierta a gente con ganas de pasar un buen rato.',
      category,
      place_name: placeName,
      place_address: placeAddress,
      lat,
      lng,
      date,
      time,
      status: 'upcoming',
      creatorId: currentUser.id,
      creatorName: currentUser.fullName,
      creatorAvatar: currentUser.avatar,
      creatorSchool: currentUser.school,
      coverPhoto,
      hasReminder: false,
    });

    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border transition-colors ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between ${
            theme === 'dark'
              ? 'border-slate-800 bg-slate-900/90'
              : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span>Proponer nuevo plan en Burriana</span>
            </h3>
            <p className="text-xs text-slate-400">
              Ayuda a que los jóvenes de Burriana no se aburran hoy
            </p>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              theme === 'dark'
                ? 'bg-slate-800 text-slate-400 hover:text-white'
                : 'bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Título del plan *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Partidillo de vóley en el Arenal, Quedada en El Clot..."
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">
              Categoría
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(Object.keys(CATEGORY_MAP) as PlanCategory[]).map((catKey) => {
                const info = CATEGORY_MAP[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                        : 'bg-slate-800/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-sm">{info.emoji}</span>
                    <span className="font-semibold truncate text-[11px]">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location in Burriana */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Lugar de Burriana *
              </label>
              {onRequestPickLocation && (
                <button
                  type="button"
                  onClick={() => {
                    onRequestPickLocation();
                    onClose();
                  }}
                  className="text-cyan-400 hover:underline text-[11px]"
                >
                  📍 Seleccionar en el mapa
                </button>
              )}
            </div>

            {pickedCoords ? (
              <div className="p-2.5 bg-cyan-950/40 border border-cyan-500/30 rounded-xl mb-2">
                <div className="text-cyan-300 font-semibold text-[11px] flex items-center gap-1">
                  <span>✓ Punto marcado en mapa:</span>
                  <span className="font-mono text-[10px]">
                    {pickedCoords[0].toFixed(4)}, {pickedCoords[1].toFixed(4)}
                  </span>
                </div>
                <input
                  type="text"
                  value={customPlaceName}
                  onChange={(e) => setCustomPlaceName(e.target.value)}
                  placeholder="Nombre de este sitio en Burriana (ej. Mi plaza favorita)"
                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            ) : (
              <select
                value={selectedPresetPlace}
                onChange={(e) => setSelectedPresetPlace(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                {BURRIANA_PRESET_PLACES.map((place) => (
                  <option key={place.name} value={place.name}>
                    {place.name} · {place.address}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Cuándo
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Hoy, Mañana, Sábado..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Hora
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="17:30"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Descripción y qué llevar
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué haréis, si hay que llevar algo (balón, altavoz, patines, merienda) y si es para cualquier edad..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
            />
          </div>

          {/* Custom Photo URL (Optional) */}
          <div>
            <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              Foto del plan (opcional)
            </label>
            <input
              type="url"
              value={customCover}
              onChange={(e) => setCustomCover(e.target.value)}
              placeholder="URL de foto o déjalo vacío para usar foto temática de Burriana"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:brightness-110 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar plan en Burr Plans</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
