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
      if (!user) {
        set({
          user: null,
          authProfile: null,
          accessStatus: 'unauthenticated',
          authLoading: false,
        });
        return;
      }

      set({ user, authLoading: true });

      try {
        const profile = await getOrCreateProfile(user);
        const status = getAccessStatus(profile);
        set({
          user,
          authProfile: profile,
          accessStatus: status,
          authLoading: false,
        });
      } catch (err) {
        console.error('Error loading auth profile:', err);
        const trialStart = new Date();
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 30);
        const fallbackProfile: UserProfile_Auth = {
          id: user.id,
          email: user.email ?? null,
          full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
          avatar_url: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
          trial_start_date: trialStart.toISOString(),
          trial_end_date: trialEnd.toISOString(),
          subscription_status: 'trial',
          stripe_customer_id: null,
          stripe_subscription_id: null,
        };
        set({
          user,
          authProfile: fallbackProfile,
          accessStatus: 'trial',
          authLoading: false,
        });
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
