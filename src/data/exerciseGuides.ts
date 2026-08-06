// ============================================================
// RYZE — Base de Dados de Guias & Demonstrações de Exercícios
// ============================================================

export interface ExerciseGuide {
  id: string;
  name: string;
  category: 'peito' | 'costas' | 'pernas' | 'ombros' | 'biceps' | 'triceps' | 'gluteos' | 'core';
  image?: string;
  /** @deprecated Substituído por modelo 3D GLB. Mantido apenas como último fallback. */
  gifUrls?: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipmentNeeded: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  activationLevel: number; // 0 a 100%
  tempo: string; // ex: "3-0-1-0" (descida - pausa - subida - pausa)
  motionType: 'squat' | 'bench_press' | 'pull_up' | 'hip_thrust' | 'overhead_press' | 'bicep_curl' | 'tricep_extension' | 'generic';
  /**
   * true = GLB disponível no Supabase Storage em /exercises/{id}/animation.glb
   * Para ativar 3D em um exercício:
   *   1. Faça upload do GLB no Supabase Storage (bucket: exercises)
   *   2. Mude has3d para true aqui
   *   3. Pronto — zero alteração de código
   */
  has3d: boolean;
  /** URL customizada do GLB (opcional — se omitida, usa URL padrão do Supabase Storage) */
  glbUrl?: string;
  /**
   * ID do exercício na ExerciseDB (https://oss.exercisedb.dev).
   * Preenchido manualmente com IDs confirmados via API — nunca por fuzzy match.
   * null = exercício sem correspondência confirmada → usa fallback SVG.
   *
   * Mapeamento feito em: 2026-08-06
   * Para adicionar um novo exercício:
   *   1. Busque em https://oss.exercisedb.dev/api/v1/exercises/search?search=TERMO
   *   2. Confirme que o nome/equipamento/músculo-alvo batem com o exercício local
   *   3. Preencha o exerciseDbId aqui
   */
  exerciseDbId?: string | null;
  /**
   * Cache local da gifUrl resolvida via ExerciseDB.
   * Preenchido em runtime pelo exerciseDbService e persistido em localStorage.
   * Não editar manualmente — é gerenciado pelo serviço.
   */
  gifUrl?: string | null;
  /** Músculos estabilizadores e de suporte postural */
  stabilizers?: string[];
  /** Articulações principais envolvidas no movimento */
  jointsInvolved?: string[];
  /** Plano biomecânico de movimento (Sagital, Frontal, Transverso, Multiplanar) */
  movementPlane?: string;
  /** Amplitude de movimento em graus (ROM) */
  romDegrees?: string;
  /** Classificação mecânica (Composto Multiarticular vs Isolado Monoarticular) */
  exerciseType?: string;
  steps: {
    setup: string[];
    execution: string[];
    breathing: string;
    mistakes: string[];
  };
  proTips: string[];
}

export type MuscleZone =
  | 'peitoral' | 'deltoide_ant' | 'deltoide_lat' | 'deltoide_post'
  | 'biceps' | 'triceps' | 'antebraco'
  | 'abs' | 'obliquos' | 'serratiil'
  | 'quadriceps' | 'adutores' | 'tibial'
  | 'trapezio' | 'romboides' | 'latissimo' | 'eretores'
  | 'gluteo_max' | 'gluteo_med' | 'isquiotibiais' | 'panturrilha';

export interface MuscleActivation {
  primary: MuscleZone[];
  secondary: MuscleZone[];
}

