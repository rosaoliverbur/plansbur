import { useState, useRef, useEffect } from 'react';
import type { Plan, UserProfile } from '../lib/types';
import { CATEGORY_MAP } from '../lib/constants';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Users,
  MessageCircle,
  Star,
  Bell,
  BellRing,
  Camera,
  Send,
  Navigation,
  School,
  Sparkles,
  Share2,
  CheckCircle2,
  ChevronRight,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  plan: Plan | null;
  currentUser: UserProfile;
  onClose: () => void;
  onToggleJoin: (planId: string) => void;
  onSendMessage: (planId: string, text: string) => void;
  onAddPhoto: (planId: string, photoUrl: string, caption: string) => void;
  onAddRating: (planId: string, stars: number, comment: string) => void;
  onToggleReminder: (planId: string) => void;
  onOpenUserProfile: (userId: string) => void;
  onNavigateToPlan?: (plan: Plan) => void;
  theme?: 'dark' | 'light';
}

export default function PlanDetailModal({
  plan,
  currentUser,
  onClose,
  onToggleJoin,
  onSendMessage,
  onAddPhoto,
  onAddRating,
  onToggleReminder,
  onOpenUserProfile,
  onNavigateToPlan,
  theme = 'dark',
}: Props) {
  if (!plan) return null;

  const [activeTab, setActiveTab] = useState<'info' | 'chat' | 'photos' | 'ratings'>('info');
  const [chatInput, setChatInput] = useState('');
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photoCaptionInput, setPhotoCaptionInput] = useState('');
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [selectedStars, setSelectedStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const isJoined = plan.attendees.some((a) => a.userId === currentUser.id);
  const cat = CATEGORY_MAP[plan.category];

  // Scroll to bottom of chat when tab changes or message sent
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, plan.chatMessages.length]);

  const handleJoinClick = () => {
    if (!isJoined) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
      });
    }
    onToggleJoin(plan.id);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(plan.id, chatInput.trim());
    setChatInput('');
  };

  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = photoUrlInput.trim() || plan.coverPhoto;
    onAddPhoto(plan.id, url, photoCaptionInput.trim());
    setPhotoUrlInput('');
    setPhotoCaptionInput('');
    setShowAddPhotoModal(false);
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingComment.trim()) return;
    onAddRating(plan.id, selectedStars, ratingComment.trim());
    setRatingComment('');
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin} - ¡Mira este plan en Burriana: ${plan.title}!`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Average rating
  const avgRating =
    plan.ratings.length > 0
      ? (plan.ratings.reduce((acc, r) => acc + r.stars, 0) / plan.ratings.length).toFixed(1)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border transition-colors ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Image & Quick Action Header */}
        <div className="relative h-48 sm:h-56 bg-slate-950 shrink-0 overflow-hidden">
          <img
            src={plan.coverPhoto}
            alt={plan.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/30" />

          {/* Top Controls */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 backdrop-blur-md ${cat?.color || 'bg-slate-800 text-white'} ${cat?.border || 'border-slate-700'}`}
            >
              <span>{cat?.emoji}</span>
              <span>{cat?.label}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-full bg-slate-900/70 backdrop-blur-md text-white hover:bg-slate-800 flex items-center justify-center border border-white/10 transition-colors"
                title="Compartir plan"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-900/70 backdrop-blur-md text-white hover:bg-slate-800 flex items-center justify-center border border-white/10 transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Share toast feedback */}
          {copiedLink && (
            <div className="absolute top-14 right-3 z-20 px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg shadow-lg animate-in fade-in">
              ¡Enlace del plan copiado!
            </div>
          )}

          {/* Plan Title & Location Overlay */}
          <div className="absolute bottom-3 left-4 right-4 z-10">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug drop-shadow-md">
              {plan.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-200">
              <span className="flex items-center gap-1 text-cyan-300 font-medium">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {plan.place_name}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-amber-300">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                {plan.date} a las {plan.time}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Funcionalidades 1 a 5) */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-4 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'info'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Asistentes ({plan.attendees.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors relative ${
              activeTab === 'chat'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat del plan</span>
            {plan.chatMessages.length > 0 && (
              <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded-full text-[10px] font-mono">
                {plan.chatMessages.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'photos'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Fotos ({plan.photos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ratings')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'ratings'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Valoraciones {avgRating ? `(${avgRating}★)` : ''}</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6">
          {/* TAB 1: INFO & ASISTENTES (Funcionalidad 2 + Recordatorio Funcionalidad 5) */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  ¿De qué trata este plan?
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/40 p-3.5 rounded-xl border border-slate-800/80">
                  {plan.description}
                </p>
              </div>

              {/* Quick Actions (Me apunto + Recordatorio) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleJoinClick}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                    isJoined
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30'
                      : 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-cyan-500/20'
                  }`}
                >
                  {isJoined ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>¡Ya estás apuntado/a! (Desapuntarme)</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      <span>¡Me apunto al plan!</span>
                    </>
                  )}
                </button>

                {/* Funcionalidad 5: Recordatorio */}
                <button
                  onClick={() => onToggleReminder(plan.id)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
                    plan.hasReminder
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                  }`}
                >
                  {plan.hasReminder ? (
                    <>
                      <BellRing className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span>Recordatorio activado ({plan.date})</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      <span>Activar recordatorio</span>
                    </>
                  )}
                </button>
              </div>

              {/* FUNCIONALIDAD 2: Quién va a esos planes (foto, nombre e instituto) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>¿Quién va a este plan? ({plan.attendees.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Toca un perfil para ver más</span>
                </div>

                {plan.attendees.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs bg-slate-800/20 rounded-xl border border-dashed border-slate-800">
                    Aún no hay nadie apuntado. ¡Sé el primero en apuntarte!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {plan.attendees.map((attendee) => (
                      <div
                        key={attendee.userId}
                        onClick={() => onOpenUserProfile(attendee.userId)}
                        className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-xl cursor-pointer transition-all flex items-center gap-3 group"
                        title={`Ver perfil completo de ${attendee.fullName}`}
                      >
                        <img
                          src={attendee.avatar}
                          alt={attendee.fullName}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full object-cover border-2 border-slate-700 group-hover:border-cyan-400 transition-colors shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                              {attendee.fullName}
                            </h5>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                          </div>
                          <span className="text-[11px] text-slate-400 block truncate font-mono">
                            {attendee.username}
                          </span>
                          {/* Instituto al que va */}
                          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 mt-1 truncate">
                            <School className="w-3 h-3 shrink-0" />
                            <span className="truncate">{attendee.school}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Organizer Card */}
              <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={plan.creatorAvatar}
                    alt={plan.creatorName}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                      Plan propuesto por
                    </span>
                    <button
                      onClick={() => onOpenUserProfile(plan.creatorId)}
                      className="text-xs font-bold text-cyan-400 hover:underline"
                    >
                      {plan.creatorName} ({plan.creatorSchool})
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">Lugar</span>
                  <span className="text-xs font-semibold text-white">{plan.place_name}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHAT PARA ORGANIZAR EL PLAN (Funcionalidad 4) */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[380px]">
              <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-800 mb-3 text-xs text-slate-400 flex items-center justify-between">
                <span>💬 Chat abierto para organizar la hora, qué llevar y cómo ir.</span>
                <span className="text-cyan-400 font-mono text-[11px]">Burr Chat</span>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                {plan.chatMessages.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No hay mensajes todavía. ¡Sé el primero en escribir para organizar el plan!
                  </div>
                ) : (
                  plan.chatMessages.map((msg) => {
                    const isMyMessage = msg.senderId === currentUser.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          referrerPolicy="no-referrer"
                          onClick={() => onOpenUserProfile(msg.senderId)}
                          className="w-8 h-8 rounded-full object-cover shrink-0 cursor-pointer hover:ring-2 hover:ring-cyan-400 transition-all"
                          title={`Ver perfil de ${msg.senderName}`}
                        />
                        <div
                          className={`max-w-[78%] rounded-2xl p-3 text-xs ${
                            isMyMessage
                              ? 'bg-cyan-600 text-white rounded-tr-none'
                              : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-none'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 text-[10px] font-semibold opacity-90">
                            <span
                              onClick={() => onOpenUserProfile(msg.senderId)}
                              className="cursor-pointer hover:underline"
                            >
                              {msg.senderName}
                            </span>
                            <span>·</span>
                            <span className="opacity-75">{msg.senderSchool.split(' ')[0]}</span>
                            <span>·</span>
                            <span className="opacity-75 font-mono">{msg.timestamp}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="mt-3 pt-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Escribe como ${currentUser.fullName.split(' ')[0]}...`}
                  className="flex-1 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: FOTOS DEL PLAN EN SCROLL HORIZONTAL (Funcionalidad 3) */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Galería de fotos de la actividad
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Desliza para ver fotos de los que han ido o están allí
                  </p>
                </div>
                <button
                  onClick={() => setShowAddPhotoModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir foto</span>
                </button>
              </div>

              {/* Horizontal Scroll Zone (Scroll de fotos) */}
              {plan.photos.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs bg-slate-800/20 rounded-xl border border-dashed border-slate-800">
                  Aún no hay fotos en este plan. ¡Sube la primera foto del grupo!
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar">
                  {plan.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="w-64 sm:w-72 shrink-0 snap-center bg-slate-800/80 border border-slate-700/60 rounded-2xl overflow-hidden shadow-lg group"
                    >
                      <div className="h-44 overflow-hidden bg-slate-900">
                        <img
                          src={photo.url}
                          alt={photo.caption || 'Foto del plan'}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-medium text-slate-200 line-clamp-2">
                          {photo.caption || 'Foto compartida del plan'}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                          <span>Subida por {photo.uploadedBy}</span>
                          <span>{photo.uploadedAt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Photo Modal/Form */}
              {showAddPhotoModal && (
                <form
                  onSubmit={handlePhotoSubmit}
                  className="p-4 bg-slate-800/60 rounded-xl border border-cyan-500/30 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-cyan-400" />
                      Añadir nueva foto del plan
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddPhotoModal(false)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      URL de la imagen (o pega un enlace de foto)
                    </label>
                    <input
                      type="url"
                      value={photoUrlInput}
                      onChange={(e) => setPhotoUrlInput(e.target.value)}
                      placeholder="https://... o déjalo vacío para usar foto representativa"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Pie de foto / Descripción breve
                    </label>
                    <input
                      type="text"
                      value={photoCaptionInput}
                      onChange={(e) => setPhotoCaptionInput(e.target.value)}
                      placeholder="Ej: ¡Ya estamos aquí en el Arenal listos!"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPhotoModal(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cerrar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                    >
                      Publicar foto
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: RECORDATORIOS Y VALORACIÓN CON ESTRELLAS (Funcionalidad 5) */}
          {activeTab === 'ratings' && (
            <div className="space-y-6">
              {/* Reminder Banner */}
              <div className="p-4 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Bell className="w-4 h-4" />
                    Recordatorio del plan
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-1">
                    {plan.hasReminder
                      ? `🔔 Te avisaremos para que no se te pase: ${plan.date} a las ${plan.time} en ${plan.place_name}.`
                      : 'Activa el recordatorio para recibir avisos y tenerlo siempre a mano.'}
                  </p>
                </div>
                <button
                  onClick={() => onToggleReminder(plan.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                    plan.hasReminder
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : 'bg-slate-800 text-amber-300 border border-amber-500/40 hover:bg-slate-700'
                  }`}
                >
                  {plan.hasReminder ? 'Desactivar' : 'Recordármelo'}
                </button>
              </div>

              {/* Star Rating Section */}
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>Califica la experiencia (del 1 al 5 ⭐)</span>
                  </h4>
                  {avgRating && (
                    <div className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Media: {avgRating} / 5 ({plan.ratings.length} votos)
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-300">
                  ¿Has participado o conoces esta experiencia en Burriana? Deja tu valoración con estrellas:
                </p>

                {/* Star Selector (1 to 5) */}
                <div className="flex items-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((starNum) => (
                    <button
                      key={starNum}
                      type="button"
                      onClick={() => setSelectedStars(starNum)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          starNum <= selectedStars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-400 ml-2">
                    {selectedStars} de 5 estrellas
                  </span>
                </div>

                {/* Rating Form */}
                <form onSubmit={handleRatingSubmit} className="space-y-2 pt-2">
                  <textarea
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Escribe qué tal estuvo el plan, el ambiente, la música..."
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!ratingComment.trim()}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Enviar mi valoración</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Reviews */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Opiniones de los jóvenes ({plan.ratings.length})
                </h5>

                {plan.ratings.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs bg-slate-800/20 rounded-xl border border-dashed border-slate-800">
                    Aún no hay valoraciones para este plan. ¡Sé el primero en calificarlo!
                  </div>
                ) : (
                  plan.ratings.map((rating) => (
                    <div
                      key={rating.id}
                      className="p-3.5 bg-slate-800/50 border border-slate-800 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={rating.userAvatar}
                            alt={rating.userName}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {rating.userName}
                            </span>
                            <span className="text-[10px] text-emerald-400 block">
                              {rating.userSchool}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rating.stars
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                          <span className="text-[10px] text-slate-400 ml-1 font-mono">
                            {rating.createdAt}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed pl-9">
                        {rating.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
