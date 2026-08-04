// ============================================================
// HYBRID FORGE — App Store (Persistência com localStorage)
// ============================================================

import type { UserProfile, WeekPlan, WorkoutLog, AppState } from '../types';
import { generateWeekPlan } from '../engine/aiEngine';

const STORAGE_KEY = 'hybridforge_state';

function getDefaultState(): AppState {
  return {
    profile: null,
    weekPlan: null,
    logs: [],
    currentWeek: 1,
    onboardingComplete: false,
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    return JSON.parse(raw) as AppState;
  } catch {
    return getDefaultState();
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function saveProfileWithPlan(profile: UserProfile, weekPlan: WeekPlan): AppState {
  const state = loadState();
  const updatedState: AppState = {
    ...state,
    profile,
    weekPlan,
    onboardingComplete: true,
  };
  saveState(updatedState);
  return updatedState;
}

export function saveProfile(profile: UserProfile): AppState {
  const state = loadState();
  const updatedState: AppState = {
    ...state,
    profile,
    weekPlan: generateWeekPlan(profile, state.currentWeek),
    onboardingComplete: true,
  };
  saveState(updatedState);
  return updatedState;
}

export function logWorkout(log: WorkoutLog): void {
  const state = loadState();
  state.logs = [...state.logs.filter(l => l.id !== log.id), log];
  saveState(state);
}

export function getTodayWorkout(state: AppState): { dayKey: string; workout: import('../types').DayWorkout } | null {
  if (!state.weekPlan) return null;
  const dayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const today = new Date().getDay();
  const dayKey = dayNames[today];
  const workout = state.weekPlan.days[dayKey];
  if (!workout) return null;
  return { dayKey, workout };
}

export function getProgressStats(logs: WorkoutLog[]) {
  const completed = logs.filter(l => l.completed);
  
  const totalVolume = completed
    .filter(l => l.workout.type === 'musculacao')
    .reduce((sum, log) => {
      const w = log.workout as import('../types').StrengthWorkout;
      return sum + w.volume;
    }, 0);
  
  const totalKm = completed
    .filter(l => l.workout.type === 'corrida')
    .reduce((sum, log) => {
      const w = log.workout as import('../types').RunWorkout;
      return sum + w.distance;
    }, 0);
  
  // Streak calculation
  let currentStreak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const hasLog = completed.some(l => l.date.startsWith(dateStr));
    if (hasLog) currentStreak++;
    else if (i > 0) break;
  }
  
  // Weekly stats
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  
  const weeklyLogs = completed.filter(l => new Date(l.date) >= weekStart);
  const weeklyVolume = weeklyLogs
    .filter(l => l.workout.type === 'musculacao')
    .reduce((sum, log) => sum + ((log.workout as import('../types').StrengthWorkout).volume || 0), 0);
  
  const weeklyKm = weeklyLogs
    .filter(l => l.workout.type === 'corrida')
    .reduce((sum, log) => sum + ((log.workout as import('../types').RunWorkout).distance || 0), 0);
  
  return {
    totalWorkouts: completed.length,
    totalVolume,
    totalKm,
    currentStreak,
    weeklyWorkouts: weeklyLogs.length,
    weeklyVolume,
    weeklyKm,
  };
}

export function resetApp(): void {
  localStorage.removeItem(STORAGE_KEY);
}
