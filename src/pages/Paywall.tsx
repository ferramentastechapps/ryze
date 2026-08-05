import { redirectToCheckout } from '../services/subscriptionService';
import { useAuthStore } from '../store/authStore';
import { signOut } from '../services/authService';
import { getTrialDaysRemaining } from '../services/subscriptionService';

export default function Paywall() {
  const { user, authProfile } = useAuthStore();

  const handleSubscribe = async () => {
    if (!user) return;
    await redirectToCheckout(user.id, user.email ?? '');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const daysUsed = authProfile
    ? Math.max(0, 30 - getTrialDaysRemaining(authProfile))
    : 30;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glows */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300,
        background: 'radial-gradient(ellipse, rgba(255,95,31,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        {/* Logo */}
        <img src="/logo-capa.png" alt="RYZE" style={{ height: 44, objectFit: 'contain', marginBottom: 8 }} />

        {/* Expired badge */}
        <div style={{
          background: 'rgba(255,95,31,0.1)',
          border: '1px solid rgba(255,95,31,0.3)',
          borderRadius: 100,
          padding: '6px 16px',
          fontSize: 12,
          fontWeight: 700,
          color: '#FF5F1F',
          letterSpacing: '0.08em',
          fontFamily: 'var(--font-ui)',
        }}>
          ⏰ SEU TRIAL DE 30 DIAS EXPIROU
        </div>

        {/* Card */}
        <div style={{
          width: '100%',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 24,
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 32,
              letterSpacing: '0.04em',
              color: 'var(--text-primary)',
              margin: '0 0 12px',
              lineHeight: 1.1,
            }}>
              Continue sua
              <br />
              <span style={{ color: 'var(--accent-lime)' }}>evolução</span>
            </h1>
            <p style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              margin: 0,
              lineHeight: 1.6,
              fontFamily: 'var(--font-body)',
            }}>
              Você usou {daysUsed} dias do RYZE. Assine para
              <br />
              continuar treinando sem interrupções.
            </p>
          </div>

          {/* Price card */}
          <div style={{
            width: '100%',
            background: 'linear-gradient(135deg, rgba(200,255,0,0.08), rgba(200,255,0,0.02))',
            border: '1px solid rgba(200,255,0,0.25)',
            borderRadius: 16,
            padding: '24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', marginBottom: 8 }}>
              PLANO PRO
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
              <span style={{ fontSize: 18, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>R$</span>
              <span style={{ fontSize: 52, fontWeight: 900, color: 'var(--accent-lime)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>9</span>
              <span style={{ fontSize: 32, fontWeight: 900, color: 'var(--accent-lime)', fontFamily: 'var(--font-display)' }}>,90</span>
              <span style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>/mês</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Cancele quando quiser</div>
          </div>

          {/* Features */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { emoji: '🤖', text: 'Plano semanal gerado por IA' },
              { emoji: '🏋️', text: 'Musculação + Corrida integrados' },
              { emoji: '📊', text: 'Progresso e analytics completos' },
              { emoji: '⚡', text: 'App offline (PWA nativo)' },
              { emoji: '🔥', text: 'Atualizações e novas features incluídas' },
            ].map(({ emoji, text }) => (
              <div key={text} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 14,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
              }}>
                <span style={{ fontSize: 18 }}>{emoji}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Subscribe button */}
          <button
            id="subscribe-btn"
            onClick={handleSubscribe}
            style={{
              width: '100%',
              padding: '16px',
              background: 'var(--gradient-lime)',
              color: '#08080E',
              border: 'none',
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(200,255,0,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ASSINAR POR R$9,90/MÊS →
          </button>

          <button
            onClick={handleSignOut}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
