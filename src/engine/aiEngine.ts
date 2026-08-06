// ============================================================
// RYZE / HYBRID FORGE — AI Engine (Motor de Treino Híbrido Científico)
// Metodologia baseada em Fisiologia do Treinamento Concorrente (Hickson / Fyfe et al.)
// e no Protocolo de Treino do Atleta Híbrido (Willian Folster & Victor Pareto)
// ============================================================

import type {
  UserProfile,
  WeekPlan,
  DayWorkout,
  StrengthWorkout,
  RunWorkout,
  HybridWorkout,
  RestDay,
  Exercise,
  MuscleGroup,
  RunInterval,
} from '../types';

// ─── Calculadoras Fisiológicas (Tanaka & 1RM) ──────────────────────────────

/**
 * Calculadora de Frequência Cardíaca Máxima (Fórmula de Tanaka et al., 2001)
 * FCmáx = 208 - (0.7 * idade)
 */
export function calculateFCMax(age: number = 36): number {
  return Math.round(208 - 0.7 * age);
}

/**
 * Retorna as Zonas de Esforço Fisiológico (Z1 a Z5) parametrizadas em BPM
 */
export function getFCZones(age: number = 36) {
  const fcMax = calculateFCMax(age);
  return {
    fcMax,
    z1: `${Math.round(fcMax * 0.50)} - ${Math.round(fcMax * 0.59)} bpm (50-59% FCmáx)`,
    z2: `${Math.round(fcMax * 0.60)} - ${Math.round(fcMax * 0.69)} bpm (60-69% FCmáx)`,
    z3: `${Math.round(fcMax * 0.70)} - ${Math.round(fcMax * 0.79)} bpm (70-79% FCmáx)`,
    z4: `${Math.round(fcMax * 0.80)} - ${Math.round(fcMax * 0.89)} bpm (80-89% FCmáx)`,
    z5: `${Math.round(fcMax * 0.90)} - ${Math.round(fcMax * 0.95)} bpm (90-95% FCmáx)`,
  };
}

/**
 * Calculadora de 1RM (Epley, 1985)
 * 1RM = Carga * (1 + 0.0333 * Repetições)
 */
export function calculate1RM(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg;
  return Math.round(weightKg * (1 + 0.0333 * reps));
}

// ─── Biblioteca Metódica de Treinos Híbridos (Blocos A a E) ────────────────

