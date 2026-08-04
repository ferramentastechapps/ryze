// ============================================================
// HYBRID FORGE — Gemini 2.5 Flash via OpenRouter / Local AI Engine
// ============================================================

import type { UserProfile, WeekPlan } from '../types';
import { generateWeekPlan } from '../engine/aiEngine';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'google/gemini-2.5-flash';
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface AICoachResponse {
  coachMessage: string;           // Mensagem personalizada do coach
  weekOverview: string;           // Resumo da semana
  dailyTips: Record<string, string>; // Dica do Gemini para cada dia
  nutritionPlan: string;          // Plano nutricional simplificado
  motivationalQuote: string;      // Frase motivacional do coach
  keyFocusPoints: string[];       // 3-5 pontos chave desta semana
  warningFlags: string[];         // Alertas específicos do perfil
  estimatedResults: string;       // O que esperar nas próximas 4 semanas
}

// ─── Local AI Coach Engine (Garante respostas inteligentes 100% do tempo) ────

export function generateLocalAICoaching(profile: UserProfile, weekPlan: WeekPlan): AICoachResponse {
  const name = profile.name || 'Atleta';
  const goal = profile.primaryGoal || 'equilibrio';
  const weight = profile.weight || 75;
  const days = profile.daysPerWeek || 4;

  const proteinMin = Math.round(weight * 1.8);
  const proteinMax = Math.round(weight * 2.2);

  const coachMessages: Record<string, string> = {
    hipertrofia: `E aí ${name}! Montei sua programação focando no pico de tensão mecânica e volume semanal progressivo. Cada série que você fizer nessa semana tem um propósito estético claro para transformar seu físico. Mantém a constância!`,
    perda_gordura: `Fala ${name}! Seu plano foi otimizado para acelerar o gasto calórico sem perder massa magra. A combinação da musculação intensa com os estímulos de corrida vai derreter gordura preservando sua densidade muscular.`,
    performance: `Olá ${name}! Preparamos um protocolo híbrido de alta performance. O objetivo é desenvolver força bruta nos levantamentos e aumentar seu limiar anaeróbico na corrida, sem interferência negativa.`,
    equilibrio: `Bem-vindo(a) ${name}! Seu plano busca o equilíbrio estético e funcional perfeito. Vamos desenvolver massa muscular de qualidade, melhorar o condicionamento cardiorrespiratório e garantir recuperação adequada.`,
  };

  const nutritionPlans: Record<string, string> = {
    hipertrofia: `Superávit calórico leve (+250 kcal/dia). Consuma entre ${proteinMin}g e ${proteinMax}g de proteína diariamente. Garanta 40g de carboidratos complexos 1h antes do treino para treinar com carga máxima.`,
    perda_gordura: `Déficit calórico moderado (-350 kcal/dia). Mantenha a proteína alta em ${proteinMax}g/dia para preservar massa magra. Hidratação reforçada: mínimo 3.5 litros de água por dia.`,
    performance: `Consumo em normocaloria ajustado. Mantenha ${proteinMin}g-${proteinMax}g de proteína por dia e recarregue carboidratos pós-corrida para acelerar a síntese de glicogênio.`,
    equilibrio: `Alimentação limpa em normocaloria. Alvo de proteína: ~${proteinMin}g/dia. Priorize alimentos integrais, vegetais variados e boa distribuição de macros nas refeições principais.`,
  };

  const quotes: Record<string, string> = {
    hipertrofia: "A força constrói o músculo; a consistência lapida a estética.",
    perda_gordura: "O suor de hoje é a definição de amanhã. Não pule etapas.",
    performance: "Forte na academia, rápido na pista: o atleta híbrido não aceita limites.",
    equilibrio: "Corpo são, mente forte. O treino híbrido é o caminho do equilíbrio.",
  };

  const dailyTips: Record<string, string> = {
    segunda: "Dia de iniciar forte! Foque na execução cadenciada (2s na descida) para máximo recrutamento de fibras.",
    terca: "Atente-se ao controle respiratório e à postura. Mantenha o core ativado durante cada repetição.",
    quarta: "Meio da semana! Garanta uma boa noite de sono de 7 a 8 horas para regenerar o tecido muscular.",
    quinta: "Intensidade em alta. Respeite os tempos de descanso entre as séries para recuperar o ATP muscular.",
    sexta: "Feche a semana útil com chave de ouro! Dê o seu melhor e concentre-se na conexão mente-músculo.",
    sabado: "Treino do fim de semana. Mantenha-se bem hidratado e aproveite a sessão com foco total.",
    domingo: "Dia de recuperação ativa e descanso mental. Faça alongamentos leves, alimente-se bem e prepare-se para a próxima semana.",
  };

  const keyFocusPoints = [
    `Execução limpa e cadenciada nos exercícios base`,
    `Manter meta proteica de ${proteinMin}g/dia`,
    `Respeitar o descanso para evitar sobrecarga articular`,
  ];

  const warningFlags = profile.injuries && profile.injuries.length > 0
    ? profile.injuries.map(inj => `Atenção dobrada ao aquecer e articular ${inj}. Mantenha carga controlada.`)
    : [];

  return {
    coachMessage: coachMessages[goal] || coachMessages.equilibrio,
    weekOverview: `Plano estruturado em ${days} dias ativos de treino. Musculação e corrida divididas estrategicamente para evitar a resposta de interferência e maximizar adaptações metabólicas e hipertróficas.`,
    dailyTips,
    nutritionPlan: nutritionPlans[goal] || nutritionPlans.equilibrio,
    motivationalQuote: quotes[goal] || quotes.equilibrio,
    keyFocusPoints,
    warningFlags,
    estimatedResults: `Em 4 semanas com 90%+ de consistência, você notará maior tônus muscular, aumento de 5-10% na força das cargas principais e melhora na capacidade cardiorrespiratória.`,
  };
}

