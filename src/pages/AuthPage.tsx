import { signInWithGoogle } from '../services/authService';
import { useState, useEffect } from 'react';
import TermsPrivacyModal from '../components/TermsPrivacyModal';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalTab, setModalTab] = useState<'terms' | 'privacy' | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Detect error returned in URL query string or hash from OAuth redirect
    const searchParams = new URLSearchParams(window.location.search);
    const hashStr = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
    const hashParams = new URLSearchParams(hashStr);

    const errDesc = searchParams.get('error_description') || hashParams.get('error_description');
    const errCode = searchParams.get('error') || hashParams.get('error');

    if (errDesc || errCode) {
      const msg = errDesc || errCode || 'Erro desconhecido ao autenticar com o Google';
      console.error('[AuthPage] OAuth redirect error:', msg);
      setError(`Erro no retorno do Google: ${decodeURIComponent(msg)}`);
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err: any) {
      console.error('[AuthPage] signInWithGoogle error:', err);
      setError(err?.message || 'Erro ao entrar com Google. Tente novamente.');
      setLoading(false);
    }
  };

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
      {/* Animated background glows */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 500,
        height: 500,
        background: 'radial-gradient(circle, rgba(200,255,0,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: 300,
        height: 300,
        background: 'radial-gradient(circle, rgba(155,89,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: 420,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
      }}>
        {/* Logo */}
        <img
          src="/logo-capa.png"
          alt="RYZE"
          style={{ height: 56, width: 'auto', objectFit: 'contain', marginBottom: 40 }}
        />

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
          gap: 24,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        }}>
          {/* Trial badge */}
          <div style={{
            background: 'rgba(200,255,0,0.1)',
            border: '1px solid rgba(200,255,0,0.3)',
            borderRadius: 100,
            padding: '6px 16px',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--accent-lime)',
            letterSpacing: '0.08em',
            fontFamily: 'var(--font-ui)',
          }}>
            ✦ 30 DIAS GRÁTIS
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              letterSpacing: '0.04em',
              color: 'var(--text-primary)',
              margin: '0 0 10px',
              lineHeight: 1.1,
            }}>
              Comece sua
              <br />
              <span style={{ color: 'var(--accent-lime)' }}>transformação</span>
            </h1>
            <p style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              margin: 0,
              lineHeight: 1.6,
              fontFamily: 'var(--font-body)',
            }}>
              IA com embasamento científico.
              <br />
              30 dias grátis, depois R$9,90/mês.
            </p>
          </div>

          {/* Google button */}
          <button
            id="google-signin-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '14px 24px',
              background: loading ? 'rgba(255,255,255,0.05)' : '#fff',
              color: '#1f1f1f',
              border: 'none',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'var(--font-ui)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.7 : 1,
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {/* Google icon */}
            {loading ? (
              <div style={{
                width: 20, height: 20,
                border: '2px solid rgba(31,31,31,0.2)',
                borderTopColor: '#1f1f1f',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? 'Entrando...' : 'Continuar com Google'}
          </button>

          {error && (
            <p style={{ color: '#FF5F1F', fontSize: 13, textAlign: 'center', margin: 0 }}>
              {error}
            </p>
          )}

          {/* Features */}
          <div style={{
            width: '100%',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            {[
              '🔬 IA com embasamento científico',
              '🏋️ Musculação + Corrida integrados',
              '📊 Acompanhamento de progresso',
              '⚡ Funciona offline (PWA)',
            ].map(f => (
              <div key={f} style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                {f}
              </div>
            ))}
          </div>

          <p style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.5,
          }}>
            Ao entrar, você concorda com os{' '}
            <button
              onClick={() => setModalTab('terms')}
              style={{
                background: 'none', border: 'none', padding: 0,
                color: 'var(--accent-lime)', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 'inherit',
                textDecoration: 'underline',
              }}
            >
              Termos de Uso
            </button>
            {' '}e{' '}
            <button
              onClick={() => setModalTab('privacy')}
              style={{
                background: 'none', border: 'none', padding: 0,
                color: 'var(--accent-lime)', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 'inherit',
                textDecoration: 'underline',
              }}
            >
              Privacidade
            </button>.
          </p>

          {/* Diagnostic Button */}
          <button
            onClick={() => setShowDebug(!showDebug)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 11,
              cursor: 'pointer',
              textDecoration: 'underline',
              marginTop: 4,
            }}
          >
            {showDebug ? 'Ocultar Diagnóstico' : '🔍 Diagnóstico de Conexão'}
          </button>

          {showDebug && (
            <div style={{
              width: '100%',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              padding: 12,
              fontSize: 11,
              fontFamily: 'monospace',
              color: 'var(--text-secondary)',
              wordBreak: 'break-all',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              <div><strong>Origem Atual:</strong> {window.location.origin}</div>
              <div><strong>URL Completa:</strong> {window.location.href}</div>
              {error && <div style={{ color: '#FF5F1F' }}><strong>Erro Registrado:</strong> {error}</div>}
            </div>
          )}
        </div>
      </div>

      {modalTab && (
        <TermsPrivacyModal
          initialTab={modalTab}
          onClose={() => setModalTab(null)}
        />
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
