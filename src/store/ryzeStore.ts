// ============================================================
// HYBRID FORGE — Zustand Store (estado global reativo)
// Substitui o padrão manual de loadState() / onUpdate()
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

export const useRyzeStore = create<RyzeStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

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
      name: 'hybridforge_state', // Mesma chave do localStorage anterior = sem migração!
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