// ─── Prompt Builder ────────────────────────────────────────────────────────

function buildPrompt(profile: UserProfile, weekPlan: WeekPlan): string {
  const goalMap: Record<string, string> = {
    hipertrofia: 'hipertrofia máxima e estética muscular',
    perda_gordura: 'perda de gordura e definição corporal',
    performance: 'performance atlética híbrida (força + resistência)',
    equilibrio: 'equilíbrio estético, saúde e bem-estar',
  };

  const levelMap: Record<string, string> = {
    iniciante: 'iniciante (menos de 1 ano de treino)',
    intermediario: 'intermediário (1-3 anos de treino)',
    avancado: 'avançado (mais de 3 anos, periodização conhecida)',
  };

  const runLevelMap: Record<string, string> = {
    nenhum: 'não pratica corrida',
    iniciante: 'corredor iniciante',
    intermediario: 'corredor intermediário',
    avancado: 'corredor avançado',
  };

  const weekDays = Object.keys(weekPlan.days);
  const workoutSummary = weekDays.map(day => {
    const w = weekPlan.days[day];
    if (w.type === 'musculacao') {
      return `${day}: Musculação — ${w.title}`;
    } else if (w.type === 'corrida') {
      return `${day}: Corrida — ${w.title} (${w.distance}km)`;
    } else {
      return `${day}: ${w.title}`;
    }
  }).join('\n');

  const bmi = (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1);
  const hasInjuries = profile.injuries && profile.injuries.length > 0;

  return `Você é um coach de treino híbrido de elite especializado em musculação e corrida para atletas que buscam estética e performance.

PERFIL DO ATLETA:
- Nome: ${profile.name || 'Atleta'}
- Idade: ${profile.age} anos | Sexo: ${profile.sex}
- Peso: ${profile.weight}kg | Altura: ${profile.height}cm | IMC: ${bmi}
- Nível de treino: ${levelMap[profile.experienceLevel] || profile.experienceLevel}
- Nível de corrida: ${runLevelMap[profile.runnerLevel] || profile.runnerLevel}
- Objetivo principal: ${goalMap[profile.primaryGoal] || profile.primaryGoal}
- Objetivo estético descrito: "${profile.estheticGoal || 'Não especificado'}"
- Dias de treino: ${profile.daysPerWeek} dias/semana
- Duração das sessões: ${profile.sessionDuration} minutos
- Horário preferido: ${profile.preferredTime}
- Acesso à academia: ${profile.hasGymAccess ? 'Sim' : 'Não (treino em casa)'}
${hasInjuries ? `- Lesões/restrições: ${profile.injuries.join(', ')}` : ''}
${profile.currentPace ? `- Pace atual de corrida: ${profile.currentPace}` : ''}
${profile.runGoal ? `- Objetivo de corrida: ${profile.runGoal}` : ''}

PLANO SEMANAL GERADO:
${workoutSummary}

Total: ${weekPlan.totalKm.toFixed(1)}km de corrida | ${weekPlan.totalVolume} reps de musculação

Responda SOMENTE com um objeto JSON válido (sem markdown, sem \`\`\`, apenas o JSON puro) com esta estrutura exata:

{
  "coachMessage": "Mensagem pessoal e motivadora para ${profile.name || 'o atleta'}, falando diretamente com ele (você), referenciando seu objetivo específico. Seja como um coach real, direto, sem enrolação. 3-4 frases.",
  "weekOverview": "Análise técnica da semana: como os treinos foram organizados para otimizar resultados, qual o foco da semana e o que o atleta deve esperar. 2-3 frases técnicas.",
  "dailyTips": {
    "segunda": "Dica específica e técnica para este treino",
    "terca": "Dica específica e técnica para este treino",
    "quarta": "Dica específica e técnica para este treino",
    "quinta": "Dica específica e técnica para este treino",
    "sexta": "Dica específica e técnica para este treino",
    "sabado": "Dica específica e técnica para este treino",
    "domingo": "Dica sobre o descanso/recuperação"
  },
  "nutritionPlan": "Orientações nutricionais diretas e específicas para o objetivo do atleta: calorias estimadas, proteína mínima, timing pré e pós treino. Seja específico com números.",
  "motivationalQuote": "Uma frase curta e poderosa, original, que resume a filosofia do treino híbrido para este atleta específico.",
  "keyFocusPoints": ["Foco 1 desta semana", "Foco 2", "Foco 3"],
  "warningFlags": ${hasInjuries ? `["Cuidado com ${profile.injuries[0]} nos exercícios de..."]` : '[]'},
  "estimatedResults": "O que o atleta pode esperar ver nas próximas 4 semanas seguindo o plano com consistência. Seja honesto e realista."
}`;
}

