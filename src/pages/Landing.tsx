import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Dumbbell, Zap, Activity, ArrowRight, ChevronRight, Brain, Calendar, TrendingUp, ShieldCheck, CheckCircle2, Lock, Atom } from 'lucide-react';

interface LandingProps {
  isOnboarded: boolean;
}

export default function Landing({ isOnboarded }: LandingProps) {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; color: string;
    }> = [];

    const colors = ['#C8FF00', '#FF5F1F', '#00D4FF', '#9B59FF'];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(200,255,0,${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Background gradient */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(155,89,255,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0,212,255,0.08) 0%, transparent 50%), #08080E',
        zIndex: 0,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Header */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 40px',
          maxWidth: 1200,
          margin: '0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36,
              background: 'var(--gradient-lime)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={20} color="#08080E" strokeWidth={2.5} />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              letterSpacing: '0.08em',
              color: 'var(--text-primary)',
            }}>HYBRID FORGE</span>
          </div>

          {isOnboarded ? (
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard')}>
              Meu Dashboard <ArrowRight size={14} />
            </button>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/anamnese')}>
              Começar grátis
            </button>
          )}
        </header>

        {/* Hero Section */}
        <section style={{
          minHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 24px',
          paddingTop: 40,
        }}>
          {/* Eyebrow */}
          <div className="badge badge-lime animate-fade-in" style={{ marginBottom: 24 }}>
            <Activity size={12} />
            IA · Musculação · Corrida
          </div>

          {/* Main Title */}
          <h1
            className="animate-fade-in"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(64px, 12vw, 120px)',
              lineHeight: 0.95,
              letterSpacing: '0.04em',
              marginBottom: 24,
              animationDelay: '100ms',
            }}
          >
            <span style={{ display: 'block', color: 'var(--text-primary)' }}>TREINO.</span>
            <span style={{
              display: 'block',
              background: 'var(--gradient-lime)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>EVOLUÇÃO.</span>
            <span style={{ display: 'block', color: 'var(--text-primary)' }}>RESULTADO.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="animate-fade-in"
            style={{
              fontSize: 18,
              color: 'var(--text-secondary)',
              maxWidth: 520,
              lineHeight: 1.7,
              marginBottom: 48,
              animationDelay: '200ms',
            }}
          >
            A IA analisa seu perfil completo e cria um plano semanal personalizado de musculação e corrida para o corpo que você deseja.
          </p>

          {/* CTA Buttons */}
          <div
            className="animate-fade-in"
            style={{
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
              justifyContent: 'center',
              animationDelay: '300ms',
            }}
          >
            {isOnboarded ? (
              <button
                className="btn btn-primary btn-lg animate-glow"
                onClick={() => navigate('/dashboard')}
              >
                <LayoutDashboard size={20} />
                Ir para o Dashboard
              </button>
            ) : (
              <>
                <button
                  className="btn btn-primary btn-lg animate-glow"
                  onClick={() => navigate('/anamnese')}
                >
                  Criar meu plano grátis
                  <ArrowRight size={20} />
                </button>
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={() => navigate('/anamnese')}
                >
                  Ver como funciona
                </button>
              </>
            )}
          </div>

          {/* Social proof */}
          <div
            className="animate-fade-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              marginTop: 48,
              animationDelay: '400ms',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {[
              { label: 'Baseado em ciência', icon: Atom },
              { label: '100% confiável', icon: CheckCircle2 },
              { label: 'Privacidade garantida', icon: Lock },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  fontWeight: 500,
                }}>
                  <Icon size={14} style={{ color: 'var(--accent-lime)' }} />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5vw, 56px)',
              letterSpacing: '0.04em',
              color: 'var(--text-primary)',
              marginBottom: 16,
            }}>
              TUDO QUE VOCÊ PRECISA
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
              Um sistema completo que entende você como atleta híbrido.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass-card animate-fade-in"
                  style={{
                    padding: 28,
                    animationDelay: `${i * 80}ms`,
                    cursor: 'default',
                  }}
                >
                  <div style={{
                    width: 52, height: 52,
                    background: feature.color + '22',
                    border: `1px solid ${feature.color}33`,
                    borderRadius: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20,
                    color: feature.color,
                  }}>
                    <Icon size={24} />
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 700,
                    fontSize: 17,
                    color: 'var(--text-primary)',
                    marginBottom: 8,
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section style={{ padding: '80px 24px', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5vw, 56px)',
            letterSpacing: '0.04em',
            marginBottom: 48,
          }}>
            COMO FUNCIONA
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="glass-card animate-fade-in"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  padding: 24,
                  animationDelay: `${i * 100}ms`,
                  cursor: 'default',
                }}
              >
                <div style={{
                  width: 48, height: 48,
                  background: 'var(--gradient-lime)',
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: 24,
                  color: '#08080E',
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4, fontFamily: 'var(--font-ui)' }}>
                    {step.title}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    {step.description}
                  </div>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--text-muted)', marginLeft: 'auto', flexShrink: 0 }} />
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary btn-lg animate-glow"
            style={{ marginTop: 40 }}
            onClick={() => navigate('/anamnese')}
          >
            Começar agora — é grátis
            <ArrowRight size={20} />
          </button>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '32px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 13,
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.08em', color: 'var(--text-primary)', marginBottom: 8 }}>
            HYBRID FORGE
          </div>
          <p>Baseado em ciência. Feito para resultados.</p>
        </footer>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: Brain,
    title: 'Anamnese Inteligente',
    description: 'Análise completa do seu perfil: histórico, limitações, objetivos e nível atual. A IA entende quem você é.',
    color: '#9B59FF',
  },
  {
    icon: Calendar,
    title: 'Plano Semanal Personalizado',
    description: 'Semana estruturada com musculação e corrida sequenciados para evitar interferência e maximizar resultados.',
    color: '#C8FF00',
  },
  {
    icon: Dumbbell,
    title: 'Periodização Científica',
    description: 'Sistema High-Low com progressão de carga automática. Cada treino tem propósito e progressão.',
    color: '#FF5F1F',
  },
  {
    icon: Activity,
    title: 'Corrida Integrada',
    description: 'Treinos de corrida (leve, intervalado, longão) planejados em harmonia com a musculação.',
    color: '#00D4FF',
  },
  {
    icon: TrendingUp,
    title: 'Tracking de Progresso',
    description: 'Registre seus treinos, acompanhe volume, km rodados e evolução semana a semana.',
    color: '#C8FF00',
  },
  {
    icon: Zap,
    title: 'IA com Gemini 2.5 Flash',
    description: 'Integração direta com a IA avançada do Google para orientações e análises técnicas completas.',
    color: '#FF5F1F',
  },
];

const STEPS = [
  { title: 'Preencha a Anamnese', description: 'Responda 5 etapas de perguntas sobre você, seus objetivos e disponibilidade de treino.' },
  { title: 'A IA monta seu plano', description: 'Nosso motor de regras científico cria um plano semanal completo personalizado para você.' },
  { title: 'Siga os treinos', description: 'Abra o treino do dia, siga os exercícios e registre suas séries em tempo real.' },
  { title: 'Acompanhe a evolução', description: 'Veja seu progresso crescendo: volume levantado, km rodados, streak e muito mais.' },
];

// Need this import for the dashboard icon
function LayoutDashboard({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"/>
      <rect width="7" height="5" x="14" y="3" rx="1"/>
      <rect width="7" height="9" x="14" y="12" rx="1"/>
      <rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>
  );
}
