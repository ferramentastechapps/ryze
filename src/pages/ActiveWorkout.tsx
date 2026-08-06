import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Check, ChevronLeft, Clock, Trophy, X, Info, Activity,
  Flame, Heart, Wind, Zap, Lightbulb, TrendingUp, AlertTriangle, Plus, Minus,
} from 'lucide-react';
import type { AppState, StrengthWorkout, RunWorkout, Exercise, Badge } from '../types';
import { getLastExerciseData } from '../store/appStore';
import { useRyzeStore } from '../store/ryzeStore';
import { useGamificationStore } from '../store/gamificationStore';
import { AchievementToast } from '../components/AchievementToast';
import ExerciseDemoModal from '../components/ExerciseDemoModal';

interface ActiveWorkoutProps {
  state: AppState;
  onUpdate: () => void;
}

const WEEK_DAYS = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

// ─── Haptic Feedback Helper ─────────────────────────────────────────────────
function haptic(pattern: number | number[]) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

export default function ActiveWorkout({ state, onUpdate }: ActiveWorkoutProps) {
  const { dayKey } = useParams<{ dayKey: string }>();
  const navigate = useNavigate();
  const { weekPlan, logs } = state;
  const addLog = useRyzeStore(s => s.addLog);
  const { checkAndAwardWorkout } = useGamificationStore();

  const workout = dayKey && weekPlan ? weekPlan.days[dayKey] : null;

  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  // Série atual por exercício: { [exerciseId]: número de séries concluídas }
  const [completedSetsMap, setCompletedSetsMap] = useState<Record<string, number>>({});
  const [exerciseRpeMap, setExerciseRpeMap] = useState<Record<string, number>>({});
  const [showFinished, setShowFinished] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restTotal, setRestTotal] = useState<number>(60);
  const [selectedDemo, setSelectedDemo] = useState<{ id: string; name: string; muscles: string[] } | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [earnedXp, setEarnedXp] = useState<number>(0);
  const [showAchievementToast, setShowAchievementToast] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // ─── Wake Lock API (tela não apaga durante o treino) ────────────────────
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch {
        // Wake Lock não suportado — ok
      }
    };

    if (isRunning) requestWakeLock();

    return () => {
      wakeLockRef.current?.release().catch(() => {});
    };
  }, [isRunning]);

  // Reativar wake lock quando a página volta ao foco
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isRunning && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch { /* ok */ }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning]);

  // ─── Timer principal ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ─── Timer de descanso com Haptic Feedback ──────────────────────────────
  const startRestTimer = useCallback((seconds: number) => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRestTimer(seconds);
    setRestTotal(seconds);

    restTimerRef.current = setInterval(() => {
      setRestTimer(prev => {
        if (prev === null || prev <= 1) {
          if (restTimerRef.current) clearInterval(restTimerRef.current);
          // Vibrar forte quando o descanso terminar
          haptic([300, 100, 300, 100, 300]);
          return null;
        }
        // Vibração leve nos últimos 3 segundos
        if (prev <= 4) haptic(60);
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ─── Série individual concluída ──────────────────────────────────────────
  const handleSetComplete = useCallback((exerciseId: string, totalSets: number, restSeconds: number) => {
    haptic(80); // Feedback tátil ao concluir uma série

    setCompletedSetsMap(prev => {
      const current = (prev[exerciseId] || 0) + 1;
      const next = { ...prev, [exerciseId]: current };

      if (current >= totalSets) {
        // Todas as séries concluídas → marcar exercício como completo
        setCompletedExercises(p => new Set([...p, exerciseId]));
        haptic([100, 50, 100]); // Vibração de conclusão
        if (restSeconds > 0) startRestTimer(restSeconds);
      } else {
        // Série intermediária → timer de descanso mais curto
        if (restSeconds > 0) startRestTimer(restSeconds);
      }

      setActiveExercise(exerciseId);
      return next;
    });
  }, [startRestTimer]);

  // Desmarcar um exercício (undone)
  const handleUnmarkExercise = useCallback((exerciseId: string) => {
    haptic(40);
    setCompletedExercises(prev => {
      const next = new Set(prev);
      next.delete(exerciseId);
      return next;
    });
    setCompletedSetsMap(prev => ({ ...prev, [exerciseId]: 0 }));
  }, []);

  // ─── Concluir treino ─────────────────────────────────────────────────────
  const finishWorkout = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    wakeLockRef.current?.release().catch(() => {});
    haptic([200, 100, 200, 100, 400]);

    const log = {
      id: `${dayKey}-${Date.now()}`,
      date: new Date().toISOString(),
      dayOfWeek: dayKey || '',
      workout: workout!,
      completed: true,
      duration: Math.round(elapsedTime / 60),
    };
    addLog(log);   // Zustand store (reativo — UI atualiza automaticamente)
    onUpdate();
    setShowFinished(true);
  };

  // ─── Sair com confirmação ────────────────────────────────────────────────
  const handleBack = () => {
    if (completedExercises.size > 0 || Object.values(completedSetsMap).some(v => v > 0)) {
      setShowExitConfirm(true);
    } else {
      navigate('/plano');
    }
  };

  if (!workout || !dayKey) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Treino não encontrado.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/plano')}>
            Voltar ao plano
          </button>
        </div>
      </div>
    );
  }

  if (showFinished) {
    return (
      <>
        {showAchievementToast && (
          <AchievementToast
            badges={newBadges}
            earnedXp={earnedXp}
            onClose={() => setShowAchievementToast(false)}
          />
        )}
        <FinishedScreen elapsedTime={elapsedTime} workout={workout} completedExercises={completedExercises} onContinue={() => navigate('/dashboard')} />
      </>
    );
  }

  const isHybrid = workout.type === 'hibrido';
  const isStrength = workout.type === 'musculacao' || isHybrid;
  const isRun = workout.type === 'corrida' || isHybrid;
  const accentColor = isHybrid ? 'var(--accent-lime)' : isStrength ? 'var(--accent-orange)' : 'var(--accent-cyan)';
  const accentGradient = isHybrid ? 'var(--gradient-lime)' : isStrength ? 'var(--gradient-orange)' : 'var(--gradient-cyan)';

  const strengthWorkout = isHybrid ? (workout as any).strength as StrengthWorkout : isStrength ? workout as StrengthWorkout : null;
  const runWorkout = isHybrid ? (workout as any).run as RunWorkout : isRun ? workout as RunWorkout : null;

  const totalExercises = strengthWorkout?.exercises.length || 0;
  const progress = totalExercises > 0 ? (completedExercises.size / totalExercises) * 100 : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: 120 }}>
      {/* Header bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,8,14,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <button onClick={handleBack} className="btn btn-icon btn-ghost" style={{ flexShrink: 0 }}>
          <ChevronLeft size={20} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {workout.title}
          </div>
          {/* Progress bar */}
          {isStrength && (
            <div style={{ height: 3, background: 'var(--border-subtle)', borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: accentGradient,
                borderRadius: 3,
                transition: 'width 0.4s ease',
              }} />
            </div>
          )}
        </div>

        {/* Timer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-full)',
          flexShrink: 0,
        }}>
          <Clock size={14} color="var(--text-muted)" />
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
            {formatTime(elapsedTime)}
          </span>
        </div>
      </div>

      {/* ─── Modal de confirmação de saída ─────────────────────────────── */}
      {showExitConfirm && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(8,8,14,0.92)',
          zIndex: 300,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 32,
          backdropFilter: 'blur(12px)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-xl)',
            padding: 28,
            maxWidth: 340,
            width: '100%',
            textAlign: 'center',
          }}>
            <div style={{
              width: 56, height: 56,
              borderRadius: 16,
              background: 'rgba(255,95,31,0.15)',
              border: '1px solid rgba(255,95,31,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--accent-orange)',
            }}>
              <AlertTriangle size={28} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>
              Sair do treino?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>
              Você tem {completedExercises.size} exercício{completedExercises.size !== 1 ? 's' : ''} concluído{completedExercises.size !== 1 ? 's' : ''}. O progresso não será salvo.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowExitConfirm(false)}
              >
                Continuar
              </button>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={() => {
                  wakeLockRef.current?.release().catch(() => {});
                  navigate('/plano');
                }}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Timer de descanso overlay ────────────────────────────────────── */}
      {restTimer !== null && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(8,8,14,0.92)',
          zIndex: 200,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 20,
          backdropFilter: 'blur(12px)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.08em', fontSize: 13, textTransform: 'uppercase' }}>
            DESCANSO
          </div>

          {/* Anel de progresso do timer */}
          <div style={{ position: 'relative', width: 180, height: 180 }}>
            <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="90" cy="90" r="80" fill="none" stroke="var(--border-subtle)" strokeWidth="6" />
              <circle
                cx="90" cy="90" r="80"
                fill="none"
                stroke={accentColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 * (1 - (restTimer / restTotal))}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 64,
                color: restTimer <= 3 ? 'var(--accent-lime)' : accentColor,
                lineHeight: 1,
                letterSpacing: '0.02em',
                transition: 'color 0.3s',
              }}>
                {restTimer}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-ui)', fontWeight: 600 }}>
                segundos
              </span>
            </div>
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => {
              if (restTimerRef.current) clearInterval(restTimerRef.current);
              haptic(40);
              setRestTimer(null);
            }}
          >
            <X size={16} /> Pular descanso
          </button>
        </div>
      )}

      <div style={{ padding: '20px' }}>
        {/* ─── Strength Workout ──────────────────────────────────────────── */}
        {strengthWorkout && (
          <div>
            {/* Progress stats */}
            <div className="animate-fade-in" style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24,
            }}>
              {[
                { label: 'Concluídos', value: completedExercises.size, color: 'var(--accent-lime)' },
                { label: 'Restantes', value: totalExercises - completedExercises.size, color: accentColor },
                { label: 'Progresso', value: `${Math.round(progress)}%`, color: 'var(--text-primary)' },
              ].map(stat => (
                <div key={stat.label} className="metric-card" style={{ textAlign: 'center', padding: '12px 8px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: stat.color, lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Exercise list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {strengthWorkout.exercises.map((exercise, i) => {
                const done = completedExercises.has(exercise.id);
                const isActive = activeExercise === exercise.id;
                const completedSets = completedSetsMap[exercise.id] || 0;
                const lastData = getLastExerciseData(logs, exercise.id);

                return (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    index={i}
                    isDone={done}
                    isActive={isActive}
                    accentColor={accentColor}
                    completedSets={completedSets}
                    lastData={lastData}
                    onSetComplete={() => handleSetComplete(exercise.id, exercise.sets, exercise.rest)}
                    onUnmark={() => handleUnmarkExercise(exercise.id)}
                    onOpenDemo={() => setSelectedDemo({
                      id: exercise.id,
                      name: exercise.name,
                      muscles: exercise.muscleGroups,
                    })}
                  />
                );
              })}
            </div>

            {/* Exercise Demo Modal */}
            {selectedDemo && (
              <ExerciseDemoModal
                exerciseId={selectedDemo.id}
                exerciseName={selectedDemo.name}
                muscleGroups={selectedDemo.muscles}
                onClose={() => setSelectedDemo(null)}
              />
            )}

            {/* Finish button */}
            <div style={{ marginTop: 32 }}>
              {completedExercises.size === totalExercises && totalExercises > 0 ? (
                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  onClick={finishWorkout}
                >
                  <Trophy size={20} />
                  Concluir treino!
                </button>
              ) : (
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                  onClick={finishWorkout}
                >
                  Encerrar treino ({completedExercises.size}/{totalExercises})
                </button>
              )}
            </div>
          </div>
        )}

        {/* ─── Run Workout ───────────────────────────────────────────────── */}
        {runWorkout && (
          <div className="animate-fade-in">
            <div style={{
              background: 'var(--accent-cyan-dim)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 'var(--radius-xl)',
              padding: 24,
              marginBottom: 20,
              textAlign: 'center',
            }}>
              <div style={{
                width: 56, height: 56,
                borderRadius: 16,
                background: 'rgba(0,212,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-cyan)',
                margin: '0 auto 16px',
              }}>
                <Activity size={28} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 64, color: 'var(--accent-cyan)', lineHeight: 1 }}>
                {runWorkout.distance}
              </div>
              <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
                quilômetros
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text-primary)' }}>{runWorkout.paceTarget}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>PACE ALVO</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text-primary)' }}>{runWorkout.duration}min</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>DURAÇÃO</div>
                </div>
              </div>
            </div>

            {/* Run details cards */}
            {[
              { label: 'Aquecimento', content: runWorkout.warmup, icon: Flame, color: 'var(--accent-orange)' },
              { label: 'Zona de FC', content: runWorkout.heartRateZone, icon: Heart, color: 'var(--accent-orange)' },
              { label: 'Desaquecimento', content: runWorkout.cooldown, icon: Wind, color: 'var(--accent-cyan)' },
            ].filter(c => c.content).map(card => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="glass-card" style={{ padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontFamily: 'var(--font-ui)', fontSize: 14, marginBottom: 6 }}>
                    <Icon size={16} style={{ color: card.color }} />
                    {card.label}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{card.content}</div>
                </div>
              );
            })}

            {/* Intervals */}
            {runWorkout.intervals && (
              <div className="glass-card" style={{ padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontFamily: 'var(--font-ui)', fontSize: 14, marginBottom: 12 }}>
                  <Zap size={16} style={{ color: 'var(--accent-cyan)' }} />
                  Intervalos
                </div>
                {runWorkout.intervals.map((iv, i) => (
                  <div key={i} style={{
                    padding: '12px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 8,
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 24, color: 'var(--accent-cyan)',
                      background: 'var(--accent-cyan-dim)',
                      borderRadius: 8, padding: '4px 10px',
                      flexShrink: 0,
                    }}>×{iv.repetitions}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-ui)' }}>{iv.effort} @ {iv.pace}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Recuperação: {iv.recovery}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              className="btn"
              style={{ width: '100%', background: 'var(--gradient-cyan)', color: '#08080E', fontWeight: 800, fontSize: 16, padding: '18px' }}
              onClick={finishWorkout}
            >
              <Trophy size={20} />
              Concluir corrida!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Exercise Card (com séries individuais + progressive overload) ──────────

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  isDone: boolean;
  isActive: boolean;
  accentColor: string;
  completedSets: number;
  lastData: { weight: number; reps: string; date: string } | null;
  onSetComplete: () => void;
  onUnmark: () => void;
  onOpenDemo: () => void;
}

function ExerciseCard({
  exercise,
  index,
  isDone,
  isActive,
  accentColor,
  completedSets,
  lastData,
  onSetComplete,
  onUnmark,
  onOpenDemo,
}: ExerciseCardProps) {

  const lastDateLabel = lastData
    ? (() => {
        const d = new Date(lastData.date);
        const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
        if (diff === 0) return 'hoje';
        if (diff === 1) return 'ontem';
        if (diff < 7) return `${diff}d atrás`;
        return `${Math.floor(diff / 7)}sem atrás`;
      })()
    : null;

  return (
    <div
      className="animate-fade-in"
      style={{
        background: isDone ? 'rgba(200,255,0,0.04)' : 'var(--bg-card)',
        border: `1px solid ${isDone ? 'rgba(200,255,0,0.2)' : isActive ? accentColor + '44' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        transition: 'all 0.3s',
        opacity: isDone ? 0.75 : 1,
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Header do exercício */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
        {/* Número do exercício */}
        <div style={{
          width: 32, height: 32,
          borderRadius: '50%',
          background: isDone ? 'var(--accent-lime)' : 'var(--bg-elevated)',
          border: `2px solid ${isDone ? 'var(--accent-lime)' : accentColor + '44'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          color: isDone ? '#08080E' : 'var(--text-muted)',
          fontFamily: 'var(--font-ui)',
          fontWeight: 800,
          fontSize: 13,
          cursor: isDone ? 'pointer' : 'default',
          transition: 'all 0.2s',
        }} onClick={isDone ? onUnmark : undefined}>
          {isDone ? <Check size={16} strokeWidth={3} /> : index + 1}
        </div>

        {/* Nome + info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {exercise.blockName && (
            <div style={{
              fontSize: 9,
              fontWeight: 900,
              color: 'var(--accent-orange)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-ui)',
              marginBottom: 2,
            }}>
              {exercise.blockName}
            </div>
          )}
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 700,
            fontSize: 15,
            color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {exercise.name}
          </div>
          {exercise.pairedExerciseName && (
            <div style={{ fontSize: 11, color: 'var(--accent-orange)', fontWeight: 700, marginTop: 1 }}>
              + {exercise.pairedExerciseName}
            </div>
          )}
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {exercise.sets} séries · {exercise.reps} reps · {exercise.rest}s descanso
          </div>
        </div>

        {/* Demo Button */}
        <button
          onClick={onOpenDemo}
          title="Ver Demonstração"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 10px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--accent-lime)',
            fontFamily: 'var(--font-ui)',
            fontWeight: 700,
            fontSize: 11,
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
        >
          <Info size={13} />
          Guia
        </button>
      </div>

      {/* ─── Progressive Overload: última carga ─────────────────────────── */}
      {lastData && !isDone && (
        <div style={{
          margin: '0 16px',
          padding: '8px 12px',
          background: 'rgba(200,255,0,0.06)',
          border: '1px solid rgba(200,255,0,0.15)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 12,
        }}>
          <TrendingUp size={13} color="var(--accent-lime)" />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Última vez <span style={{ color: 'var(--accent-lime)', fontWeight: 700 }}>
              {lastData.weight}kg × {lastData.reps} reps
            </span>
            <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>({lastDateLabel})</span>
          </span>
        </div>
      )}

      {/* ─── Séries individuais ──────────────────────────────────────────── */}
      {!isDone && (
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Array.from({ length: exercise.sets }).map((_, i) => {
              const isSetDone = i < completedSets;
              const isNextSet = i === completedSets;

              return (
                <button
                  key={i}
                  onClick={isNextSet ? onSetComplete : undefined}
                  disabled={isSetDone || !isNextSet}
                  style={{
                    width: 44, height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: isSetDone
                      ? 'var(--accent-lime)'
                      : isNextSet
                      ? accentColor + '22'
                      : 'var(--bg-elevated)',
                    border: `2px solid ${isSetDone ? 'var(--accent-lime)' : isNextSet ? accentColor : 'var(--border-subtle)'}`,
                    color: isSetDone
                      ? '#08080E'
                      : isNextSet
                      ? accentColor
                      : 'var(--text-muted)',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: isNextSet ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: isNextSet ? 'scale(1.05)' : 'scale(1)',
                  }}
                  title={isSetDone ? `Série ${i + 1} concluída` : isNextSet ? `Concluir série ${i + 1}` : `Série ${i + 1}`}
                >
                  {isSetDone ? <Check size={18} strokeWidth={3} /> : i + 1}
                </button>
              );
            })}
          </div>

          {/* Progresso de séries texto */}
          {completedSets > 0 && completedSets < exercise.sets && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontFamily: 'var(--font-ui)', fontWeight: 600 }}>
              {completedSets} de {exercise.sets} séries concluídas
            </div>
          )}
        </div>
      )}

      {/* Technique tip */}
      {exercise.technique && (
        <div style={{
          padding: '0 16px 14px',
          fontSize: 12,
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          display: 'flex', alignItems: 'flex-start', gap: 6,
        }}>
          <Lightbulb size={14} style={{ color: accentColor, flexShrink: 0, marginTop: 2 }} />
          {exercise.technique}
        </div>
      )}
    </div>
  );
}