export const MUSCLE_ACTIVATION_MAP: Record<ExerciseGuide['category'], MuscleActivation> = {
  peito: {
    primary: ['peitoral', 'serratiil'],
    secondary: ['triceps', 'deltoide_ant'],
  },
  costas: {
    primary: ['latissimo', 'romboides', 'trapezio'],
    secondary: ['biceps', 'eretores', 'deltoide_post'],
  },
  pernas: {
    primary: ['quadriceps', 'gluteo_max'],
    secondary: ['isquiotibiais', 'adutores', 'eretores', 'panturrilha'],
  },
  ombros: {
    primary: ['deltoide_ant', 'deltoide_lat'],
    secondary: ['triceps', 'trapezio', 'deltoide_post'],
  },
  biceps: {
    primary: ['biceps'],
    secondary: ['antebraco', 'deltoide_ant'],
  },
  triceps: {
    primary: ['triceps'],
    secondary: ['antebraco', 'deltoide_post'],
  },
  gluteos: {
    primary: ['gluteo_max', 'gluteo_med'],
    secondary: ['isquiotibiais', 'quadriceps', 'adutores'],
  },
  core: {
    primary: ['abs', 'obliquos'],
    secondary: ['eretores', 'quadriceps', 'serratiil'],
  },
};

export const EXERCISE_GUIDES: Record<string, ExerciseGuide> = {
  supino_reto: {
    id: 'supino_reto',
    name: 'Supino Reto com Barra',
    category: 'peito',
    motionType: 'bench_press',
    has3d: false, // Mude para true após upload do GLB no Supabase Storage
    exerciseDbId: 'EIeI8Vf', // ExerciseDB: "barbell bench press" — confirmado 2026-08-06
    primaryMuscles: ['Peitoral Maior (Esternal & Clavicular)', 'Serrátil Anterior'],
    secondaryMuscles: ['Tríceps Braquial', 'Deltoide Anterior'],
    equipmentNeeded: 'Barra Olímpica + Banco Reto',
    difficulty: 'Intermediário',
    activationLevel: 95,
    tempo: '3-0-1-0 (3s descida, 1s subida)',
    steps: {
      setup: [
        'Deite-se no banco mantendo os pés firmes e cravados no chão.',
        'Faça uma leve retração escapular (junte as escápulas para trás e para baixo).',
        'Segure a barra com pegada um pouco mais larga que os ombros.',
        'Desencaixe a barra mantendo os pulsos firmes e neutros.',
      ],
      execution: [
        'Desça a barra de forma controlada (3 segundos) até tocar suavemente o peito.',
        'Mantenha os cotovelos a aproximadamente 45° em relação ao tronco.',
        'Empurre a barra com força explosiva até a extensão completa dos braços.',
      ],
      breathing: 'Inspire profundamente durante a descida e expire forte ao empurrar a carga.',
      mistakes: [
        'Abrir os cotovelos em 90° (estressa o manguito rotador).',
        'Quicar a barra no peito aproveitando o impulso.',
        'Tirar os glúteos do banco durante o esforço.',
      ],
    },
    proTips: [
      'Empurre o chão com os pés (leg drive) para transferir força das pernas para o movimento.',
    ],
  },

  supino_inclinado: {
    id: 'supino_inclinado',
    name: 'Supino Inclinado com Halteres',
    category: 'peito',
    motionType: 'bench_press',
    has3d: false,
    exerciseDbId: '3TZduzM', // ExerciseDB: "barbell incline bench press" — confirmado 2026-08-06
    primaryMuscles: ['Peitoral Superior (Porção Clavicular)'],
    secondaryMuscles: ['Deltoide Anterior', 'Tríceps Braquial'],
    equipmentNeeded: 'Halteres + Banco Inclinado (30°-45°)',
    difficulty: 'Intermediário',
    activationLevel: 90,
    tempo: '3-1-1-0',
    steps: {
      setup: [
        'Ajuste o banco em uma inclinação entre 30° e 45°.',
        'Sente-se com os halteres apoiados sobre as coxas.',
        'Imulsione os joelhos para elevar os halteres até a altura do peitoral superior.',
      ],
      execution: [
        'Abra o peito e desça os halteres nas laterais de forma controlada.',
        'Empurre os halteres para cima convergindo-os no topo sem encostar.',
      ],
      breathing: 'Inspire na descida e expire ao empurrar os halteres.',
      mistakes: [
        'Inclinação excessiva do banco acima de 45°.',
        'Deixar os cotovelos caírem desalinhados.',
      ],
    },
    proTips: [
      'Sinta um alongamento profundo na porção superior do peitoral no ponto mais baixo.',
    ],
  },

  agachamento: {
    id: 'agachamento',
    name: 'Agachamento Livre com Barra',
    category: 'pernas',
    motionType: 'squat',
    has3d: false,
    exerciseDbId: 'qXTaZnJ', // ExerciseDB: "barbell full squat" — confirmado 2026-08-06
    primaryMuscles: ['Quadríceps (Vasto Lateral, Medial, Intermédio)', 'Glúteo Máximo'],
    secondaryMuscles: ['Isquiotibiais', 'Eretores da Espinha', 'Core / Abdômen'],
    equipmentNeeded: 'Barra Olímpica + RACK de Agachamento',
    difficulty: 'Avançado',
    activationLevel: 98,
    tempo: '3-1-1-0',
    steps: {
      setup: [
        'Posicione a barra no rack na altura do trapézio superior.',
        'Entre sob a barra, apoie-a firmemente e retire-a do suporte.',
        'Afastamento dos pés na largura dos ombros com pontas levemente voltadas para fora.',
      ],
      execution: [
        'Inicie o movimento projetando o quadril para trás e flexionando os joelhos.',
        'Desça até o quadril passar ligeiramente da linha dos joelhos (paralelo ou profundo).',
        'Empurre o chão com o meio dos pés subindo de forma firme.',
      ],
      breathing: 'Inspire fundo no topo, trave o abdômen (bracing) e expire ao completar a subida.',
      mistakes: [
        'Deixar os joelhos caírem para dentro (valgo dinâmico).',
        'Arredondar a coluna lombar na parte mais baixa.',
      ],
    },
    proTips: [
      'Force os joelhos para fora acompanhando a linha das pontas dos pés.',
    ],
  },

  barra_fixa: {
    id: 'barra_fixa',
    name: 'Barra Fixa (Pull-Up)',
    category: 'costas',
    motionType: 'pull_up',
    has3d: false,
    exerciseDbId: 'lBDjFxJ', // ExerciseDB: "pull-up" — confirmado 2026-08-06
    primaryMuscles: ['Latíssimo do Dorso (Grande Dorsal)', 'Romboides'],
    secondaryMuscles: ['Bíceps Braquial', 'Braquiorradial', 'Trapézio'],
    equipmentNeeded: 'Barra Fixa',
    difficulty: 'Intermediário',
    activationLevel: 92,
    tempo: '2-1-1-1',
    steps: {
      setup: [
        'Segure a barra com pegada pronada um pouco mais larga que a dos ombros.',
        'Fique totalmente pendurado com os braços estendidos.',
        'Inicie puxando as escápulas para baixo.',
      ],
      execution: [
        'Puxe o corpo para cima direcionando o peito para a barra.',
        'Suba até o queixo ultrapassar a altura da barra.',
        'Retorne à posição inicial de maneira totalmente controlada.',
      ],
      breathing: 'Inspire na descida e expire durante a puxada.',
      mistakes: [
        'Usar impulso de pernas (kipping).',
        'Não descer até a extensão completa dos braços.',
      ],
    },
    proTips: [
      'Pense em guiar a subida com os cotovelos apontados para o chão.',
    ],
  },

  hip_thrust: {
    id: 'hip_thrust',
    name: 'Hip Thrust com Barra',
    category: 'gluteos',
    motionType: 'hip_thrust',
    has3d: false,
    exerciseDbId: null, // ExerciseDB free não tem barbell hip thrust — fallback SVG
    primaryMuscles: ['Glúteo Máximo', 'Glúteo Médio'],
    secondaryMuscles: ['Isquiotibiais', 'Quadríceps', 'Adutor Magno'],
    equipmentNeeded: 'Barra Olímpica + Banco + Protetor',
    difficulty: 'Intermediário',
    activationLevel: 100,
    tempo: '2-1-1-1',
    steps: {
      setup: [
        'Apoie a parte inferior das escápulas na borda de um banco firme.',
        'Posicione a barra estofada diretamente sobre o quadril.',
        'Manter as canelas na vertical a 90° no topo do movimento.',
      ],
      execution: [
        'Empurre pelos calcanhares e eleve o quadril estendendo-o por completo.',
        'Esprema os glúteos fortemente no topo por 1 segundo.',
        'Desça o quadril sob controle.',
      ],
      breathing: 'Inspire na descida e expire forte na contração do topo.',
      mistakes: [
        'Hiperestender a lombar no topo do movimento.',
      ],
    },
    proTips: [
      'Mantenha o queixo junto ao peito durante todo o trajeto.',
    ],
  },

  desenvolvimento: {
    id: 'desenvolvimento',
    name: 'Desenvolvimento com Halteres',
    category: 'ombros',
    motionType: 'overhead_press',
    has3d: false,
    exerciseDbId: '5vfAI0I', // ExerciseDB: "dumbbell scott press" (seated DB shoulder press) — confirmado 2026-08-06
    primaryMuscles: ['Deltoide Anterior', 'Deltoide Lateral'],
    secondaryMuscles: ['Tríceps Braquial', 'Trapézio Superior'],
    equipmentNeeded: 'Halteres + Banco Ajustável',
    difficulty: 'Intermediário',
    activationLevel: 88,
    tempo: '2-0-1-0',
    steps: {
      setup: [
        'Sente-se no banco ajustado em leve inclinação (75-80°).',
        'Eleve os halteres na altura das orelhas com cotovelos a 45°.',
      ],
      execution: [
        'Empurre os halteres verticalmente para cima até quase estender os cotovelos.',
        'Retorne suavemente até a linha dos ombros.',
      ],
      breathing: 'Inspire na descida e expire ao empurrar.',
      mistakes: ['Arquear excessivamente a lombar destacando o tronco do encosto.'],
    },
    proTips: ['Mantenha os antebraços sempre na vertical sob a carga.'],
  },

  rosca_direta: {
    id: 'rosca_direta',
    name: 'Rosca Direta com Barra',
    category: 'biceps',
    motionType: 'bicep_curl',
    has3d: false,
    exerciseDbId: '25GPyDY', // ExerciseDB: "barbell curl" — confirmado 2026-08-06
    primaryMuscles: ['Bíceps Braquial'],
    secondaryMuscles: ['Braquial', 'Braquiorradial'],
    equipmentNeeded: 'Barra W / Barra Reta',
    difficulty: 'Iniciante',
    activationLevel: 90,
    tempo: '2-0-1-1',
    steps: {
      setup: [
        'Mantenha a postura ereta e os pés alinhados com os ombros.',
        'Segure a barra com as palmas para cima e cotovelos junto ao corpo.',
      ],
      execution: [
        'Flexione os cotovelos elevando a barra sem projetar os cotovelos para a frente.',
        'Concontraia o bíceps no topo e desça devagar.',
      ],
      breathing: 'Expire na subida e inspire na descida.',
      mistakes: ['Usar o balanço do quadril/tronco para subir o peso.'],
    },
    proTips: ['Mantenha os cotovelos fixos como pivôs nas laterais do corpo.'],
  },

  testa: {
    id: 'testa',
    name: 'Extensão Testa com Barra',
    category: 'triceps',
    motionType: 'tricep_extension',
    has3d: false,
    exerciseDbId: 'yRLPCLu', // ExerciseDB: "barbell reverse grip skullcrusher" — confirmado 2026-08-06
    primaryMuscles: ['Tríceps Braquial (Todas as cabeças)'],
    secondaryMuscles: ['Ancôneo'],
    equipmentNeeded: 'Barra W + Banco Reto',
    difficulty: 'Intermediário',
    activationLevel: 92,
    tempo: '3-0-1-0',
    steps: {
      setup: [
        'Deite no banco e mantenha os braços estendidos ligeiramente inclinados para trás.',
      ],
      execution: [
        'Flexione somente os cotovelos levando a barra em direção ao topo da cabeça.',
        'Empurre a barra de volta estendendo o tríceps.',
      ],
      breathing: 'Inspire na descida e expire ao estender os cotovelos.',
      mistakes: ['Abrir os cotovelos para as laterais durante a flexão.'],
    },
    proTips: ['Mantenha os braços levemente inclinados para trás para manter a tensão ativa.'],
  },

  leg_press: {
    id: 'leg_press',
    name: 'Leg Press 45°',
    category: 'pernas',
    motionType: 'squat',
    has3d: false,
    exerciseDbId: '10Z2DXU', // ExerciseDB: "sled 45° leg press" — confirmado 2026-08-06
    primaryMuscles: ['Quadríceps'],
    secondaryMuscles: ['Glúteo Máximo', 'Isquiotibiais'],
    equipmentNeeded: 'Máquina Leg Press 45°',
    difficulty: 'Iniciante',
    activationLevel: 88,
    tempo: '3-0-1-0',
    steps: {
      setup: ['Apoie as costas por completo no encosto e apoie os pés no centro da plataforma.'],
      execution: ['Destrave a plataforma e flexione os joelhos a 90°.', 'Empurre pelos calcanhares sem travar os joelhos.'],
      breathing: 'Inspire ao recolher as pernas e expire ao empurrar.',
      mistakes: ['Tirar a lombar do banco no ponto mais baixo.'],
    },
    proTips: ['Posicione os pés levemente mais altos para enfatizar os glúteos.'],
  },

  remada_curvada: {
    id: 'remada_curvada',
    name: 'Remada Curvada com Barra',
    category: 'costas',
    motionType: 'pull_up',
    has3d: false,
    exerciseDbId: 'eZyBC3j', // ExerciseDB: "barbell bent over row" — confirmado 2026-08-06
    primaryMuscles: ['Latíssimo do Dorso', 'Romboides'],
    secondaryMuscles: ['Bíceps Braquial', 'Deltoide Posterior', 'Eretores'],
    equipmentNeeded: 'Barra Olímpica',
    difficulty: 'Intermediário',
    activationLevel: 90,
    tempo: '2-1-1-0',
    steps: {
      setup: ['Incline o tronco a 45° mantendo a lombar neutra e joelhos semi-flexionados.'],
      execution: ['Puxe a barra em direção ao umbigo espremendo as costas.'],
      breathing: 'Expire na puxada e inspire ao descer a barra.',
      mistakes: ['Arredondar a coluna lombar.'],
    },
    proTips: ['Puxe com os cotovelos raspando ao lado das costelas.'],
  },

  elevacao_lateral: {
    id: 'elevacao_lateral',
    name: 'Elevação Lateral com Halteres',
    category: 'ombros',
    motionType: 'overhead_press',
    has3d: false,
    exerciseDbId: 'DsgkuIt', // ExerciseDB: "dumbbell lateral raise" — confirmado 2026-08-06
    primaryMuscles: ['Deltoide Lateral'],
    secondaryMuscles: ['Deltoide Anterior', 'Trapézio Superior'],
    equipmentNeeded: 'Halteres',
    difficulty: 'Iniciante',
    activationLevel: 85,
    tempo: '2-1-2-0',
    steps: {
      setup: ['Segure os halteres nas laterais do corpo com cotovelos levemente dobrados.'],
      execution: ['Eleve os braços lateralmente até a linha dos ombros.', 'Desça de forma lenta.'],
      breathing: 'Expire ao subir e inspire na descida.',
      mistakes: ['Balançar o corpo para usar impulso.'],
    },
    proTips: ['Lidere a subida pelos cotovelos, não pelas mãos.'],
  },
};

