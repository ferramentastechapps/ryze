import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, Clock, Trophy, X, Plus, Minus, Info, Activity, Flame, Heart, Wind, Zap, Lightbulb } from 'lucide-react';
import type { AppState, StrengthWorkout, RunWorkout, Exercise, LoggedSet } from '../types';
import { logWorkout } from '../store/appStore';
import ExerciseDemoModal from '../components/ExerciseDemoModal';

interface ActiveWorkoutProps {
  state: AppState;
  onUpdate: () => void;
}

const WEEK_DAYS = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

export default function ActiveWorkout({ state, onUpdate }: ActiveWorkoutProps) {
  const { dayKey } = useParams<{ dayKey: string }>();
  const navigate = useNavigate();
  const { weekPlan } = state;

  const workout = dayKey && weekPlan ? weekPlan.days[dayKey] : null;

  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [showFinished, setShowFinished] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<{ id: string; name: string; muscles: string[] } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const startRestTimer = (seconds: number) => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRestTimer(seconds);
    restTimerRef.current = setInterval(() => {
      setRestTimer(prev => {
        if (prev === null || prev <= 1) {
          if (restTimerRef.current) clearInterval(restTimerRef.current);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const toggleExercise = (exId: string, restSeconds: number) => {
    setCompletedExercises(prev => {
      const next = new Set(prev);
      if (next.has(exId)) {
        next.delete(exId);
      } else {
        next.add(exId);
        if (restSeconds > 0) startRestTimer(restSeconds);
      }
      return next;
    });
    setActiveExercise(exId);
  };

  const finishWorkout = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const log = {
      id: `${dayKey}-${Date.now()}`,
      date: new Date().toISOString(),
      dayOfWeek: dayKey || '',
      workout: workout!,
      completed: true,
      duration: Math.round(elapsedTime / 60),
    };
    logWorkout(log);
    onUpdate();
    setShowFinished(true);
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
    return <FinishedScreen elapsedTime={elapsedTime} workout={workout} completedExercises={completedExercises} onContinue={() => navigate('/dashboard')} />;
  }

  const isStrength = workout.type === 'musculacao';
  const isRun = workout.type === 'corrida';
  const accentColor = isStrength ? 'var(--accent-orange)' : 'var(--accent-cyan)';
  const accentGradient = isStrength ? 'var(--gradient-orange)' : 'var(--gradient-cyan)';

  const strengthWorkout = isStrength ? workout as StrengthWorkout : null;
  const runWorkout = isRun ? workout as RunWorkout : null;

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
        <button onClick={() => navigate('/plano')} className="btn btn-icon btn-ghost" style={{ flexShrink: 0 }}>
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

      {/* Rest timer overlay */}
      {restTimer !== null && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(8,8,14,0.92)',
          zIndex: 200,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 24,
          backdropFilter: 'blur(12px)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.08em', fontSize: 13, textTransform: 'uppercase' }}>
            DESCANSO
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 96,
            color: accentColor,
            lineHeight: 1,
            letterSpacing: '0.02em',
          }}>
            {restTimer}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>segundos</div>
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (restTimerRef.current) clearInterval(restTimerRef.current);
              setRestTimer(null);
            }}
          >
            <X size={16} /> Pular descanso
          </button>
        </div>
      )}

      <div style={{ padding: '20px' }}>
        {/* Strength Workout */}
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

                return (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    index={i}
                    isDone={done}
                    isActive={isActive}
                    accentColor={accentColor}
                    onToggle={() => toggleExercise(exercise.id, exercise.rest)}
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
              {completedExercises.size === totalExercises ? (
                <button
                  className="btn btn-primary btn-lg animate-glow"
                  style={{ width: '100%' }}
                  onClick={finishWorkout}
                >
                  <Trophy size={20} />
                  Concluir treino! 🎉
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

        {/* Run Workout */}
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
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-ui)', fontSize: 14, marginBottom: 12 }}>⚡ Intervalos</div>
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
              Concluir corrida! 🎉
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Exercise Card ─────────────────────────────────────────────────────────

function ExerciseCard({
  exercise,
  index,
  isDone,
  isActive,
  accentColor,
  onToggle,
  onOpenDemo,
}: {
  exercise: Exercise;
  index: number;
  isDone: boolean;
  isActive: boolean;
  accentColor: string;
  onToggle: () => void;
  onOpenDemo: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="animate-fade-in"
      style={{
        background: isDone ? 'rgba(200,255,0,0.04)' : 'var(--bg-card)',
        border: `1px solid ${isDone ? 'rgba(200,255,0,0.2)' : isActive ? accentColor + '44' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        transition: 'all 0.3s',
        opacity: isDone ? 0.7 : 1,
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
        {/* Check button */}
        <button
          onClick={onToggle}
          style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: isDone ? 'var(--accent-lime)' : 'var(--bg-elevated)',
            border: `2px solid ${isDone ? 'var(--accent-lime)' : accentColor + '44'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s',
            color: isDone ? '#08080E' : 'var(--text-muted)',
          }}
        >
          <Check size={16} strokeWidth={3} />
        </button>

        {/* Exercise info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 700,
            fontSize: 15,
            color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {exercise.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {exercise.sets} séries · {exercise.reps} reps · {exercise.rest}s descanso
          </div>
        </div>

        {/* Demo Button */}
        <button
          onClick={onOpenDemo}
          title="Ver Demonstração e Execução"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
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

        {/* Sets/Reps badge */}
        <div style={{
          padding: '6px 12px',
          background: isDone ? 'var(--accent-lime-dim)' : accentColor + '22',
          borderRadius: 'var(--radius-full)',
          fontFamily: 'var(--font-ui)',
          fontWeight: 800,
          fontSize: 14,
          color: isDone ? 'var(--accent-lime)' : accentColor,
          flexShrink: 0,
          cursor: 'pointer',
        }} onClick={() => setExpanded(e => !e)}>
          {exercise.sets}×{exercise.reps}
        </div>
      </div>

      {/* Technique tip */}
      {exercise.technique && (
        <div style={{
          padding: '0 16px 14px 66px',
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

// ─── Finished Screen ───────────────────────────────────────────────────────

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
      background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(200,255,0,0.1) 0%, transparent 60%), #08080E',
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
        animation: 'glow-pulse 2s ease-in-out infinite',
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
        className="btn btn-primary btn-lg animate-glow"
        style={{ width: '100%', maxWidth: 320 }}
        onClick={onContinue}
      >
        Voltar ao Dashboard
      </button>
    </div>
  );
}
