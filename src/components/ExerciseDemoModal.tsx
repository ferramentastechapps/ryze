import { useState } from 'react';
import {
  X, Play, ShieldAlert, CheckCircle2, Wind, Sparkles,
  BookOpen, Activity, AlertTriangle, Check, Dumbbell, Zap,
} from 'lucide-react';
import { getExerciseGuide } from '../data/exerciseGuides';
import ExerciseDemonstrator from './ExerciseDemonstrator';
import MuscleMap from './MuscleMap';

interface ExerciseDemoModalProps {
  exerciseId: string;
  exerciseName: string;
  muscleGroups: string[];
  onClose: () => void;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Iniciante: '#4ade80',
  Intermediário: '#fbbf24',
  Avançado: '#f87171',
};

export default function ExerciseDemoModal({
  exerciseId,
  exerciseName,
  muscleGroups,
  onClose,
}: ExerciseDemoModalProps) {
  const guide = getExerciseGuide(exerciseId, exerciseName, muscleGroups);
  const [activeTab, setActiveTab] = useState<'demo' | 'steps' | 'mistakes'>('demo');

  const accentColor =
    guide.category === 'peito' || guide.category === 'pernas'
      ? '#FF5F1F' // Neon Orange
      : guide.category === 'costas' || guide.category === 'gluteos'
      ? '#00D4FF' // Neon Cyan
      : '#C8FF00'; // Neon Lime

  const difficultyColor = DIFFICULTY_COLOR[guide.difficulty] ?? '#C8FF00';

  const tabs = [
    { id: 'demo' as const, label: 'Demonstração & Anatômico', icon: <Activity size={14} /> },
    { id: 'steps' as const, label: 'Passo a Passo', icon: <BookOpen size={14} /> },
    { id: 'mistakes' as const, label: 'Erros & Dicas Pro', icon: <ShieldAlert size={14} /> },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(4, 4, 10, 0.92)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 660,
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#090912',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 24,
          boxShadow: `0 32px 80px rgba(0,0,0,0.85), 0 0 60px ${accentColor}15`,
          overflow: 'hidden',
          animation: 'fadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ═══════════════════════════════════════════════════
            HEADER
        ═══════════════════════════════════════════════════ */}
        <div style={{
          padding: '18px 22px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.015)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Category + Difficulty row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: `${accentColor}20`,
                  color: accentColor,
                  border: `1px solid ${accentColor}44`,
                }}>
                  {guide.category.toUpperCase()}
                </span>
                <span style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 800,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: `${difficultyColor}20`,
                  color: difficultyColor,
                  border: `1px solid ${difficultyColor}44`,
                }}>
                  {guide.difficulty}
                </span>
                <span style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  ⚡ {guide.activationLevel}% Ativação Muscular
                </span>
              </div>

              {/* Title */}
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 26,
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.1,
                letterSpacing: '0.02em',
                margin: '4px 0',
              }}>
                {guide.name}
              </h2>

              {/* Equipment */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-ui)',
                fontWeight: 600,
                marginTop: 4,
              }}>
                <Dumbbell size={13} color={accentColor} />
                {guide.equipmentNeeded}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, flexShrink: 0,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            NAVIGATION TABS
        ═══════════════════════════════════════════════════ */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '0 22px',
          gap: 0,
          background: 'rgba(0,0,0,0.3)',
          flexShrink: 0,
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '14px 18px',
                border: 'none',
                borderBottom: activeTab === tab.id ? `2px solid ${accentColor}` : '2px solid transparent',
                background: 'none',
                color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-muted)',
                fontFamily: 'var(--font-ui)',
                fontWeight: activeTab === tab.id ? 800 : 600,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.15s',
                letterSpacing: '0.02em',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════
            SCROLLABLE BODY
        ═══════════════════════════════════════════════════ */}
        <div style={{
          padding: 22,
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}>

          {/* TAB 1: DEMO & MUSCLE MAP */}
          {activeTab === 'demo' && (
            <>
              {/* Motion / Video Demonstrator */}
              <ExerciseDemonstrator guide={guide} />

              {/* Anatomical 3D Muscle Map */}
              <MuscleMap guide={guide} />
            </>
          )}

          {/* TAB 2: STEP BY STEP */}
          {activeTab === 'steps' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Setup */}
              <div style={{
                padding: '16px 18px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                borderLeft: `3px solid ${accentColor}`,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 13,
                  color: accentColor, marginBottom: 12,
                }}>
                  <CheckCircle2 size={16} />
                  1 · Posicionamento Inicial (Setup)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {guide.steps.setup.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        minWidth: 22, height: 22,
                        background: `${accentColor}22`,
                        color: accentColor,
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 900,
                        fontFamily: 'var(--font-ui)',
                        flexShrink: 0,
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution */}
              <div style={{
                padding: '16px 18px',
                background: 'rgba(200,255,0,0.03)',
                border: '1px solid rgba(200,255,0,0.12)',
                borderRadius: 16,
                borderLeft: '3px solid #C8FF00',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 13,
                  color: '#C8FF00', marginBottom: 12,
                }}>
                  <Play size={14} fill="currentColor" />
                  2 · Execução do Movimento
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {guide.steps.execution.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 13, color: '#C8FF00', fontWeight: 900, flexShrink: 0 }}>→</span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Breathing */}
              <div style={{
                padding: '14px 18px',
                background: 'rgba(0,212,255,0.04)',
                border: '1px solid rgba(0,212,255,0.15)',
                borderRadius: 16,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}>
                <Wind size={18} color="#00D4FF" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{
                    fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 11,
                    color: '#00D4FF', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    3 · Controle de Respiração
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {guide.steps.breathing}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MISTAKES & PRO TIPS */}
          {activeTab === 'mistakes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Common Mistakes */}
              <div style={{
                padding: '16px 18px',
                background: 'rgba(255,95,31,0.05)',
                border: '1px solid rgba(255,95,31,0.18)',
                borderRadius: 16,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 13,
                  color: '#FF5F1F', marginBottom: 12,
                }}>
                  <AlertTriangle size={16} />
                  Erros Frequentes a Evitar
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {guide.steps.mistakes.map((mistake, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 10,
                        padding: '10px 14px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,95,31,0.12)',
                        borderRadius: 10,
                        alignItems: 'flex-start',
                      }}
                    >
                      <span style={{ color: '#FF5F1F', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>✕</span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{mistake}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trainer Pro Tips */}
              {guide.proTips && guide.proTips.length > 0 && (
                <div style={{
                  padding: '16px 18px',
                  background: 'rgba(200,255,0,0.04)',
                  border: '1px solid rgba(200,255,0,0.18)',
                  borderRadius: 16,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 13,
                    color: '#C8FF00', marginBottom: 12,
                  }}>
                    <Sparkles size={16} />
                    Dica dos Treinadores
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {guide.proTips.map((tip, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 15, flexShrink: 0 }}>💡</span>
                        <span style={{ fontSize: 13, color: '#FFFFFF', fontStyle: 'italic', lineHeight: 1.6 }}>
                          "{tip}"
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════════════ */}
        <div style={{
          padding: '14px 22px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.35)',
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 'var(--radius-lg)',
              background: accentColor,
              color: '#08080E',
              border: 'none',
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              letterSpacing: '0.04em',
              transition: 'transform 0.15s ease',
            }}
          >
            <Check size={18} strokeWidth={3} />
            Entendi! Fechar Guia
          </button>
        </div>
      </div>
    </div>
  );
}
