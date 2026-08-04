// ============================================================
// HYBRID FORGE — Base de Dados de Guias & Demonstrações de Exercícios
// ============================================================

export interface ExerciseGuide {
  id: string;
  name: string;
  category: 'peito' | 'costas' | 'pernas' | 'ombros' | 'biceps' | 'triceps' | 'gluteos' | 'core';
  image?: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipmentNeeded: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  activationLevel: number; // 0 a 100%
  tempo: string; // ex: "3-0-1-0" (descida - pausa - subida - pausa)
  steps: {
    setup: string[];
    execution: string[];
    breathing: string;
    mistakes: string[];
  };
  proTips: string[];
}

export const EXERCISE_GUIDES: Record<string, ExerciseGuide> = {
  supino_reto: {
    id: 'supino_reto',
    name: 'Supino Reto com Barra',
    category: 'peito',
    image: '/guides/supino_reto.png',
    primaryMuscles: ['Peitoral Maior (Porção Esternal)', 'Peitoral Maior (Porção Clavicular)'],
    secondaryMuscles: ['Tríceps Braquial', 'Deltoide Anterior', 'Serrátil Anterior'],
    equipmentNeeded: 'Barra Olímpica + Banco Reto',
    difficulty: 'Intermediário',
    activationLevel: 95,
    tempo: '3-0-1-0 (3s descida, 1s subida)',
    steps: {
      setup: [
        'Deite-se no banco mantendo os pés firmes no chão.',
        'Faça uma leve retração escapular (junte as escápulas para trás e para baixo).',
        'Segure a barra com uma pegada um pouco mais larga que a largura dos ombros.',
        'Desencaixe a barra mantendo os pulsos neutros e retos.',
      ],
      execution: [
        'Desça a barra de forma controlada (3 segundos) até tocar suavemente a linha dos mamilos.',
        'Mantenha os cotovelos a aproximadamente 45° em relação ao tronco (evite abrir em 90°).',
        'Empurre a barra de forma explosiva até quase estender os cotovelos sem perder o arco natural da coluna.',
      ],
      breathing: 'Inspire profundamente durante a descida (fase excêntrica) e expire forte ao empurrar (fase concêntrica).',
      mistakes: [
        'Abrir os cotovelos em 90° (estressa excessivamente o manguito rotador).',
        'Quicar a barra no peito aproveitando o impulso.',
        'Tirar os glúteos do banco durante a carga pesada.',
        'Dobrar os pulsos para trás suportando o peso nas articulações.',
      ],
    },
    proTips: [
      'Empurre o chão com os pés (leg drive) para transferir força de todo o corpo para o movimento.',
      'Imagine que está tentando entortar a barra para fora com as mãos para ativar os lats e estabilizar o ombro.',
    ],
  },

  supino_inclinado: {
    id: 'supino_inclinado',
    name: 'Supino Inclinado com Halteres',
    category: 'peito',
    primaryMuscles: ['Peitoral Maior (Porção Superior / Clavicular)'],
    secondaryMuscles: ['Deltoide Anterior', 'Tríceps Braquial'],
    equipmentNeeded: 'Halteres + Banco Inclinado (30°-45°)',
    difficulty: 'Intermediário',
    activationLevel: 90,
    tempo: '3-1-1-0',
    steps: {
      setup: [
        'Ajuste o banco em uma inclinação de 30° a 45° (inclinações muito altas ativam mais ombro do que peito).',
        'Sente-se com os halteres apoiados sobre as coxas.',
        'Use os joelhos para dar um impulso leve e posicionar os halteres na altura do peito superior.',
      ],
      execution: [
        'Baixe os halteres nas laterais do peito abrindo bem a caixa torácica.',
        'Empurre os halteres para cima aproximando-os ligeiramente no topo sem encostá-los.',
        'Mantenha a tensão constante no peitoral durante todo o movimento.',
      ],
      breathing: 'Inspire ao abrir os braços na descida e expire ao fechar no topo.',
      mistakes: [
        'Inclinação excessiva do banco (acima de 45° virando treino de ombro).',
        'Deixar os halteres caírem rápido demais sem controle.',
      ],
    },
    proTips: [
      'No ponto mais baixo, sinta um alongamento profundo no peitoral superior antes de iniciar a subida.',
    ],
  },

  agachamento: {
    id: 'agachamento',
    name: 'Agachamento Livre com Barra',
    category: 'pernas',
    image: '/guides/agachamento.png',
    primaryMuscles: ['Quadríceps (Vasto Lateral, Medial e Intermédio)', 'Glúteo Máximo'],
    secondaryMuscles: ['Isquiotibiais', 'Eretores da Espinha', 'Core / Abdômen'],
    equipmentNeeded: 'Barra Olímpica + RACK de Agachamento',
    difficulty: 'Avançado',
    activationLevel: 98,
    tempo: '3-1-1-0',
    steps: {
      setup: [
        'Posicione a barra no rack na altura da parte média do esterno.',
        'Entre debaixo da barra apoiando-a sobre o trapézio (High Bar) ou deltoide posterior (Low Bar).',
        'Dê 2 a 3 passos para trás. Pés afastados na largura dos ombros com pontas ligeiramente apontadas para fora (15-30°).',
      ],
      execution: [
        'Inicie a descida projetando o quadril para trás e dobrando os joelhos simultaneamente.',
        'Desça até que a articulação do quadril fique abaixo do nível dos joelhos (agachamento profundo/paralelo).',
        'Empurre o chão com o meio do pé subindo o quadril e o peito no mesmo ritmo.',
      ],
      breathing: 'Manobra de Valsalva: Inspire fundo na posição inicial, trave o abdômen (brace) e só solte o ar após passar o ponto crítico da subida.',
      mistakes: [
        'Valgo dinâmico (deixar os joelhos caírem para dentro na subida).',
        'Arredondar a lombar no ponto mais fundo (butt wink).',
        'Elevar o calcanhar do chão ao agachar.',
      ],
    },
    proTips: [
      'Pense em empurrar os joelhos para fora na direção dos dedos dos pés durante toda a descida e subida.',
    ],
  },

  barra_fixa: {
    id: 'barra_fixa',
    name: 'Barra Fixa (Pull-Up)',
    category: 'costas',
    image: '/guides/barra_fixa.png',
    primaryMuscles: ['Latíssimo do Dorso (Grande Dorsal)'],
    secondaryMuscles: ['Bíceps Braquial', 'Braquiorradial', 'Redondo Maior', 'Trapezius'],
    equipmentNeeded: 'Barra Fixa',
    difficulty: 'Intermediário',
    activationLevel: 92,
    tempo: '2-1-1-1',
    steps: {
      setup: [
        'Segure a barra com pegada pronada (palmas para a frente) um pouco mais larga que os ombros.',
        'Fique pendurado com os braços totalmente estendidos (Dead Hang).',
        'Inicie ativando as escápulas: puxe as omoplatas para baixo sem dobrar os braços (Depressão Escapular).',
      ],
      execution: [
        'Puxe o corpo para cima levando o peito em direção à barra.',
        'Suba até que o queixo passe o nível da barra e o peito quase toque a barra.',
        'Retorne à posição inicial estendendo os braços de forma controlada.',
      ],
      breathing: 'Inspire na descida e expire ao puxar o corpo para cima.',
      mistakes: [
        'Kipping ou usar impulso de pernas para subir.',
        'Não realizar amplitude completa (subir pela metade ou não descer totalmente).',
        'Encolher os ombros junto às orelhas no topo.',
      ],
    },
    proTips: [
      'Imagine que está tentando puxar os cotovelos para baixo em direção aos bolsos das calças, em vez de focar nas mãos.',
    ],
  },

  hip_thrust: {
    id: 'hip_thrust',
    name: 'Hip Thrust com Barra',
    category: 'gluteos',
    primaryMuscles: ['Glúteo Máximo'],
    secondaryMuscles: ['Isquiotibiais', 'Quadríceps', 'Adutor Magno'],
    equipmentNeeded: 'Barra Olímpica + Banco + Protetor de Barra',
    difficulty: 'Intermediário',
    activationLevel: 100,
    tempo: '2-1-1-1 (segurar 1s no topo)',
    steps: {
      setup: [
        'Apoie as escápulas (borda inferior) contra um banco firme.',
        'Role a barra carregada (com protetor) sobre o quadril.',
        'Posicione os pés no chão de modo que as canelas fiquem verticais (90°) no topo do movimento.',
      ],
      execution: [
        'Empurre pelos calcanhares e eleve o quadril estendendo-o totalmente.',
        'No topo, esprema os glúteos com força máxima mantendo o queixo recolhido contra o peito.',
        'Desça o quadril de forma controlada sem desengajar o core.',
      ],
      breathing: 'Inspire na descida e expire fortemente ao contrair os glúteos no topo.',
      mistakes: [
        'Hiperestender a lombar no topo (o movimento deve vir puramente da extensão do quadril).',
        'Pés muito distantes ou muito próximos do banco.',
      ],
    },
    proTips: [
      'Mantenha os olhos voltados para a frente (não olhe para o teto) para evitar a hiperestensão da coluna lombar.',
    ],
  },

  desenvolvimento: {
    id: 'desenvolvimento',
    name: 'Desenvolvimento com Halteres',
    category: 'ombros',
    primaryMuscles: ['Deltoide Anterior', 'Deltoide Lateral'],
    secondaryMuscles: ['Tríceps Braquial', 'Trapézio Superior'],
    equipmentNeeded: 'Halteres + Banco a 75-80°',
    difficulty: 'Intermediário',
    activationLevel: 88,
    tempo: '2-0-1-0',
    steps: {
      setup: [
        'Ajuste o banco em uma inclinação quase vertical (75-80°).',
        'Sente-se apoiando as costas firmemente.',
        'Eleve os halteres na altura das orelhas com os cotovelos apontando levemente para a frente (linha do plano escapular).',
      ],
      execution: [
        'Empurre os halteres para cima em uma trajetória suavemente curva até quase se tocarem no topo.',
        'Desça sob controle até a altura dos ombros/orelhas.',
      ],
      breathing: 'Inspire na descida e expire ao empurrar para cima.',
      mistakes: [
        'Arquear excessivamente a lombar destacando as costas do banco.',
        'Abater os halteres bruscamente na descida.',
      ],
    },
    proTips: ['Mantenha o core rígido para estabilizar a coluna durante toda a carga.'],
  },

  rosca_direta: {
    id: 'rosca_direta',
    name: 'Rosca Direta com Barra',
    category: 'biceps',
    primaryMuscles: ['Bíceps Braquial (Cabeça Longa e Curta)'],
    secondaryMuscles: ['Braquial', 'Braquiorradial'],
    equipmentNeeded: 'Barra Reta ou Barra W',
    difficulty: 'Iniciante',
    activationLevel: 90,
    tempo: '2-0-1-1',
    steps: {
      setup: [
        'Fique em pé com postura ereta, pés na largura dos ombros.',
        'Segure a barra com pegada supina (palmas para cima) na largura dos ombros.',
        'Mantenha os cotovelos colados ao lado do tronco.',
      ],
      execution: [
        'Flexione os cotovelos elevando a barra em direção aos ombros sem mover os cotovelos para a frente.',
        'Esprema o bíceps no pico da contração.',
        'Desça a barra lentamente até a extensão quase completa dos braços.',
      ],
      breathing: 'Expire ao subir a barra e inspire na descida.',
      mistakes: [
        'Usar balanço do tronco (roubo) para iniciar a subida.',
        'Avançar os cotovelos tirando a tensão do bíceps.',
      ],
    },
    proTips: ['Use a Barra W se sentir desconforto nos pulsos com a barra reta.'],
  },

  testa: {
    id: 'testa',
    name: 'Extensão Testa com Barra (Skullcrusher)',
    category: 'triceps',
    primaryMuscles: ['Tríceps Braquial (Cabeça Longa, Lateral e Medial)'],
    secondaryMuscles: ['Ancôneo'],
    equipmentNeeded: 'Barra W + Banco Reto',
    difficulty: 'Intermediário',
    activationLevel: 92,
    tempo: '3-0-1-0',
    steps: {
      setup: [
        'Deite-se no banco com uma barra W nas mãos.',
        'Estenda os braços para cima, inclinando-os ligeiramente para trás em relação à vertical (para manter tensão constante).',
      ],
      execution: [
        'Flexione apenas os cotovelos baixando a barra em direção à testa/topo da cabeça.',
        'Mantenha os cotovelos apontados para o teto e imóveis.',
        'Empurre a barra de volta à posição inicial contraindo o tríceps.',
      ],
      breathing: 'Inspire na descida e expire ao estender os cotovelos.',
      mistakes: ['Abrir os cotovelos para as laterais.', 'Mover os ombros junto com o movimento.'],
    },
    proTips: ['Baixe a barra um pouco atrás da cabeça para aumentar a amplitude e proteger os cotovelos.'],
  },
};

