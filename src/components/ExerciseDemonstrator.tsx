import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Camera, Activity, Sparkles, Zap, Loader2, Film } from 'lucide-react';
import type { ExerciseGuide } from '../data/exerciseGuides';
import Exercise3DViewer from './Exercise3DViewer';
import type { CameraPreset } from './Exercise3DViewer';
import { getExerciseGLBUrl } from '../services/exerciseAssetService';
import { getExerciseGifUrl } from '../services/exerciseDbService';

interface ExerciseDemonstratorProps {
  guide: ExerciseGuide;
}

// ── COLOR PALETTE CONSTANTS (BIOMECHANICAL HIGHLIGHT) ──
const MUSCLE_COLORS = {
  primary: '#FF3B30',    // Vermelho (Músculo Alvo Primário)
  secondary: '#FF9500',  // Laranja (Músculo Secundário / Sinergista)
  stabilizer: '#FFCC00', // Amarelo (Músculo Estabilizador)
  body: '#2C2C2E',       // Cinza Escuro (Estrutura Corporal / Osso)
  bodyAccent: '#3A3A3C', // Cinza Médio (Contorno)
};

// ─── EXERCISEDB GIF VIEWER COMPONENT ───
function ExerciseGifViewer({
  exerciseDbId,
  guideName,
  isPlaying,
  onError,
}: {
  exerciseDbId: string;
  guideName: string;
  isPlaying: boolean;
  onError: () => void;
}) {
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    let isMounted = true;
    setLoadingState('loading');

    getExerciseGifUrl(exerciseDbId)
      .then((url) => {
        if (!isMounted) return;
        if (url) {
          setGifUrl(url);
        } else {
          setLoadingState('error');
          onError();
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadingState('error');
        onError();
      });

    return () => {
      isMounted = false;
    };
  }, [exerciseDbId]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 280,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, rgba(28,28,45,0.95) 0%, rgba(8,8,14,0.98) 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Background Subtle Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.04,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Dark Mode Skeleton / Spinner (Passo 5) */}
      {loadingState === 'loading' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            zIndex: 2,
          }}
        >
          <Loader2 size={32} color={MUSCLE_COLORS.primary} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>
            Carregando GIF de Exercício Real...
          </span>
        </div>
      )}

      {/* Real Exercise GIF (Passo 1 & 4) */}
      {gifUrl && (
        <img
          src={gifUrl}
          alt={`GIF de demonstração do exercício ${guideName}`}
          onLoad={() => setLoadingState('loaded')}
          onError={() => {
            setLoadingState('error');
            onError();
          }}
          style={{
            maxHeight: '92%',
            maxWidth: '92%',
            objectFit: 'contain',
            borderRadius: 'var(--radius-md)',
            display: loadingState === 'loaded' ? 'block' : 'none',
            filter: isPlaying ? 'none' : 'grayscale(40%) brightness(0.7)',
            transition: 'filter 0.3s ease',
            zIndex: 1,
          }}
        />
      )}

      {/* Badge "GIF REAL" (Estilo 3D REAL-TIME) */}
      {loadingState === 'loaded' && (
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
            border: `1px solid ${MUSCLE_COLORS.primary}66`,
            fontSize: 10,
            fontFamily: 'var(--font-ui)',
            fontWeight: 900,
            color: MUSCLE_COLORS.primary,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          <Film size={12} color={MUSCLE_COLORS.primary} />
          GIF REAL
        </div>
      )}
    </div>
  );
}

