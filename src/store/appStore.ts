// ============================================================
// HYBRID FORGE — App Store (Persistência com localStorage)
// ============================================================

import type { UserProfile, WeekPlan, WorkoutLog, AppState, StrengthWorkout } from '../types';
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
      const w = log.workout as StrengthWorkout;
      return sum + w.volume;
    }, 0);

  const totalKm = completed
    .filter(l => l.workout.type === 'corrida')
    .reduce((sum, log) => {
      const w = log.workout as import('../types').RunWorkout;
      return sum + w.distance;
    }, 0);

  // ─── Streak calculation (corrigido: dias de descanso não quebram a streak) ──
  let currentStreak = 0;
  const today = new Date();
  const DAY_NAMES = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const state = loadState();

  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayKey = DAY_NAMES[d.getDay()];

    const hasLog = completed.some(l => l.date.startsWith(dateStr));

    if (hasLog) {
      currentStreak++;
    } else {
      // Verificar se era dia de descanso no plano do usuário
      const dayPlan = state.weekPlan?.days[dayKey];
      const isRestDay = !dayPlan || dayPlan.type === 'descanso' || dayPlan.type === 'ativo';

      if (i === 0) {
        // Hoje sem treino ainda: não contar, mas não quebrar
        continue;
      }

      if (!isRestDay) break; // Era dia de treino e não treinou → quebra streak
      // Era dia de descanso → continua verificando dias anteriores sem incrementar
    }
  }

  // Weekly stats
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);

  const weeklyLogs = completed.filter(l => new Date(l.date) >= weekStart);
  const weeklyVolume = weeklyLogs
    .filter(l => l.workout.type === 'musculacao')
    .reduce((sum, log) => sum + ((log.workout as StrengthWorkout).volume || 0), 0);

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

// ─── Progressive Overload: buscar última sessão de um exercício ────────────
export function getLastExerciseData(
  logs: WorkoutLog[],
  exerciseId: string
): { weight: number; reps: string; date: string } | null {
  const completed = logs
    .filter(l => l.completed && l.workout.type === 'musculacao')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const log of completed) {
    const workout = log.workout as StrengthWorkout;
    const exercise = workout.exercises?.find(e => e.id === exerciseId);
    if (!exercise) continue;

    // Prioridade: loggedSets (dado real gravado pelo usuário)
    if (exercise.loggedSets && exercise.loggedSets.length > 0) {
      const lastSet = exercise.loggedSets[exercise.loggedSets.length - 1];
      return { weight: lastSet.weight, reps: String(lastSet.reps), date: log.date };
    }
    // Fallback: peso sugerido no plano
    if (exercise.weight) {
      return { weight: exercise.weight, reps: exercise.reps, date: log.date };
    }
  }

  return null;
}

export function resetApp(): void {
  localStorage.removeItem(STORAGE_KEY);
}
