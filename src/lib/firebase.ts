import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { Plan, UserProfile } from './types';
import { INITIAL_PLANS, INITIAL_PROFILES } from './initialData';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId according to Firebase skill
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection on startup
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, check connection.');
    }
  }
}

// Authentication Helpers
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// User Profile sync in Firestore
export async function syncUserProfile(user: User, defaultSchool?: string): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    } else {
      const emailUsername = user.email ? user.email.split('@')[0] : 'joven';
      const cleanUsername = `@${emailUsername.replace(/[^a-zA-Z0-9_]/g, '_')}`;
      const newProfile: UserProfile = {
        id: user.uid,
        username: cleanUsername,
        fullName: user.displayName || 'Joven de Burriana',
        avatar:
          user.photoURL ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        school: defaultSchool || 'Col·legi Ntra. Sra. de la Consolació',
        bio: '¡Hola! Me acabo de unir a Burr Plans para no aburrirme en Burriana.',
        interests: ['Helados en Hans & Don Pipo', 'Voleibol playa', 'Tardeo & Merienda'],
        followersCount: 0,
        followingCount: 0,
        isFollowedByMe: false,
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    throw error;
  }
}

// Save updated profile
export async function saveProfileToFirestore(profile: UserProfile): Promise<void> {
  const userRef = doc(db, 'users', profile.id);
  try {
    await setDoc(userRef, profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${profile.id}`);
  }
}

// Listen to all users
export function subscribeToUsers(onUsersUpdate: (users: UserProfile[]) => void): Unsubscribe {
  const usersRef = collection(db, 'users');
  return onSnapshot(
    usersRef,
    (snapshot) => {
      const users: UserProfile[] = [];
      snapshot.forEach((doc) => {
        users.push(doc.data() as UserProfile);
      });
      onUsersUpdate(users);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    }
  );
}

// Listen to all plans with real-time updates across all devices
export function subscribeToPlans(onPlansUpdate: (plans: Plan[]) => void): Unsubscribe {
  const plansRef = collection(db, 'plans');
  return onSnapshot(
    plansRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // First time initialization: seed initial plans with authentic Burriana spots
        onPlansUpdate(INITIAL_PLANS);
        try {
          for (const plan of INITIAL_PLANS) {
            await setDoc(doc(db, 'plans', plan.id), plan);
          }
        } catch (e) {
          console.warn('Could not seed initial plans into Firestore:', e);
        }
      } else {
        const loadedPlans: Plan[] = [];
        snapshot.forEach((doc) => {
          loadedPlans.push(doc.data() as Plan);
        });
        onPlansUpdate(loadedPlans);
      }
    },
    (error) => {
      console.warn('Firestore plans onSnapshot error:', error);
      // Fallback to local
      onPlansUpdate(INITIAL_PLANS);
    }
  );
}

// Save or create a plan in Firestore
export async function savePlanToFirestore(plan: Plan): Promise<void> {
  const planRef = doc(db, 'plans', plan.id);
  try {
    await setDoc(planRef, plan, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `plans/${plan.id}`);
  }
}

// Delete plan
export async function deletePlanFromFirestore(planId: string): Promise<void> {
  const planRef = doc(db, 'plans', planId);
  try {
    await deleteDoc(planRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `plans/${planId}`);
  }
}