// ─── Finished Screen ────────────────────────────────────────────────────────

function FinishedScreen({
  elapsedTime,
  workout,
  completedExercises,
  onContinue,
}: {
  elapsedTime: number;
  workout: any;
  completedExercises: Set<string>;
  onContinue: () => void;
}) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center',
      padding: 32,
      background: '#08080E',
    }}>
      {/* Trophy animation */}
      <div style={{
        width: 80, height: 80,
        borderRadius: 24,
        background: 'var(--accent-lime-dim)',
        border: '1px solid var(--accent-lime)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--accent-lime)',
        marginBottom: 24,
        animation: 'float 3s ease-in-out infinite',
      }}>
        <Trophy size={44} />
      </div>

      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 56,
        letterSpacing: '0.04em',
        color: 'var(--accent-lime)',
        marginBottom: 8,
      }}>
        TREINO<br />COMPLETO!
      </h2>

      <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 40 }}>
        Mais uma sessão no banco. Consistência é tudo.
      </p>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16,
        width: '100%', maxWidth: 320, marginBottom: 40,
      }}>
        <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--accent-lime)' }}>
            {formatTime(elapsedTime)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.06em', marginTop: 4 }}>
            DURAÇÃO
          </div>
        </div>
        {workout.type === 'musculacao' && (
          <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--accent-orange)' }}>
              {completedExercises.size}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.06em', marginTop: 4 }}>
              EXERCÍCIOS
            </div>
          </div>
        )}
        {workout.type === 'corrida' && (
          <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--accent-cyan)' }}>
              {workout.distance}km
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.06em', marginTop: 4 }}>
              DISTÂNCIA
            </div>
          </div>
        )}
      </div>

      <button
        className="btn btn-primary btn-lg"
        style={{ width: '100%', maxWidth: 320 }}
        onClick={onContinue}
      >
        Voltar ao Dashboard
      </button>
    </div>
  );
}
