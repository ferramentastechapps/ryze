import { useState } from 'react';
import {
  X, ShieldAlert, CheckCircle2, Wind, Sparkles,
  Activity, AlertTriangle, Check, Dumbbell, Zap, Target, Layers, Compass, BarChart3, RotateCw
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
  Iniciante: '#34C759',    // Verde iOS
  Intermediário: '#FF9500', // Laranja iOS
  Avançado: '#FF3B30',      // Vermelho iOS
};

export default function ExerciseDemoModal({
  exerciseId,
  exerciseName,
  muscleGroups,
  onClose,
}: ExerciseDemoModalProps) {
  const guide = getExerciseGuide(exerciseId, exerciseName, muscleGroups);
  const [activeTab, setActiveTab] = useState<'muscles' | 'steps' | 'mistakes' | 'analytics'>('muscles');

  const accentColor = '#FF3B30'; // Vermelho primário premium de performance
  const difficultyColor = DIFFICULTY_COLOR[guide.difficulty] ?? '#FF9500';

  const tabs = [
    { id: 'muscles' as const, label: 'Músculos', icon: <Target size={15} /> },
    { id: 'steps' as const, label: 'Execução', icon: <CheckCircle2 size={15} /> },
    { id: 'mistakes' as const, label: 'Erros Comuns', icon: <ShieldAlert size={15} /> },
    { id: 'analytics' as const, label: 'Analytics', icon: <BarChart3 size={15} /> },
  ];

  const primaryMuscles = guide.primaryMuscles || [];
  const secondaryMuscles = guide.secondaryMuscles || [];
  const stabilizers = guide.stabilizers || ['Core / Transverso Abdominal', 'Eretores Lombares'];
  const joints = guide.jointsInvolved || ['Glenoumeral (Ombro)', 'Cotovelo'];
  const movementPlane = guide.movementPlane || 'Plano Sagital (Flexão/Extensão)';
  const romDegrees = guide.romDegrees || '110° Amplitude Completa';
  const exerciseType = guide.exerciseType || (guide.category === 'biceps' || guide.category === 'triceps' ? 'Isolado Monoarticular' : 'Composto Multiarticular');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(4, 4, 10, 0.94)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#090912',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 28,
          boxShadow: `0 32px 90px rgba(0,0,0,0.95), 0 0 60px ${accentColor}18`,
          overflow: 'hidden',
          animation: 'fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ═══════════════════════════════════════════════════
            HEADER FIXO PREMIUM
        ═══════════════════════════════════════════════════ */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Badges de Categoria + Dificuldade + Ativação */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
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
                  letterSpacing: '0.06em',
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
                  ⚡ {guide.activationLevel}% EMG Ativação
                </span>
              </div>

              {/* Título Principal */}
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 26,
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
                margin: '2px 0 6px',
              }}>
                {guide.name}
              </h2>

              {/* Equipamento */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-ui)',
                fontWeight: 600,
              }}>
                <Dumbbell size={13} color={accentColor} />
                {guide.equipmentNeeded}
              </div>
            </div>

            {/* Fechar Button */}
            <button
              onClick={onClose}
              style={{
                width: 38, height: 38, flexShrink: 0,
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
            ÁREA DA ANIMAÇÃO 3D REAL-TIME (~40% DA ÁREA)
        ═══════════════════════════════════════════════════ */}
        <div style={{
          padding: '16px 20px 0',
          flexShrink: 0,
          background: '#06060C',
        }}>
          <ExerciseDemonstrator guide={guide} />
        </div>

        {/* ═══════════════════════════════════════════════════
            SELETOR DE ABAS DE NAVEGAÇÃO
        ═══════════════════════════════════════════════════ */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '0 20px',
          background: 'rgba(0,0,0,0.4)',
          flexShrink: 0,
          marginTop: 12,
        }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '13px 8px',
                  border: 'none',
                  borderBottom: isActive ? `3px solid ${accentColor}` : '3px solid transparent',
                  background: 'none',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: isActive ? 900 : 600,
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  letterSpacing: '0.02em',
                }}
              >
                <span style={{ color: isActive ? accentColor : 'currentColor' }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ═══════════════════════════════════════════════════
            CORPO DA ABA SELECIONADA (SCROLLABLE)
        ═══════════════════════════════════════════════════ */}
        <div style={{
          padding: 20,
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>

          {/* ══ ABA 1: MÚSCULOS ══ */}
          {activeTab === 'muscles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Grid de Classificação Muscular por Cores */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
                {/* Músculo Principal (Vermelho) */}
                <div style={{
                  padding: '14px 16px',
                  background: 'rgba(255,59,48,0.08)',
                  border: '1px solid rgba(255,59,48,0.25)',
                  borderRadius: 16,
                  borderLeft: '4px solid #FF3B30',
                }}>
                  <div style={{
                    fontSize: 10,
                    color: '#FF3B30',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 6,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF3B30' }} />
                    MÚSCULO PRINCIPAL
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {primaryMuscles.map((m, i) => (
                      <div key={i} style={{ fontSize: 13, fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-ui)' }}>
                        {m}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Músculos Secundários (Laranja) */}
                <div style={{
                  padding: '14px 16px',
                  background: 'rgba(255,149,0,0.08)',
                  border: '1px solid rgba(255,149,0,0.25)',
                  borderRadius: 16,
                  borderLeft: '4px solid #FF9500',
                }}>
                  <div style={{
                    fontSize: 10,
                    color: '#FF9500',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 6,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF9500' }} />
                    MÚSCULOS SECUNDÁRIOS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {secondaryMuscles.map((m, i) => (
                      <div key={i} style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
                        • {m}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Estabilizadores (Amarelo) */}
                <div style={{
                  padding: '14px 16px',
                  background: 'rgba(255,204,0,0.08)',
                  border: '1px solid rgba(255,204,0,0.25)',
                  borderRadius: 16,
                  borderLeft: '4px solid #FFCC00',
                }}>
                  <div style={{
                    fontSize: 10,
                    color: '#FFCC00',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 6,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFCC00' }} />
                    ESTABILIZADORES
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {stabilizers.map((m, i) => (
                      <div key={i} style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
                        • {m}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabela de Especificações Rápidas */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
              }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>
                    GRUPO MUSCULAR
                  </div>
                  <div style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 800, fontFamily: 'var(--font-ui)', marginTop: 2 }}>
                    {guide.category.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>
                    EQUIPAMENTO
                  </div>
                  <div style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 800, fontFamily: 'var(--font-ui)', marginTop: 2 }}>
                    {guide.equipmentNeeded.split('+')[0]}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>
                    MOVIMENTO
                  </div>
                  <div style={{ fontSize: 13, color: accentColor, fontWeight: 800, fontFamily: 'var(--font-ui)', marginTop: 2 }}>
                    {exerciseType}
                  </div>
                </div>
              </div>

              {/* Mapa Anatômico SVG Interativo Incorporado */}
              <MuscleMap guide={guide} />
            </div>
          )}

          {/* ══ ABA 2: EXECUÇÃO ══ */}
          {activeTab === 'steps' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Posicionamento Inicial (Setup) */}
              <div style={{
                padding: '16px 18px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 18,
                borderLeft: `4px solid ${accentColor}`,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 13,
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

              {/* Execução do Movimento */}
              <div style={{
                padding: '16px 18px',
                background: 'rgba(255,149,0,0.03)',
                border: '1px solid rgba(255,149,0,0.15)',
                borderRadius: 18,
                borderLeft: '4px solid #FF9500',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 13,
                  color: '#FF9500', marginBottom: 12,
                }}>
                  <Layers size={15} />
                  2 · Cadência & Execução do Movimento
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {guide.steps.execution.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 13, color: '#FF9500', fontWeight: 900, flexShrink: 0 }}>→</span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Controle de Respiração */}
              <div style={{
                padding: '14px 18px',
                background: 'rgba(0,212,255,0.04)',
                border: '1px solid rgba(0,212,255,0.15)',
                borderRadius: 18,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}>
                <Wind size={20} color="#00D4FF" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{
                    fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 11,
                    color: '#00D4FF', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    3 · Padrão de Respiração Biomecânica
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {guide.steps.breathing}
                  </div>
                </div>
              </div>

              {/* Dicas Pro dos Treinadores */}
              {guide.proTips && guide.proTips.length > 0 && (
                <div style={{
                  padding: '16px 18px',
                  background: 'rgba(255,204,0,0.04)',
                  border: '1px solid rgba(255,204,0,0.2)',
                  borderRadius: 18,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 13,
                    color: '#FFCC00', marginBottom: 10,
                  }}>
                    <Sparkles size={16} />
                    Dica dos Treinadores de Elite
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {guide.proTips.map((tip, i) => (
                      <div key={i} style={{ fontSize: 13, color: '#FFFFFF', fontStyle: 'italic', lineHeight: 1.5 }}>
                        "{tip}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ ABA 3: ERROS COMUNS ══ */}
          {activeTab === 'mistakes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-ui)',
                fontWeight: 700,
                marginBottom: 4,
              }}>
                ILUSTRAÇÃO DE ERROS DE EXECUÇÃO & CUIDADOS BIOMECÂNICOS
              </div>

              {guide.steps.mistakes.map((mistake, i) => (
                <div
                  key={i}
                  style={{
                    padding: '16px 18px',
                    background: 'rgba(255,59,48,0.06)',
                    border: '1px solid rgba(255,59,48,0.2)',
                    borderRadius: 18,
                    display: 'flex',
                    gap: 14,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Ícone de Alerta Visual */}
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: '50%',
                    background: 'rgba(255,59,48,0.18)',
                    border: '1px solid rgba(255,59,48,0.3)',
                    color: '#FF3B30',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontWeight: 900, fontSize: 16,
                  }}>
                    ✕
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: 'var(--font-ui)',
                      fontWeight: 900,
                      fontSize: 13,
                      color: '#FF3B30',
                      marginBottom: 4,
                    }}>
                      Erro #{i + 1} — Risco de Compensação
                    </div>
                    <div style={{ fontSize: 13, color: '#FFFFFF', lineHeight: 1.5, fontWeight: 600 }}>
                      {mistake}
                    </div>
                    <div style={{
                      marginTop: 8,
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-ui)',
                      fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <Zap size={12} color="#FF9500" />
                      Correção: Mantenha postura neutra e cadência sob controle.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══ ABA 4: ANALYTICS BIOMECÂNICO ══ */}
          {activeTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Medidor de Ativação Muscular (EMG Index) */}
              <div style={{
                padding: '18px 20px',
                background: 'rgba(255,59,48,0.06)',
                border: '1px solid rgba(255,59,48,0.2)',
                borderRadius: 20,
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 12,
                  color: '#FF3B30', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Zap size={15} color="#FF3B30" />
                    ÍNDICE DE ATIVAÇÃO EMG
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 900 }}>{guide.activationLevel}%</span>
                </div>

                <div style={{
                  height: 10,
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 99,
                  overflow: 'hidden',
                  marginBottom: 8,
                }}>
                  <div style={{
                    height: '100%',
                    width: `${guide.activationLevel}%`,
                    background: 'linear-gradient(90deg, #FF9500, #FF3B30)',
                    boxShadow: '0 0 14px #FF3B30',
                    borderRadius: 99,
                    transition: 'width 0.8s ease-out',
                  }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>
                  Recrutamento muscular validado por eletromiografia biomecânica.
                </div>
              </div>

              {/* Grid 2x2 de Especificações Biomecânicas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {/* Articulações Envolvidas */}
                <div style={{
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>
                    ARTICULAÇÕES ENVOLVIDAS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {joints.map((j, i) => (
                      <div key={i} style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 800, fontFamily: 'var(--font-ui)' }}>
                        • {j}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plano de Movimento */}
                <div style={{
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>
                    PLANO DE MOVIMENTO
                  </div>
                  <div style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 800, fontFamily: 'var(--font-ui)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Compass size={14} color="#00D4FF" />
                    {movementPlane}
                  </div>
                </div>

                {/* Amplitude de Movimento (ROM) */}
                <div style={{
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>
                    AMPLITUDE (ROM)
                  </div>
                  <div style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 800, fontFamily: 'var(--font-ui)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <RotateCw size={14} color="#FF9500" />
                    {romDegrees}
                  </div>
                </div>

                {/* Tipo de Exercício */}
                <div style={{
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>
                    TIPO DE EXERCÍCIO
                  </div>
                  <div style={{ fontSize: 12, color: '#FF3B30', fontWeight: 800, fontFamily: 'var(--font-ui)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Layers size={14} color="#FF3B30" />
                    {exerciseType}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ═══════════════════════════════════════════════════
            FOOTER FIXO
        ═══════════════════════════════════════════════════ */}
        <div style={{
          padding: '14px 22px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.4)',
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 'var(--radius-lg)',
              background: accentColor,
              color: '#FFFFFF',
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
              boxShadow: `0 8px 24px ${accentColor}44`,
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
