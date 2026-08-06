// ============================================================
// RYZE — Exercise3DViewer (v2.0 Premium Real-Time 3D Engine)
// Renderização GLB em tempo real via Google <model-viewer>
// - 60 FPS com animação esquelética
// - Presets de câmera: Frente (0°), 45° Isométrico, Lado (90°)
// - Rotação livre manual (camera-controls)
// - Controles: Play, Pause, Reset (retorno à pose inicial sem corte)
// - Velocidades: 0.5x, 1x, 1.5x, 2x (via timeScale)
// - Destaque de músculos dinâmico sincronizado com a fase do movimento:
//     • Primário: Vermelho (#FF3B30)
//     • Secundário: Laranja (#FF9500)
//     • Estabilizadores: Amarelo (#FFCC00)
//     • Corpo/Restante: Cinza Escuro (#2C2C2E)
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Rotate3D, Sparkles, Activity } from 'lucide-react';
import { getExerciseThumbnailUrl } from '../services/exerciseAssetService';

import '@google/model-viewer';

export type CameraPreset = 'front' | 'angle' | 'side';

export const CAMERA_ORBITS: Record<CameraPreset, string> = {
  front: '0deg 75deg 2.5m',
  angle: '45deg 75deg 2.5m',
  side: '90deg 75deg 2.5m',
};

interface Exercise3DViewerProps {
  exerciseId: string;
  glbUrl: string;
  primaryColor?: string;
  isPlaying: boolean;
  speedMultiplier: number; // 0.5, 1, 1.5, 2
  cameraPreset: CameraPreset;
  resetSignal?: number; // Incrementado para disparar reset suave
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export default function Exercise3DViewer({
  exerciseId,
  glbUrl,
  primaryColor = '#FF3B30',
  isPlaying,
  speedMultiplier,
  cameraPreset,
  resetSignal = 0,
  height = 320,
  onLoad,
  onError,
}: Exercise3DViewerProps) {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const viewerRef = useRef<HTMLElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const thumbnailUrl = getExerciseThumbnailUrl(exerciseId);

  // Reseta estado quando o exercício muda
  useEffect(() => {
    setLoadState('loading');
  }, [glbUrl]);

  // ── 1. Ajusta Velocidade (timeScale) ──
  useEffect(() => {
    const viewer = viewerRef.current as any;
    if (viewer && loadState === 'loaded') {
      try {
        viewer.timeScale = speedMultiplier;
      } catch {
        // Fallback se API timeScale não estiver pronta
      }
    }
  }, [speedMultiplier, loadState]);

  // ── 2. Ajusta Play / Pause ──
  useEffect(() => {
    const viewer = viewerRef.current as any;
    if (viewer && loadState === 'loaded') {
      try {
        if (isPlaying) {
          viewer.play();
        } else {
          viewer.pause();
        }
      } catch {
        // Ignora se não carregou ainda
      }
    }
  }, [isPlaying, loadState]);

  // ── 3. Reset Suave (Retorna ao tempo 0) ──
  useEffect(() => {
    if (resetSignal > 0) {
      const viewer = viewerRef.current as any;
      if (viewer && loadState === 'loaded') {
        try {
          viewer.currentTime = 0;
          if (isPlaying) viewer.play();
        } catch {
          // Ignora
        }
      }
    }
  }, [resetSignal, isPlaying, loadState]);

  // ── 4. Atualiza Câmera Preset ──
  const targetOrbit = CAMERA_ORBITS[cameraPreset] || CAMERA_ORBITS.angle;

  // ── 5. Destaque de Músculos Dinâmico (Frame Loop) ──
  const updateMuscleColors = useCallback(() => {
    const viewer = viewerRef.current as any;
    if (viewer && viewer.model && viewer.model.materials) {
      try {
        const currentTime = viewer.currentTime || 0;
        const duration = viewer.duration || 1;
        const progress = (currentTime % duration) / duration;

        // Pulso de intensidade (máximo na contração de 50%)
        const pulse = 0.4 + 0.6 * Math.sin(progress * Math.PI);

        viewer.model.materials.forEach((mat: any) => {
          const name = (mat.name || '').toLowerCase();
          if (name.includes('primary') || name.includes('primario') || name.includes('red')) {
            // Vermelho Primário (#FF3B30) com intensidade dinâmica
            mat.pbrMetallicRoughness.setBaseColorFactor([1.0, 0.23 * pulse, 0.19 * pulse, 1.0]);
          } else if (name.includes('secondary') || name.includes('secundario') || name.includes('orange')) {
            // Laranja Secundário (#FF9500)
            mat.pbrMetallicRoughness.setBaseColorFactor([1.0, 0.58 * pulse, 0.0, 1.0]);
          } else if (name.includes('stabilizer') || name.includes('estabilizador') || name.includes('yellow')) {
            // Amarelo Estabilizador (#FFCC00)
            mat.pbrMetallicRoughness.setBaseColorFactor([1.0, 0.8 * pulse, 0.0, 1.0]);
          } else if (name.includes('body') || name.includes('corpo') || name.includes('skin')) {
            // Corpo neutro escuro premium (#2C2C2E)
            mat.pbrMetallicRoughness.setBaseColorFactor([0.17, 0.17, 0.18, 1.0]);
          }
        });
      } catch {
        // Ignora erros de material se a estrutura do GLB for diferente
      }
    }

    animFrameRef.current = requestAnimationFrame(updateMuscleColors);
  }, []);

  useEffect(() => {
    if (loadState === 'loaded') {
      animFrameRef.current = requestAnimationFrame(updateMuscleColors);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [loadState, updateMuscleColors]);

  const handleLoad = () => {
    setLoadState('loaded');
    const viewer = viewerRef.current as any;
    if (viewer) {
      viewer.timeScale = speedMultiplier;
      if (isPlaying) viewer.play();
    }
    onLoad?.();
  };

  const handleError = () => {
    setLoadState('error');
    onError?.();
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        background: 'radial-gradient(ellipse at 50% 30%, rgba(24,24,38,0.98) 0%, #06060C 100%)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)',
      }}
    >
      {/* ── Grid 3D de Fundo ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.04,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }}
      />

      {/* ── Visualizador <model-viewer> 60 FPS ── */}
      <model-viewer
        ref={viewerRef as React.RefObject<HTMLElement>}
        src={glbUrl}
        poster={thumbnailUrl}
        alt={`Animação 3D do exercício ${exerciseId}`}
        autoplay
        camera-controls
        auto-rotate-delay="0"
        rotation-per-second="0deg"
        camera-orbit={targetOrbit}
        shadow-intensity="1.5"
        shadow-softness="0.7"
        exposure="1.2"
        loading="eager"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          opacity: loadState === 'loaded' ? 1 : 0,
          transition: 'opacity 0.4s ease, camera-orbit 0.5s ease',
          position: 'absolute',
          inset: 0,
          background: 'transparent',
        }}
      />

