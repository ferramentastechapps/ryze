import React from 'react';
import { useGamificationStore, getNextLevelXp } from '../store/gamificationStore';
import { Zap, Flame, Trophy } from 'lucide-react';

interface XpBarProps {
  compact?: boolean;
}

const LEVEL_NAMES: Record<number, string> = {
  1: 'Recruta',
  2: 'Bronze',
  3: 'Prata',
  4: 'Ouro',
  5: 'Platina',
  6: 'Diamante',
  7: 'Mestre',
  8: 'Grão-Mestre',
  9: 'Challenger',
  10: 'RYZE Elite',
};

function getLevelName(level: number): string {
  return LEVEL_NAMES[level] ?? `Nível ${level}`;
}

export const XpBar: React.FC<XpBarProps> = ({ compact = false }) => {
  const { xp, level, streak, unlockedBadges } = useGamificationStore();

  const prevLevelXp = (level - 1) * 100;
  const nextLevelXp = getNextLevelXp(level);
  const currentLevelProgress = xp - prevLevelXp;
  const xpNeededForNext = nextLevelXp - prevLevelXp;
  const progressPercent = Math.min(100, Math.max(0, (currentLevelProgress / xpNeededForNext) * 100));
  const xpToNext = xpNeededForNext - currentLevelProgress;

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '6px 12px',
        fontSize: 12,
        color: 'var(--text-muted)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 800, color: 'var(--accent-orange)' }}>
          <Zap size={13} />
          <span>Nv. {level}</span>
        </div>
        <div style={{ width: 48, height: 5, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent-orange)', borderRadius: 99, transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: 'var(--accent-orange)' }}>
          <Flame size={13} />
          <span>{streak}d</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '16px 18px' }}>
      {/* Top row: Level badge + right stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        
        {/* Level badge + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(255,95,31,0.25) 0%, rgba(255,95,31,0.1) 100%)',
            border: '1px solid rgba(255,95,31,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 900,
            color: 'var(--accent-orange)',
            flexShrink: 0,
          }}>
            {level}
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 800,
              fontSize: 15,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}>
              {getLevelName(level)}
            </div>
            <div style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              marginTop: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>{xp} XP</span>
              <span>•</span>
              <span>faltam {xpToNext} XP para Nv. {level + 1}</span>
            </div>
          </div>
        </div>

        {/* Right: Streak + Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Streak */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              fontWeight: 900,
              color: streak > 0 ? 'var(--accent-orange)' : 'var(--text-muted)',
            }}>
              <Flame size={16} style={{ flexShrink: 0 }} />
              <span>{streak}</span>
            </div>
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginTop: 1,
            }}>
              Sequência
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 32, background: 'var(--border-subtle)' }} />

          {/* Badges */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              fontWeight: 900,
              color: 'var(--accent-lime)',
            }}>
              <Trophy size={15} style={{ flexShrink: 0 }} />
              <span>{unlockedBadges.length}</span>
            </div>
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginTop: 1,
            }}>
              Conquistas
            </div>
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div>
        <div style={{
          height: 8,
          background: 'var(--bg-elevated)',
          borderRadius: 99,
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, var(--accent-orange) 0%, #ffaa44 100%)',
            borderRadius: 99,
            transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: progressPercent > 0 ? '0 0 10px rgba(255,95,31,0.5)' : 'none',
          }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 5,
          fontSize: 10,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-ui)',
          fontWeight: 600,
        }}>
          <span>{currentLevelProgress} XP</span>
          <span>{xpNeededForNext} XP</span>
        </div>
      </div>
    </div>
  );
};