function buildTreinoA(profile: UserProfile): StrengthWorkout {
  const isBeginner = profile.experienceLevel === 'iniciante';
  const setsBase = isBeginner ? 3 : 4;

  const exercises: Exercise[] = [
    {
      id: 'mob_inf',
      name: 'Flexibilidade e Mobilidade de Inferiores',
      muscleGroups: ['pernas', 'gluteos'],
      sets: 1,
      reps: '5 min',
      rest: 30,
      blockName: 'BLOCO 01 - AQUECIMENTO',
      blockType: 'aquecimento',
      technique: 'Foco em tornozelos, quadril e rotação femoral pré-treino.',
    },
    {
      id: 'agachamento_bodyweight',
      name: 'Agachamento c/ Peso do Corpo',
      muscleGroups: ['pernas', 'gluteos'],
      sets: setsBase,
      reps: '15',
      rest: 45,
      blockName: 'BLOCO 01 - AQUECIMENTO',
      blockType: 'aquecimento',
      technique: 'Cadência 3-0-1-0. Ativação neuromuscular sem carga.',
    },
    {
      id: 'agachamento_livre',
      name: 'Agachamento Livre com Barra',
      muscleGroups: ['pernas', 'gluteos'],
      sets: setsBase,
      reps: '15',
      rest: 60,
      blockName: 'BLOCO 02 - META DE REPETIÇÃO',
      blockType: 'meta',
      technique: 'Desça até a paralela (90°). Mantenha o joelho alinhado com a ponta dos pés.',
    },
    {
      id: 'leg_press_45',
      name: 'Leg Press 45°',
      muscleGroups: ['pernas', 'gluteos'],
      sets: setsBase,
      reps: '15',
      rest: 45,
      blockName: 'BLOCO 03 - META DE REPETIÇÃO',
      blockType: 'meta',
      technique: 'Pés na largura dos ombros no centro da plataforma. Não trave os joelhos no topo.',
    },
    {
      id: 'cadeira_extensora',
      name: 'Cadeira Extensora',
      muscleGroups: ['pernas'],
      sets: setsBase,
      reps: '15',
      rest: 45,
      blockName: 'BLOCO 04 - META DE REPETIÇÃO',
      blockType: 'meta',
      technique: 'Pico de contração isométrica de 1s na extensão máxima.',
    },
    {
      id: 'terra_deadlift',
      name: 'Terra Deadlift / Stiff',
      muscleGroups: ['costas', 'pernas', 'gluteos'],
      sets: 4,
      reps: '15-12-10-8',
      rest: 90,
      blockName: 'BLOCO 05 - PIRÂMIDE',
      blockType: 'piramide',
      technique: 'Pirâmide crescente de carga: aumente o peso a cada série reduzindo as repetições.',
    },
    {
      id: 'bi_abdutora',
      name: 'Cadeira Abdutora',
      muscleGroups: ['gluteos'],
      sets: setsBase,
      reps: '15',
      rest: 45,
      blockName: 'BLOCO 06 - BI-SET',
      blockType: 'biset',
      pairedExerciseName: 'Panturrilha em Pé (15 repetições sem descanso)',
      technique: 'Execute 15 reps na Abdutora e passe IMEDIATAMENTE para 15 reps de Panturrilha.',
    },
    {
      id: 'bi_panturrilha',
      name: 'Panturrilha em Pé',
      muscleGroups: ['pernas'],
      sets: setsBase,
      reps: '15',
      rest: 45,
      blockName: 'BLOCO 06 - BI-SET',
      blockType: 'biset',
      technique: 'Calcanhares descem ao máximo e sobem na ponta dos pés.',
    },
    {
      id: 'abs_tabata',
      name: 'Abdominal — Sequência Tabata',
      muscleGroups: ['core', 'abdomen'],
      sets: 2,
      reps: '2x Sequência (4 min)',
      rest: 180,
      blockName: 'BLOCO 07 - ABDOMINAL',
      blockType: 'tabata',
      technique: '20seg de esforço máximo (Crunch/Prancha) + 10seg de descanso por 8 rounds.',
    },
  ];

  return {
    type: 'musculacao',
    letter: 'A',
    title: 'Treino A — Membros Inferiores + Abs',
    description: 'Foco total em quadríceps, glúteos e abdômen estruturado em 7 blocos metódicos.',
    focus: ['pernas', 'gluteos', 'core'],
    exercises,
    duration: profile.sessionDuration || 60,
    intensity: 'alta',
    volume: exercises.reduce((acc, ex) => acc + ex.sets * 12, 0),
  };
}

