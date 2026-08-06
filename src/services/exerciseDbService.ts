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
