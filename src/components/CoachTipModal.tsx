import { useState, useEffect } from 'react';
import { X, Sparkles, Check, Activity, Target, ShieldCheck, Zap, Layers, Flame } from 'lucide-react';

interface CoachTipModalProps {
  tipText: string;
  workoutTitle: string;
  workoutType?: string;
  onClose: () => void;
}

export default function CoachTipModal({ tipText, workoutTitle, workoutType = 'musculacao', onClose }: CoachTipModalProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const phases = [
    { name: 'Excêntrica (Desida)', duration: '3s', desc: 'Controle o peso resistindo à gravidade', color: 'var(--accent-cyan)' },
    { name: 'Pausa Isométrica', duration: '1s', desc: 'Ativação máxima no ponto de tensão', color: 'var(--accent-orange)' },
    { name: 'Concêntrica (Puxada/Empurrão)', duration: '2s', desc: 'Força explosiva para vencer a carga', color: 'var(--accent-lime)' },
  ];

  // Biomechanical cycle timer
  useEffect(() => {
    let startTime = Date.now();
    const cycleDuration = 4000; // 4s cycle

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) % cycleDuration;
      const pct = elapsed / cycleDuration;
      setProgress(pct);

      if (pct < 0.55) {
        setPhaseIndex(0);
      } else if (pct < 0.75) {
        setPhaseIndex(1);
      } else {
        setPhaseIndex(2);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  const currentPhase = phases[phaseIndex];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(4, 4, 8, 0.90)',
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
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#0B0B14',
          border: '1px solid rgba(155,89,255,0.35)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(155,89,255,0.18)',
          overflow: 'hidden',
          animation: 'fadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Opaque Solid Header - Prevents content bleed on scroll */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#121220',
          flexShrink: 0,
          position: 'relative',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: 12,
              background: 'rgba(155,89,255,0.22)',
              border: '1px solid rgba(155,89,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-purple)',
              flexShrink: 0,
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

        {/* Scrollable Modal Content */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          flex: 1,
          boxSizing: 'border-box',
        }}>

          {/* 1. Cadência & Animação Biomecânica Widget */}
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            position: 'relative',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: 'var(--accent-lime)', fontFamily: 'var(--font-ui)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Activity size={16} /> CADÊNCIA BIOMECÂNICA RECOMENDADA
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>
                Tempo Total: 4s por repetição
              </span>
            </div>

            {/* Visual Contraction Graphic Box */}
            <div style={{
              height: 100,
              background: 'radial-gradient(ellipse 90% 90% at 50% 50%, rgba(155,89,255,0.12) 0%, #08080E 100%)',
              border: '1px solid rgba(155,89,255,0.2)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Pulse Ring */}
              <div style={{
                position: 'absolute',
                width: 70 + progress * 40,
                height: 70 + progress * 40,
                borderRadius: '50%',
                border: `2px solid ${currentPhase.color}`,
                opacity: 0.4 - progress * 0.3,
                transition: 'all 0.1s linear',
              }} />

              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: currentPhase.color,
                fontFamily: 'var(--font-ui)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}>
                FASE ATUAL: {currentPhase.name} ({currentPhase.duration})
              </div>

              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'center', padding: '0 16px' }}>
                {currentPhase.desc}
              </div>
            </div>

            {/* Dynamic Cadence Progress Bar */}
            <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{
                height: '100%',
                width: `${progress * 100}%`,
                background: currentPhase.color,
                borderRadius: 4,
                transition: 'width 0.05s linear',
              }} />
            </div>

            {/* Phase Selector Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {phases.map((p, idx) => (
                <div key={idx} style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  background: phaseIndex === idx ? `${p.color}20` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${phaseIndex === idx ? p.color : 'rgba(255,255,255,0.06)'}`,
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: phaseIndex === idx ? p.color : 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
                    {p.duration}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: phaseIndex === idx ? 'var(--text-primary)' : 'var(--text-secondary)', marginTop: 2 }}>
                    {idx === 0 ? 'Desida' : idx === 1 ? 'Pausa' : 'Subida'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Coach Quote & Specific Technical Advice */}
          <div style={{
            padding: '20px',
            background: 'rgba(155,89,255,0.1)',
            border: '1px solid rgba(155,89,255,0.3)',
            borderLeft: '4px solid var(--accent-purple)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-ui)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={15} /> ORIENTAÇÃO TÉCNICA DO DIA
            </div>
            <p style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>
              "{tipText}"
            </p>
          </div>

          {/* 3. Target Muscle Chips & Focus */}
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Target size={14} style={{ color: 'var(--accent-orange)' }} /> FOCOS DE ATIVAÇÃO NO TREINO
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Conexão Mente-Músculo', 'Retração Escapular', 'Controle Excêntrico 3s', 'Zero Impulso / Roubo'].map((chip, i) => (
                <span key={i} style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  background: 'rgba(200,255,0,0.08)',
                  border: '1px solid rgba(200,255,0,0.2)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--accent-lime)',
                  fontFamily: 'var(--font-ui)',
                }}>
                  ✓ {chip}
                </span>
              ))}
            </div>
          </div>

          {/* 4. Execution Directives List */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} style={{ color: 'var(--accent-cyan)' }} /> REGRAS PARA MÁXIMO RESULTADO HOJE
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { title: '1. Ativação Escapular Antes de Puxar', desc: 'Deprima e junte as escápulas antes de flexionar os cotovelos para isolar a dorsal.' },
                { title: '2. Alongamento Fascial Completo', desc: 'No final da fase excêntrica, sinta a musculatura alongar por completo sem perder a tensão.' },
                { title: '3. Exalação na Fase de Esforço', desc: 'Solte o ar vigorosamente ao vencer a carga (concêntrica) e inspire ao retornar.' },
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: '14px 16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}>
                  <div style={{
                    width: 26, height: 26,
                    borderRadius: '50%',
                    background: 'var(--accent-lime-dim)',
                    color: 'var(--accent-lime)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 2,
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Opaque Solid Footer Action */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-medium)',
          background: '#121220',
          display: 'flex',
          justifyContent: 'flex-end',
          flexShrink: 0,
          position: 'relative',
          zIndex: 10,
        }}>
          <button
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px' }}
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
