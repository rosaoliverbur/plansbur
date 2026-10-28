import { useState, useEffect, useMemo } from 'react';
import type { Plan, PlanCategory, UserProfile } from './lib/types';
import { INITIAL_PLANS, INITIAL_PROFILES } from './lib/initialData';
import { CATEGORY_MAP, SCHOOLS_BURRIANA } from './lib/constants';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import PlanCard from './components/PlanCard';
import PlanMap from './components/PlanMap';
import PlanDetailModal from './components/PlanDetailModal';
import UserProfileModal from './components/UserProfileModal';
import CreatePlanModal from './components/CreatePlanModal';
import SettingsModal from './components/SettingsModal';
import {
  MapPin,
  Calendar,
  Sparkles,
  Search,
  Filter,
  School,
  Bell,
  Compass,
  CheckCircle2,
  Users,
  Layers,
  Sliders,
  RotateCcw,
  Cloud,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  auth,
  testConnection,
  loginWithGoogle,
  logoutUser,
  syncUserProfile,
  saveProfileToFirestore,
  subscribeToPlans,
  savePlanToFirestore,
  deletePlanFromFirestore,
} from './lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

const STORAGE_KEY_PLANS = 'burr_plans_data_v4';
const STORAGE_KEY_PROFILES = 'burr_profiles_data_v4';
const STORAGE_KEY_THEME = 'burr_theme_mode';

