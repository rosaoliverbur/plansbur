import { Map, Calendar, Bell, Sliders, PlusCircle } from 'lucide-react';

interface Props {
  activeView: 'feed' | 'map' | 'reminders';
  onViewChange: (view: 'feed' | 'map' | 'reminders') => void;
  onOpenCreate: () => void;
  onOpenMyProfile: () => void;
  onOpenSettings: () => void;
  remindersCount: number;
  theme: 'dark' | 'light';
}

export default function BottomNav({
  activeView,
  onViewChange,
  onOpenCreate,
  onOpenMyProfile,
  onOpenSettings,
  remindersCount,
  theme,
}: Props) {
  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-lg border-t px-2 py-2 transition-colors ${
        theme === 'dark'
          ? 'bg-slate-900/95 border-slate-800'
          : 'bg-white/95 border-slate-200 shadow-lg'
      }`}
    >
      <div className="grid grid-cols-5 items-center justify-items-center">
        {/* Feed Tab */}
        <button
          onClick={() => onViewChange('feed')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            activeView === 'feed'
              ? 'text-cyan-500 font-bold'
              : theme === 'dark'
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Planes</span>
        </button>

        {/* Map Tab */}
        <button
          onClick={() => onViewChange('map')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            activeView === 'map'
              ? 'text-cyan-500 font-bold'
              : theme === 'dark'
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Mapa</span>
        </button>

        {/* Center Prominent Create Button */}
        <button
          onClick={onOpenCreate}
          className="flex flex-col items-center justify-center -mt-4 min-h-[48px] min-w-[48px] p-2 bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 rounded-full shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform"
          aria-label="Crear nuevo plan"
        >
          <PlusCircle className="w-6 h-6 stroke-[2.2]" />
        </button>

        {/* Reminders Tab */}
        <button
          onClick={() => onViewChange('reminders')}
          className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            activeView === 'reminders'
              ? 'text-cyan-500 font-bold'
              : theme === 'dark'
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell className="w-5 h-5" />
          {remindersCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 bg-amber-400 rounded-full" />
          )}
          <span className="text-[10px] font-semibold mt-1">Avisos</span>
        </button>

        {/* Ajustes Tab */}
        <button
          onClick={onOpenSettings}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Ajustes y Modo oscuro / claro"
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Ajustes</span>
        </button>
      </div>
    </div>
  );
}
