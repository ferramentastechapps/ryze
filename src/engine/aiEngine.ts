// ============================================================
// HYBRID FORGE — AI Engine (Motor de Geração de Treinos)
// ============================================================

import type {
  UserProfile,
  WeekPlan,
  DayWorkout,
  StrengthWorkout,
  RunWorkout,
  RestDay,
  Exercise,
  MuscleGroup,
  RunInterval,
} from '../types';

// ─── Exercício Database ────────────────────────────────────────────────────

const EXERCISE_DB: Record<string, Exercise[]> = {
  peito: [
    { id: 'supino_reto', name: 'Supino Reto com Barra', muscleGroups: ['peito', 'triceps', 'ombros'], sets: 4, reps: '8-12', rest: 90, technique: 'Desça controlado em 3s, suba explosivo' },
    { id: 'supino_inclinado', name: 'Supino Inclinado com Halteres', muscleGroups: ['peito', 'ombros'], sets: 3, reps: '10-15', rest: 75, technique: 'Foco na porção superior do peitoral' },
    { id: 'crossover', name: 'Crossover Cabo', muscleGroups: ['peito'], sets: 3, reps: '12-15', rest: 60, technique: 'Adução completa, esprema no final' },
    { id: 'flexao', name: 'Flexão de Braço', muscleGroups: ['peito', 'triceps'], sets: 3, reps: '15-20', rest: 60 },
    { id: 'peck_deck', name: 'Peck Deck / Voador', muscleGroups: ['peito'], sets: 3, reps: '12-15', rest: 60, technique: 'Isolamento completo do peitoral' },
    { id: 'mergulho', name: 'Mergulho em Paralelas (Peito)', muscleGroups: ['peito', 'triceps'], sets: 3, reps: '10-12', rest: 90, technique: 'Incline o tronco para frente para ativar mais o peitoral' },
  ],
  costas: [
    { id: 'barra_fixa', name: 'Barra Fixa (Pull-up)', muscleGroups: ['costas', 'biceps'], sets: 4, reps: '6-10', rest: 90, technique: 'Puxada completa, chegue ao queixo' },
    { id: 'remada_curvada', name: 'Remada Curvada com Barra', muscleGroups: ['costas', 'biceps'], sets: 4, reps: '8-12', rest: 90, technique: 'Cotovelos próximos ao corpo, escápula retrai' },
    { id: 'puxada_frontal', name: 'Puxada Frontal no Cabo', muscleGroups: ['costas', 'biceps'], sets: 3, reps: '10-15', rest: 75, technique: 'Leve inclinação para trás, puxe até o queixo' },
    { id: 'remada_maquina', name: 'Remada na Máquina', muscleGroups: ['costas'], sets: 3, reps: '12-15', rest: 60 },
    { id: 'remada_unilateral', name: 'Remada Unilateral com Halter', muscleGroups: ['costas', 'biceps'], sets: 3, reps: '10-12', rest: 75, technique: 'Joelho e mão de apoio no banco, puxe o cotovelo alto' },
    { id: 'levantamento_terra', name: 'Levantamento Terra', muscleGroups: ['costas', 'pernas', 'gluteos'], sets: 4, reps: '5-8', rest: 120, technique: 'Coluna neutra, empurre o chão, não puxe a barra' },
  ],
  pernas: [
    { id: 'agachamento', name: 'Agachamento Livre', muscleGroups: ['pernas', 'gluteos'], sets: 4, reps: '8-12', rest: 120, technique: 'Desça até a paralela ou abaixo, joelhos na linha dos pés' },
    { id: 'leg_press', name: 'Leg Press 45°', muscleGroups: ['pernas', 'gluteos'], sets: 4, reps: '10-15', rest: 90, technique: 'Amplitude completa sem travar os joelhos' },
    { id: 'cadeira_extensora', name: 'Cadeira Extensora', muscleGroups: ['pernas'], sets: 3, reps: '12-15', rest: 60, technique: 'Extensão completa, segure 1s no topo' },
    { id: 'mesa_flexora', name: 'Mesa Flexora', muscleGroups: ['pernas'], sets: 3, reps: '12-15', rest: 60 },
    { id: 'stiff', name: 'Stiff com Barra', muscleGroups: ['pernas', 'gluteos'], sets: 3, reps: '10-12', rest: 90, technique: 'Sinta o alongamento dos isquiotibiais' },
    { id: 'afundo', name: 'Avanço / Afundo', muscleGroups: ['pernas', 'gluteos'], sets: 3, reps: '12 cada', rest: 75 },
    { id: 'panturrilha', name: 'Panturrilha em Pé', muscleGroups: ['pernas'], sets: 4, reps: '15-20', rest: 60, technique: 'Amplitude máxima, segure 1s no topo' },
  ],
  ombros: [
    { id: 'desenvolvimento', name: 'Desenvolvimento com Halteres', muscleGroups: ['ombros', 'triceps'], sets: 4, reps: '10-12', rest: 90, technique: 'Evite hiper-extensão lombar' },
    { id: 'elevacao_lateral', name: 'Elevação Lateral', muscleGroups: ['ombros'], sets: 4, reps: '12-15', rest: 60, technique: 'Levante até a altura dos ombros, polegar ligeiramente para baixo' },
    { id: 'elevacao_frontal', name: 'Elevação Frontal', muscleGroups: ['ombros'], sets: 3, reps: '12-15', rest: 60 },
    { id: 'remada_alta', name: 'Remada Alta com Barra', muscleGroups: ['ombros', 'trapezio'], sets: 3, reps: '12-15', rest: 75 },
    { id: 'face_pull', name: 'Face Pull no Cabo', muscleGroups: ['ombros'], sets: 3, reps: '15-20', rest: 60, technique: 'Essencial para saúde do manguito rotador' },
  ],
  biceps: [
    { id: 'rosca_direta', name: 'Rosca Direta com Barra', muscleGroups: ['biceps'], sets: 3, reps: '10-12', rest: 75 },
    { id: 'rosca_alternada', name: 'Rosca Alternada com Halteres', muscleGroups: ['biceps'], sets: 3, reps: '10-12', rest: 75, technique: 'Supinação no final do movimento' },
    { id: 'rosca_martelo', name: 'Rosca Martelo', muscleGroups: ['biceps'], sets: 3, reps: '12-15', rest: 60 },
    { id: 'rosca_scott', name: 'Rosca Scott', muscleGroups: ['biceps'], sets: 3, reps: '10-12', rest: 75, technique: 'Isolamento máximo, evite usar o ombro' },
  ],
  triceps: [
    { id: 'testa', name: 'Extensão Testa com Barra (Skullcrusher)', muscleGroups: ['triceps'], sets: 3, reps: '10-12', rest: 75 },
    { id: 'triceps_cabo', name: 'Pushdown no Cabo', muscleGroups: ['triceps'], sets: 3, reps: '12-15', rest: 60, technique: 'Cotovelhos fixos ao lado do corpo' },
    { id: 'mergulho_banco', name: 'Mergulho no Banco', muscleGroups: ['triceps'], sets: 3, reps: '15-20', rest: 60 },
    { id: 'frances', name: 'Francês com Haltere', muscleGroups: ['triceps'], sets: 3, reps: '12-15', rest: 75 },
  ],
  gluteos: [
    { id: 'hip_thrust', name: 'Hip Thrust com Barra', muscleGroups: ['gluteos', 'pernas'], sets: 4, reps: '10-15', rest: 90, technique: 'Extensão quadril completa, esprema no topo' },
    { id: 'extensao_quadril', name: 'Extensão de Quadril no Cabo', muscleGroups: ['gluteos'], sets: 3, reps: '15-20', rest: 60 },
    { id: 'agachamento_sumô', name: 'Agachamento Sumô', muscleGroups: ['gluteos', 'pernas'], sets: 4, reps: '12-15', rest: 90 },
    { id: 'cadeira_abdutora', name: 'Cadeira Abdutora', muscleGroups: ['gluteos'], sets: 3, reps: '15-20', rest: 60 },
  ],
  core: [
    { id: 'prancha', name: 'Prancha Isométrica', muscleGroups: ['core', 'abdomen'], sets: 3, reps: '45-60s', rest: 60 },
    { id: 'abdominal_infra', name: 'Elevação de Pernas', muscleGroups: ['abdomen', 'core'], sets: 3, reps: '15-20', rest: 60 },
    { id: 'crunch', name: 'Crunch Abdominal', muscleGroups: ['abdomen'], sets: 3, reps: '20-25', rest: 45 },
    { id: 'russian_twist', name: 'Rotação Russa', muscleGroups: ['abdomen', 'core'], sets: 3, reps: '20 cada lado', rest: 60 },
    { id: 'dead_bug', name: 'Dead Bug', muscleGroups: ['core'], sets: 3, reps: '10 cada lado', rest: 60, technique: 'Lombar colada no chão durante todo o movimento' },
  ],
};