export default function App() {
  // Theme state: 'dark' | 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      return saved === 'light' || saved === 'dark' ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Sound / notification preference
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Firebase auth state
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  // Synchronize document theme class
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Profiles state
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILES);
      return saved ? JSON.parse(saved) : INITIAL_PROFILES;
    } catch {
      return INITIAL_PROFILES;
    }
  });

  // Current user (defaults to 'user-me' Rosa Oliver or synced Firebase user)
  const [currentUserId, setCurrentUserId] = useState<string>('user-me');
  const currentUser = useMemo(() => {
    return profiles.find((p) => p.id === currentUserId) || profiles[0];
  }, [profiles, currentUserId]);

  // Plans state (synchronized in real time with Firestore Cloud)
  const [plans, setPlans] = useState<Plan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLANS);
      if (!saved) return INITIAL_PLANS;
      const parsed = JSON.parse(saved);
      if (!parsed.some((p: Plan) => p.place_name?.includes('Hans'))) {
        return INITIAL_PLANS;
      }
      return parsed;
    } catch {
      return INITIAL_PLANS;
    }
  });

  // Navigation & View state
  const [activeView, setActiveView] = useState<'feed' | 'map' | 'reminders'>('feed');
  const [desktopLayout, setDesktopLayout] = useState<'split' | 'cards' | 'map'>('split');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pickedCoords, setPickedCoords] = useState<[number, number] | null>(null);
  const [isPickingLocation, setIsPickingLocation] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>('all');
  const [selectedPlaceFilter, setSelectedPlaceFilter] = useState<string>('all');

  // Firebase Realtime Subscriptions & Auth listener
  useEffect(() => {
    testConnection();

    // 1. Auth state listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      if (u) {
        try {
          const profile = await syncUserProfile(u);
          setProfiles((prev) => {
            const exists = prev.some((p) => p.id === profile.id);
            return exists ? prev.map((p) => (p.id === profile.id ? profile : p)) : [profile, ...prev];
          });
          setCurrentUserId(profile.id);
        } catch (e) {
          console.warn('Error syncing profile from cloud:', e);
        }
      }
    });

    // 2. Real-time multi-device Firestore synchronization
    const unsubscribePlans = subscribeToPlans((remotePlans) => {
      if (remotePlans && remotePlans.length > 0) {
        setPlans(remotePlans);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribePlans();
    };
  }, []);

  // Save to localStorage as quick cache
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  }, [profiles]);

  // Active Selected Plan
  const selectedPlan = useMemo(() => {
    return plans.find((p) => p.id === selectedPlanId) || null;
  }, [plans, selectedPlanId]);

  // Active Profile Modal user
  const viewingProfile = useMemo(() => {
    return profiles.find((p) => p.id === viewingUserId) || null;
  }, [profiles, viewingUserId]);

  // Filtered Plans
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      // Reminders view filter
      if (activeView === 'reminders' && !plan.hasReminder) {
        return false;
      }

      // Quick Place filter (Hans, Don Pipo, Arenal, Clot, etc.)
      if (selectedPlaceFilter !== 'all') {
        const placeMatches =
          plan.place_name.toLowerCase().includes(selectedPlaceFilter.toLowerCase()) ||
          plan.title.toLowerCase().includes(selectedPlaceFilter.toLowerCase());
        if (!placeMatches) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = plan.title.toLowerCase().includes(q);
        const matchesPlace = plan.place_name.toLowerCase().includes(q);
        const matchesDesc = plan.description.toLowerCase().includes(q);
        const matchesCreator = plan.creatorName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesPlace && !matchesDesc && !matchesCreator) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && plan.category !== selectedCategory) {
        return false;
      }

      // School filter (whether any attendee is from this school)
      if (selectedSchoolFilter !== 'all') {
        const hasStudent = plan.attendees.some(
          (a) => a.school === selectedSchoolFilter
        );
        if (!hasStudent) return false;
      }

      return true;
    });
  }, [plans, activeView, searchQuery, selectedCategory, selectedSchoolFilter, selectedPlaceFilter]);

  // Count active reminders
  const remindersCount = useMemo(() => {
    return plans.filter((p) => p.hasReminder).length;
  }, [plans]);

  // Google Auth actions
  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      const synced = await syncUserProfile(user);
      setProfiles((prev) => {
        const exists = prev.some((p) => p.id === synced.id);
        return exists ? prev.map((p) => (p.id === synced.id ? synced : p)) : [synced, ...prev];
      });
      setCurrentUserId(synced.id);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.25 } });
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logoutUser();
      setFirebaseUser(null);
      setCurrentUserId('user-me');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handler: Join or Leave Plan (Funcionalidad 2 + Firestore Cloud Persistence)
  const handleToggleJoin = (planId: string) => {
    let updatedTargetPlan: Plan | null = null;
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;
        const alreadyJoined = plan.attendees.some((a) => a.userId === currentUser.id);

        const updated: Plan = alreadyJoined
          ? {
              ...plan,
              attendees: plan.attendees.filter((a) => a.userId !== currentUser.id),
            }
          : {
              ...plan,
              attendees: [
                ...plan.attendees,
                {
                  userId: currentUser.id,
                  fullName: currentUser.fullName,
                  username: currentUser.username,
                  avatar: currentUser.avatar,
                  school: currentUser.school,
                  joinedAt: 'Ahora mismo',
                },
              ],
            };
        updatedTargetPlan = updated;
        return updated;
      })
    );
    if (updatedTargetPlan) {
      savePlanToFirestore(updatedTargetPlan);
    }
  };

  // Handler: Send Chat message (Funcionalidad 4 + Firestore Cloud Persistence)
  const handleSendMessage = (planId: string, text: string) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      planId,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderUsername: currentUser.username,
      senderAvatar: currentUser.avatar,
      senderSchool: currentUser.school,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    let updatedTargetPlan: Plan | null = null;
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;
        const updated: Plan = {
          ...plan,
          chatMessages: [...plan.chatMessages, newMessage],
        };
        updatedTargetPlan = updated;
        return updated;
      })
    );
    if (updatedTargetPlan) {
      savePlanToFirestore(updatedTargetPlan);
    }
  };

  // Handler: Add Photo to Plan Gallery (Funcionalidad 3 + Firestore Cloud Persistence)
  const handleAddPhoto = (planId: string, url: string, caption: string) => {
    const newPhoto = {
      id: `photo-${Date.now()}`,
      url,
      caption: caption || 'Foto añadida por un asistente',
      uploadedBy: currentUser.fullName,
      uploadedAt: 'Ahora mismo',
    };

    let updatedTargetPlan: Plan | null = null;
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;
        const updated: Plan = {
          ...plan,
          photos: [newPhoto, ...plan.photos],
        };
        updatedTargetPlan = updated;
        return updated;
      })
    );
    if (updatedTargetPlan) {
      savePlanToFirestore(updatedTargetPlan);
    }
  };

  // Handler: Add Star Rating (Funcionalidad 5 + Firestore Cloud Persistence)
  const handleAddRating = (planId: string, stars: number, comment: string) => {
    const newRating = {
      id: `rating-${Date.now()}`,
      planId,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userAvatar: currentUser.avatar,
      userSchool: currentUser.school,
      stars,
      comment,
      createdAt: 'Ahora mismo',
    };

    let updatedTargetPlan: Plan | null = null;
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;
        const updated: Plan = {
          ...plan,
          ratings: [newRating, ...plan.ratings],
        };
        updatedTargetPlan = updated;
        return updated;
      })
    );
    if (updatedTargetPlan) {
      savePlanToFirestore(updatedTargetPlan);
    }
  };

  // Handler: Toggle Reminder (Funcionalidad 5 + Firestore Cloud Persistence)
  const handleToggleReminder = (planId: string) => {
    let updatedTargetPlan: Plan | null = null;
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;
        const nextState = !plan.hasReminder;
        const updated: Plan = {
          ...plan,
          hasReminder: nextState,
        };
        updatedTargetPlan = updated;
        return updated;
      })
    );
    if (updatedTargetPlan) {
      savePlanToFirestore(updatedTargetPlan);
    }
  };

  // Handler: Toggle Follow user (User Request)
  const handleToggleFollow = (targetUserId: string) => {
    setProfiles((prev) =>
      prev.map((u) => {
        if (u.id !== targetUserId) return u;
        const isFollowed = !!u.isFollowedByMe;
        const updated = {
          ...u,
          isFollowedByMe: !isFollowed,
          followersCount: isFollowed ? u.followersCount - 1 : u.followersCount + 1,
        };
        saveProfileToFirestore(updated);
        return updated;
      })
    );
  };

  // Handler: Update current user profile
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    const nextUser = { ...currentUser, ...updated };
    setProfiles((prev) =>
      prev.map((u) => (u.id === currentUser.id ? nextUser : u))
    );
    saveProfileToFirestore(nextUser);
  };

  // Handler: Reset Data to defaults (Hans, Don Pipo, Arenal, etc.)
  const handleResetData = () => {
    setPlans(INITIAL_PLANS);
    setProfiles(INITIAL_PROFILES);
    localStorage.removeItem(STORAGE_KEY_PLANS);
    localStorage.removeItem(STORAGE_KEY_PROFILES);
    confetti({ particleCount: 30, spread: 60 });
  };

  // Handler: Create Plan with Cloud Persistence
  const handleCreatePlan = (newPlanData: Omit<Plan, 'id' | 'chatMessages' | 'ratings' | 'photos' | 'attendees'>) => {
    const newPlanId = `plan-${Date.now()}`;
    const newPlan: Plan = {
      ...newPlanData,
      id: newPlanId,
      creatorId: currentUser.id,
      creatorName: currentUser.fullName,
      creatorAvatar: currentUser.avatar,
      creatorSchool: currentUser.school,
      photos: [
        {
          id: `p-${Date.now()}`,
          url: newPlanData.coverPhoto,
          caption: 'Foto principal del plan',
          uploadedBy: currentUser.fullName,
          uploadedAt: 'Ahora',
        },
      ],
      attendees: [
        {
          userId: currentUser.id,
          fullName: currentUser.fullName,
          username: currentUser.username,
          avatar: currentUser.avatar,
          school: currentUser.school,
          joinedAt: 'Organizador',
        },
      ],
      chatMessages: [
        {
          id: `msg-${Date.now()}`,
          planId: newPlanId,
          senderId: currentUser.id,
          senderName: currentUser.fullName,
          senderUsername: currentUser.username,
          senderAvatar: currentUser.avatar,
          senderSchool: currentUser.school,
          text: `¡Hola a todos! He propuesto este plan en ${newPlanData.place_name}. ¿Quién se apunta?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      ratings: [],
    };

    setPlans((prev) => [newPlan, ...prev]);
    savePlanToFirestore(newPlan);
    setSelectedPlanId(newPlan.id);
    setPickedCoords(null);
    setIsPickingLocation(false);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans pb-20 md:pb-6 transition-colors duration-200 ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Bar Contract Navigation */}
      <TopNav
        currentUser={currentUser}
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          setIsPickingLocation(false);
        }}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenMyProfile={() => setViewingUserId(currentUser.id)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        isLoggedIn={!!firebaseUser}
        onLogin={handleGoogleLogin}
        onLogout={handleGoogleLogout}
      />

      {/* Hero & Burr Plans Tagline Banner */}
      <section
        className={`border-b px-4 sm:px-6 py-6 sm:py-8 transition-colors ${
          theme === 'dark'
            ? 'border-slate-900 bg-gradient-to-b from-slate-900/60 to-slate-950'
            : 'border-slate-200 bg-gradient-to-b from-cyan-50/60 to-white'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-500 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full mb-2">
                <span>📍 Burriana (Castellón)</span>
                <span className="text-slate-400">·</span>
                <span>Juventud & Amigos</span>
                <span className="text-slate-400">·</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Firebase Nube Activa
                </span>
              </div>
              <h1
                className={`text-2xl sm:text-4xl font-black tracking-tight ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}
              >
                Ayudamos a los jóvenes a no aburrirse
              </h1>
              <p
                className={`text-sm sm:text-base mt-1 max-w-2xl leading-relaxed ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Descubre planes en Burriana: desde helados artesanos en <strong>Hand's (Hans)</strong> o <strong>Don Pipo</strong>, hasta vóley en el <strong>Arenal</strong>, paseos por <strong>El Clot</strong> o hamburguesas en <strong>Burger King</strong> y <strong>McDonald's</strong>.
              </p>
            </div>

            {/* Quick Layout Mode Buttons for Desktop */}
            <div
              className={`hidden lg:flex items-center gap-1.5 p-1 border rounded-xl self-start md:self-center ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <button
                onClick={() => setDesktopLayout('split')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  desktopLayout === 'split'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Dividido (Mapa + Planes)</span>
              </button>
              <button
                onClick={() => setDesktopLayout('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  desktopLayout === 'cards'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Solo tarjetas</span>
              </button>
              <button
                onClick={() => setDesktopLayout('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  desktopLayout === 'map'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Mapa completo</span>
              </button>
            </div>
          </div>

          {/* Quick Hangout Spots Strip (Heladerías Hand's y Don Pipo, McDonald's, Burger King, Arenal, Clot) */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-500" />
              <span>Sitios de Burriana:</span>
            </span>

            <button
              onClick={() => setSelectedPlaceFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold shrink-0 transition-colors border ${
                selectedPlaceFilter === 'all'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                  : theme === 'dark'
                  ? 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              Todos los sitios
            </button>

            {[
              { name: 'Hans', emoji: '🍦', label: 'Hand\'s (Hans)' },
              { name: 'Don Pipo', emoji: '🍨', label: 'Don Pipo' },
              { name: 'McDonald\'s', emoji: '🍟', label: 'McDonald\'s' },
              { name: 'Burger King', emoji: '👑', label: 'Burger King' },
              { name: 'Arenal', emoji: '🏖️', label: 'El Arenal' },
              { name: 'Clot', emoji: '🌿', label: 'El Clot' },
              { name: 'El Pla', emoji: '🏛️', label: 'El Pla' },
            ].map((spot) => (
              <button
                key={spot.name}
                onClick={() => setSelectedPlaceFilter(spot.name)}
                className={`px-2.5 py-1 text-xs rounded-lg font-semibold shrink-0 transition-colors border flex items-center gap-1.5 ${
                  selectedPlaceFilter === spot.name
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                    : theme === 'dark'
                    ? 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/40 hover:text-white'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-amber-500/40 hover:text-slate-900'
                }`}
              >
                <span>{spot.emoji}</span>
                <span>{spot.label}</span>
              </button>
            ))}
          </div>

          {/* Search & Filters Strip */}
          <div className="mt-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por plan, sitio (Hans, Don Pipo, McDo, Arenal...) o amigos..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:border-cyan-500 transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 shadow-sm'
                  }`}
                />
              </div>

              {/* School filter (Funcionalidad 2: Filtro por Instituto) */}
              <div className="relative sm:w-72 shrink-0">
                <School className="w-4 h-4 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedSchoolFilter}
                  onChange={(e) => setSelectedSchoolFilter(e.target.value)}
                  className={`w-full pl-9 pr-8 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-800 text-white'
                      : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                  }`}
                >
                  <option value="all">🏫 Todos los institutos de Burriana</option>
                  {SCHOOLS_BURRIANA.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Category horizontal buttons */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === 'all'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                    : theme === 'dark'
                    ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                🔥 Todos los planes ({plans.length})
              </button>
              {(Object.keys(CATEGORY_MAP) as PlanCategory[]).map((catKey) => {
                const info = CATEGORY_MAP[catKey];
                const isSelected = selectedCategory === catKey;
                return (
                  <button
                    key={catKey}
                    onClick={() => setSelectedCategory(catKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                        : theme === 'dark'
                        ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                        : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <span>{info.emoji}</span>
                    <span>{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        {/* VIEW 1: MAP VIEW on mobile or full map mode */}
        {(activeView === 'map' || desktopLayout === 'map') && (
          <div className="h-[75vh] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <PlanMap
              plans={filteredPlans}
              selectedId={selectedPlanId}
              onSelect={(id) => setSelectedPlanId(id)}
              pick={
                isPickingLocation
                  ? {
                      value: pickedCoords,
                      onPick: (coords) => {
                        setPickedCoords(coords);
                        setIsPickingLocation(false);
                        setIsCreateOpen(true);
                      },
                    }
                  : undefined
              }
            />
          </div>
        )}

        {/* VIEW 2: REMINDERS VIEW */}
        {activeView === 'reminders' && desktopLayout !== 'map' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className={`text-lg font-bold flex items-center gap-2 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  <Bell className="w-5 h-5 text-amber-500" />
                  <span>Tus planes con recordatorio activo ({filteredPlans.length})</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Te avisaremos antes de que empiece cada plan para que no te lo pierdas
                </p>
              </div>
            </div>

            {filteredPlans.length === 0 ? (
              <div
                className={`p-12 text-center rounded-2xl border border-dashed ${
                  theme === 'dark'
                    ? 'bg-slate-900/50 border-slate-800'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <Bell className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-sm font-bold">No tienes ningún recordatorio activo</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Toca la campanita en cualquier plan de Burriana (o cena en Hans / Don Pipo) para activar un aviso.
                </p>
                <button
                  onClick={() => setActiveView('feed')}
                  className="mt-4 px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Explorar planes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    currentUser={currentUser}
                    onSelect={(id) => setSelectedPlanId(id)}
                    onToggleJoin={handleToggleJoin}
                    onToggleReminder={handleToggleReminder}
                    onOpenUserProfile={(uid) => setViewingUserId(uid)}
                    theme={theme}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: DESKTOP SPLIT VIEW (Map + Cards side by side) */}
        {activeView === 'feed' && desktopLayout === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Side: Plans Feed (Cards) */}
            <div className="lg:col-span-7 space-y-4">
              <div
                className={`flex items-center justify-between pb-2 border-b ${
                  theme === 'dark' ? 'border-slate-900' : 'border-slate-200'
                }`}
              >
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {filteredPlans.length}{' '}
                  {filteredPlans.length === 1 ? 'plan disponible' : 'planes disponibles'} en Burriana
                </span>
                <span className="text-[11px] text-cyan-500 font-medium">
                  Toca un plan para ver asistentes, fotos y chat
                </span>
              </div>

              {filteredPlans.length === 0 ? (
                <div
                  className={`p-10 text-center rounded-2xl border border-dashed ${
                    theme === 'dark'
                      ? 'bg-slate-900/50 border-slate-800'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <Sparkles className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                  <h3 className="text-sm font-bold">No hay planes con estos filtros</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Prueba a limpiar la búsqueda o propón tú el primer plan en este sitio de Burriana.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedSchoolFilter('all');
                      setSelectedPlaceFilter('all');
                    }}
                    className="mt-3 px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg"
                  >
                    Restablecer filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredPlans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      currentUser={currentUser}
                      onSelect={(id) => setSelectedPlanId(id)}
                      onToggleJoin={handleToggleJoin}
                      onToggleReminder={handleToggleReminder}
                      onOpenUserProfile={(uid) => setViewingUserId(uid)}
                      theme={theme}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Side: Sticky Interactive Burriana Map (Funcionalidad 1) */}
            <div className="hidden lg:block lg:col-span-5 sticky top-24">
              <div className="h-[680px] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
                <PlanMap
                  plans={filteredPlans}
                  selectedId={selectedPlanId}
                  onSelect={(id) => setSelectedPlanId(id)}
                  pick={
                    isPickingLocation
                      ? {
                          value: pickedCoords,
                          onPick: (coords) => {
                            setPickedCoords(coords);
                            setIsPickingLocation(false);
                            setIsCreateOpen(true);
                          },
                        }
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: PURE CARDS VIEW on desktop */}
        {activeView === 'feed' && desktopLayout === 'cards' && (
          <div className="space-y-4">
            <div
              className={`flex items-center justify-between pb-2 border-b ${
                theme === 'dark' ? 'border-slate-900' : 'border-slate-200'
              }`}
            >
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {filteredPlans.length} planes en Burriana
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  currentUser={currentUser}
                  onSelect={(id) => setSelectedPlanId(id)}
                  onToggleJoin={handleToggleJoin}
                  onToggleReminder={handleToggleReminder}
                  onOpenUserProfile={(uid) => setViewingUserId(uid)}
                  theme={theme}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button on mobile to view map / feed */}
      <div className="md:hidden fixed bottom-18 right-4 z-30">
        <button
          onClick={() => setActiveView(activeView === 'map' ? 'feed' : 'map')}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/90 backdrop-blur-md text-white font-bold text-xs rounded-full border border-slate-700 shadow-xl"
        >
          {activeView === 'map' ? (
            <>
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Ver lista</span>
            </>
          ) : (
            <>
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Ver mapa</span>
            </>
          )}
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          setIsPickingLocation(false);
        }}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenMyProfile={() => setViewingUserId(currentUser.id)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        remindersCount={remindersCount}
        theme={theme}
      />

      {/* MODAL 1: Plan Detail Modal (Funcionalidades 1 a 5) */}
      {selectedPlan && (
        <PlanDetailModal
          plan={selectedPlan}
          currentUser={currentUser}
          onClose={() => setSelectedPlanId(null)}
          onToggleJoin={handleToggleJoin}
          onSendMessage={handleSendMessage}
          onAddPhoto={handleAddPhoto}
          onAddRating={handleAddRating}
          onToggleReminder={handleToggleReminder}
          onOpenUserProfile={(uid) => setViewingUserId(uid)}
          theme={theme}
        />
      )}

      {/* MODAL 2: User Profile Modal (Detailed Profiles + Follows + User Plans) */}
      {viewingProfile && (
        <UserProfileModal
          profile={viewingProfile}
          currentUserId={currentUser.id}
          onClose={() => setViewingUserId(null)}
          onToggleFollow={handleToggleFollow}
          plans={plans}
          onSelectPlan={(id) => {
            setSelectedPlanId(id);
            setViewingUserId(null);
          }}
          onUpdateProfile={handleUpdateProfile}
          theme={theme}
          isLoggedIn={!!firebaseUser}
          onLogin={handleGoogleLogin}
          onLogout={handleGoogleLogout}
        />
      )}

      {/* MODAL 3: Create Plan Modal */}
      <CreatePlanModal
        currentUser={currentUser}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreatePlan={handleCreatePlan}
        pickedCoords={pickedCoords}
        onRequestPickLocation={() => {
          setIsPickingLocation(true);
          setActiveView('map');
          setDesktopLayout('map');
        }}
        theme={theme}
      />

      {/* MODAL 4: Ajustes Modal (Modo oscuro / claro, sitios de Burriana, sonido, Nube Firebase) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={(newTheme) => setTheme(newTheme)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        preferredSchool={selectedSchoolFilter}
        onPreferredSchoolChange={(school) => setSelectedSchoolFilter(school)}
        onResetData={handleResetData}
        onSelectPlaceFilter={(place) => {
          setSelectedPlaceFilter(place);
          setActiveView('feed');
        }}
        isLoggedIn={!!firebaseUser}
        firebaseUser={firebaseUser}
        onLogin={handleGoogleLogin}
        onLogout={handleGoogleLogout}
      />
    </div>
  );
}
