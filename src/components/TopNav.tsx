import { Plus, Moon, Sun, LogIn, LogOut } from 'lucide-react';
import type { UserProfile } from '../lib/types';

interface Props {
  currentUser: UserProfile;
  activeView: 'feed' | 'map' | 'reminders';
  onViewChange: (view: 'feed' | 'map' | 'reminders') => void;
  onOpenCreate: () => void;
  onOpenMyProfile: () => void;
  onOpenSettings: () => void;
  theme: 'dark' | 'light';
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export default function TopNav({
  currentUser,
  activeView,
  onViewChange,
  onOpenCreate,
  onOpenMyProfile,
  onOpenSettings,
  theme,
  isLoggedIn,
  onLogin,
  onLogout,
}: Props) {
  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800'
          : 'bg-white/90 border-slate-200 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-cyan-500/20">
            BP
          </div>
          <button
            onClick={() => onViewChange('feed')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span
              className={`text-lg font-black tracking-tight transition-colors whitespace-nowrap ${
                theme === 'dark' ? 'text-white group-hover:text-cyan-400' : 'text-slate-900 group-hover:text-cyan-600'
              }`}
            >
              Burr Plans
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={() => onViewChange('feed')}
            className={`transition-colors whitespace-nowrap hover:text-cyan-400 ${
              activeView === 'feed' ? 'text-cyan-400 border-b-2 border-cyan-400 py-1 font-bold' : ''
            }`}
          >
            Todos los planes
          </button>
          <button
            onClick={() => onViewChange('map')}
            className={`transition-colors whitespace-nowrap hover:text-cyan-400 ${
              activeView === 'map' ? 'text-cyan-400 border-b-2 border-cyan-400 py-1 font-bold' : ''
            }`}
          >
            Mapa de Burriana
          </button>
          <button
            onClick={() => onViewChange('reminders')}
            className={`transition-colors whitespace-nowrap hover:text-cyan-400 ${
              activeView === 'reminders' ? 'text-cyan-400 border-b-2 border-cyan-400 py-1 font-bold' : ''
            }`}
          >
            Mis recordatorios
          </button>
        </nav>

        {/* Zone 3: Primary Action & Profile / Login Trigger */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            onClick={onOpenSettings}
            className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 ${
              theme === 'dark'
                ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Ajustes (Modo claro / oscuro)"
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-cyan-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <span className="hidden sm:inline text-xs font-semibold">Ajustes</span>
          </button>

          {isLoggedIn ? (
            <button
              onClick={onOpenMyProfile}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
              }`}
              title="Ver mi perfil"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.fullName}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover ring-1 ring-cyan-400"
              />
              <span className="hidden sm:inline font-semibold">{currentUser.fullName.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/15 transition-all shadow-sm"
              title="Iniciar sesión con Google"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Acceder</span>
            </button>
          )}

          <button
            onClick={onOpenCreate}
            className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-400 hover:brightness-110 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all active:scale-95 whitespace-nowrap flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">Crear plan</span>
          </button>
        </div>
      </div>
    </header>
  );
}