// ─── Helper Functions ──────────────────────────────────────────────────────

function selectExercises(muscleGroups: MuscleGroup[], count: number, level: UserProfile['experienceLevel']): Exercise[] {
  const exercises: Exercise[] = [];
  const exercisePool: Exercise[] = muscleGroups.flatMap(mg => EXERCISE_DB[mg] || []);
  
  // Remove duplicates
  const uniquePool = exercisePool.filter((ex, idx, arr) => arr.findIndex(e => e.id === ex.id) === idx);
  
  // Prioritize compound exercises for beginners
  let sorted = [...uniquePool];
  if (level === 'iniciante') {
    sorted = sorted.sort((a, b) => (b.muscleGroups.length - a.muscleGroups.length));
  }
  
  // Select up to `count` exercises
  for (let i = 0; i < Math.min(count, sorted.length); i++) {
    const ex = { ...sorted[i] };
    // Adjust sets by level
    if (level === 'iniciante') ex.sets = Math.max(2, ex.sets - 1);
    if (level === 'avancado') ex.sets = ex.sets + 1;
    exercises.push(ex);
  }
  
  return exercises;
}

function calculateVolume(exercises: Exercise[]): number {
  return exercises.reduce((total, ex) => {
    const repsNum = parseInt(ex.reps.split('-')[0]) || 10;
    return total + (ex.sets * repsNum);
  }, 0);
}

