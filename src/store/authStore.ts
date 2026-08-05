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
    // Se há token OAuth na URL (fluxo implicit pós-redirect do Google)
    // precisamos deixar o Supabase processar o hash antes de decidir o estado
    const hasTokenInHash = window.location.hash.includes('access_token');

    const unsubscribe = onAuthStateChange(async (event, user) => {
      console.log('[AuthStore] auth event:', event, '| user:', user?.email ?? 'null');

      if (!user) {
        // INITIAL_SESSION com null + token na URL = Supabase ainda está processando o hash
        // Não fazer nada: o evento SIGNED_IN vai vir em seguida com o user
        if (event === 'INITIAL_SESSION' && hasTokenInHash) {
          console.log('[AuthStore] Aguardando processamento do token OAuth na URL...');
          return;
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

    // Se NÃO há token na URL (acesso normal), getSession() define o estado inicial.
    // Se HÁ token na URL, o Supabase vai emitir SIGNED_IN via onAuthStateChange automaticamente.
    if (!hasTokenInHash) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.user) {
          set({ user: null, authProfile: null, accessStatus: 'unauthenticated', authLoading: false });
        }
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
