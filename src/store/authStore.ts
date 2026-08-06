// ============================================================
// RYZE — Auth Store (Zustand)
// ============================================================

import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { UserProfile_Auth, AccessStatus } from '../types/supabase';
import { getOrCreateProfile } from '../services/authService';
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
    const hash = window.location.hash;
    const search = window.location.search;
    const hasTokenInHash = hash.includes('access_token');
    const hasCodeInQuery = search.includes('code=');

    const processAuth = async () => {
      set({ authLoading: true });

      // ── 1. Resgate manual se há token OAuth na URL hash (#access_token=...) ──
      // Resolve o problema de clock skew e erros internos de fetch no gotrue-js
      if (hasTokenInHash) {
        try {
          const rawHash = window.location.hash.slice(1);
          const hashParams = new URLSearchParams(rawHash);
          const access_token = hashParams.get('access_token');
          const refresh_token = hashParams.get('refresh_token');

          if (access_token) {
            const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string)?.trim();
            const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string)?.trim();

            const headersEnviados = {
              Authorization: `Bearer ${access_token}`,
              apikey: supabaseAnonKey,
            };

            console.log('[DEBUG] token bruto:', JSON.stringify(access_token));
            console.log('[DEBUG] headers enviados:', JSON.stringify(headersEnviados));

            // Chamada nativa direta para a API REST do Supabase (/auth/v1/user)
            const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
              headers: headersEnviados,
            });

            if (userRes.ok) {
              const user = (await userRes.json()) as User;
              console.log('[AuthStore] Usuário autenticado com sucesso via REST API:', user.email);

              // Tenta persistir a sessão localmente se houver refresh token
              if (refresh_token) {
                await supabase.auth.setSession({ access_token, refresh_token }).catch(() => {});
              }

              window.history.replaceState(null, '', window.location.pathname);
              const { profile, status } = await buildSession(user);
              set({ user, authProfile: profile, accessStatus: status, authLoading: false });
              return;
            } else {
              console.warn('[AuthStore] Erro ao validar access_token via REST:', userRes.status, userRes.statusText);
            }
          }
        } catch (err) {
          console.error('[AuthStore] Erro ao processar hash OAuth da URL:', err);
        }
      }

      // ── 2. Se há código PKCE na URL (?code=...) ──
      if (hasCodeInQuery) {
        try {
          const searchParams = new URLSearchParams(search);
          const code = searchParams.get('code');
          if (code) {
            console.log('[AuthStore] Trocando código PKCE por sessão:', code);
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (data?.session?.user) {
              console.log('[AuthStore] Sessão obtida via exchangeCodeForSession:', data.session.user.email);
              window.history.replaceState(null, '', window.location.pathname);
              const { profile, status } = await buildSession(data.session.user);
              set({ user: data.session.user, authProfile: profile, accessStatus: status, authLoading: false });
              return;
            } else if (error) {
              console.warn('[AuthStore] Erro ao trocar código PKCE via exchangeCodeForSession:', error.message);
            }
          }

          // Tentativa secundária com getSession()
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            window.history.replaceState(null, '', window.location.pathname);
            const { profile, status } = await buildSession(session.user);
            set({ user: session.user, authProfile: profile, accessStatus: status, authLoading: false });
            return;
          }
        } catch (err) {
          console.error('[AuthStore] Erro ao processar código PKCE:', err);
        }
      }

      // ── 3. Verificação padrão de sessão existente no localStorage ──
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { profile, status } = await buildSession(session.user);
          set({ user: session.user, authProfile: profile, accessStatus: status, authLoading: false });
          return;
        }
      } catch (err) {
        console.error('[AuthStore] Erro ao obter sessão atual:', err);
      }

      // Não autenticado
      set({ user: null, authProfile: null, accessStatus: 'unauthenticated', authLoading: false });
    };

    // Listener para eventos de autenticação futuros (ex: logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthStore] onAuthStateChange event:', event, '| user:', session?.user?.email ?? 'null');

      if (event === 'SIGNED_IN' && session?.user) {
        if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        const { profile, status } = await buildSession(session.user);
        set({ user: session.user, authProfile: profile, accessStatus: status, authLoading: false });
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, authProfile: null, accessStatus: 'unauthenticated', authLoading: false });
      }
    });

    // Executa a verificação inicial
    processAuth();

    return () => {
      subscription.unsubscribe();
    };
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    const { profile, status } = await buildSession(user);
    set({ authProfile: profile, accessStatus: status });
  },
}));