function buildTreinoB(profile: UserProfile): StrengthWorkout {
  const exercises: Exercise[] = [
    {
      id: 'mob_sup_b',
      name: 'Aquecimento e Mobilidade de Superiores',
      muscleGroups: ['peito', 'ombros'],
      sets: 1,
      reps: '5 min',
      rest: 60,
      blockName: 'BLOCO 01 - AQUECIMENTO',
      blockType: 'aquecimento',
      technique: 'Rotação de ombros e manguito rotador com elástico/halter leve.',
    },
    {
      id: 'supino_reto_halteres',
      name: 'Supino Reto c/ Halteres',
      muscleGroups: ['peito', 'triceps', 'ombros'],
      sets: 4,
      reps: '15-12-10-8',
      rest: 90,
      blockName: 'BLOCO 02 - PIRÂMIDE',
      blockType: 'piramide',
      technique: 'Progrida a carga a cada série (15, 12, 10, 8 reps) mantendo amplitude profunda.',
    },
    {
      id: 'supino_inclinado_halteres',
      name: 'Supino Inclinado c/ Halteres',
      muscleGroups: ['peito', 'ombros'],
      sets: 4,
      reps: '15',
      rest: 90,
      blockName: 'BLOCO 03 - META DE REPETIÇÕES',
      blockType: 'meta',
      technique: 'Banco a 30°-45°. Foco na porção clavicular (peitoral superior).',
    },
    {
      id: 'voador_crossover',
      name: 'Voador (Crossover Polia Alta)',
      muscleGroups: ['peito'],
      sets: 4,
      reps: '15',
      rest: 90,
      blockName: 'BLOCO 04 - META DE REPETIÇÕES',
      blockType: 'meta',
      technique: 'Adução completa. Cruze as mãos levemente no centro para contração máxima.',
    },
    {
      id: 'elevacao_frontal',
      name: 'Elevação Frontal c/ Halteres',
      muscleGroups: ['ombros'],
      sets: 4,
      reps: '15',
      rest: 90,
      blockName: 'BLOCO 05 - META DE REPETIÇÕES',
      blockType: 'meta',
      technique: 'Controle o movimento sem usar o balanço do tronco.',
    },
    {
      id: 'elevacao_lateral',
      name: 'Elevação Lateral c/ Halteres',
      muscleGroups: ['ombros'],
      sets: 4,
      reps: '15',
      rest: 90,
      blockName: 'BLOCO 06 - META DE REPETIÇÕES',
      blockType: 'meta',
      technique: 'Cotovelos levemente flexionados, suba até a linha dos ombros.',
    },
    {
      id: 'rosca_biceps_barra_w',
      name: 'Rosca Bíceps Barra W',
      muscleGroups: ['biceps'],
      sets: 4,
      reps: '15',
      rest: 90,
      blockName: 'BLOCO 07 - META DE REPETIÇÕES',
      blockType: 'meta',
      technique: 'Mantenha os cotovelos fixos ao lado do corpo.',
    },
    {
      id: 'biceps_concentrado',
      name: 'Bíceps Concentrado',
      muscleGroups: ['biceps'],
      sets: 4,
      reps: '15',
      rest: 90,
      blockName: 'BLOCO 08 - META DE REPETIÇÕES',
      blockType: 'meta',
      technique: 'Apoie o cotovelo na coxa interna e isole o pico do bíceps.',
    },
  ];

  return {
    type: 'musculacao',
    letter: 'B',
    title: 'Treino B — Peito, Ombro e Bíceps',
    description: 'Hipertrofia de peitoral, deltoides e bíceps dividida em 8 blocos metódicos de repetição e pirâmide.',
    focus: ['peito', 'ombros', 'biceps'],
    exercises,
    duration: profile.sessionDuration || 60,
    intensity: 'alta',
    volume: exercises.reduce((acc, ex) => acc + ex.sets * 12, 0),
  };
}