// ─── Main Function ──────────────────────────────────────────────────────────

export async function generateAICoaching(profile: UserProfile): Promise<{
  weekPlan: WeekPlan;
  aiCoach: AICoachResponse;
}> {
  const weekPlan = generateWeekPlan(profile, 1);
  const localCoach = generateLocalAICoaching(profile, weekPlan);

  if (!API_KEY) {
    console.log('Usando Motor de IA Coach RYZE integrado.');
    return { weekPlan, aiCoach: localCoach };
  }

  try {
    const prompt = buildPrompt(profile, weekPlan);

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://hybridforge.app',
        'X-Title': 'HYBRID FORGE',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.warn('API OpenRouter indisponível, usando motor de IA local.');
      return { weekPlan, aiCoach: localCoach };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return { weekPlan, aiCoach: localCoach };
    }

    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const aiCoach: AICoachResponse = JSON.parse(cleanContent);
    return { weekPlan, aiCoach };
  } catch (error) {
    console.warn('Falha na requisição de IA, usando motor de IA local:', error);
    return { weekPlan, aiCoach: localCoach };
  }
}

// ─── Store AI coaching in localStorage ─────────────────────────────────────

const AI_COACH_KEY = 'hybridforge_ai_coach';

export function saveAICoach(coach: AICoachResponse): void {
  localStorage.setItem(AI_COACH_KEY, JSON.stringify(coach));
}

export function loadAICoach(): AICoachResponse | null {
  try {
    const raw = localStorage.getItem(AI_COACH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AICoachResponse;
  } catch {
    return null;
  }
}
