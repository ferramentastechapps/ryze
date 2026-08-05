// ============================================================
// RYZE — Auth Store (Zustand)
// ============================================================

import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { UserProfile_Auth, AccessStatus } from '../types/supabase';
import { getOrCreateProfile, onAuthStateChange } from '../services/authService';
import { getAccessStatus } from '../services/subscriptionService';
import { supabase } from '../services/supabase';

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

async function buildSession(user: User) {
  const trialStart = new Date();
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 30);

  const fallback: UserProfile_Auth = {
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

  try {
    const profile = await getOrCreateProfile(user);
    const status = getAccessStatus(profile);
    return { profile, status };
  } catch {
    return { profile: fallback, status: 'trial' as AccessStatus };
  }
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
    // Detectar se há token OAuth na URL (fluxo implicit pós-redirect do Google)
    const hasTokenInHash = window.location.hash.includes('access_token');

    // Único ponto de verdade: onAuthStateChange do Supabase
    // O Supabase processa o hash da URL automaticamente antes de emitir o evento
    const unsubscribe = onAuthStateChange(async (user) => {
      console.log('[AuthStore] onAuthStateChange user:', user?.email ?? 'null');

      if (!user) {
        // Limpar hash de erro/token inválido da URL
        if (window.location.hash.includes('access_token') || window.location.hash.includes('error')) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        set({ user: null, authProfile: null, accessStatus: 'unauthenticated', authLoading: false });
        return;
      }

      set({ user, authLoading: true });

      const { profile, status } = await buildSession(user);

      // Limpar token da URL após autenticação bem-sucedida
      if (window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }

      set({ user, authProfile: profile, accessStatus: status, authLoading: false });
    });

    // Se NÃO há token na URL (sessão normal, não redirect OAuth),
    // precisamos do getSession() para inicializar o estado.
    // Se HÁ token na URL, o onAuthStateChange vai disparar automaticamente.
    if (!hasTokenInHash) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.user) {
          // Não tem sessão ativa e não é redirect OAuth → vai pro login
          set({ user: null, authProfile: null, accessStatus: 'unauthenticated', authLoading: false });
        }
        // Se tem sessão, o onAuthStateChange já vai tratar
      });
    }

    return unsubscribe;
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    const { profile, status } = await buildSession(user);
    set({ authProfile: profile, accessStatus: status });
  },
}));
