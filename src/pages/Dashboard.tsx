import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Activity, Flame, TrendingUp, ChevronRight, Play, Trophy, Zap, Sparkles } from 'lucide-react';
import type { AppState, DayWorkout, StrengthWorkout, RunWorkout } from '../types';
import { getTodayWorkout, getProgressStats, logWorkout } from '../store/appStore';
import { loadAICoach } from '../services/geminiService';
import ExerciseDemoModal from '../components/ExerciseDemoModal';
import CoachTipModal from '../components/CoachTipModal';

interface DashboardProps {
  state: AppState;
  onUpdate: () => void;
}

const DAY_NAMES_PT: Record<string, string> = {
  segunda: 'Segunda-feira',
  terca: 'Terça-feira',
  quarta: 'Quarta-feira',
  quinta: 'Quinta-feira',
  sexta: 'Sexta-feira',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

const WEEK_DAYS = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
const WEEK_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function getWorkoutIcon(workout: DayWorkout) {
  if (workout.type === 'musculacao') return <Dumbbell size={18} />;
  if (workout.type === 'corrida') return <Activity size={18} />;
  return <Zap size={18} />;
}

function getWorkoutColor(workout: DayWorkout) {
  if (workout.type === 'musculacao') return 'var(--accent-orange)';
  if (workout.type === 'corrida') return 'var(--accent-cyan)';
  return 'var(--text-muted)';
}

function getWorkoutBg(workout: DayWorkout) {
  if (workout.type === 'musculacao') return 'var(--accent-orange-dim)';
  if (workout.type === 'corrida') return 'var(--accent-cyan-dim)';
  return 'var(--bg-elevated)';
}

export default function Dashboard({ state, onUpdate }: DashboardProps) {
  const navigate = useNavigate();
  const [demoExercise, setDemoExercise] = useState<{ id: string; name: string; muscleGroups: string[] } | null>(null);
  const [showTipModal, setShowTipModal] = useState(false);
  const { profile, weekPlan, logs } = state;

  const todayResult = getTodayWorkout(state);
  const stats = getProgressStats(logs);
  const today = new Date();
  const todayDayIndex = today.getDay(); // 0=sunday
  const todayKey = WEEK_DAYS[(todayDayIndex === 0 ? 6 : todayDayIndex - 1)];

  // Check if today's workout is completed
  const todayLog = logs.find(l => {
    const d = new Date(l.date);
    return d.toDateString() === today.toDateString();
  });
  const todayCompleted = todayLog?.completed;

  // Load Gemini AI coaching
  const aiCoach = loadAICoach();
  const todayAiTip = aiCoach?.dailyTips?.[todayKey];


  const greeting = () => {
    const h = today.getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const weekProgress = weekPlan ? (() => {
    const completedDays = WEEK_DAYS.filter(day => {
      return logs.some(l => {
        const d = new Date(l.date);
        const lDay = WEEK_DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
        return lDay === day && l.completed && d >= new Date(weekPlan.startDate);
      });
    }).length;
    return completedDays;
  })() : 0;

  const totalWorkoutDays = weekPlan ? WEEK_DAYS.filter(day =>
    weekPlan.days[day]?.type !== 'descanso'
  ).length : 0;

  const progressPercent = totalWorkoutDays > 0 ? (weekProgress / totalWorkoutDays) * 100 : 0;
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="page" style={{ background: 'var(--bg-base)' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header bg glow */}
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: '40vh',
          background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(200,255,0,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ paddingBottom: 40 }}>
          {/* Greeting */}
          <div className="animate-fade-in" style={{ paddingTop: 24, paddingBottom: 32 }}>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', marginBottom: 4 }}>
              {greeting()}, {profile?.name || 'atleta'}
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 44,
              letterSpacing: '0.04em',
              color: 'var(--text-primary)',
              lineHeight: 1,
            }}>
              PRONTO PARA<br />
              <span style={{
                background: 'var(--gradient-lime)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>EVOLUIR?</span>
            </h1>
          </div>

          {/* Today's Workout Card */}
          {todayResult && (
            <div
              className="animate-fade-in"
              style={{ marginBottom: 24, animationDelay: '80ms' }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)', marginBottom: 12 }}>
                TREINO DE HOJE
              </div>
              <div
                className="workout-card"
                style={{
                  background: todayCompleted
                    ? 'rgba(200,255,0,0.04)'
                    : todayResult.workout.type === 'musculacao'
                    ? 'rgba(255,95,31,0.04)'
                    : todayResult.workout.type === 'corrida'
                    ? 'rgba(0,212,255,0.04)'
                    : 'var(--bg-card)',
                  cursor: todayResult.workout.type !== 'descanso' ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (todayResult.workout.type !== 'descanso') {
                    navigate(`/treino/${todayResult.dayKey}`);
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{
                    width: 56, height: 56,
                    borderRadius: 16,
                    background: getWorkoutBg(todayResult.workout),
                    border: `1px solid ${getWorkoutColor(todayResult.workout)}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: getWorkoutColor(todayResult.workout),
                    flexShrink: 0,
                  }}>
                    {todayCompleted ? <Trophy size={22} /> : getWorkoutIcon(todayResult.workout)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{
                        fontFamily: 'var(--font-ui)',
                        fontWeight: 800,
                        fontSize: 17,
                        color: 'var(--text-primary)',
                      }}>
                        {todayResult.workout.title}
                      </span>
                      {todayCompleted && (
                        <span className="badge badge-lime" style={{ fontSize: 10 }}>✓ Feito!</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                      {todayResult.workout.description}
                    </div>

                    {/* Workout details */}
                    <div style={{ display: 'flex', gap: 16 }}>
                      {todayResult.workout.type === 'musculacao' && (
                        <>
                          <Stat
                            label="Exercícios"
                            value={String((todayResult.workout as StrengthWorkout).exercises.length)}
                          />
                          <Stat
                            label="Duração"
                            value={`${(todayResult.workout as StrengthWorkout).duration}min`}
                          />
                          <Stat
                            label="Intensidade"
                            value={(todayResult.workout as StrengthWorkout).intensity.toUpperCase()}
                          />
                        </>
                      )}
                      {todayResult.workout.type === 'corrida' && (
                        <>
                          <Stat
                            label="Distância"
                            value={`${(todayResult.workout as RunWorkout).distance}km`}
                          />
                          <Stat
                            label="Pace alvo"
                            value={(todayResult.workout as RunWorkout).paceTarget || '--'}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Start button */}
                {todayResult.workout.type !== 'descanso' && !todayCompleted && (
                  <div style={{ marginTop: 16 }}>
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', gap: 8 }}
                      onClick={e => { e.stopPropagation(); navigate(`/treino/${todayResult.dayKey}`); }}
                    >
                      <Play size={16} fill="currentColor" />
                      Iniciar treino
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 🔮 Gemini / Coach RYZE Daily Tip */}
          {todayAiTip && todayResult && todayResult.workout.type !== 'descanso' && (
            <div
              className="animate-fade-in glass-card"
              onClick={() => setShowTipModal(true)}
              style={{
                padding: '16px 18px',
                marginBottom: 16,
                background: 'linear-gradient(135deg, rgba(155,89,255,0.12) 0%, rgba(200,255,0,0.05) 100%)',
                borderColor: 'rgba(155,89,255,0.3)',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                animationDelay: '120ms',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div style={{
                width: 34, height: 34,
                borderRadius: 10,
                background: 'rgba(155,89,255,0.2)',
                border: '1px solid rgba(155,89,255,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                marginTop: 2,
              }}>
                <Sparkles size={16} color="var(--accent-purple)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--accent-purple)',
                    fontFamily: 'var(--font-ui)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}>
                    COACH RYZE — DICA DE HOJE
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--accent-lime)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <Sparkles size={11} color="var(--accent-lime)" /> Ver Análise em Detalhes →
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {todayAiTip}
                </p>
              </div>
            </div>
          )}

          {/* Stats Row */}
          <div
            className="stagger-children animate-fade-in"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              marginBottom: 24,
              animationDelay: '160ms',
            }}
          >
            <div className="metric-card" style={{ textAlign: 'center' }}>
              <div className="metric-value" style={{ fontSize: 32, color: 'var(--accent-lime)' }}>
                {stats.currentStreak}
              </div>
              <div className="metric-label">Dias seguidos</div>
            </div>
            <div className="metric-card" style={{ textAlign: 'center' }}>
              <div className="metric-value" style={{ fontSize: 32, color: 'var(--accent-orange)' }}>
                {stats.weeklyWorkouts}
              </div>
              <div className="metric-label">Treinos na semana</div>
            </div>
            <div className="metric-card" style={{ textAlign: 'center' }}>
              <div className="metric-value" style={{ fontSize: 32, color: 'var(--accent-cyan)' }}>
                {stats.weeklyKm.toFixed(1)}
              </div>
              <div className="metric-label">km na semana</div>
            </div>
          </div>

          {/* Weekly Progress Ring + Week Calendar */}
          <div
            className="animate-fade-in glass-card"
            style={{ padding: 24, marginBottom: 24, animationDelay: '240ms' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              {/* Progress ring */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border-subtle)" strokeWidth="6" />
                  <circle
                    cx="60" cy="60" r="54"
                    fill="none"
                    stroke="url(#ringGrad)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (circumference * progressPercent / 100)}
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#C8FF00" />
                      <stop offset="100%" stopColor="#FF5F1F" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 32,
                    color: 'var(--text-primary)',
                    lineHeight: 1,
                  }}>
                    {weekProgress}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>
                    / {totalWorkoutDays}
                  </span>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  Semana em andamento
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  {weekProgress === 0 ? 'Comece hoje! Cada treino conta.' :
                    weekProgress === totalWorkoutDays ? '🎉 Semana completa! Incrível!' :
                    `${totalWorkoutDays - weekProgress} treino${totalWorkoutDays - weekProgress > 1 ? 's' : ''} restante${totalWorkoutDays - weekProgress > 1 ? 's' : ''}`}
                </div>

                {/* Mini calendar */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {WEEK_DAYS.map((day, i) => {
                    const workout = weekPlan?.days[day];
                    const isToday = day === todayKey;
                    const isDone = logs.some(l => {
                      const d = new Date(l.date);
                      const lDay = WEEK_DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
                      return lDay === day && l.completed;
                    });
                    const isRest = !workout || workout.type === 'descanso' || workout.type === 'ativo';

                    return (
                      <div
                        key={day}
                        title={WEEK_SHORT[i]}
                        style={{
                          flex: 1,
                          height: 40,
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 9,
                          fontWeight: 700,
                          fontFamily: 'var(--font-ui)',
                          letterSpacing: '0.04em',
                          background: isDone ? 'var(--accent-lime-dim)' :
                            isToday ? 'var(--bg-elevated)' :
                            isRest ? 'transparent' : 'var(--bg-card)',
                          border: isToday ? '2px solid var(--accent-lime)' :
                            isDone ? '1px solid rgba(200,255,0,0.3)' :
                            '1px solid var(--border-subtle)',
                          color: isDone ? 'var(--accent-lime)' :
                            isToday ? 'var(--text-primary)' :
                            isRest ? 'var(--text-muted)' :
                            !workout ? 'var(--text-muted)' :
                            workout.type === 'corrida' ? 'var(--accent-cyan)' : 'var(--accent-orange)',
                          transition: 'all 0.2s',
                        }}
                      >
                        {isDone ? '✓' : WEEK_SHORT[i].charAt(0)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* This week's workouts preview */}
          {weekPlan && (
            <div className="animate-fade-in" style={{ animationDelay: '320ms' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)' }}>
                  PRÓXIMOS TREINOS
                </div>
                <button
                  onClick={() => navigate('/plano')}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-lime)', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}
                >
                  Ver plano completo <ChevronRight size={14} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {WEEK_DAYS.slice(0, 5).map((day, i) => {
                  const workout = weekPlan.days[day];
                  if (!workout) return null;
                  const isToday = day === todayKey;
                  const isPast = i < (todayDayIndex === 0 ? 6 : todayDayIndex - 1);

                  return (
                    <div
                      key={day}
                      className={`glass-card ${workout.type !== 'descanso' && workout.type !== 'ativo' ? '' : ''}`}
                      style={{
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        cursor: workout.type !== 'descanso' && workout.type !== 'ativo' ? 'pointer' : 'default',
                        opacity: isPast ? 0.5 : 1,
                        borderColor: isToday ? 'var(--accent-lime)' : 'var(--border-subtle)',
                        background: isToday ? 'var(--accent-lime-dim)' : 'var(--bg-card)',
                      }}
                      onClick={() => {
                        if (workout.type !== 'descanso' && workout.type !== 'ativo') {
                          navigate(`/treino/${day}`);
                        }
                      }}
                    >
                      <div style={{
                        width: 36, height: 36,
                        borderRadius: 10,
                        background: getWorkoutBg(workout),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: getWorkoutColor(workout),
                        flexShrink: 0,
                      }}>
                        {getWorkoutIcon(workout)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: isToday ? 'var(--accent-lime)' : 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>
                          {DAY_NAMES_PT[day]}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {workout.title}
                        </div>
                      </div>

                      {isToday && <span className="badge badge-lime" style={{ flexShrink: 0, fontSize: 10 }}>Hoje</span>}
                      {workout.type !== 'descanso' && workout.type !== 'ativo' && !isToday && (
                        <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Total stats */}
          <div
            className="animate-fade-in glass-card"
            style={{ padding: 20, marginTop: 24, animationDelay: '400ms' }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)', marginBottom: 16 }}>
              CONQUISTAS TOTAIS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { label: 'Treinos', value: stats.totalWorkouts, icon: Trophy, color: 'var(--accent-lime)' },
                { label: 'Km rodados', value: `${stats.totalKm.toFixed(0)}`, icon: Activity, color: 'var(--accent-cyan)' },
                { label: 'Vol. total', value: `${(stats.totalVolume / 1000).toFixed(1)}k`, icon: Dumbbell, color: 'var(--accent-orange)' },
              ].map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 36, height: 36,
                      borderRadius: 10,
                      background: stat.color + '22',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: stat.color,
                      margin: '0 auto 8px',
                    }}>
                      <Icon size={18} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: stat.color, lineHeight: 1 }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.04em' }}>
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {demoExercise && (
        <ExerciseDemoModal
          exerciseId={demoExercise.id}
          exerciseName={demoExercise.name}
          muscleGroups={demoExercise.muscleGroups}
          onClose={() => setDemoExercise(null)}
        />
      )}

      {showTipModal && todayResult && (
        <CoachTipModal
          tipText={todayAiTip}
          workoutTitle={todayResult.workout.title}
          workoutType={todayResult.workout.type}
          onClose={() => setShowTipModal(false)}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  );
}
