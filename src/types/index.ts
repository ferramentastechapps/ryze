// ============================================================
// HYBRID FORGE — Types
// ============================================================

export type Sex = 'masculino' | 'feminino';
export type ExperienceLevel = 'iniciante' | 'intermediario' | 'avancado';
export type PrimaryGoal = 'hipertrofia' | 'perda_gordura' | 'performance' | 'equilibrio';
export type RunnerLevel = 'nenhum' | 'iniciante' | 'intermediario' | 'avancado';
export type WorkoutType = 'musculacao' | 'corrida' | 'descanso' | 'ativo';
export type RunType = 'leve' | 'intervalado' | 'longao' | 'tempo';
export type MuscleGroup =
  | 'peito'
  | 'costas'
  | 'ombros'
  | 'biceps'
  | 'triceps'
  | 'pernas'
  | 'gluteos'
  | 'abdomen'
  | 'core'
  | 'trapezio'
  | 'full_body';

export interface UserProfile {
  // Dados Pessoais
  name: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  sex: Sex;

  // Experiência
  experienceLevel: ExperienceLevel;
  injuries: string[];
  hasGymAccess: boolean;
  equipment: string[];

  // Objetivos
  primaryGoal: PrimaryGoal;
  targetWeight?: number;
  estheticGoal: string; // ex: "corpo equilibrado", "mais volume no upper"

  // Disponibilidade
  daysPerWeek: number; // 3-6
  sessionDuration: number; // minutos
  preferredTime: 'manha' | 'tarde' | 'noite';

  // Corrida
  runnerLevel: RunnerLevel;
  currentPace?: string; // ex: "6:30/km"
  weeklyKm?: number;
  runGoal?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  sets: number;
  reps: string; // ex: "8-12" ou "3x10"
  rest: number; // segundos
  weight?: number; // kg sugerido ou atual
  notes?: string;
  technique?: string;
  videoUrl?: string;
  completed?: boolean;
  loggedSets?: LoggedSet[];
}

export interface LoggedSet {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
  timestamp: string;
}

export interface StrengthWorkout {
  type: 'musculacao';
  focus: MuscleGroup[];
  title: string;
  description: string;
  duration: number; // minutos
  exercises: Exercise[];
  intensity: 'baixa' | 'media' | 'alta';
  volume: number; // total de séries
}

export interface RunWorkout {
  type: 'corrida';
  runType: RunType;
  title: string;
  description: string;
  distance: number; // km
  duration: number; // minutos estimado
  paceTarget?: string;
  heartRateZone?: string;
  intervals?: RunInterval[];
  warmup?: string;
  cooldown?: string;
  intensity: 'baixa' | 'media' | 'alta';
}

export interface RunInterval {
  effort: string; // ex: "400m" ou "3min"
  pace: string;
  recovery: string;
  repetitions: number;
}

export interface RestDay {
  type: 'descanso' | 'ativo';
  title: string;
  description: string;
  activities?: string[];
}

export type DayWorkout = StrengthWorkout | RunWorkout | RestDay;

export interface WeekPlan {
  weekNumber: number;
  startDate: string;
  days: {
    [key: string]: DayWorkout; // "segunda", "terca", etc.
  };
  totalVolume: number;
  totalKm: number;
  focusMuscles: MuscleGroup[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  dayOfWeek: string;
  workout: DayWorkout;
  completed: boolean;
  duration?: number; // minutos reais
  notes?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
}

export interface ProgressStats {
  totalWorkouts: number;
  totalVolume: number; // kg levantados
  totalKm: number;
  currentStreak: number;
  bestStreak: number;
  weeklyWorkouts: number;
  weeklyVolume: number;
  weeklyKm: number;
  personalRecords: PersonalRecord[];
}

export interface PersonalRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
}

export interface AppState {
  profile: UserProfile | null;
  weekPlan: WeekPlan | null;
  logs: WorkoutLog[];
  currentWeek: number;
  onboardingComplete: boolean;
}
