import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useRyzeStore } from './store/ryzeStore';
import Navigation from './components/Navigation';

// Importação estática direta
import Landing from './pages/Landing';
import Anamnese from './pages/Anamnese';
import Dashboard from './pages/Dashboard';
import WeeklyPlan from './pages/WeeklyPlan';
import ActiveWorkout from './pages/ActiveWorkout';
import Progress from './pages/Progress';

import './styles/global.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { onboardingComplete, profile, weekPlan, logs } = useRyzeStore();

  const state = { profile, weekPlan, logs, currentWeek: 1, onboardingComplete };
  const refresh = () => {};

  const isOnboarded = onboardingComplete;

  return (
    <BrowserRouter>
      <ScrollToTop />
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
    </BrowserRouter>
  );
}