// Helper para obter ou gerar guia genérico se não estiver explicitamente mapeado
export function getExerciseGuide(exerciseId: string, exerciseName: string, muscleGroups: string[]): ExerciseGuide {
  if (EXERCISE_GUIDES[exerciseId]) {
    return EXERCISE_GUIDES[exerciseId];
  }

  // Generates intelligent fallback details based on muscle group
  const primary = muscleGroups[0] || 'musculatura';
  const category = (primary as ExerciseGuide['category']) || 'peito';

  return {
    id: exerciseId,
    name: exerciseName,
    category: category,
    primaryMuscles: muscleGroups.map(m => m.toUpperCase()),
    secondaryMuscles: ['Estabilizadores do Core', 'Músculos Sinergistas'],
    equipmentNeeded: 'Equipamento padrão de academia / Peso corporal',
    difficulty: 'Intermediário',
    activationLevel: 85,
    tempo: '2-0-1-0 (2s excêntrico, 1s concêntrico)',
    steps: {
      setup: [
        `Prepare o posicionamento inicial mantendo a postura ereta e o core ativado.`,
        `Ajuste a pegada ou apoio de acordo com a sua amplitude anatômica ideal.`,
      ],
      execution: [
        `Inicie o movimento focando na contração da musculatura de ${primary}.`,
        `Realize a fase excêntrica de forma controlada sem deixar o peso cair.`,
        `Retorne à posição inicial mantendo constante tensão muscular.`,
      ],
      breathing: `Inspire na fase de menor esforço e expire durante o momento de força máxima.`,
      mistakes: [
        `Realizar repetições parciais por excesso de carga.`,
        `Perder o alinhamento da postura e estabilização do core durante a série.`,
      ],
    },
    proTips: [
      `Foque na conexão mente-músculo: sinta o trabalho de ${primary} em cada repetição.`,
    ],
  };
}
