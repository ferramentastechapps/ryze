import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useRyzeStore } from './store/ryzeStore';
import Navigation from './components/Navigation';

import './styles/global.css';

// ─── Code Splitting: páginas carregadas sob demanda ──────────────────────────
const Landing = lazy(() => import('./pages/Landing'));
const Anamnese = lazy(() => import('./pages/Anamnese'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const WeeklyPlan = lazy(() => import('./pages/WeeklyPlan'));
const ActiveWorkout = lazy(() => import('./pages/ActiveWorkout'));
const Progress = lazy(() => import('./pages/Progress'));

// ─── Loading spinner durante lazy load ───────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#08080E',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'Bebas Neue, sans-serif', fontSize: 48,
          color: '#C8FF00', letterSpacing: '0.1em',
        }}>
          RYZE
        </div>
        <div style={{
          marginTop: 16, width: 40, height: 40,
          border: '3px solid rgba(200,255,0,0.2)',
          borderTopColor: '#C8FF00',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '16px auto 0',
        }} />
      </div>
    </div>
  );
}

export default function App() {
  // Zustand: reativo, sem prop drilling, sem onUpdate manual
  const { onboardingComplete, profile, weekPlan, logs } = useRyzeStore();

  const state = { profile, weekPlan, logs, currentWeek: 1, onboardingComplete };
  const refresh = () => {}; // Zustand é reativo — não precisa de refresh manual

  const isOnboarded = onboardingComplete;

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing isOnboarded={isOnboarded} />} />
          <Route path="/anamnese" element={<Anamnese onComplete={refresh} />} />
          <Route
            path="/dashboard"
            element={isOnboarded ? <Dashboard state={state} onUpdate={refresh} /> : <Navigate to="/anamnese" />}
          />
          <Route
            path="/plano"
            element={isOnboarded ? <WeeklyPlan state={state} onUpdate={refresh} /> : <Navigate to="/anamnese" />}
          />
          <Route
            path="/treino/:dayKey"
            element={isOnboarded ? <ActiveWorkout state={state} onUpdate={refresh} /> : <Navigate to="/anamnese" />}
          />
          <Route
            path="/progresso"
            element={isOnboarded ? <Progress state={state} /> : <Navigate to="/anamnese" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>

      {isOnboarded && <Navigation />}
    </BrowserRouter>
  );
}