export function getExerciseGuide(exerciseId: string, exerciseName: string, muscleGroups: string[]): ExerciseGuide {
  if (EXERCISE_GUIDES[exerciseId]) {
    return EXERCISE_GUIDES[exerciseId];
  }

  const normalizedName = exerciseName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [key, guide] of Object.entries(EXERCISE_GUIDES)) {
    const normalizedGuide = guide.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalizedGuide.includes(normalizedName.split(' ')[0]) || normalizedName.includes(normalizedGuide.split(' ')[0])) {
      return guide;
    }
  }

  const primary = muscleGroups[0] || 'musculatura';
  const categoryMap: Record<string, ExerciseGuide['category']> = {
    peito: 'peito', peitoral: 'peito', chest: 'peito',
    costas: 'costas', dorsal: 'costas', back: 'costas',
    pernas: 'pernas', legs: 'pernas', quadriceps: 'pernas',
    ombros: 'ombros', shoulder: 'ombros', deltoides: 'ombros',
    biceps: 'biceps', bicep: 'biceps',
    triceps: 'triceps', tricep: 'triceps',
    gluteos: 'gluteos', glutes: 'gluteos',
    core: 'core', abdomen: 'core', abs: 'core',
  };
  const category = categoryMap[primary.toLowerCase()] ?? 'peito';

  let motionType: ExerciseGuide['motionType'] = 'generic';
  if (category === 'pernas' || category === 'gluteos') motionType = 'squat';
  else if (category === 'peito') motionType = 'bench_press';
  else if (category === 'costas') motionType = 'pull_up';
  else if (category === 'ombros') motionType = 'overhead_press';
  else if (category === 'biceps') motionType = 'bicep_curl';
  else if (category === 'triceps') motionType = 'tricep_extension';

  let movementPlane = 'Plano Sagital (Flexão/Extensão)';
  let jointsInvolved = ['Glenoumeral (Ombro)', 'Cotovelo'];
  let exerciseType = 'Composto Multiarticular';
  let romDegrees = '110° Amplitude Completa';
  let defaultStabilizers = ['Eretores da Espinha', 'Core / Abdômen', 'Manguito Rotador'];

  if (category === 'pernas' || category === 'gluteos') {
    jointsInvolved = ['Coxofemoral (Quadril)', 'Joelho', 'Tornozelo'];
    movementPlane = 'Plano Sagital & Transverso';
    romDegrees = '120° Profundo Paralelo';
    defaultStabilizers = ['Eretores Lombares', 'Transiverso Abdominal', 'Glúteo Médio'];
  } else if (category === 'costas') {
    jointsInvolved = ['Escapulotorácica', 'Glenoumeral', 'Cotovelo'];
    movementPlane = 'Plano Frontal & Sagital';
    romDegrees = '105° Tração Completa';
    defaultStabilizers = ['Bíceps Braquial', 'Antebraço', 'Core'];
  } else if (category === 'ombros') {
    jointsInvolved = ['Glenoumeral', 'Acromioclavicular', 'Cotovelo'];
    movementPlane = 'Plano Frontal / Escapular';
    romDegrees = '95° Elevação Vertical';
    defaultStabilizers = ['Trapézio Superior', 'Tríceps', 'Core Espinhal'];
  } else if (category === 'biceps' || category === 'triceps') {
    jointsInvolved = ['Ulnohumeral (Cotovelo)'];
    movementPlane = 'Plano Sagital Uniaxial';
    romDegrees = '130° Isolamento Monoarticular';
    exerciseType = 'Isolado Monoarticular';
    defaultStabilizers = ['Braquiorradial', 'Deltoide Anterior', 'Puno'];
  }

  return {
    id: exerciseId,
    name: exerciseName,
    category,
    motionType,
    has3d: false,
    primaryMuscles: muscleGroups.map(m => m.toUpperCase()),
    secondaryMuscles: ['Sinergistas Auxiliares', 'Cadeia Posterior'],
    stabilizers: defaultStabilizers,
    jointsInvolved,
    movementPlane,
    romDegrees,
    exerciseType,
    equipmentNeeded: 'Equipamento padrão de academia',
    difficulty: 'Intermediário',
    activationLevel: 88,
    tempo: '2-0-1-0',
    steps: {
      setup: [`Prepare o posicionamento alinhando a postura e ativando o core.`],
      execution: [`Realize a fase excêntrica de forma controlada e suba com pressão constante.`],
      breathing: `Inspire no menor esforço e expire no pico de força.`,
      mistakes: [`Perder o alinhamento corporal durante as repetições.`],
    },
    proTips: [`Mantenha o foco constante na musculatura de ${primary}.`],
  };
}
