// ============================================================
// RYZE — ExerciseDB Service (V1 API Integration & Local Cache)
// ============================================================

const EXERCISE_DB_BASE_URL = 'https://oss.exercisedb.dev/api/v1/exercises';
const CACHE_PREFIX = 'ryze_gif_cache_v1_';

export interface ExerciseDbDetails {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles?: string[];
  bodyParts?: string[];
  equipments?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
}

/**
 * Busca o gifUrl do exercício pelo exerciseDbId.
 * Prioriza o cache local (localStorage). Se não existir, faz a chamada à API e salva no cache.
 * Retorna null se exerciseDbId for inválido, nulo ou se a requisição falhar.
 */
export async function getExerciseGifUrl(exerciseDbId: string | null | undefined): Promise<string | null> {
  if (!exerciseDbId) return null;

  const cacheKey = `${CACHE_PREFIX}${exerciseDbId}`;

  // 1. Tenta recuperar do cache local
  try {
    const cachedUrl = localStorage.getItem(cacheKey);
    if (cachedUrl) {
      return cachedUrl;
    }
  } catch (err) {
    console.warn('[ExerciseDB] Erro ao ler cache local:', err);
  }

  // 2. Chama a API da ExerciseDB se não estiver em cache
  try {
    const response = await fetch(`${EXERCISE_DB_BASE_URL}/${exerciseDbId}`);
    if (!response.ok) {
      console.warn(`[ExerciseDB] Falha na API HTTP ${response.status} para ID: ${exerciseDbId}`);
      return null;
    }

    const result = await response.json();
    if (result && result.success && result.data && result.data.gifUrl) {
      const gifUrl = result.data.gifUrl;

      // 3. Salva no cache local
      try {
        localStorage.setItem(cacheKey, gifUrl);
      } catch (err) {
        console.warn('[ExerciseDB] Erro ao salvar cache local:', err);
      }

      return gifUrl;
    }
  } catch (err) {
    console.error('[ExerciseDB] Erro ao buscar GIF na API:', err);
  }

  return null;
}

/**
 * Força a atualização do cache para um exerciseDbId específico.
 */
export async function refreshExerciseGifUrl(exerciseDbId: string): Promise<string | null> {
  if (!exerciseDbId) return null;
  const cacheKey = `${CACHE_PREFIX}${exerciseDbId}`;
  try {
    localStorage.removeItem(cacheKey);
  } catch (e) {
    // ignore
  }
  return getExerciseGifUrl(exerciseDbId);
}

// ─── REDE DE SEGURANÇA (somente em DEV) ──────────────────────────────────────
// Detecta gifUrls e exerciseDbIds duplicados antes que cheguem ao usuário.
// Disparado automaticamente na inicialização do módulo.

/**
 * Verifica se dois exercícios distintos resolveram para o mesmo gifUrl no cache
 * local. Emite console.warn para cada colisão detectada.
 * Deve ser chamado após o carregamento inicial ou ao término de um ciclo de resolução.
 *
 * @param exerciseMap Record<exerciseId, exerciseDbId | null>
 */
export function warnDuplicateGifUrls(exerciseMap: Record<string, string | null | undefined>): void {
  if (!import.meta.env.DEV) return;

  const gifUrlToIds: Record<string, string[]> = {};

  for (const [exerciseId, exerciseDbId] of Object.entries(exerciseMap)) {
    if (!exerciseDbId) continue;
    const cacheKey = `${CACHE_PREFIX}${exerciseDbId}`;
    let gifUrl: string | null = null;
    try {
      gifUrl = localStorage.getItem(cacheKey);
    } catch {
      continue;
    }
    if (!gifUrl) continue;

    if (!gifUrlToIds[gifUrl]) gifUrlToIds[gifUrl] = [];
    gifUrlToIds[gifUrl].push(exerciseId);
  }

  for (const [gifUrl, ids] of Object.entries(gifUrlToIds)) {
    if (ids.length > 1) {
      console.warn(
        `[RYZE][DEV] ⚠️ gifUrl DUPLICADO detectado!\n` +
        `  GIF: ${gifUrl}\n` +
        `  Exercícios com esse mesmo GIF: ${ids.join(', ')}\n` +
        `  Verifique os exerciseDbIds em exerciseGuides.ts`,
      );
    }
  }
}

/**
 * Verifica se dois exercícios no mapa estático têm o mesmo exerciseDbId.
 * Emite console.warn para cada colisão detectada.
 *
 * @param exerciseMap Record<exerciseId, exerciseDbId | null>
 */
export function warnDuplicateExerciseDbIds(exerciseMap: Record<string, string | null | undefined>): void {
  if (!import.meta.env.DEV) return;

  const dbIdToExercises: Record<string, string[]> = {};

  for (const [exerciseId, exerciseDbId] of Object.entries(exerciseMap)) {
    if (!exerciseDbId) continue;
    if (!dbIdToExercises[exerciseDbId]) dbIdToExercises[exerciseDbId] = [];
    dbIdToExercises[exerciseDbId].push(exerciseId);
  }

  for (const [dbId, ids] of Object.entries(dbIdToExercises)) {
    if (ids.length > 1) {
      console.warn(
        `[RYZE][DEV] ⚠️ exerciseDbId DUPLICADO detectado!\n` +
        `  exerciseDbId: "${dbId}"\n` +
        `  Exercícios afetados: ${ids.join(', ')}\n` +
        `  Resultado: todos mostrariam o mesmo GIF. Corrija em exerciseGuides.ts`,
      );
    }
  }
}