function buildTreinoC(profile: UserProfile): StrengthWorkout {
  const exercises: Exercise[] = [
    {
      id: 'mob_sup_c',
      name: 'Aquecimento e Mobilidade de Costas & Escápulas',
      muscleGroups: ['costas', 'ombros'],
      sets: 1,
      reps: '5 min',
      rest: 60,
      blockName: 'BLOCO 01 - AQUECIMENTO',
      blockType: 'aquecimento',
      technique: 'Retração e depressão escapular na barra ou polia leve.',
    },
    {
      id: 'puxada_alta_polia',
      name: 'Puxada Alta na Polia ou Máquina',
      muscleGroups: ['costas', 'biceps'],
      sets: 4,
      reps: '15',
      rest: 120,
      blockName: 'BLOCO 02 - META DE REPETIÇÕES',
      blockType: 'meta',
      technique: 'Puxe direcionando a barra até a parte superior do peito.',
    },
    {
      id: 'remada_baixa',
      name: 'Remada Baixa no Cabo / Máquina',
      muscleGroups: ['costas'],
      sets: 4,
      reps: '15',
      rest: 90,
      blockName: 'BLOCO 03 - META DE REPETIÇÕES',
      blockType: 'meta',
      technique: 'Tronco ereto, escápulas seladas no final do movimento.',
    },
    {
      id: 'pulldown_dropset',
      name: 'Pulldown com Barra Reta',
      muscleGroups: ['costas'],
      sets: 4,
      reps: '12 + Drop',
      rest: 90,
      blockName: 'BLOCO 04 - DROPSET',
      blockType: 'dropset',
      technique: 'Ao atingir a falha na 12ª rep, reduza 30% da carga imediatamente e vá até a falha.',
    },
    {
      id: 'remada_supinada',
      name: 'Remada Supinada com Barra',
      muscleGroups: ['costas', 'biceps'],
      sets: 4,
      reps: '15',
      rest: 45,
      blockName: 'BLOCO 05 - META DE REPETIÇÃO',
      blockType: 'meta',
      technique: 'Pegada invertida (palmas para cima). Foco na porção inferior do latíssimo.',
    },
    {
      id: 'triceps_barra_reta',
      name: 'Tríceps na Barra Reta (Pushdown)',
      muscleGroups: ['triceps'],
      sets: 4,
      reps: '12 + Drop',
      rest: 45,
      blockName: 'BLOCO 06 - DROPSET',
      blockType: 'dropset',
      technique: 'Na 4ª série faça um dropset duplo reduzindo o peso sem pausa.',
    },
    {
      id: 'peck_deck_invertido',
      name: 'Peck Deck Invertido (Crucifixo Invertido)',
      muscleGroups: ['ombros', 'costas'],
      sets: 4,
      reps: '15',
      rest: 45,
      blockName: 'BLOCO 07 - META DE REPETIÇÕES',
      blockType: 'meta',
      technique: 'Isolamento do deltoide posterior e romboides.',
    },
  ];

  return {
    type: 'musculacao',
    letter: 'C',
    title: 'Treino C — Costas e Tríceps',
    description: 'Trabalho completo da cadeia posterior e tríceps com técnicas de Dropset e meta de volume.',
    focus: ['costas', 'triceps', 'ombros'],
    exercises,
    duration: profile.sessionDuration || 60,
    intensity: 'alta',
    volume: exercises.reduce((acc, ex) => acc + ex.sets * 12, 0),
  };
}

function buildTreinoD(profile: UserProfile): StrengthWorkout {
  const base = buildTreinoB(profile);
  return {
    ...base,
    letter: 'D',
    title: 'Treino D — Peito, Ombro e Bíceps (Foco Densidade)',
    description: 'Segundo estímulo semanal de peitoral e deltóides com variações de ângulos e fadiga controlada.',
  };
}

function buildTreinoE(profile: UserProfile): StrengthWorkout {
  const base = buildTreinoC(profile);
  return {
    ...base,
    letter: 'E',
    title: 'Treino E — Costas e Tríceps (Foco Espessura)',
    description: 'Segundo estímulo de dorsal e braços para fechamento de volume semanal.',
  };
}

// ─── Planilha de Corrida por Zonas de Frequência Cardíaca ─────────────────

function buildRunIntervalado13(profile: UserProfile): RunWorkout {
  const zones = getFCZones(profile.age || 36);
  return {
    type: 'corrida',
    runType: 'intervalado',
    title: 'Corrida — Intervalado 1:3 Moderado (Atleta Híbrido)',
    description: 'Aquecimento + 7 tiros de 30seg em Z3 alternados com 90seg de recuperação em Z1.',
    distance: 3.5,
    duration: 30,
    paceTarget: profile.runnerLevel === 'iniciante' ? '6:30 - 7:15/km' : '5:30 - 6:15/km',
    heartRateZone: `Z3 (${zones.z3}) / Z1 (${zones.z1})`,
    fcMaxTarget: zones.z3,
    warmup: '5 min trote leve em Z1 (Zona de Recuperação)',
    cooldown: '5 min caminhada em Z1 + alongamento dinâmico',
    intensity: 'media',
    intervals: [
      {
        effort: '30 seg Z3 (Tiro Moderado)',
        pace: 'Sub-máximo em Z3',
        recovery: '90 seg Z1 (Caminhada leve)',
        repetitions: 7,
      },
    ],
  };
}