function buildStrengthWorkout(
  title: string,
  description: string,
  muscles: MuscleGroup[],
  profile: UserProfile,
  intensity: 'baixa' | 'media' | 'alta'
): StrengthWorkout {
  const exerciseCount = profile.experienceLevel === 'iniciante' ? 4 : profile.experienceLevel === 'intermediario' ? 5 : 6;
  const exercises = selectExercises(muscles, exerciseCount, profile.experienceLevel);
  
  // Always add 1-2 core exercises at the end
  const coreEx = selectExercises(['core'], 1, profile.experienceLevel);
  exercises.push(...coreEx);

  return {
    type: 'musculacao',
    title,
    description,
    focus: muscles,
    exercises,
    duration: profile.sessionDuration,
    intensity,
    volume: calculateVolume(exercises),
  };
}

function buildRunWorkout(
  title: string,
  description: string,
  runType: RunWorkout['runType'],
  distance: number,
  profile: UserProfile
): RunWorkout {
  const intensity: 'baixa' | 'media' | 'alta' = 
    runType === 'leve' ? 'baixa' :
    runType === 'longao' ? 'media' : 'alta';
  
  // Adjust distance by runner level
  const multiplier = profile.runnerLevel === 'iniciante' ? 0.6 :
    profile.runnerLevel === 'intermediario' ? 0.85 : 1.0;
  
  const adjustedDistance = Math.round(distance * multiplier * 10) / 10;
  const estimatedPace = profile.runnerLevel === 'iniciante' ? '7:30/km' :
    profile.runnerLevel === 'intermediario' ? '6:00/km' : '5:00/km';
  
  const duration = Math.round((adjustedDistance / (60 / parseInt(estimatedPace))) * 60);

  let intervals: RunInterval[] | undefined;
  let warmup: string | undefined;
  let cooldown: string | undefined;

  if (runType === 'intervalado') {
    intervals = profile.runnerLevel === 'iniciante'
      ? [{ effort: '200m', pace: '6:30/km', recovery: '200m caminhada', repetitions: 4 }]
      : profile.runnerLevel === 'intermediario'
      ? [{ effort: '400m', pace: '5:15/km', recovery: '200m trote leve', repetitions: 5 }]
      : [{ effort: '800m', pace: '4:30/km', recovery: '400m trote', repetitions: 4 }];
    warmup = '10 min trote leve (Zona 2)';
    cooldown = '5 min caminhada + alongamento';
  } else if (runType === 'tempo') {
    warmup = '10 min aquecimento progressivo';
    cooldown = '10 min desaceleração';
  } else {
    warmup = '5 min caminhada';
    cooldown = '5 min caminhada';
  }

  return {
    type: 'corrida',
    runType,
    title,
    description,
    distance: adjustedDistance,
    duration,
    paceTarget: estimatedPace,
    heartRateZone: intensity === 'baixa' ? 'Zona 2 (65-75% FCmax)' : 
      intensity === 'media' ? 'Zona 3-4 (75-88% FCmax)' : 'Zona 4-5 (88-95% FCmax)',
    intervals,
    warmup,
    cooldown,
    intensity,
  };
}

