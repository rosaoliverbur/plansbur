import type { Plan, UserProfile } from '../lib/types';
import { CATEGORY_MAP } from '../lib/constants';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  MessageCircle,
  Star,
  Bell,
  BellRing,
  School,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  plan: Plan;
  currentUser: UserProfile;
  onSelect: (planId: string) => void;
  onToggleJoin: (planId: string) => void;
  onToggleReminder: (planId: string) => void;
  onOpenUserProfile: (userId: string) => void;
  theme?: 'dark' | 'light';
}

export default function PlanCard({
  plan,
  currentUser,
  onSelect,
  onToggleJoin,
  onToggleReminder,
  onOpenUserProfile,
  theme = 'dark',
}: Props) {
  const isJoined = plan.attendees.some((a) => a.userId === currentUser.id);
  const cat = CATEGORY_MAP[plan.category];

  // Average rating
  const avgRating =
    plan.ratings.length > 0
      ? (plan.ratings.reduce((acc, r) => acc + r.stars, 0) / plan.ratings.length).toFixed(1)
      : null;

  return (
    <div
      onClick={() => onSelect(plan.id)}
      className={`group rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col border ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-800 hover:border-slate-700/80 shadow-lg shadow-black/40'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-md shadow-slate-200/50'
      }`}
    >
      {/* Cover Media */}
      <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-950">
        <img
          src={plan.coverPhoto}
          alt={plan.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md flex items-center gap-1 shadow-sm ${cat?.color || 'bg-slate-800 text-white'} ${cat?.border || 'border-slate-700'}`}
          >
            <span>{cat?.emoji}</span>
            <span>{cat?.label}</span>
          </span>

          <div className="flex items-center gap-1.5">
            {plan.status === 'live' && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-md shadow-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                EN VIVO
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleReminder(plan.id);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                plan.hasReminder
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900/60 text-white hover:bg-slate-800'
              }`}
              title={plan.hasReminder ? 'Recordatorio activo' : 'Activar recordatorio'}
            >
              {plan.hasReminder ? (
                <BellRing className="w-3.5 h-3.5" />
              ) : (
                <Bell className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Bottom Location & Time Banner */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-1 text-cyan-300 font-semibold drop-shadow truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{plan.place_name}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-300 font-medium shrink-0 ml-2 drop-shadow text-[11px]">
            <Clock className="w-3 h-3 shrink-0" />
            <span>{plan.date} · {plan.time}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3
            className={`text-base font-bold transition-colors line-clamp-1 ${
              theme === 'dark' ? 'text-white group-hover:text-cyan-400' : 'text-slate-900 group-hover:text-cyan-600'
            }`}
          >
            {plan.title}
          </h3>
          <p
            className={`text-xs line-clamp-2 mt-1 leading-relaxed ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {plan.description}
          </p>
        </div>

        {/* Attendees Section Preview (Funcionalidad 2) */}
        <div
          className={`pt-2 border-t ${
            theme === 'dark' ? 'border-slate-800/80' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {/* Stacked avatars */}
              <div className="flex -space-x-2 overflow-hidden">
                {plan.attendees.slice(0, 4).map((att) => (
                  <img
                    key={att.userId}
                    src={att.avatar}
                    alt={att.fullName}
                    referrerPolicy="no-referrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenUserProfile(att.userId);
                    }}
                    className={`inline-block h-6 w-6 rounded-full ring-2 object-cover cursor-pointer hover:scale-110 transition-transform ${
                      theme === 'dark' ? 'ring-slate-900' : 'ring-white'
                    }`}
                    title={`${att.fullName} (${att.school})`}
                  />
                ))}
              </div>
              <span
                className={`text-xs font-semibold ml-1 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {plan.attendees.length}{' '}
                {plan.attendees.length === 1 ? 'persona va' : 'personas van'}
              </span>
            </div>

            {/* Quick School Tag of First Attendee */}
            {plan.attendees[0] && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[130px]">
                <School className="w-3 h-3 shrink-0" />
                <span className="truncate">{plan.attendees[0].school.replace('Col·legi ', '').replace('Ntra. Sra. de la ', '')}</span>
              </span>
            )}
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="pt-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1 hover:text-cyan-500 transition-colors">
              <MessageCircle className="w-3.5 h-3.5 text-cyan-500" />
              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                {plan.chatMessages.length}
              </span>
            </span>
            {avgRating && (
              <span className="flex items-center gap-1 text-amber-500 font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{avgRating}</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleJoin(plan.id);
            }}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95 flex items-center gap-1 ${
              isJoined
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                : theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
            }`}
          >
            {isJoined ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Apuntado/a</span>
              </>
            ) : (
              <span>¡Me apunto!</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