function buildRunIntervalado12(profile: UserProfile): RunWorkout {
  const zones = getFCZones(profile.age || 36);
  return {
    type: 'corrida',
    runType: 'intervalado',
    title: 'Corrida — Intervalado 1:2 Moderado (Atleta Híbrido)',
    description: 'Aquecimento + 7 tiros de 45seg em Z3 alternados com 90seg de recuperação em Z1.',
    distance: 4.0,
    duration: 32,
    paceTarget: profile.runnerLevel === 'iniciante' ? '6:15 - 7:00/km' : '5:15 - 6:00/km',
    heartRateZone: `Z3 (${zones.z3}) / Z1 (${zones.z1})`,
    fcMaxTarget: zones.z3,
    warmup: '5 min trote leve em Z1',
    cooldown: '5 min caminhada em Z1',
    intensity: 'media',
    intervals: [
      {
        effort: '45 seg Z3 (Tiro Moderado)',
        pace: 'Sub-máximo em Z3',
        recovery: '90 seg Z1 (Caminhada leve)',
        repetitions: 7,
      },
    ],
  };
}

function buildRunIntervalado11(profile: UserProfile): RunWorkout {
  const zones = getFCZones(profile.age || 36);
  return {
    type: 'corrida',
    runType: 'intervalado',
    title: 'Corrida — Intervalado 1:1 Moderado (Atleta Híbrido)',
    description: 'Aquecimento + 7 tiros de 1min em Z3 alternados com 1min de recuperação em Z1.',
    distance: 4.5,
    duration: 35,
    paceTarget: profile.runnerLevel === 'iniciante' ? '6:00 - 6:45/km' : '5:00 - 5:45/km',
    heartRateZone: `Z3 (${zones.z3}) / Z1 (${zones.z1})`,
    fcMaxTarget: zones.z3,
    warmup: '5 min trote leve em Z1',
    cooldown: '5 min caminhada em Z1',
    intensity: 'alta',
    intervals: [
      {
        effort: '1 min Z3 (Tiro Moderado)',
        pace: 'Ritmo Forte Z3',
        recovery: '1 min Z1 (Caminhada/Trote leve)',
        repetitions: 7,
      },
    ],
  };
}

// ─── Gerador Principal do Plano Semanal (WeekPlan) ─────────────────────────

