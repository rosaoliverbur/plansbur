import { useState } from 'react';
import {
  X,
  Moon,
  Sun,
  Bell,
  MapPin,
  School,
  RotateCcw,
  Check,
  Sparkles,
  Sliders,
  Cloud,
  LogIn,
  LogOut,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import { BURRIANA_PRESET_PLACES, SCHOOLS_BURRIANA } from '../lib/constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  preferredSchool: string;
  onPreferredSchoolChange: (school: string) => void;
  onResetData: () => void;
  onSelectPlaceFilter?: (placeName: string) => void;
  isLoggedIn?: boolean;
  firebaseUser?: any;
  onLogin?: () => void;
  onLogout?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  soundEnabled,
  onToggleSound,
  preferredSchool,
  onPreferredSchoolChange,
  onResetData,
  onSelectPlaceFilter,
  isLoggedIn = false,
  firebaseUser,
  onLogin,
  onLogout,
}: Props) {
  if (!isOpen) return null;

  const [resetConfirm, setResetConfirm] = useState(false);

  // Famous local hangout spots highlighted for the user
  const famousFoodSpots = [
    { name: 'Heladería Hand\'s (Hans)', tag: 'Hans', emoji: '🍦', subtitle: 'Av. Mediterrània, 33 (Platja/Port)' },
    { name: 'Heladería Don Pipo', tag: 'Don Pipo', emoji: '🍨', subtitle: 'Camí del Grao, 7' },
    { name: 'McDonald\'s Burriana', tag: 'McDonald\'s', emoji: '🍟', subtitle: 'Av. Londres, 2 (Carabona)' },
    { name: 'Burger King Burriana', tag: 'Burger King', emoji: '👑', subtitle: 'Av. de la Marina, 12' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border transition-colors ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
            theme === 'dark'
              ? 'border-slate-800 bg-slate-900/90'
              : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">Ajustes de Burr Plans</h3>
              <p className="text-xs text-slate-400">Personaliza tu experiencia y aspecto</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              theme === 'dark'
                ? 'bg-slate-800 text-slate-400 hover:text-white'
                : 'bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
            aria-label="Cerrar ajustes"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-6 text-xs flex-1">
          {/* APARTADO 0: ESTADO DE LA NUBE Y CUENTA FIREBASE */}
          <div
            className={`p-4 rounded-xl border transition-colors ${
              theme === 'dark'
                ? 'bg-slate-950/70 border-cyan-500/30'
                : 'bg-cyan-50/80 border-cyan-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs flex items-center gap-1.5">
                    <span>Sincronización en la Nube (Firebase)</span>
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Activo
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Los planes, fotos, chats y valoraciones se sincronizan en tiempo real entre móviles, tablets y ordenadores.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                theme === 'dark' ? 'border-slate-800' : 'border-cyan-100'
              }`}
            >
              {isLoggedIn ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        firebaseUser?.photoURL ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                      }
                      alt="Cuenta"
                      className="w-8 h-8 rounded-full border border-cyan-400/50 object-cover"
                    />
                    <div>
                      <p className="font-bold text-xs">
                        {firebaseUser?.displayName || 'Usuario de Google'}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[190px]">
                        {firebaseUser?.email}
                      </p>
                    </div>
                  </div>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className={`px-3 py-1.5 rounded-lg border font-semibold text-xs flex items-center gap-1.5 transition-colors ${
                        theme === 'dark'
                          ? 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                      <span>Cerrar sesión</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="font-semibold text-slate-300 block">Modo Invitado Activo</span>
                    <span className="text-[10px] text-slate-400 block">
                      Inicia sesión para guardar tu nombre e instituto oficial
                    </span>
                  </div>
                  {onLogin && (
                    <button
                      type="button"
                      onClick={onLogin}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Entrar con Google</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* APARTADO 1: TEMA VISUAL (Modo Oscuro / Modo Claro) */}
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Aspecto visual (Modo Oscuro / Modo Claro)</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Selecciona cómo quieres ver Burr Plans en tu móvil o pantalla
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Modo Oscuro Button */}
              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  theme === 'dark'
                    ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400'
                    : 'border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-cyan-400 border border-slate-700 flex items-center justify-center shadow-sm">
                    <Moon className="w-4 h-4" />
                  </div>
                  {theme === 'dark' && (
                    <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-xs block text-white">Modo Oscuro</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Fondo noche con toques cian, ideal para salir de tardeo
                  </span>
                </div>
              </button>

              {/* Modo Claro Button */}
              <button
                type="button"
                onClick={() => onThemeChange('light')}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  theme === 'light'
                    ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500 text-slate-900'
                    : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center shadow-sm">
                    <Sun className="w-4 h-4" />
                  </div>
                  {theme === 'light' && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-xs block text-slate-900">Modo Claro</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Limpio y luminoso, perfecto para el sol en el Arenal
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* APARTADO 2: SITIOS TOP DE BURRIANA (Hans, Don Pipo, McDonald's, Burger King) */}
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Puntos de encuentro y sitios de comida</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ubicaciones clave donde quedan los jóvenes de Burriana
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {famousFoodSpots.map((spot) => (
                <button
                  key={spot.name}
                  onClick={() => {
                    onSelectPlaceFilter?.(spot.tag);
                    onClose();
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 group ${
                    theme === 'dark'
                      ? 'bg-slate-800/60 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800'
                      : 'bg-slate-50 border-slate-200 hover:border-cyan-500/50 hover:bg-white'
                  }`}
                >
                  <span className="text-base">{spot.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs truncate block group-hover:text-cyan-500 transition-colors">
                      {spot.tag}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {spot.subtitle}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* APARTADO 3: INSTITUTO PREFERIDO */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tu instituto o centro de Burriana</span>
            </h4>
            <select
              value={preferredSchool}
              onChange={(e) => onPreferredSchoolChange(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-cyan-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-500'
              }`}
            >
              <option value="all">Ver todos los institutos</option>
              {SCHOOLS_BURRIANA.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* APARTADO 4: NOTIFICACIONES / AVISOS */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              theme === 'dark'
                ? 'bg-slate-800/40 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-bold text-xs block">Alertas de planes</span>
                <span className="text-[10px] text-slate-400 block">
                  Avisar con sonido antes de que empiece un plan
                </span>
              </div>
            </div>
            <button
              onClick={onToggleSound}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                soundEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* APARTADO 5: RESTABLECER DATOS */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              theme === 'dark'
                ? 'bg-slate-800/20 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <span className="font-bold text-xs block">Restablecer planes</span>
              <span className="text-[10px] text-slate-400 block">
                Vuelve a cargar los planes con Hans, Don Pipo y el Arenal
              </span>
            </div>
            {resetConfirm ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setResetConfirm(false)}
                  className="px-2 py-1 text-[11px] text-slate-400 hover:text-white"
                >
                  No
                </button>
                <button
                  onClick={() => {
                    onResetData();
                    setResetConfirm(false);
                    onClose();
                  }}
                  className="px-3 py-1 bg-red-500 hover:bg-red-400 text-white font-bold rounded-lg text-xs"
                >
                  Sí, reiniciar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setResetConfirm(true)}
                className={`px-3 py-1.5 rounded-lg border font-semibold text-xs flex items-center gap-1.5 transition-colors ${
                  theme === 'dark'
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex justify-end ${
            theme === 'dark'
              ? 'border-slate-800 bg-slate-900'
              : 'border-slate-100 bg-slate-50'
          }`}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
