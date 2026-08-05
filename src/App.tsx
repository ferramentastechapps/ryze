import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useRyzeStore } from './store/ryzeStore';
import { useAuthStore } from './store/authStore';
import Navigation from './components/Navigation';

// Importação estática direta
import Landing from './pages/Landing';
import Anamnese from './pages/Anamnese';
import Dashboard from './pages/Dashboard';
import WeeklyPlan from './pages/WeeklyPlan';
import ActiveWorkout from './pages/ActiveWorkout';
import Progress from './pages/Progress';
import AuthPage from './pages/AuthPage';
import Paywall from './pages/Paywall';

import './styles/global.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// ─── Auth Gate: protege rotas com base no status ──────────────────────────────
function AuthGate({ children, isOnboarded }: { children: React.ReactNode; isOnboarded: boolean }) {
  const { accessStatus, authLoading } = useAuthStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Redireciona para o app após login bem-sucedido
  useEffect(() => {
    if (!authLoading && (accessStatus === 'trial' || accessStatus === 'active')) {
      // Se o usuário está autenticado e está na raiz /  (landing ou callback OAuth),
      // redireciona para o destino correto dentro do app
      if (pathname === '/' || pathname === '') {
        if (isOnboarded) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/anamnese', { replace: true });
        }
      }
    }
  }, [authLoading, accessStatus, pathname, isOnboarded, navigate]);

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
      }}>
        <img src="/logo-capa.png" alt="RYZE" style={{ height: 44, objectFit: 'contain' }} />
        <div style={{
          width: 24, height: 24,
          border: '2px solid rgba(200,255,0,0.2)',
          borderTopColor: 'var(--accent-lime)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (accessStatus === 'unauthenticated') return <AuthPage />;
  if (accessStatus === 'expired') return <Paywall />;

  return <>{children}</>;
}

export default function App() {
  const { onboardingComplete, profile, weekPlan, logs } = useRyzeStore();
  const { initialize } = useAuthStore();

  // Inicializa listener de autenticação
  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  const state = { profile, weekPlan, logs, currentWeek: 1, onboardingComplete };
  const refresh = () => {};

  const isOnboarded = onboardingComplete;

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthGate isOnboarded={isOnboarded}>
        <Routes>
          <Route path="/" element={<Landing isOnboarded={isOnboarded} />} />
          <Route path="/anamnese" element={<Anamnese onComplete={refresh} />} />
          <Route
            path="/dashboard"
            element={isOnboarded ? <Dashboard state={state} onUpdate={refresh} /> : <Navigate to="/anamnese" replace />}
          />
          <Route
            path="/plano"
            element={isOnboarded ? <WeeklyPlan state={state} onUpdate={refresh} /> : <Navigate to="/anamnese" replace />}
          />
          <Route
            path="/treino/:dayKey"
            element={isOnboarded ? <ActiveWorkout state={state} onUpdate={refresh} /> : <Navigate to="/anamnese" replace />}
          />
          <Route
            path="/progresso"
            element={isOnboarded ? <Progress state={state} /> : <Navigate to="/anamnese" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {isOnboarded && <Navigation />}
      </AuthGate>
    </BrowserRouter>
  );
}
