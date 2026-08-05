// ============================================================
// RYZE — Auth Store (Zustand)
// ============================================================

import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { UserProfile_Auth, AccessStatus } from '../types/supabase';
import { getOrCreateProfile, onAuthStateChange } from '../services/authService';
import { getAccessStatus } from '../services/subscriptionService';

interface AuthStore {
  // State
  user: User | null;
  authProfile: UserProfile_Auth | null;
  accessStatus: AccessStatus;
  authLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setAuthProfile: (profile: UserProfile_Auth | null) => void;
  setAccessStatus: (status: AccessStatus) => void;
  setAuthLoading: (loading: boolean) => void;
  initialize: () => () => void;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  authProfile: null,
  accessStatus: 'loading',
  authLoading: true,

  setUser: (user) => set({ user }),
  setAuthProfile: (profile) => set({ authProfile: profile }),
  setAccessStatus: (status) => set({ accessStatus: status }),
  setAuthLoading: (loading) => set({ authLoading: loading }),

  initialize: () => {
    const unsubscribe = onAuthStateChange(async (user) => {
      set({ user, authLoading: true });

      if (!user) {
        set({
          user: null,
          authProfile: null,
          accessStatus: 'unauthenticated',
          authLoading: false,
        });
        return;
      }

      try {
        const profile = await getOrCreateProfile(user);
        const status = getAccessStatus(profile);
        set({
          authProfile: profile,
          accessStatus: status,
          authLoading: false,
        });
      } catch (err) {
        console.error('Error loading auth profile:', err);
        set({ accessStatus: 'unauthenticated', authLoading: false });
      }
    });

    return unsubscribe;
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    const profile = await getOrCreateProfile(user);
    const status = getAccessStatus(profile);
    set({ authProfile: profile, accessStatus: status });
  },
}));
