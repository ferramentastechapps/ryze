import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Activity, Flame, TrendingUp, ChevronRight, Play, Trophy, Zap, Sparkles, LogOut, ShieldCheck, Megaphone } from 'lucide-react';
import type { AppState, DayWorkout, StrengthWorkout, RunWorkout } from '../types';
import { getTodayWorkout, getProgressStats } from '../store/appStore';
import { loadAICoach } from '../services/geminiService';
import ExerciseDemoModal from '../components/ExerciseDemoModal';
import CoachTipModal from '../components/CoachTipModal';
import SubscriptionBadge from '../components/SubscriptionBadge';
import { XpBar } from '../components/XpBar';
import { useAuthStore } from '../store/authStore';
import { signOut } from '../services/authService';
import { getGlobalAnnouncement, type GlobalAnnouncement } from '../services/announcementService';

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
  const [announcement, setAnnouncement] = useState<GlobalAnnouncement | null>(null);
  const { profile, weekPlan, logs } = state;

  useEffect(() => {
    setAnnouncement(getGlobalAnnouncement());
  }, []);

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

  const weekProgress = logs.length;

  const totalWorkoutDays = weekPlan ? WEEK_DAYS.filter(day =>
    weekPlan.days[day]?.type !== 'descanso'
  ).length : 0;

  const progressPercent = totalWorkoutDays > 0 ? (weekProgress / totalWorkoutDays) * 100 : 0;
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="page" style={{ background: 'var(--bg-base)' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ paddingBottom: 40 }}>
          {/* Header Brand */}
          <DashboardHeader />

          {/* Greeting */}
          <div className="animate-fade-in" style={{ paddingTop: 16, paddingBottom: 20 }}>
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

          {/* Global Announcement Banner from Admin */}
          {announcement && announcement.active && (
            <div className="animate-fade-in mb-6" style={{
              padding: 16,
              borderRadius: 'var(--radius-lg)',
              background: announcement.type === 'warning' ? 'var(--accent-orange-dim)' : announcement.type === 'success' ? 'var(--accent-lime-dim)' : 'var(--bg-elevated)',
              border: `1px solid ${announcement.type === 'warning' ? 'var(--accent-orange)' : announcement.type === 'success' ? 'var(--accent-lime)' : 'var(--border-medium)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: announcement.type === 'warning' ? 'rgba(255,95,31,0.2)' : announcement.type === 'success' ? 'rgba(200,255,0,0.2)' : 'rgba(59,130,246,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: announcement.type === 'warning' ? 'var(--accent-orange)' : announcement.type === 'success' ? 'var(--accent-lime)' : '#3b82f6',
                flexShrink: 0,
              }}>
                <Megaphone size={18} />
              </div>
              <div>
                <h4 style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>
                  {announcement.title}
                </h4>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, margin: 0 }}>
                  {announcement.message}
                </p>
              </div>
            </div>
          )}

          {/* XpBar Widget */}
          <div className="animate-fade-in mb-6" style={{ animationDelay: '40ms' }}>
            <XpBar />
          </div>

          {/* Today's Workout Card */}
          {todayResult && (
            <div
              className="animate-fade-in"
              style={{ marginBottom: 24, animationDelay: '80ms' }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-ui)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <Sparkles size={13} color="var(--accent-lime)" />
                  <span>TREINO DE HOJE</span>
                </div>
                <span className="badge badge-lime" style={{ fontSize: 9, padding: '2px 8px' }}>HOJE</span>
              </div>

              <div
                className="glass-card"
                style={{
                  padding: '18px 20px',
                  borderRadius: 'var(--radius-xl)',
                  border: `1px solid ${todayCompleted ? 'rgba(200,255,0,0.3)' : 'var(--accent-lime)'}`,
                  background: 'rgba(200, 255, 0, 0.03)',
                  cursor: todayResult.workout.type !== 'descanso' ? 'pointer' : 'default',
                  transition: 'all 0.25s ease',
                }}
                onClick={() => {
                  if (todayResult.workout.type !== 'descanso') {
                    navigate(`/treino/${todayResult.dayKey}`);
                  }
                }}
              >
                {/* Header row identical to DayCard structure */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  {/* Category icon box */}
                  <div style={{
                    width: 44, height: 44,
                    borderRadius: 12,
                    background: getWorkoutBg(todayResult.workout),
                    border: `1px solid ${getWorkoutColor(todayResult.workout)}33`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: getWorkoutColor(todayResult.workout),
                  }}>
                    {getWorkoutIcon(todayResult.workout)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>
                        {todayResult.workout.title}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-ui)', fontWeight: 600 }}>
                      <span style={{ color: getWorkoutColor(todayResult.workout), textTransform: 'uppercase', fontWeight: 700 }}>
                        {todayResult.workout.type === 'musculacao' ? 'Musculação' : todayResult.workout.type === 'corrida' ? 'Corrida' : 'Treino Híbrido'}
                      </span>
                      {todayResult.workout.type === 'musculacao' && (
                        <span> · {(todayResult.workout as StrengthWorkout).exercises.length} ex · {(todayResult.workout as StrengthWorkout).duration}min</span>
                      )}
                      {todayResult.workout.type === 'corrida' && (
                        <span> · {(todayResult.workout as RunWorkout).distance}km · Pace {(todayResult.workout as RunWorkout).paceTarget}</span>
                      )}
                      {todayResult.workout.type === 'hibrido' && (
                        <span> · {(todayResult.workout as any).strength?.exercises?.length || 0} ex + {(todayResult.workout as any).run?.distance || 0}km</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  lineHeight: 1.5,
                  margin: '0 0 16px 0',
                }}>
                  {todayResult.workout.description}
                </p>

                {/* Subdetails chips for clean visual balance */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                  {todayResult.workout.type === 'musculacao' && (
                    <>
                      <span className="badge badge-orange" style={{ fontSize: 10 }}>{(todayResult.workout as StrengthWorkout).exercises.length} EXERCÍCIOS</span>
                      <span className="badge badge-lime" style={{ fontSize: 10 }}>{(todayResult.workout as StrengthWorkout).duration} MINUTOS</span>
                      <span className="badge badge-purple" style={{ fontSize: 10 }}>{(todayResult.workout as StrengthWorkout).intensity.toUpperCase()} INTENSIDADE</span>
                    </>
                  )}
                  {todayResult.workout.type === 'corrida' && (
                    <>
                      <span className="badge badge-cyan" style={{ fontSize: 10 }}>{(todayResult.workout as RunWorkout).distance} KM</span>
                      <span className="badge badge-lime" style={{ fontSize: 10 }}>PACE {(todayResult.workout as RunWorkout).paceTarget || '6:00/km'}</span>
                    </>
                  )}
                  {todayResult.workout.type === 'hibrido' && (
                    <>
                      <span className="badge badge-orange" style={{ fontSize: 10 }}>{(todayResult.workout as any).strength?.exercises?.length || 0} EXERCÍCIOS</span>
                      <span className="badge badge-cyan" style={{ fontSize: 10 }}>{(todayResult.workout as any).run?.distance || 0} KM CORRIDA</span>
                      <span className="badge badge-purple" style={{ fontSize: 10 }}>HÍBRIDO</span>
                    </>
                  )}
                </div>

                {/* Action button */}
                {todayResult.workout.type !== 'descanso' && !todayCompleted && (
                  <button
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px 20px',
                      fontSize: 14,
                      fontWeight: 800,
                      boxShadow: '0 4px 14px rgba(200,255,0,0.2)',
                    }}
                    onClick={e => { e.stopPropagation(); navigate(`/treino/${todayResult.dayKey}`); }}
                  >
                    <Play size={16} fill="currentColor" />
                    <span>INICIAR TREINO</span>
                  </button>
                )}

                {todayCompleted && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '12px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'rgba(200,255,0,0.1)',
                    color: 'var(--accent-lime)',
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'var(--font-ui)',
                    border: '1px solid rgba(200,255,0,0.2)',
                  }}>
                    <Trophy size={16} />
                    <span>Treino concluído hoje! Bom trabalho!</span>
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  marginBottom: 8,
                  flexWrap: 'wrap',
                }}>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: 'var(--accent-purple)',
                    fontFamily: 'var(--font-ui)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    COACH RYZE <span style={{ opacity: 0.4 }}>•</span> DICA DE HOJE
                  </div>

                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--accent-lime)',
                    background: 'rgba(200,255,0,0.1)',
                    border: '1px solid rgba(200,255,0,0.25)',
                    padding: '3px 9px',
                    borderRadius: 999,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    whiteSpace: 'nowrap',
                  }}>
                    <Sparkles size={10} color="var(--accent-lime)" /> Ver Análise →
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
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
          tipText={todayAiTip || ''}
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

// ─── Dashboard Header with User Avatar + Badge ────────────────────────────────
function DashboardHeader() {
  const { authProfile, user } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try { await signOut(); } catch (e) { console.error(e); }
  };

  return (
    <div style={{ paddingTop: 16, paddingBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <img src="/logo-capa.png" alt="RYZE" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {(authProfile?.is_admin || (user?.email && user.email.toLowerCase() === 'ferramentastech.apps@gmail.com')) && (
          <button
            onClick={() => navigate('/admin')}
            title="Painel Admin"
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 8px', borderRadius: 8,
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#f59e0b', fontSize: 11, fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <ShieldCheck size={14} />
            <span>ADMIN</span>
          </button>
        )}

        <SubscriptionBadge />

        {/* User avatar */}
        {authProfile?.avatar_url ? (
          <img
            src={authProfile.avatar_url}
            alt={authProfile.full_name ?? 'User'}
            style={{
              width: 32, height: 32,
              borderRadius: '50%',
              border: '2px solid var(--border-subtle)',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{
            width: 32, height: 32,
            borderRadius: '50%',
            background: 'var(--bg-elevated)',
            border: '2px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'var(--accent-lime)',
          }}>
            {(user?.email ?? 'U')[0].toUpperCase()}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleSignOut}
          title="Sair"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 8,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