// ─── HIGH-PRECISION ANIMATED EXERCISE MOTION ENGINE (SVG FALLBACK 60FPS) ──
function AnimatedMotionEngine({ guide, isPlaying, speedMultiplier, cameraPreset, resetSignal }: {
  guide: ExerciseGuide;
  isPlaying: boolean;
  speedMultiplier: number;
  cameraPreset: CameraPreset;
  resetSignal: number;
}) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'setup' | 'execucao' | 'contracao' | 'retorno'>('setup');

  useEffect(() => {
    if (resetSignal > 0) {
      setProgress(0);
      setPhase('setup');
    }
  }, [resetSignal]);

  useEffect(() => {
    if (!isPlaying) return;

    const cycleDuration = 3600 / speedMultiplier;
    const interval = setInterval(() => {
      const elapsed = Date.now() % cycleDuration;
      const pct = elapsed / cycleDuration;
      setProgress(pct);

      if (pct < 0.1) setPhase('setup');
      else if (pct < 0.45) setPhase('execucao'); // Descida (Excêntrica)
      else if (pct < 0.6) setPhase('contracao'); // Contração Máxima (Isométrica)
      else setPhase('retorno');                   // Subida (Concêntrica)
    }, 16); // ~60 FPS

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier]);

  // Easing suave (sine wave 0..1..0)
  const motionFactor = Math.sin(progress * Math.PI);

  // Intensidade do destaque muscular dinâmico (pico na contração máxima)
  const pulseIntensity = 0.5 + 0.5 * motionFactor;

  // Transformações por tipo de movimento
  const getMotionTransform = () => {
    switch (guide.motionType) {
      case 'squat':
        return {
          hipY: 10 + motionFactor * 36,
          kneeAngle: motionFactor * 48,
          barY: 10 + motionFactor * 36,
        };
      case 'bench_press':
        return {
          barY: 28 + motionFactor * 42,
          armSpread: motionFactor * 16,
        };
      case 'pull_up':
        return {
          bodyY: 45 - motionFactor * 42,
          elbowFlex: motionFactor * 42,
        };
      case 'bicep_curl':
        return {
          forearmAngle: -motionFactor * 115,
        };
      case 'overhead_press':
        return {
          barY: 42 - motionFactor * 46,
        };
      default:
        return {
          offsetY: motionFactor * 22,
        };
    }
  };

  const motion = getMotionTransform();

  // Rotação de perspectiva baseada no preset da câmera
  const getCameraTransform = () => {
    if (cameraPreset === 'side') return 'scaleX(0.7) rotateY(45deg)';
    if (cameraPreset === 'angle') return 'scaleX(0.88)';
    return 'none'; // Frontal
  };

  return (
    <div style={{
      height: 280, width: '100%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, rgba(28,28,45,0.95) 0%, rgba(8,8,14,0.98) 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />

      <svg
        width="240" height="240" viewBox="0 0 200 220"
        style={{
          position: 'relative', zIndex: 1,
          transform: getCameraTransform(),
          transition: 'transform 0.4s ease-out',
        }}
      >
        {/* Anel de Ciclo de Repetição */}
        <circle cx="100" cy="110" r="95" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" strokeDasharray="4 4" />
        <circle
          cx="100" cy="110" r="95" fill="none"
          stroke={MUSCLE_COLORS.primary} strokeWidth="3"
          strokeDasharray={2 * Math.PI * 95} strokeDashoffset={2 * Math.PI * 95 * (1 - progress)}
          transform="rotate(-90 100 110)" style={{ transition: 'stroke-dashoffset 0.02s linear' }}
        />

        {/* ══ MOVIMENTO: AGACHAMENTO (SQUAT) ══ */}
        {guide.motionType === 'squat' && (
          <g transform={`translate(0, ${motion.hipY || 0})`}>
            {/* Barra */}
            <line x1="45" y1="42" x2="155" y2="42" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
            <rect x="36" y="32" width="12" height="20" rx="3" fill={MUSCLE_COLORS.primary} />
            <rect x="152" y="32" width="12" height="20" rx="3" fill={MUSCLE_COLORS.primary} />

            {/* Cabeça */}
            <circle cx="100" cy="35" r="13" fill={MUSCLE_COLORS.body} stroke={MUSCLE_COLORS.bodyAccent} strokeWidth="2" />
            {/* Coluna / Tronco */}
            <path d="M100 48 L100 105" stroke={MUSCLE_COLORS.body} strokeWidth="12" strokeLinecap="round" />

            {/* 🔥 MÚSCULOS DESTAQUE BIOMECÂNICO */}
            {/* Quadríceps (Primário: Vermelho + Pulso) */}
            <circle
              cx="100" cy="98" r="22"
              fill={MUSCLE_COLORS.primary}
              opacity={pulseIntensity * 0.85}
              style={{ filter: `blur(6px)` }}
            />
            {/* Glúteos (Secundário: Laranja) */}
            <circle
              cx="100" cy="112" r="16"
              fill={MUSCLE_COLORS.secondary}
              opacity={pulseIntensity * 0.7}
              style={{ filter: `blur(4px)` }}
            />
            {/* Core (Estabilizador: Amarelo) */}
            <rect
              x="92" y="65" width="16" height="30" rx="4"
              fill={MUSCLE_COLORS.stabilizer}
              opacity={0.5 + pulseIntensity * 0.4}
              style={{ filter: `blur(3px)` }}
            />

            {/* Coxas & Pernas */}
            <path d={`M100 105 L${78 - (motion.kneeAngle || 0)} 145 L85 185`} fill="none" stroke="#F1F5F9" strokeWidth="9" strokeLinecap="round" />
            <path d={`M100 105 L${122 + (motion.kneeAngle || 0)} 145 L115 185`} fill="none" stroke="#F1F5F9" strokeWidth="9" strokeLinecap="round" />
          </g>
        )}

        {/* ══ MOVIMENTO: SUPINO (BENCH PRESS) ══ */}
        {guide.motionType === 'bench_press' && (
          <g>
            {/* Banco */}
            <rect x="55" y="115" width="90" height="8" rx="2" fill={MUSCLE_COLORS.bodyAccent} />
            <rect x="65" y="123" width="6" height="30" fill={MUSCLE_COLORS.body} />
            <rect x="129" y="123" width="6" height="30" fill={MUSCLE_COLORS.body} />

            {/* Tronco deitado */}
            <rect x="65" y="105" width="70" height="12" rx="4" fill={MUSCLE_COLORS.body} />
            <circle cx="58" cy="111" r="11" fill={MUSCLE_COLORS.body} stroke={MUSCLE_COLORS.bodyAccent} strokeWidth="1.5" />

            {/* 🔥 Peitoral (Primário: Vermelho) */}
            <circle
              cx="95" cy="105" r="18"
              fill={MUSCLE_COLORS.primary}
              opacity={pulseIntensity * 0.9}
              style={{ filter: `blur(5px)` }}
            />
            {/* Tríceps (Secundário: Laranja) */}
            <circle
              cx="118" cy="100" r="12"
              fill={MUSCLE_COLORS.secondary}
              opacity={pulseIntensity * 0.75}
              style={{ filter: `blur(3px)` }}
            />
            {/* Deltoide (Estabilizador: Amarelo) */}
            <circle
              cx="75" cy="105" r="10"
              fill={MUSCLE_COLORS.stabilizer}
              opacity={0.6 * pulseIntensity}
              style={{ filter: `blur(3px)` }}
            />

            {/* Barra em movimento */}
            <g transform={`translate(0, ${motion.barY || 0})`}>
              <line x1="42" y1="50" x2="158" y2="50" stroke="#F8FAFC" strokeWidth="6" strokeLinecap="round" />
              <rect x="32" y="40" width="12" height="20" rx="2" fill={MUSCLE_COLORS.primary} />
              <rect x="156" y="40" width="12" height="20" rx="2" fill={MUSCLE_COLORS.primary} />
              <path d={`M85 105 L75 ${50 + (motion.barY || 0) * 0.4} L65 50`} fill="none" stroke="#E2E8F0" strokeWidth="7" strokeLinecap="round" />
              <path d={`M115 105 L125 ${50 + (motion.barY || 0) * 0.4} L135 50`} fill="none" stroke="#E2E8F0" strokeWidth="7" strokeLinecap="round" />
            </g>
          </g>
        )}

        {/* ══ OUTROS MOVIMENTOS (GENÉRICO / COSTAS / OMBROS) ══ */}
        {guide.motionType !== 'squat' && guide.motionType !== 'bench_press' && (
          <g transform={`translate(0, ${(motion as any).bodyY || (motion as any).barY || 0})`}>
            <line x1="38" y1="30" x2="162" y2="30" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
            <circle cx="100" cy="55" r="14" fill={MUSCLE_COLORS.body} stroke={MUSCLE_COLORS.bodyAccent} strokeWidth="2" />
            <path d="M100 68 L100 130" stroke={MUSCLE_COLORS.body} strokeWidth="12" strokeLinecap="round" />

            {/* Músculo Alvo */}
            <circle
              cx="100" cy="90" r="20"
              fill={MUSCLE_COLORS.primary}
              opacity={pulseIntensity * 0.9}
              style={{ filter: `blur(5px)` }}
            />
            <circle
              cx="100" cy="115" r="14"
              fill={MUSCLE_COLORS.secondary}
              opacity={pulseIntensity * 0.7}
              style={{ filter: `blur(4px)` }}
            />

            <path d="M100 75 L65 40 L45 30" fill="none" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round" />
            <path d="M100 75 L135 40 L155 30" fill="none" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round" />
            <path d="M100 130 L90 180" stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" />
            <path d="M100 130 L110 180" stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" />
          </g>
        )}
      </svg>

      {/* Badge da Fase Atual do Movimento */}
      <div style={{
        position: 'absolute', top: 12, left: 12,
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 'var(--radius-full)',
        background: 'rgba(8,8,14,0.85)', backdropFilter: 'blur(12px)',
        border: `1px solid ${MUSCLE_COLORS.primary}66`,
        fontSize: 11, fontFamily: 'var(--font-ui)', fontWeight: 900,
        color: MUSCLE_COLORS.primary, letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: MUSCLE_COLORS.primary,
          animation: isPlaying ? 'pulse 1s infinite' : 'none', flexShrink: 0,
        }} />
        Fase:{' '}
        {phase === 'setup'
          ? 'Posição Inicial'
          : phase === 'execucao'
          ? 'Execução (Excêntrica)'
          : phase === 'contracao'
          ? 'Contração Máxima'
          : 'Retorno (Concêntrica)'}
      </div>

      <div style={{
        position: 'absolute', bottom: 12,
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 12px', background: 'rgba(0,0,0,0.75)',
        borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,0.1)',
        fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 700,
      }}>
        <Activity size={12} color={MUSCLE_COLORS.primary} />
        SISTEMA DE ANIMAÇÃO REAL-TIME 60FPS
      </div>
    </div>
  );
}

