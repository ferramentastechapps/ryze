// ============================================================
// RYZE — Gamification Store (Zustand)
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GamificationState, Badge } from '../types';
import { BADGES } from '../data/badges';

export interface GamificationStore extends GamificationState {
  // Actions
  addXp: (amount: number, reason?: string) => { newLevel: boolean; newXp: number; level: number };
  checkAndAwardWorkout: (workoutType: string, isHybrid: boolean, totalVolume: number, rpe?: number) => {
    earnedXp: number;
    unlockedBadges: Badge[];
  };
  resetGamification: () => void;
}

const DEFAULT_GAMIFICATION: GamificationState = {
  xp: 0,
  level: 1,
  streak: 0,
  bestStreak: 0,
  lastWorkoutDate: null,
  unlockedBadges: [],
};

// Helper: calcula nível baseado no XP (100 XP por nível)
export function getLevelFromXp(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

// Helper: XP necessário para o próximo nível
export function getNextLevelXp(level: number): number {
  return level * 100;
}

// Helper: verifica se duas datas são do mesmo dia
function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// Helper: verifica se d1 foi no dia anterior a d2
function isYesterday(d1: Date, d2: Date): boolean {
  const yesterday = new Date(d2);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(d1, yesterday);
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_GAMIFICATION,

      addXp: (amount: number) => {
        const currentXp = get().xp;
        const oldLevel = get().level;
        const newXp = currentXp + amount;
        const newLevelCalc = getLevelFromXp(newXp);

        set({
          xp: newXp,
          level: newLevelCalc,
        });

        return {
          newLevel: newLevelCalc > oldLevel,
          newXp,
          level: newLevelCalc,
        };
      },

      checkAndAwardWorkout: (workoutType: string, isHybrid: boolean, totalVolume: number, rpe?: number) => {
        const state = get();
        const now = new Date();

        // 1. Atualiza Streak
        let newStreak = state.streak;
        let lastDate = state.lastWorkoutDate ? new Date(state.lastWorkoutDate) : null;

        if (!lastDate) {
          newStreak = 1;
        } else if (isSameDay(lastDate, now)) {
          // Já treinou hoje, mantém streak
        } else if (isYesterday(lastDate, now)) {
          newStreak += 1;
        } else {
          newStreak = 1; // Quebrou streak
        }

        const newBestStreak = Math.max(state.bestStreak, newStreak);
        const lastWorkoutDateIso = now.toISOString();

        // 2. Calcula XP ganho
        let baseEarnedXp = 100; // Base por treino
        if (isHybrid) baseEarnedXp += 50; // Bônus híbrido
        if (newStreak > 1) baseEarnedXp += Math.min(newStreak * 5, 50); // Bônus streak

        const currentXp = state.xp + baseEarnedXp;
        const currentLevel = getLevelFromXp(currentXp);

        // 3. Avalia conquistas (Badges)
        const unlockedSet = new Set(state.unlockedBadges);
        const newlyUnlocked: Badge[] = [];

        const checkBadge = (badgeId: string, condition: boolean) => {
          if (condition && !unlockedSet.has(badgeId)) {
            unlockedSet.add(badgeId);
            const found = BADGES.find(b => b.id === badgeId);
            if (found) newlyUnlocked.push({ ...found, unlockedAt: lastWorkoutDateIso });
          }
        };

        checkBadge('first_workout', true);
        checkBadge('streak_3', newStreak >= 3);
        checkBadge('streak_7', newStreak >= 7);
        checkBadge('streak_30', newStreak >= 30);
        checkBadge('volume_10k', totalVolume >= 10000);
        checkBadge('volume_50k', totalVolume >= 50000);
        checkBadge('level_5', currentLevel >= 5);
        checkBadge('level_10', currentLevel >= 10);
        checkBadge('hybrid_warrior', isHybrid);
        checkBadge('rpe_master', typeof rpe === 'number' && rpe > 0);
        checkBadge('early_bird', now.getHours() < 8);

        set({
          xp: currentXp,
          level: currentLevel,
          streak: newStreak,
          bestStreak: newBestStreak,
          lastWorkoutDate: lastWorkoutDateIso,
          unlockedBadges: Array.from(unlockedSet),
        });

        return {
          earnedXp: baseEarnedXp,
          unlockedBadges: newlyUnlocked,
        };
      },

      resetGamification: () => {
        set(DEFAULT_GAMIFICATION);
      },
    }),
    {
      name: 'ryze_gamification_state',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
