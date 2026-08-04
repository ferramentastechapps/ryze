import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { loadState } from './store/appStore';
import type { AppState } from './types';

// Pages
import Landing from './pages/Landing';
import Anamnese from './pages/Anamnese';
import Dashboard from './pages/Dashboard';
import WeeklyPlan from './pages/WeeklyPlan';
import ActiveWorkout from './pages/ActiveWorkout';
import Progress from './pages/Progress';
import Navigation from './components/Navigation';

import './styles/global.css';

export default function App() {
  const [state, setState] = useState<AppState>(loadState());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const refresh = () => setState(loadState());

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#08080E' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 48, color: '#C8FF00', letterSpacing: '0.1em' }}>
            HYBRID FORGE
          </div>
          <div style={{ marginTop: 16, width: 40, height: 40, border: '3px solid rgba(200,255,0,0.2)', borderTopColor: '#C8FF00', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '16px auto 0' }} />
        </div>
      </div>
    );
  }

  const isOnboarded = state.onboardingComplete;

  return (
    <BrowserRouter>
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

      {isOnboarded && <Navigation />}
    </BrowserRouter>
  );
}
