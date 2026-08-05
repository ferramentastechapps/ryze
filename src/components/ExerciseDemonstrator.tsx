import { useState, useEffect } from 'react';
import { Play, Pause, FastForward, Activity, Sparkles, RefreshCw } from 'lucide-react';
import type { ExerciseGuide } from '../data/exerciseGuides';

interface ExerciseDemonstratorProps {
  guide: ExerciseGuide;
}

function getPrimaryColor(category: ExerciseGuide['category']): string {
  if (category === 'peito' || category === 'pernas') return '#FF5F1F'; // Neon Orange
  if (category === 'costas' || category === 'gluteos') return '#00D4FF'; // Neon Cyan
  return '#C8FF00'; // Neon Lime
}

// ─── HIGH-PRECISION ANIMATED EXERCISE MOTION ENGINE ─────────────────────────
function AnimatedMotionEngine({ guide, isPlaying, speedMultiplier, primaryColor }: {
  guide: ExerciseGuide;
  isPlaying: boolean;
  speedMultiplier: number;
  primaryColor: string;
}) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'descida' | 'pausa' | 'subida'>('descida');

  useEffect(() => {
    if (!isPlaying) return;

    let startTime = Date.now();
    const cycleDuration = 3600 / speedMultiplier;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) % cycleDuration;
      const pct = elapsed / cycleDuration;
      setProgress(pct);

      if (pct < 0.45) setPhase('descida');
      else if (pct < 0.6) setPhase('pausa');
      else setPhase('subida');
    }, 30);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier]);

  // Motion parameter calculation (0 to 1 smooth sine curve)
  const motionFactor = Math.sin(progress * Math.PI);

  const getMotionTransform = () => {
    switch (guide.motionType) {
      case 'squat':
        // Hip & knee flexion
        return {
          hipY: 10 + motionFactor * 35,
          kneeAngle: motionFactor * 45,
          barY: 10 + motionFactor * 35,
          highlightOpacity: phase === 'subida' ? 1 : 0.4,
        };
      case 'bench_press':
        // Barbell lowering to chest
        return {
          barY: 30 + motionFactor * 40,
          armSpread: motionFactor * 15,
          highlightOpacity: phase === 'subida' ? 1 : 0.3,
        };
      case 'pull_up':
        // Body pulling up to bar
        return {
          bodyY: 45 - motionFactor * 40,
          elbowFlex: motionFactor * 40,
          highlightOpacity: phase === 'subida' ? 1 : 0.4,
        };
      case 'bicep_curl':
        // Forearm flexing up
        return {
          forearmAngle: -motionFactor * 110,
          highlightOpacity: phase === 'subida' ? 1 : 0.3,
        };
      case 'overhead_press':
        // Pressing overhead
        return {
          barY: 40 - motionFactor * 45,
          highlightOpacity: phase === 'subida' ? 1 : 0.3,
        };
      default:
        return {
          offsetY: motionFactor * 20,
          highlightOpacity: 0.7,
        };
    }
  };

  const motion = getMotionTransform();

  return (
    <div style={{
      height: 280,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, rgba(20,20,35,0.9) 0%, rgba(8,8,14,0.98) 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Grid Lines Background */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.05,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />

      {/* Trajectory Guide Line */}
      <svg width="220" height="240" viewBox="0 0 200 220" style={{ position: 'relative', zIndex: 1 }}>
        {/* Outer Circular Progress Ring */}
        <circle cx="100" cy="110" r="95" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" strokeDasharray="4 4" />
        <circle
          cx="100" cy="110" r="95"
          fill="none"
          stroke={primaryColor}
          strokeWidth="3"
          strokeDasharray={2 * Math.PI * 95}
          strokeDashoffset={2 * Math.PI * 95 * (1 - progress)}
          transform="rotate(-90 100 110)"
          style={{ transition: 'stroke-dashoffset 0.03s linear' }}
        />

        {/* MOTION ANIMATED ATHLETE FIGURE */}
        {guide.motionType === 'squat' && (
          <g transform={`translate(0, ${motion.hipY || 0})`} style={{ transition: 'transform 0.05s linear' }}>
            {/* Barbell Weight */}
            <line x1="50" y1="42" x2="150" y2="42" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
            <rect x="42" y="32" width="12" height="20" rx="3" fill={primaryColor} />
            <rect x="146" y="32" width="12" height="20" rx="3" fill={primaryColor} />

            {/* Head */}
            <circle cx="100" cy="35" r="13" fill="#F8FAFC" />
            {/* Spine & Torso */}
            <path d="M100 48 L100 105" stroke="#CBD5E1" strokeWidth="12" strokeLinecap="round" />
            {/* Target Muscle Glow (Quadriceps / Glutes) */}
            <circle cx="100" cy="98" r="18" fill={primaryColor} opacity={motion.highlightOpacity} style={{ filter: `blur(4px)` }} />

            {/* Thighs & Legs */}
            <path d={`M100 105 L${78 - (motion.kneeAngle || 0)} 145 L85 185`} fill="none" stroke="#F1F5F9" strokeWidth="9" strokeLinecap="round" />
            <path d={`M100 105 L${122 + (motion.kneeAngle || 0)} 145 L115 185`} fill="none" stroke="#F1F5F9" strokeWidth="9" strokeLinecap="round" />
          </g>
        )}

        {guide.motionType === 'bench_press' && (
          <g transform="translate(0, 0)">
            {/* Bench */}
            <rect x="60" y="115" width="80" height="8" rx="2" fill="#475569" />
            <rect x="70" y="123" width="6" height="30" fill="#334155" />
            <rect x="124" y="123" width="6" height="30" fill="#334155" />

            {/* Torso lying down */}
            <rect x="68" y="105" width="64" height="12" rx="4" fill="#CBD5E1" />
            <circle cx="62" cy="111" r="11" fill="#F8FAFC" />

            {/* Glowing Peitoral */}
            <circle cx="95" cy="105" r="14" fill={primaryColor} opacity={motion.highlightOpacity} style={{ filter: `blur(4px)` }} />

            {/* Moving Barbell */}
            <g transform={`translate(0, ${motion.barY || 0})`}>
              <line x1="45" y1="50" x2="145" y2="50" stroke="#F8FAFC" strokeWidth="6" strokeLinecap="round" />
              <rect x="36" y="40" width="12" height="20" rx="2" fill={primaryColor} />
              <rect x="142" y="40" width="12" height="20" rx="2" fill={primaryColor} />

              {/* Arms pushing */}
              <path d={`M85 105 L75 ${50 + (motion.barY || 0) * 0.4} L65 50`} fill="none" stroke="#E2E8F0" strokeWidth="7" strokeLinecap="round" />
              <path d={`M115 105 L125 ${50 + (motion.barY || 0) * 0.4} L135 50`} fill="none" stroke="#E2E8F0" strokeWidth="7" strokeLinecap="round" />
            </g>
          </g>
        )}

        {guide.motionType !== 'squat' && guide.motionType !== 'bench_press' && (
          <g transform={`translate(0, ${motion.bodyY || motion.barY || 0})`}>
            {/* Pullup Bar */}
            <line x1="40" y1="30" x2="160" y2="30" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
            {/* Athlete Head & Body */}
            <circle cx="100" cy="55" r="14" fill="#F8FAFC" />
            <path d="M100 68 L100 130" stroke="#CBD5E1" strokeWidth="12" strokeLinecap="round" />
            {/* Muscle highlight */}
            <circle cx="100" cy="90" r="18" fill={primaryColor} opacity={motion.highlightOpacity} style={{ filter: `blur(4px)` }} />
            {/* Arms */}
            <path d="M100 75 L65 40 L45 30" fill="none" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round" />
            <path d="M100 75 L135 40 L155 30" fill="none" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round" />
            {/* Legs */}
            <path d="M100 130 L90 180" stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" />
            <path d="M100 130 L110 180" stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" />
          </g>
        )}
      </svg>

      {/* Phase Indicator Badge */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 'var(--radius-full)',
        background: 'rgba(8,8,14,0.85)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${primaryColor}55`,
        fontSize: 11,
        fontFamily: 'var(--font-ui)',
        fontWeight: 800,
        color: primaryColor,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: primaryColor,
          animation: isPlaying ? 'pulse 1.2s infinite' : 'none',
          flexShrink: 0,
        }} />
        Fase: {phase === 'descida' ? 'Excêntrica (Descida)' : phase === 'pausa' ? 'Isométrica' : 'Concêntrica (Subida)'}
      </div>

      {/* Engine Badge */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        background: 'rgba(0,0,0,0.7)',
        borderRadius: 'var(--radius-full)',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: 10,
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-ui)',
        fontWeight: 700,
      }}>
        <Activity size={12} color={primaryColor} />
        MOTOR DE MOVIMENTO DINÂMICO RYZE 60FPS
      </div>
    </div>
  );
}