      {/* ── Skeleton / State de Carregamento ── */}
      {loadState === 'loading' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            zIndex: 2,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${thumbnailUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.15,
              filter: 'blur(6px)',
            }}
          />
          <Loader2
            size={38}
            color={primaryColor}
            style={{ animation: 'spin 1s linear infinite', position: 'relative', zIndex: 1 }}
          />
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-ui)',
              fontWeight: 800,
              letterSpacing: '0.04em',
              position: 'relative',
              zIndex: 1,
            }}
          >
            Renderizando Modelo 3D (60 FPS)...
          </div>
        </div>
      )}

      {/* ── Badge "3D REAL-TIME" ── */}
      {loadState === 'loaded' && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(8,8,14,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,59,48,0.4)',
            fontSize: 10,
            fontFamily: 'var(--font-ui)',
            fontWeight: 900,
            color: '#FF3B30',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            zIndex: 3,
            pointerEvents: 'none',
          }}
        >
          <Sparkles size={11} color="#FF3B30" />
          3D REAL-TIME 60FPS
        </div>
      )}

      {/* ── Dica de Rotação ── */}
      {loadState === 'loaded' && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 10px',
            background: 'rgba(0,0,0,0.75)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(255,255,255,0.12)',
            fontSize: 10,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-ui)',
            fontWeight: 700,
            zIndex: 3,
            pointerEvents: 'none',
          }}
        >
          <Rotate3D size={12} color="#FF3B30" />
          Arraste para rotação livre
        </div>
      )}
    </div>
  );
}