function buildRestDay(active: boolean): RestDay {
  if (active) {
    return {
      type: 'ativo',
      title: 'Recuperação Ativa',
      description: 'Atividade leve para acelerar a recuperação sem stressar o sistema nervoso central.',
      activities: ['20-30 min caminhada leve', 'Yoga ou alongamento 20 min', 'Foam roller nos grupos treinados', 'Natação leve (opcional)'],
    };
  }
  return {
    type: 'descanso',
    title: 'Descanso Completo',
    description: 'O crescimento muscular acontece no descanso. Priorize sono (7-9h) e nutrição.',
    activities: ['Dormir 7-9 horas', 'Hidratação adequada', 'Refeições ricas em proteína (1.8-2.2g/kg)', 'Caminhada leve se desejar'],
  };
}

// ─── Plano por Objetivo ────────────────────────────────────────────────────

export function generateWeekPlan(profile: UserProfile, weekNumber: number = 1): WeekPlan {
  const days = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  const dayWorkouts: Record<string, DayWorkout> = {};
  
  // Determine structure based on goal and availability
  const { primaryGoal, daysPerWeek, runnerLevel } = profile;
  const hasRunning = runnerLevel !== 'nenhum';
  
  let schedule: string[] = [];
  
  if (daysPerWeek === 3) {
    schedule = generateSchedule3Days(primaryGoal, hasRunning);
  } else if (daysPerWeek === 4) {
    schedule = generateSchedule4Days(primaryGoal, hasRunning);
  } else if (daysPerWeek === 5) {
    schedule = generateSchedule5Days(primaryGoal, hasRunning);
  } else {
    schedule = generateSchedule6Days(primaryGoal, hasRunning);
  }
  
  // Assign workouts to days
  days.forEach((day, index) => {
    const workoutType = schedule[index] || 'rest';
    dayWorkouts[day] = assignWorkout(day, workoutType, profile, weekNumber);
  });
  
  const allExercises = Object.values(dayWorkouts)
    .filter((d): d is StrengthWorkout => d.type === 'musculacao')
    .flatMap(d => d.exercises);
  
  const totalVolume = allExercises.reduce((sum, ex) => {
    const reps = parseInt(ex.reps.split('-')[0]) || 10;
    return sum + ex.sets * reps;
  }, 0);
  
  const totalKm = Object.values(dayWorkouts)
    .filter((d): d is RunWorkout => d.type === 'corrida')
    .reduce((sum, d) => sum + d.distance, 0);
  
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - now.getDay() + 1);

  return {
    weekNumber,
    startDate: startDate.toISOString(),
    days: dayWorkouts,
    totalVolume,
    totalKm,
    focusMuscles: getFocusMuscles(primaryGoal),
  };
}

function generateSchedule3Days(goal: string, hasRun: boolean): string[] {
  // [seg, ter, qua, qui, sex, sab, dom]
  if (!hasRun) return ['upper', 'rest', 'lower', 'rest', 'full', 'rest_active', 'rest'];
  if (goal === 'hipertrofia') return ['upper', 'run_leve', 'lower', 'rest', 'full', 'rest_active', 'rest'];
  if (goal === 'performance') return ['upper', 'run_intervalado', 'lower', 'rest_active', 'run_longao', 'rest', 'rest'];
  return ['upper', 'run_leve', 'lower', 'rest', 'run_intervalado', 'rest_active', 'rest'];
}

function generateSchedule4Days(goal: string, hasRun: boolean): string[] {
  if (!hasRun) return ['push', 'pull', 'rest', 'legs', 'rest', 'full', 'rest'];
  if (goal === 'hipertrofia') return ['push', 'run_leve', 'pull', 'legs', 'rest', 'run_longao', 'rest'];
  if (goal === 'performance') return ['upper', 'run_intervalado', 'lower', 'rest', 'run_tempo', 'upper', 'rest'];
  return ['push', 'run_leve', 'pull_legs', 'rest', 'run_intervalado', 'full', 'rest'];
}