export default function ExerciseDemonstrator({ guide }: ExerciseDemonstratorProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('angle');
  const [resetSignal, setResetSignal] = useState(0);
  const [use3D, setUse3D] = useState(guide.has3d);
  const [gifFailed, setGifFailed] = useState(false);

  const glbUrl = guide.glbUrl ?? getExerciseGLBUrl(guide.id);

  useEffect(() => {
    setUse3D(!!guide.has3d);
    setGifFailed(false);
  }, [guide.id, guide.has3d, guide.exerciseDbId]);

  const handleReset = () => {
    setResetSignal(prev => prev + 1);
  };

  const speeds = [0.5, 1, 1.5, 2];
  const cameraOptions: { id: CameraPreset; label: string }[] = [
    { id: 'front', label: 'Frente (0°)' },
    { id: 'angle', label: '45° Isométrico' },
    { id: 'side', label: 'Lado (90°)' },
  ];

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
    }}>
      {/* ── Viewport da Animação ── */}
      <div style={{
        position: 'relative', background: '#06060C',
        minHeight: 280, display: 'flex',
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        {use3D ? (
          <Exercise3DViewer
            exerciseId={guide.id}
            glbUrl={glbUrl}
            primaryColor={MUSCLE_COLORS.primary}
            isPlaying={isPlaying}
            speedMultiplier={speedMultiplier}
            cameraPreset={cameraPreset}
            resetSignal={resetSignal}
            height={320}
            onError={() => setUse3D(false)}
          />
        ) : guide.exerciseDbId && !gifFailed ? (
          <ExerciseGifViewer
            exerciseDbId={guide.exerciseDbId}
            guideName={guide.name}
            isPlaying={isPlaying}
            onError={() => setGifFailed(true)}
          />
        ) : (
          <AnimatedMotionEngine
            guide={guide}
            isPlaying={isPlaying}
            speedMultiplier={speedMultiplier}
            cameraPreset={cameraPreset}
            resetSignal={resetSignal}
          />
        )}

        {/* Badge de Ativação Muscular */}
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 5,
          padding: '5px 12px', borderRadius: 'var(--radius-full)',
          background: 'rgba(8,8,14,0.85)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)',
          fontSize: 11, fontFamily: 'var(--font-ui)', fontWeight: 900,
          color: 'var(--text-primary)', pointerEvents: 'none',
        }}>
          ⚡ <span style={{ color: MUSCLE_COLORS.primary }}>{guide.activationLevel}%</span> Ativação
        </div>
      </div>

      {/* ── PAINEL DE CONTROLES PREMIUM ── */}
      <div style={{
        padding: '14px 18px',
        display: 'flex', flexDirection: 'column', gap: 12,
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        {/* Linha 1: Controles de Reprodução (Play, Pause, Reset, Velocidades) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          {/* Play, Pause, Reset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pausar' : 'Reproduzir'}
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: isPlaying ? 'rgba(255,255,255,0.08)' : MUSCLE_COLORS.primary,
                color: isPlaying ? 'var(--text-primary)' : '#08080E',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: isPlaying ? '1px solid rgba(255,255,255,0.15)' : 'none',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: isPlaying ? 'none' : `0 0 16px ${MUSCLE_COLORS.primary}66`,
              }}
            >
              {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
            </button>

            <button
              onClick={handleReset}
              title="Reiniciar Posição Inicial"
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Seletor de Velocidades (0.5x, 1x, 1.5x, 2x) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(0,0,0,0.4)', padding: 3,
            borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {speeds.map(s => (
              <button
                key={s}
                onClick={() => setSpeedMultiplier(s)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: speedMultiplier === s ? MUSCLE_COLORS.primary : 'transparent',
                  color: speedMultiplier === s ? '#FFFFFF' : 'var(--text-muted)',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 900,
                  fontSize: 11,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Linha 2: Seletor Ângulo de Câmera & Legenda de Cores Musculares */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 10, paddingTop: 10,
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          {/* 
            Câmeras / Seletor de Ângulo
            NOTA / LIMITAÇÃO CONHECIDA: O seletor de ângulo (Frente/45°/Lado) permanece visível na UI 
            para manter consistência e funcionalidade no modelo 3D e no fallback SVG. 
            Contudo, quando um GIF 2D da ExerciseDB estiver ativo, a troca de ângulo não alterará 
            a perspectiva do GIF, pois a mídia enviada pela API é um GIF plano 2D.
          */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Camera size={13} color="var(--text-muted)" style={{ marginRight: 2 }} />
            {cameraOptions.map(cam => (
              <button
                key={cam.id}
                onClick={() => setCameraPreset(cam.id)}
                style={{
                  padding: '5px 11px',
                  borderRadius: 'var(--radius-md)',
                  border: cameraPreset === cam.id ? `1px solid ${MUSCLE_COLORS.primary}88` : '1px solid rgba(255,255,255,0.08)',
                  background: cameraPreset === cam.id ? `${MUSCLE_COLORS.primary}22` : 'rgba(255,255,255,0.03)',
                  color: cameraPreset === cam.id ? '#FFFFFF' : 'var(--text-muted)',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 800,
                  fontSize: 11,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {cam.label}
              </button>
            ))}
          </div>

          {/* Legenda de Ativação por Cor */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            fontSize: 10, fontFamily: 'var(--font-ui)', fontWeight: 800,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: MUSCLE_COLORS.primary }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: MUSCLE_COLORS.primary }} />
              Primário
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: MUSCLE_COLORS.secondary }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: MUSCLE_COLORS.secondary }} />
              Secundário
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: MUSCLE_COLORS.stabilizer }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: MUSCLE_COLORS.stabilizer }} />
              Estabilizador
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
