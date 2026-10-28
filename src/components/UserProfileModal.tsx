import { useState } from 'react';
import type { UserProfile, Plan } from '../lib/types';
import { SCHOOLS_BURRIANA, AVAILABLE_INTERESTS, CATEGORY_MAP } from '../lib/constants';
import { X, UserPlus, UserCheck, School, MapPin, Calendar, Heart, Sparkles, Check, Edit3, LogOut, LogIn } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  profile: UserProfile | null;
  currentUserId: string;
  onClose: () => void;
  onToggleFollow: (userId: string) => void;
  plans: Plan[];
  onSelectPlan: (planId: string) => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
  theme?: 'dark' | 'light';
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onLogin?: () => void;
}

export default function UserProfileModal({
  profile,
  currentUserId,
  onClose,
  onToggleFollow,
  plans,
  onSelectPlan,
  onUpdateProfile,
  theme = 'dark',
  isLoggedIn = false,
  onLogout,
  onLogin,
}: Props) {
  if (!profile) return null;

  const isMe = profile.id === currentUserId;
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editSchool, setEditSchool] = useState(profile.school);
  const [editInterests, setEditInterests] = useState<string[]>(profile.interests || []);
  const [editUsername, setEditUsername] = useState(profile.username);
  const [editFullName, setEditFullName] = useState(profile.fullName);
  const [activeTab, setActiveTab] = useState<'attending' | 'created'>('attending');

  // Plans where this user is an attendee
  const attendingPlans = plans.filter((p) =>
    p.attendees.some((a) => a.userId === profile.id)
  );

  // Plans created by this user
  const createdPlans = plans.filter((p) => p.creatorId === profile.id);

  const handleFollowClick = () => {
    if (!profile.isFollowedByMe) {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
    onToggleFollow(profile.id);
  };

  const handleSaveProfile = () => {
    onUpdateProfile?.({
      fullName: editFullName,
      username: editUsername.startsWith('@') ? editUsername : `@${editUsername}`,
      school: editSchool,
      bio: editBio,
      interests: editInterests,
    });
    setIsEditing(false);
  };

  const toggleInterest = (interest: string) => {
    if (editInterests.includes(interest)) {
      setEditInterests(editInterests.filter((i) => i !== interest));
    } else {
      setEditInterests([...editInterests, interest]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border transition-colors ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-700 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 text-white hover:bg-black/70 flex items-center justify-center transition-colors z-10"
            aria-label="Cerrar perfil"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="px-6 pt-0 pb-6 overflow-y-auto custom-scrollbar flex-1 -mt-12">
          {/* Avatar and Action */}
          <div className="flex items-end justify-between mb-4">
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.fullName}
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-full object-cover border-4 border-slate-900 shadow-xl bg-slate-800"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Activo en Burr Plans" />
            </div>

            {isMe ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Cancelar' : 'Editar perfil'}</span>
                </button>
                {isLoggedIn && onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-semibold transition-all active:scale-95"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Salir</span>
                  </button>
                )}
                {!isLoggedIn && onLogin && (
                  <button
                    onClick={() => {
                      onLogin();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Acceder con Google</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleFollowClick}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md active:scale-95 ${
                  profile.isFollowedByMe
                    ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
                }`}
              >
                {profile.isFollowedByMe ? (
                  <>
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>Siguiendo</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Seguir</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* User Details / Edit Mode */}
          {isEditing ? (
            <div className="space-y-4 pt-2 mb-6 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nombre de usuario (@)</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Instituto / Centro de Burriana</label>
                <select
                  value={editSchool}
                  onChange={(e) => setEditSchool(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  {SCHOOLS_BURRIANA.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Biografía breve</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Cuéntale a los jóvenes de Burriana qué te gusta hacer..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Tus intereses en Burriana</label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_INTERESTS.map((interest) => {
                    const isSelected = editInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-2.5 py-1 text-xs rounded-lg transition-colors border ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Guardar cambios
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">{profile.fullName}</h3>
                <span className="text-xs text-cyan-400 font-mono">{profile.username}</span>
              </div>

              {/* School badge */}
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2.5 py-1 mt-1.5 mb-3">
                <School className="w-3.5 h-3.5 shrink-0" />
                <span>{profile.school}</span>
              </div>

              {/* Bio */}
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {profile.bio || 'Sin biografía todavía.'}
              </p>

              {/* Social Stats */}
              <div className="flex items-center gap-6 py-2.5 px-4 bg-slate-800/50 rounded-xl border border-slate-800/80 mb-4 text-xs">
                <div>
                  <span className="font-bold text-white text-base mr-1 tabular-nums">
                    {profile.followersCount + (profile.isFollowedByMe ? 1 : 0)}
                  </span>
                  <span className="text-slate-400">Seguidores</span>
                </div>
                <div className="w-px h-4 bg-slate-700" />
                <div>
                  <span className="font-bold text-white text-base mr-1 tabular-nums">{profile.followingCount}</span>
                  <span className="text-slate-400">Siguiendo</span>
                </div>
                <div className="w-px h-4 bg-slate-700" />
                <div>
                  <span className="font-bold text-white text-base mr-1 tabular-nums">{attendingPlans.length}</span>
                  <span className="text-slate-400">Planes</span>
                </div>
              </div>

              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Intereses en su tiempo libre</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-2.5 py-1 text-xs rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Planes del usuario Section */}
          <div className="border-t border-slate-800/80 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Planes de {profile.fullName.split(' ')[0]}</span>
              </h4>

              <div className="flex gap-1 p-0.5 bg-slate-800 rounded-lg text-xs">
                <button
                  onClick={() => setActiveTab('attending')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    activeTab === 'attending'
                      ? 'bg-cyan-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Apuntado/a ({attendingPlans.length})
                </button>
                <button
                  onClick={() => setActiveTab('created')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    activeTab === 'created'
                      ? 'bg-cyan-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Organizados ({createdPlans.length})
                </button>
              </div>
            </div>

            {/* List of Plans */}
            {activeTab === 'attending' ? (
              attendingPlans.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs bg-slate-800/30 rounded-xl border border-dashed border-slate-800">
                  No está apuntado/a a ningún plan próximo por ahora.
                </div>
              ) : (
                <div className="space-y-2">
                  {attendingPlans.map((plan) => {
                    const cat = CATEGORY_MAP[plan.category];
                    return (
                      <div
                        key={plan.id}
                        onClick={() => {
                          onSelectPlan(plan.id);
                          onClose();
                        }}
                        className="p-3 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-all flex items-center gap-3 group"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-700">
                          <img
                            src={plan.coverPhoto}
                            alt={plan.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{cat?.emoji}</span>
                            <h5 className="text-xs font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                              {plan.title}
                            </h5>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 truncate">
                            <span className="text-cyan-400 font-medium">{plan.date} · {plan.time}</span>
                            <span>·</span>
                            <span className="truncate flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                              {plan.place_name}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : createdPlans.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs bg-slate-800/30 rounded-xl border border-dashed border-slate-800">
                No ha organizado ningún plan todavía.
              </div>
            ) : (
              <div className="space-y-2">
                {createdPlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => {
                      onSelectPlan(plan.id);
                      onClose();
                    }}
                    className="p-3 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-all flex items-center gap-3 group"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-700">
                      <img
                        src={plan.coverPhoto}
                        alt={plan.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                        {plan.title}
                      </h5>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 truncate">
                        <span className="text-emerald-400">{plan.date} · {plan.time}</span>
                        <span>·</span>
                        <span className="truncate">{plan.place_name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