function generateSchedule5Days(goal: string, hasRun: boolean): string[] {
  if (!hasRun) return ['chest_shoulders', 'back_biceps', 'legs', 'push', 'pull', 'rest_active', 'rest'];
  if (goal === 'hipertrofia') return ['chest_shoulders', 'run_leve', 'back_biceps', 'legs', 'run_leve', 'shoulders_arms', 'rest'];
  if (goal === 'performance') return ['upper', 'run_intervalado', 'lower', 'run_leve', 'upper', 'run_longao', 'rest'];
  return ['chest_shoulders', 'run_intervalado', 'back_biceps', 'legs', 'run_leve', 'full', 'rest'];
}

function generateSchedule6Days(goal: string, hasRun: boolean): string[] {
  if (goal === 'hipertrofia') return ['chest_shoulders', 'back_biceps', 'legs', 'run_leve', 'push', 'pull_legs', 'rest'];
  if (goal === 'performance') return ['upper', 'run_intervalado', 'lower', 'run_leve', 'upper', 'run_longao', 'rest'];
  return ['chest_shoulders', 'run_intervalado', 'back_biceps', 'legs', 'run_leve', 'full', 'rest'];
}

function assignWorkout(day: string, type: string, profile: UserProfile, week: number): DayWorkout {
  const level = profile.experienceLevel;
  
  switch(type) {
    case 'upper':
      return buildStrengthWorkout(
        'Membros Superiores',
        'Treino completo de peito, costas, ombros e braços para máxima hipertrofia do upper body.',
        ['peito', 'costas', 'ombros'],
        profile, 'alta'
      );
    case 'lower':
      return buildStrengthWorkout(
        'Membros Inferiores',
        'Treino de pernas e glúteos com foco em força e volume para desenvolvimento da musculatura inferior.',
        ['pernas', 'gluteos'],
        profile, 'alta'
      );
    case 'push':
      return buildStrengthWorkout(
        'Push — Empurrar',
        'Peito, ombros e tríceps em um treino sinérgico de alta eficiência.',
        ['peito', 'ombros', 'triceps'],
        profile, 'alta'
      );
    case 'pull':
      return buildStrengthWorkout(
        'Pull — Puxar',
        'Costas e bíceps com foco em amplitude, espessura e definição.',
        ['costas', 'biceps'],
        profile, 'alta'
      );
    case 'legs':
      return buildStrengthWorkout(
        'Legs Day — Pernas & Glúteos',
        'O treino mais importante da semana. Quadríceps, isquiotibiais e glúteos em máximo volume.',
        ['pernas', 'gluteos'],
        profile, 'alta'
      );
    case 'pull_legs':
      return buildStrengthWorkout(
        'Pull + Pernas',
        'Costas, bíceps e trabalho complementar de pernas num treino eficiente.',
        ['costas', 'pernas'],
        profile, 'media'
      );
    case 'chest_shoulders':
      return buildStrengthWorkout(
        'Peito & Ombros',
        'Upper anterior completo — peito e ombros com alta densidade de volume.',
        ['peito', 'ombros'],
        profile, 'alta'
      );
    case 'back_biceps':
      return buildStrengthWorkout(
        'Costas & Bíceps',
        'Espessura e largura das costas com trabalho de bíceps. A combinação clássica.',
        ['costas', 'biceps'],
        profile, 'alta'
      );
    case 'shoulders_arms':
      return buildStrengthWorkout(
        'Ombros & Braços',
        'Deltoides, bíceps e tríceps — foco em estética e definição dos braços.',
        ['ombros', 'biceps', 'triceps'],
        profile, 'media'
      );
    case 'full':
    case 'full_body':
      return buildStrengthWorkout(
        'Full Body',
        'Treino completo do corpo com exercícios compostos multiarticulares para máxima eficiência.',
        ['peito', 'costas', 'pernas', 'ombros'],
        profile, 'media'
      );
    case 'run_leve':
      return buildRunWorkout(
        'Corrida Leve — Zona 2',
        'Corrida regenerativa em baixa intensidade. Constrói base aeróbia e acelera a recuperação muscular.',
        'leve',
        6,
        profile
      );
    case 'run_intervalado':
      return buildRunWorkout(
        'Treino Intervalado',
        'Série de tiros de alta intensidade alternados com recuperação. Aumenta VO2max e queima de gordura.',
        'intervalado',
        8,
        profile
      );
    case 'run_longao':
      return buildRunWorkout(
        'Longão — Endurance',
        'Corrida longa em ritmo confortável. Desenvolve resistência aeróbia, fortalece tendões e queima gordura.',
        'longao',
        12,
        profile
      );
    case 'run_tempo':
      return buildRunWorkout(
        'Tempo Run',
        'Corrida em ritmo limiar anaeróbico — desafiador mas sustentável. Melhora significativamente o pace.',
        'tempo',
        8,
        profile
      );
    case 'rest_active':
      return buildRestDay(true);
    case 'rest':
    default:
      return buildRestDay(false);
  }
}

