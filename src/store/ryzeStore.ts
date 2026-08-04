// ============================================================
// HYBRID FORGE — Zustand Store (estado global reativo)
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppState, UserProfile, WeekPlan, WorkoutLog } from '../types';
import { generateWeekPlan } from '../engine/aiEngine';

interface RyzeStore extends AppState {
  // Actions
  setProfile: (profile: UserProfile) => void;
  setProfileWithPlan: (profile: UserProfile, weekPlan: WeekPlan) => void;
  addLog: (log: WorkoutLog) => void;
  resetAll: () => void;
  refresh: () => void;
}

const DEFAULT_STATE: AppState = {
  profile: null,
  weekPlan: null,
  logs: [],
  currentWeek: 1,
  onboardingComplete: false,
};

// ─── Carregamento síncrono inicial (evita piscar no primeiro render) ────────
function getInitialState(): AppState {
  try {
    const raw = localStorage.getItem('hybridforge_state');
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    if (!parsed) return DEFAULT_STATE;

    // Se estiver no formato Zustand persist { state: { ... } }
    if (parsed.state) {
      return {
        profile: parsed.state.profile ?? null,
        weekPlan: parsed.state.weekPlan ?? null,
        logs: parsed.state.logs ?? [],
        currentWeek: parsed.state.currentWeek ?? 1,
        onboardingComplete: parsed.state.onboardingComplete ?? false,
      };
    }

    // Se estiver no formato direto (appStore legado)
    return {
      profile: parsed.profile ?? null,
      weekPlan: parsed.weekPlan ?? null,
      logs: parsed.logs ?? [],
      currentWeek: parsed.currentWeek ?? 1,
      onboardingComplete: parsed.onboardingComplete ?? false,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export const useRyzeStore = create<RyzeStore>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      setProfile: (profile: UserProfile) => {
        const currentWeek = get().currentWeek || 1;
        const weekPlan = generateWeekPlan(profile, currentWeek);
        set({
          profile,
          weekPlan,
          onboardingComplete: true,
        });
      },

      setProfileWithPlan: (profile: UserProfile, weekPlan: WeekPlan) => {
        set({
          profile,
          weekPlan,
          onboardingComplete: true,
        });
      },

      addLog: (log: WorkoutLog) => {
        set(state => ({
          logs: [...state.logs.filter(l => l.id !== log.id), log],
        }));
      },

      resetAll: () => {
        set(DEFAULT_STATE);
      },

      refresh: () => {
        // No-op: Zustand é reativo, subscriptions atualizam automaticamente
      },
    }),
    {
      name: 'hybridforge_state',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ─── Seletores utilitários ────────────────────────────────────────────────────
export const selectState = (s: RyzeStore): AppState => ({
  profile: s.profile,
  weekPlan: s.weekPlan,
  logs: s.logs,
  currentWeek: s.currentWeek,
  onboardingComplete: s.onboardingComplete,
});
