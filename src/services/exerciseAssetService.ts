// ============================================================
// RYZE — Exercise Asset Service
// Gerencia URLs de assets 3D via Supabase Storage
// ============================================================
//
// ESTRUTURA NO SUPABASE STORAGE (bucket: "exercises"):
//
//   exercises/
//   └── {exercise_id}/
//       ├── animation.glb     ← Modelo 3D + animação (loop)
//       └── thumbnail.webp    ← Preview estático para loading rápido
//
// COMO ADICIONAR UM NOVO EXERCÍCIO COM 3D:
//   1. Faça upload dos arquivos no bucket "exercises" do Supabase Storage
//   2. Defina o bucket como PUBLIC (Settings > Storage > Policies)
//   3. Adicione "has3d: true" no exercício em exerciseGuides.ts
//   4. Zero alteração de código necessária
// ============================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const BUCKET_NAME = 'exercises';

/**
 * Retorna a URL pública do arquivo GLB de um exercício no Supabase Storage.
 * Retorna undefined se o exercício não tem asset 3D configurado.
 */
export function getExerciseGLBUrl(exerciseId: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${exerciseId}/animation.glb`;
}

/**
 * Retorna a URL pública do thumbnail WebP de um exercício.
 * Usado como poster (imagem de preview enquanto o GLB carrega).
 */
export function getExerciseThumbnailUrl(exerciseId: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${exerciseId}/thumbnail.webp`;
}

/**
 * Verifica se um GLB existe no Supabase Storage fazendo uma requisição HEAD.
 * Retorna true se o arquivo existe e está acessível.
 * Útil para validar se o asset foi uploadado corretamente.
 */
export async function checkGLBExists(exerciseId: string): Promise<boolean> {
  try {
    const url = getExerciseGLBUrl(exerciseId);
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
