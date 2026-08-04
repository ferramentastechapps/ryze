import { useState, useEffect } from 'react';
import { X, Sparkles, Check, Activity, Target, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';

interface CoachTipModalProps {
  tipText: string;
  workoutTitle: string;
  workoutType?: string;
  onClose: () => void;
}

export default function CoachTipModal({ tipText, workoutTitle, workoutType = 'musculacao', onClose }: CoachTipModalProps) {
  const [phase, setPhase] = useState<'Controlada' | 'Pausa de Ativação' | 'Contração Explosiva'>('Controlada');
  const [progress, setProgress] = useState(0);

  // Biomechanical cycle timer
  useEffect(() => {
    let startTime = Date.now();
    const cycleDuration = 4000;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) % cycleDuration;
      const pct = elapsed / cycleDuration;
      setProgress(pct);

      if (pct < 0.55) {
        setPhase('Controlada');
      } else if (pct < 0.72) {
        setPhase('Pausa de Ativação');
      } else {
        setPhase('Contração Explosiva');
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(4, 4, 8, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 580,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#0B0B14',
          border: '1px solid rgba(155,89,255,0.3)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(155,89,255,0.15)',
          overflow: 'hidden',
          animation: 'fadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(155,89,255,0.12) 0%, rgba(200,255,0,0.05) 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: 12,
              background: 'rgba(155,89,255,0.2)',
              border: '1px solid rgba(155,89,255,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-purple)',
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--accent-purple)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-ui)',
              }}>
                ORIENTAÇÃO DO COACH RYZE
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-primary)', marginTop: 2 }}>
                {workoutTitle || 'Treino do Dia'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-icon btn-ghost"
            style={{ borderRadius: '50%', width: 36, height: 36 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Animated Biomechanics Cadence Visualizer */}
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: 'var(--accent-lime)', fontFamily: 'var(--font-ui)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Activity size={16} /> CADÊNCIA BIOMECÂNICA RECOMENDADA
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>
                Tempo ideal: 3s — 1s — 2s
              </span>
            </div>

            {/* Dynamic Progress Indicator */}
            <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{
                height: '100%',
                width: `${progress * 100}%`,
                background: phase === 'Controlada' ? 'var(--accent-cyan)' : phase === 'Pausa de Ativação' ? 'var(--accent-orange)' : 'var(--accent-lime)',
                borderRadius: 4,
                transition: 'width 0.05s linear',
              }} />
            </div>

            {/* Current Phase Status Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Fase Atual: <strong style={{ color: 'var(--text-primary)' }}>{phase}</strong>
              </div>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 999,
                background: phase === 'Controlada' ? 'rgba(0,212,255,0.15)' : phase === 'Pausa de Ativação' ? 'rgba(255,95,31,0.15)' : 'rgba(200,255,0,0.15)',
                color: phase === 'Controlada' ? 'var(--accent-cyan)' : phase === 'Pausa de Ativação' ? 'var(--accent-orange)' : 'var(--accent-lime)',
                fontFamily: 'var(--font-ui)',
              }}>
                {phase === 'Controlada' ? 'Desida Retida 3s' : phase === 'Pausa de Ativação' ? 'Pausa no Pico 1s' : 'Subida Explosiva 2s'}
              </div>
            </div>
          </div>

          {/* Coach Advice Text Box */}
          <div style={{
            padding: '18px',
            background: 'rgba(155,89,255,0.08)',
            borderLeft: '4px solid var(--accent-purple)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-ui)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={14} /> ORIENTAÇÃO TÉCNICA PRINCIPAL
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
              "{tipText}"
            </p>
          </div>

          {/* 3 Key Principles for Execution */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)', marginBottom: 12 }}>
              REGRAS DE EXECUÇÃO HOJE
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { title: 'Conexão Mente-Músculo', desc: 'Concentre a força no músculo alvo principal sem roubar com os sinergistas.' },
                { title: 'Amplitude Completa', desc: 'Alongue o músculo completamente no ponto inicial e esprema no final.' },
                { title: 'Respiração Guiada', desc: 'Expire durante o esforço (fase concêntrica) e inspire na fase de controle.' },
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: '12px 14px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}>
                  <div style={{
                    width: 24, height: 24,
                    borderRadius: '50%',
                    background: 'var(--accent-lime-dim)',
                    color: 'var(--accent-lime)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Action */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            onClick={onClose}
          >
            <Check size={18} />
            Entendi! Aplicar no treino de hoje
          </button>
        </div>
      </div>
    </div>
  );
}
