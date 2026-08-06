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
  reps: string; // ex: "8-12" ou "3x10" ou "15-12-10-8"
  rest: number; // segundos
  weight?: number; // kg sugerido ou atual
  notes?: string;
  technique?: string;
  videoUrl?: string;
  completed?: boolean;
  loggedSets?: LoggedSet[];
  blockName?: string; // ex: "BLOCO 01 - AQUECIMENTO", "BLOCO 02 - PIRÂMIDE", "BLOCO 06 - BI-SET"
  blockType?: 'aquecimento' | 'piramide' | 'meta' | 'dropset' | 'biset' | 'tabata' | 'generico';
  pairedExerciseName?: string; // Para Bi-Set (ex: "Panturrilha em Pé")
}

export interface LoggedSet {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
  timestamp: string;
  rpe?: number; // Escala 6-10 de Esforço Percebido
  oneRM?: number; // 1RM calculado (Epley formula: weight * (1 + reps/30))
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  category: 'streak' | 'volume' | 'workout' | 'level' | 'special';
  unlockedAt?: string;
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  bestStreak: number;
  lastWorkoutDate: string | null;
  unlockedBadges: string[]; // Badge IDs
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
  letter?: 'A' | 'B' | 'C' | 'D' | 'E'; // Identificador do Treino A, B, C...
}

export interface RunWorkout {
  type: 'corrida';
  runType: RunType;
  title: string;
  description: string;
  distance: number; // km
  duration: number; // minutos estimado
  paceTarget?: string;
  heartRateZone?: string; // ex: "Z3 (70-79% FCmáx)"
  fcMaxTarget?: string; // ex: "128 - 145 bpm"
  intervals?: RunInterval[];
  warmup?: string;
  cooldown?: string;
  intensity: 'baixa' | 'media' | 'alta';
}

export interface HybridWorkout {
  type: 'hibrido';
  title: string;
  description: string;
  strength: StrengthWorkout;
  run: RunWorkout;
}

export interface RunInterval {
  effort: string; // ex: "400m" ou "30seg"
  pace: string;
  recovery: string; // ex: "90seg caminhada Z1"
  repetitions: number;
}

export interface RestDay {
  type: 'descanso' | 'ativo';
  title: string;
  description: string;
  activities?: string[];
}

export type DayWorkout = StrengthWorkout | RunWorkout | HybridWorkout | RestDay;

export interface WeekPlan {
  weekNumber: number;
  startDate: string;
  days: {
    [key: string]: DayWorkout; // "segunda", "terca", etc.
  };
  totalVolume: number;
  totalKm: number;
  focusMuscles: MuscleGroup[];
  fcMaxCalculated?: number; // FCmáx estimada (Tanaka)
  fcZones?: {
    z1: string; // 50-59%
    z2: string; // 60-69%
    z3: string; // 70-79%
    z4: string; // 80-89%
    z5: string; // 90-95%
  };
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
  xpEarned?: number;
  rpeAverage?: number;
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
  gamification?: GamificationState;
}

