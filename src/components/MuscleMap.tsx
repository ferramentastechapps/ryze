import type { ExerciseGuide } from '../data/exerciseGuides';

interface MuscleMapProps {
  guide: ExerciseGuide;
}

export default function MuscleMap({ guide }: MuscleMapProps) {
  const isPeito = guide.category === 'peito';
  const isCostas = guide.category === 'costas';
  const isPernas = guide.category === 'pernas' || guide.category === 'gluteos';
  const isOmbros = guide.category === 'ombros';
  const isBracos = guide.category === 'biceps' || guide.category === 'triceps';

  const accentColor = isPeito || isPernas ? 'var(--accent-orange)' : isCostas ? 'var(--accent-cyan)' : 'var(--accent-lime)';

  return (
    <div style={{
      padding: 18,
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
    }}>
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontWeight: 700,
        fontSize: 13,
        color: 'var(--text-muted)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span>🎯 ATIVAÇÃO ANATÔMICA</span>
        <span style={{ fontSize: 11, color: accentColor, fontWeight: 800 }}>{guide.difficulty}</span>
      </div>

      {/* Muscle anatomical diagram & list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Primary muscles box */}
        <div style={{
          padding: 14,
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 'var(--radius-md)',
          borderLeft: `3px solid ${accentColor}`,
        }}>
          <div style={{ fontSize: 11, color: accentColor, fontFamily: 'var(--font-ui)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
            Músculo Alvo Principal
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {guide.primaryMuscles.map((m, i) => (
              <div key={i} style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>
                • {m}
              </div>
            ))}
          </div>
        </div>

        {/* Secondary muscles box */}
        <div style={{
          padding: 14,
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 'var(--radius-md)',
          borderLeft: '3px solid var(--accent-cyan)',
        }}>
          <div style={{ fontSize: 11, color: 'var(--accent-cyan)', fontFamily: 'var(--font-ui)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
            Sinergistas & Secundários
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {guide.secondaryMuscles.map((m, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                • {m}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Equipment tag */}
      <div style={{
        marginTop: 12,
        padding: '10px 12px',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 12,
      }}>
        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>Equipamento:</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-ui)' }}>{guide.equipmentNeeded}</span>
      </div>
    </div>
  );
}