export default function ExerciseDemonstrator({ guide }: ExerciseDemonstratorProps) {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  const primaryColor = getPrimaryColor(guide.category);
  const hasGif = guide.gifUrls && guide.gifUrls.length > 0 && !mediaError;

  const handleMediaError = () => {
    // Se a URL atual falhar, tenta a próxima da lista
    if (guide.gifUrls && currentUrlIndex < guide.gifUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
    } else {
      setMediaError(true);
      setMediaLoaded(false);
    }
  };

  const handleMediaLoad = () => {
    setMediaLoaded(true);
    setMediaError(false);
  };

  const toggleSpeed = () => {
    if (speedMultiplier === 1) setSpeedMultiplier(1.5);
    else if (speedMultiplier === 1.5) setSpeedMultiplier(0.5);
    else setSpeedMultiplier(1);
  };

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
    }}>
      {/* ── Visual Media Container ── */}
      <div style={{
        position: 'relative',
        background: '#06060C',
        minHeight: 240,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* GIF / Image Stream */}
        {hasGif && (
          <img
            src={guide.gifUrls[currentUrlIndex]}
            alt={`Demonstração de ${guide.name}`}
            onLoad={handleMediaLoad}
            onError={handleMediaError}
            style={{
              display: mediaLoaded ? 'block' : 'none',
              width: '100%',
              height: 'auto',
              maxHeight: 340,
              objectFit: 'contain',
              filter: isPlaying ? 'none' : 'brightness(0.7)',
              transition: 'filter 0.2s',
            }}
          />
        )}

        {/* Multi-Source Loading Skeleton */}
        {hasGif && !mediaLoaded && !mediaError && (
          <div style={{
            width: '100%',
            height: 260,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 44,
              height: 44,
              border: `3px solid ${primaryColor}33`,
              borderTopColor: primaryColor,
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>
              Carregando animação de movimento...
            </div>
          </div>
        )}

        {/* Fallback to Animated High-Precision Engine */}
        {(!hasGif || mediaError) && (
          <AnimatedMotionEngine
            guide={guide}
            isPlaying={isPlaying}
            speedMultiplier={speedMultiplier}
            primaryColor={primaryColor}
          />
        )}

        {/* Live Badge */}
        {mediaLoaded && !mediaError && (
          <div style={{
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
            border: `1px solid ${primaryColor}55`,
            fontSize: 10,
            fontFamily: 'var(--font-ui)',
            fontWeight: 800,
            color: primaryColor,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            <Sparkles size={12} color={primaryColor} />
            DEMONSTRAÇÃO HD
          </div>
        )}

        {/* Activation Index Badge */}
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          padding: '5px 12px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(8,8,14,0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)',
          fontSize: 11,
          fontFamily: 'var(--font-ui)',
          fontWeight: 800,
          color: 'var(--text-primary)',
        }}>
          ⚡ <span style={{ color: primaryColor }}>{guide.activationLevel}%</span>
        </div>
      </div>

      {/* ── Interactive Bar ── */}
      <div style={{
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              width: 36, height: 36,
              borderRadius: '50%',
              background: isPlaying ? 'rgba(255,255,255,0.08)' : primaryColor,
              color: isPlaying ? 'var(--text-primary)' : '#08080E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: isPlaying ? '1px solid rgba(255,255,255,0.12)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
          </button>

          {/* Speed Toggle */}
          <button
            onClick={toggleSpeed}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <FastForward size={12} />
            {speedMultiplier}x Velocidade
          </button>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>
          Cadência: <span style={{ color: 'var(--text-primary)' }}>{guide.tempo}</span>
        </div>
      </div>
    </div>
  );
}