export function generateWeekPlan(profile: UserProfile, weekNumber: number = 1): WeekPlan {
  const days = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  const dayWorkouts: Record<string, DayWorkout> = {};

  const fcZones = getFCZones(profile.age || 36);

  // Instancia os treinos de Musculação do Atleta Híbrido (A a E)
  const treinoA = buildTreinoA(profile);
  const treinoB = buildTreinoB(profile);
  const treinoC = buildTreinoC(profile);
  const treinoD = buildTreinoD(profile);
  const treinoE = buildTreinoE(profile);

  // Instancia os treinos de Corrida por Zonas
  const run13 = buildRunIntervalado13(profile);
  const run12 = buildRunIntervalado12(profile);
  const run11 = buildRunIntervalado11(profile);

  // ─── Estrutura de Prescrição do Atleta Híbrido (PDF Oficial) ─────────────
  // O plano é HÍBRIDO (5 Dias de Musculação A, B, C, D, E + Corrida nas Terças, Quintas e Sábados)
  // Nos dias de corrida conjugada (Terça, Quinta e Sábado), prescrevemos o HybridWorkout ou a combinação perfeita!

  dayWorkouts['segunda'] = treinoA; // Musculação Treino A (Inferiores + Abs)
  
  dayWorkouts['terca'] = {
    type: 'hibrido',
    title: 'Treino B (Peito/Ombro/Bíceps) + Corrida Intervalada 1:3',
    description: 'Sessão dupla: Musculação Treino B + Corrida Intervalada 1:3 Moderada em Zonas Z1/Z3.',
    strength: treinoB,
    run: run13,
  } as HybridWorkout;

  dayWorkouts['quarta'] = treinoC; // Musculação Treino C (Costas + Tríceps)

  dayWorkouts['quinta'] = {
    type: 'hibrido',
    title: 'Treino D (Peito/Ombro/Bíceps) + Corrida Intervalada 1:2',
    description: 'Sessão dupla: Musculação Treino D + Corrida Intervalada 1:2 Moderada em Zonas Z1/Z3.',
    strength: treinoD,
    run: run12,
  } as HybridWorkout;

  dayWorkouts['sexta'] = treinoE; // Musculação Treino E (Costas + Tríceps)

  dayWorkouts['sabado'] = {
    type: 'hibrido',
    title: 'Corrida Intervalada 1:1 + Core / Mobilidade',
    description: 'Corrida Intervalada 1:1 Moderada (7x 1min Z3 + 1min Z1) + Sessão de Core.',
    strength: {
      type: 'musculacao',
      letter: 'A',
      title: 'Core & Mobilidade de Fim de Semana',
      description: 'Fortalecimento de abdominal, estabilidade lombar e soltura miofascial.',
      focus: ['core', 'pernas'],
      exercises: treinoA.exercises.filter(ex => ex.blockType === 'aquecimento' || ex.blockType === 'tabata'),
      duration: 30,
      intensity: 'baixa',
      volume: 48,
    },
    run: run11,
  } as HybridWorkout;

  dayWorkouts['domingo'] = {
    type: 'descanso',
    title: 'Descanso Completo & Recuperação Metabólica',
    description: 'O crescimento e a perda de gordura ocorrem no descanso. Sono (7-9h) e hidratação.',
    activities: [
      'Dormir 7 a 9 horas para restaurar o sistema nervoso central',
      'Hidratação reforçada (35ml/kg de peso corporal)',
      'Refeições com alta densidade nutricional e proteínas (2g/kg)',
    ],
  } as RestDay;

  // Cálculo de volume total de repetições e km acumulados
  let totalVolume = 0;
  let totalKm = 0;

  Object.values(dayWorkouts).forEach(workout => {
    if (workout.type === 'musculacao') {
      totalVolume += workout.volume;
    } else if (workout.type === 'corrida') {
      totalKm += workout.distance;
    } else if (workout.type === 'hibrido') {
      totalVolume += workout.strength.volume;
      totalKm += workout.run.distance;
    }
  });

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - now.getDay() + 1);

  return {
    weekNumber,
    startDate: startDate.toISOString(),
    days: dayWorkouts,
    totalVolume,
    totalKm,
    focusMuscles: ['peito', 'costas', 'pernas', 'ombros', 'gluteos', 'core'],
    fcMaxCalculated: fcZones.fcMax,
    fcZones: {
      z1: fcZones.z1,
      z2: fcZones.z2,
      z3: fcZones.z3,
      z4: fcZones.z4,
      z5: fcZones.z5,
    },
  };
}

// ─── Análise de Perfil Fisiológico ─────────────────────────────────────────

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
  const bodyType = bmi < 18.5
    ? 'Ectomorfo (Abaixo do peso ideal)'
    : bmi < 25
    ? 'Falso Magro / Recomposição Corporal'
    : bmi < 30
    ? 'Sobrepeso leve (Foco em Emagrecimento Híbrido)'
    : 'Sobrepeso moderado';

  const recommendations: string[] = [
    'Siga rigorosamente as Zonas de Esforço (%FCmáx) na corrida para não catabolizar massa muscular.',
    'Consuma entre 1.8g e 2.2g de proteína por kg de peso corporal diariamente.',
    'Respeite as cadências e intervalos dos blocos metódicos (Pirâmide, Meta e Dropset).',
    'Hidrate-se com no mínimo 3.5 litros de água por dia.',
  ];

  const warnings: string[] = [
    'Atenção ao Efeito de Interferência: Mantenha a corrida em Z1/Z3 para preservar a resposta de síntese proteica (mTORC1).',
  ];

  return {
    bodyType,
    recommendations,
    warnings,
    focusAreas: ['Peitoral', 'Costas', 'Membros Inferiores', 'Deltoides', 'Core Híbrido'],
    estimatedTimeToGoal: '8 a 12 semanas para recomposição corporal profunda',
    weeklyLoad: {
      strengthDays: 5,
      runDays: 3,
      restDays: 1,
    },
  };
}
