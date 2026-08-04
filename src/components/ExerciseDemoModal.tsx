import { useState } from 'react';
import { X, Play, ShieldAlert, CheckCircle2, Wind, Sparkles, BookOpen, Activity, AlertTriangle } from 'lucide-react';
import { getExerciseGuide } from '../data/exerciseGuides';
import ExerciseDemonstrator from './ExerciseDemonstrator';
import MuscleMap from './MuscleMap';

interface ExerciseDemoModalProps {
  exerciseId: string;
  exerciseName: string;
  muscleGroups: string[];
  onClose: () => void;
}

export default function ExerciseDemoModal({
  exerciseId,
  exerciseName,
  muscleGroups,
  onClose,
}: ExerciseDemoModalProps) {
  const guide = getExerciseGuide(exerciseId, exerciseName, muscleGroups);
  const [activeTab, setActiveTab] = useState<'demo' | 'steps' | 'mistakes'>('demo');

  const accentColor = guide.category === 'peito' || guide.category === 'pernas'
    ? 'var(--accent-orange)'
    : guide.category === 'costas' || guide.category === 'gluteos'
    ? 'var(--accent-cyan)'
    : 'var(--accent-lime)';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999,
      background: 'rgba(4, 4, 8, 0.88)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      animation: 'fadeIn 0.25s ease-out',
    }} onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 620,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#0B0B14',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'fadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="badge badge-lime" style={{ fontSize: 10, background: accentColor + '22', color: accentColor, border: `1px solid ${accentColor}44` }}>
                {guide.category.toUpperCase()}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
                Dificuldade: {guide.difficulty}
              </span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
              lineHeight: 1.1,
            }}>
              {guide.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 36, height: 36,
              borderRadius: '50%',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 24px',
          gap: 16,
          background: 'rgba(0,0,0,0.2)',
        }}>
          {[
            { id: 'demo', label: 'Demonstração & Anatômico', icon: <Activity size={14} /> },
            { id: 'steps', label: 'Passo a Passo', icon: <BookOpen size={14} /> },
            { id: 'mistakes', label: 'Erros & Dicas Pro', icon: <ShieldAlert size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '14px 4px',
                border: 'none',
                borderBottom: activeTab === tab.id ? `3px solid ${accentColor}` : '3px solid transparent',
                background: 'none',
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'var(--font-ui)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div style={{
          padding: 24,
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          {activeTab === 'demo' && (
            <>
              {/* Interactive Movement Demonstrator */}
              <ExerciseDemonstrator guide={guide} />

              {/* Anatomical Muscle Activation Map */}
              <MuscleMap guide={guide} />
            </>
          )}

          {activeTab === 'steps' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Posicionamento Inicial */}
              <div className="glass-card" style={{ padding: 18 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14,
                  color: accentColor, marginBottom: 12,
                }}>
                  <CheckCircle2 size={16} />
                  1. Posicionamento Inicial (Setup)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {guide.steps.setup.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>{i + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execução do Movimento */}
              <div className="glass-card" style={{ padding: 18 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14,
                  color: 'var(--accent-lime)', marginBottom: 12,
                }}>
                  <Play size={16} fill="currentColor" />
                  2. Execução Passo a Passo
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {guide.steps.execution.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent-lime)', fontFamily: 'var(--font-ui)' }}>→</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Respiração & Cadência */}
              <div className="glass-card" style={{ padding: 18, background: 'rgba(0,212,255,0.04)', borderColor: 'rgba(0,212,255,0.2)' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14,
                  color: 'var(--accent-cyan)', marginBottom: 8,
                }}>
                  <Wind size={16} />
                  3. Respiração & Ritmo
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {guide.steps.breathing}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mistakes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Erros Frequentes */}
              <div className="glass-card" style={{ padding: 18, background: 'rgba(255,95,31,0.04)', borderColor: 'rgba(255,95,31,0.2)' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14,
                  color: 'var(--accent-orange)', marginBottom: 12,
                }}>
                  <AlertTriangle size={16} />
                  Erros Comuns a Evitar
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {guide.steps.mistakes.map((mistake, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 10,
                      padding: '8px 12px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4,
                    }}>
                      <span style={{ color: 'var(--accent-orange)', fontWeight: 800 }}>✕</span>
                      <span>{mistake}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dicas Pro dos Treinadores */}
              {guide.proTips && guide.proTips.length > 0 && (
                <div className="glass-card" style={{ padding: 18, background: 'rgba(200,255,0,0.04)', borderColor: 'rgba(200,255,0,0.2)' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14,
                    color: 'var(--accent-lime)', marginBottom: 12,
                  }}>
                    <Sparkles size={16} />
                    Dica de Ouro do Treinador (Pro Tip)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {guide.proTips.map((tip, i) => (
                      <div key={i} style={{ fontSize: 13, color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.5 }}>
                        "{tip}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            onClick={onClose}
          >
            <Check size={18} />
            Entendi! Fechar guia
          </button>
        </div>
      </div>
    </div>
  );
}