function getFocusMuscles(goal: string): MuscleGroup[] {
  switch(goal) {
    case 'hipertrofia': return ['peito', 'costas', 'pernas', 'ombros'];
    case 'perda_gordura': return ['full_body', 'core'];
    case 'performance': return ['pernas', 'core', 'costas'];
    default: return ['peito', 'costas', 'pernas', 'ombros', 'gluteos'];
  }
}

// ─── Análise de Perfil ─────────────────────────────────────────────────────

export interface ProfileAnalysis {
  bodyType: string;
  recommendations: string[];
  warnings: string[];
  focusAreas: string[];
  estimatedTimeToGoal: string;
  weeklyLoad: {
    strengthDays: number;
    runDays: number;
    restDays: number;
  };
}

export function analyzeProfile(profile: UserProfile): ProfileAnalysis {
  const bmi = profile.weight / Math.pow(profile.height / 100, 2);
  const bodyType = bmi < 18.5 ? 'Ectomorfo (abaixo do peso ideal)' :
    bmi < 25 ? 'Peso saudável' :
    bmi < 30 ? 'Sobrepeso leve' : 'Sobrepeso moderado/alto';
  
  const recommendations: string[] = [];
  const warnings: string[] = [];
  
  // Nutrition recs
  if (profile.primaryGoal === 'hipertrofia') {
    recommendations.push('Consuma 2.0-2.4g de proteína por kg de peso corporal diariamente');
    recommendations.push('Mantenha superávit calórico de 200-300 kcal/dia para ganho limpo');
  } else if (profile.primaryGoal === 'perda_gordura') {
    recommendations.push('Déficit calórico moderado de 300-500 kcal/dia');
    recommendations.push('Proteína alta: 2.2-2.5g/kg para preservar massa muscular');
  }
  
  recommendations.push('Priorize 7-9 horas de sono para otimizar hormônios anabólicos');
  recommendations.push('Hidrate-se: mínimo 35ml por kg de peso corporal ao dia');
  
  if (profile.daysPerWeek < 4 && profile.primaryGoal === 'hipertrofia') {
    warnings.push('Com menos de 4 dias/semana, o progresso em hipertrofia será mais lento. Considere aumentar a frequência.');
  }
  
  if (profile.runnerLevel !== 'nenhum' && profile.primaryGoal === 'hipertrofia') {
    warnings.push('Atenção ao efeito de interferência: evite corrida intensa antes de treinar pernas pesadas.');
    recommendations.push('Se possível, separe corrida e musculação por 6+ horas para minimizar interferência.');
  }
  
  if (profile.experienceLevel === 'iniciante') {
    recommendations.push('Foque na técnica antes de aumentar cargas. A progressão virá naturalmente.');
  }
  
  const strengthDays = profile.daysPerWeek - (profile.runnerLevel !== 'nenhum' ? Math.min(2, Math.floor(profile.daysPerWeek / 3)) : 0);
  const runDays = profile.daysPerWeek - strengthDays;
  const restDays = 7 - profile.daysPerWeek;
  
  const estimatedTimeToGoal = profile.primaryGoal === 'hipertrofia' ? '4-6 meses para resultados significativos' :
    profile.primaryGoal === 'perda_gordura' ? '8-16 semanas para resultado sólido' :
    '3-4 meses para evolução notável na performance';
  
  return {
    bodyType,
    recommendations,
    warnings,
    focusAreas: getFocusMuscles(profile.primaryGoal).map(mg => 
      mg === 'peito' ? 'Peitoral' : mg === 'costas' ? 'Costas' : 
      mg === 'pernas' ? 'Pernas' : mg === 'ombros' ? 'Ombros' :
      mg === 'gluteos' ? 'Glúteos' : 'Core'
    ),
    estimatedTimeToGoal,
    weeklyLoad: { strengthDays, runDays, restDays },
  };
}
