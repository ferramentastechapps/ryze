// ============================================================
// HYBRID FORGE — Gemini 2.5 Flash via OpenRouter
// ============================================================

import type { UserProfile, WeekPlan } from '../types';
import { generateWeekPlan } from '../engine/aiEngine';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
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
  aiCoach: AICoachResponse | null;
}> {
  // Always generate the structural plan first (fast, reliable)
  const weekPlan = generateWeekPlan(profile, 1);

  if (!API_KEY) {
    console.warn('OpenRouter API key not found. Using rule-based engine only.');
    return { weekPlan, aiCoach: null };
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
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return { weekPlan, aiCoach: null };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in response');
      return { weekPlan, aiCoach: null };
    }

    // Parse JSON response
    let aiCoach: AICoachResponse;
    try {
      // Remove any potential markdown code blocks
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      aiCoach = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, content);
      return { weekPlan, aiCoach: null };
    }

    return { weekPlan, aiCoach };
  } catch (error) {
    console.error('Failed to call OpenRouter:', error);
    return { weekPlan, aiCoach: null };
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
