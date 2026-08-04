import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import type { ExerciseGuide } from '../data/exerciseGuides';

interface ExerciseDemonstratorProps {
  guide: ExerciseGuide;
}

export default function ExerciseDemonstrator({ guide }: ExerciseDemonstratorProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [phase, setPhase] = useState<'excêntrica' | 'pausa' | 'concêntrica'>('excêntrica');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    let startTime = Date.now();
    const cycleDuration = 4000;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) % cycleDuration;
      const pct = elapsed / cycleDuration;
      setProgress(pct);

      if (pct < 0.6) {
        setPhase('excêntrica');
      } else if (pct < 0.75) {
        setPhase('pausa');
      } else {
        setPhase('concêntrica');
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const primaryColor = guide.category === 'peito' || guide.category === 'pernas'
    ? 'var(--accent-orange)'
    : guide.category === 'costas' || guide.category === 'gluteos'
    ? 'var(--accent-cyan)'
    : 'var(--accent-lime)';

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Image / SVG container */}
      <div style={{
        position: 'relative',
        background: '#0B0B14',
        overflow: 'hidden',
      }}>
        {guide.image ? (
          /* ── Real image: let it flow naturally ── */
          <img
            src={guide.image}
            alt={guide.name}
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
            }}
          />
        ) : (
          /* ── SVG fallback animation ── */
          <div style={{
            height: 300,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="180" height="180" viewBox="0 0 200 200">
              {/* Outer ring */}
              <circle cx="100" cy="100" r="85" fill="none" stroke="var(--border-subtle)" strokeWidth="2" strokeDasharray="4 4" />
              {/* Progress ring */}
              <circle
                cx="100" cy="100" r="85"
                fill="none"
                stroke={primaryColor}
                strokeWidth="3"
                strokeDasharray={2 * Math.PI * 85}
                strokeDashoffset={2 * Math.PI * 85 * (1 - progress)}
                transform="rotate(-90 100 100)"
                style={{ transition: 'stroke-dashoffset 0.05s linear' }}
              />
              {/* Animated figure */}
              <g transform={
                phase === 'excêntrica'
                  ? 'translate(0, 10) scale(0.95)'
                  : phase === 'concêntrica'
                  ? 'translate(0, -6) scale(1.05)'
                  : 'translate(0, 0)'
              } style={{ transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', transformOrigin: '100px 100px' }}>
                <circle cx="100" cy="55" r="14" fill="var(--text-primary)" />
                <path d="M 82 75 L 118 75 L 110 120 L 90 120 Z" fill="var(--text-secondary)" />
                <circle cx="100" cy="90" r="18" fill={primaryColor} opacity={phase === 'concêntrica' ? '0.85' : '0.4'} />
                <path d="M 78 78 L 55 105 L 70 125" fill="none" stroke="var(--text-primary)" strokeWidth="6" strokeLinecap="round" />
                <path d="M 122 78 L 145 105 L 130 125" fill="none" stroke="var(--text-primary)" strokeWidth="6" strokeLinecap="round" />
                <path d="M 92 120 L 80 160 L 85 180" fill="none" stroke="var(--text-secondary)" strokeWidth="7" strokeLinecap="round" />
                <path d="M 108 120 L 120 160 L 115 180" fill="none" stroke="var(--text-secondary)" strokeWidth="7" strokeLinecap="round" />
              </g>
            </svg>
            <div style={{
              position: 'absolute',
              bottom: 12,
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}>
              SIMULADOR DE MOVIMENTO ANATÔMICO
            </div>
          </div>
        )}

        {/* Phase badge — overlaid on image */}
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
          fontWeight: 700,
          color: primaryColor,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: primaryColor,
            animation: 'pulse 1.5s infinite',
            flexShrink: 0,
          }} />
          Fase: {phase}
        </div>

        {/* Activation badge — overlaid on image */}
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(8,8,14,0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-subtle)',
          fontSize: 11,
          fontFamily: 'var(--font-ui)',
          fontWeight: 700,
          color: 'var(--text-primary)',
        }}>
          Ativação: <span style={{ color: primaryColor }}>{guide.activationLevel}%</span>
        </div>
      </div>

      {/* Control bar */}
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              width: 34, height: 34,
              borderRadius: '50%',
              background: isPlaying ? 'var(--bg-elevated)' : primaryColor,
              color: isPlaying ? 'var(--text-primary)' : '#08080E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          </button>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>
            Tempo: <span style={{ color: 'var(--text-primary)' }}>{guide.tempo}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {guide.primaryMuscles.slice(0, 1).map((m, i) => (
            <span key={i} className="badge badge-lime" style={{ fontSize: 10, background: primaryColor + '22', color: primaryColor, border: `1px solid ${primaryColor}44` }}>
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
