import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Activity, Zap, ChevronDown, ChevronUp, Play, RotateCcw, Clock, Info, BookOpen, Brain, TrendingUp, Heart, Flame, Wind } from 'lucide-react';
import type { AppState, DayWorkout, StrengthWorkout, RunWorkout, RestDay } from '../types';
import ExerciseDemoModal from '../components/ExerciseDemoModal';

interface WeeklyPlanProps {
  state: AppState;
  onUpdate: () => void;
}

const WEEK_DAYS = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
const DAY_LABELS: Record<string, string> = {
  segunda: 'Segunda',
  terca: 'Terça',
  quarta: 'Quarta',
  quinta: 'Quinta',
  sexta: 'Sexta',
  sabado: 'Sábado',
  domingo: 'Domingo',
};
const DAY_FULL: Record<string, string> = {
  segunda: 'Segunda-feira',
  terca: 'Terça-feira',
  quarta: 'Quarta-feira',
  quinta: 'Quinta-feira',
  sexta: 'Sexta-feira',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

export default function WeeklyPlan({ state }: WeeklyPlanProps) {
  const navigate = useNavigate();
  const { weekPlan, logs } = state;
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<{ id: string; name: string; muscles: string[] } | null>(null);

  const today = new Date();
  const todayDayIndex = today.getDay();
  const todayKey = WEEK_DAYS[todayDayIndex === 0 ? 6 : todayDayIndex - 1];

  const isCompleted = (day: string) => {
    return logs.some(l => {
      const d = new Date(l.date);
      const lDay = WEEK_DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
      return lDay === day && l.completed && weekPlan && d >= new Date(weekPlan.startDate);
    });
  };

  if (!weekPlan) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum plano encontrado.</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{
        position: 'fixed', inset: 0,
        background: 'var(--bg-base)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header Brand */}
        <div style={{ paddingTop: 16, paddingBottom: 16 }}>
          <img src="/Logo.png" alt="RYZE" style={{ height: 28, width: 'auto', objectFit: 'contain' }} />
        </div>

        {/* Header */}
        <div className="animate-fade-in" style={{ paddingBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)', marginBottom: 8 }}>
            SEMANA {weekPlan.weekNumber}
          </div>
          <h1 className="page-title">PLANO<br />SEMANAL</h1>
          
          {/* Week summary badges */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            <span className="badge badge-orange">
              <Dumbbell size={11} />
              {WEEK_DAYS.filter(d => weekPlan.days[d]?.type === 'musculacao').length} musculação
            </span>
            <span className="badge badge-cyan">
              <Activity size={11} />
              {WEEK_DAYS.filter(d => weekPlan.days[d]?.type === 'corrida').length} corridas
            </span>
            <span className="badge badge-purple">
              <Zap size={11} />
              {weekPlan.totalKm.toFixed(1)} km total
            </span>
          </div>
        </div>

        {/* Day cards */}
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {WEEK_DAYS.map((day, i) => {
            const workout = weekPlan.days[day];
            if (!workout) return null;
            const isExpanded = expandedDay === day;
            const done = isCompleted(day);
            const isToday = day === todayKey;

            return (
              <div
                key={day}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <DayCard
                  day={day}
                  dayLabel={DAY_LABELS[day]}
                  dayFull={DAY_FULL[day]}
                  workout={workout}
                  isExpanded={isExpanded}
                  isToday={isToday}
                  isDone={done}
                  onToggle={() => setExpandedDay(isExpanded ? null : day)}
                  onStartWorkout={() => navigate(`/treino/${day}`)}
                  onOpenDemo={(id, name, muscles) => setSelectedDemo({ id, name, muscles })}
                />
              </div>
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

        {/* Periodization info */}
        <div className="glass-card animate-fade-in" style={{ padding: 20, marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)', marginBottom: 12 }}>
            <BookOpen size={16} style={{ color: 'var(--accent-lime)' }} />
            PRINCÍPIOS DA SEMANA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: Zap, text: 'Sistema High-Low: dias intensos alternados com leves para recuperação ótima', color: 'var(--accent-orange)' },
              { icon: Brain, text: 'Evitamos pernas pesadas antes de corrida intensa para minimizar interferência', color: 'var(--accent-purple)' },
              { icon: TrendingUp, text: 'Progressão de carga automática semana a semana para estimular hipertrofia', color: 'var(--accent-lime)' },
              { icon: Activity, text: 'Corrida Zona 2 nas folgas ajuda na recuperação e queima de gordura', color: 'var(--accent-cyan)' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{
                    width: 28, height: 28,
                    borderRadius: 8,
                    background: item.color + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: item.color,
                    flexShrink: 0,
                  }}>
                    <Icon size={14} />
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Day Card Component ────────────────────────────────────────────────────

interface DayCardProps {
  day: string;
  dayLabel: string;
  dayFull: string;
  workout: DayWorkout;
  isExpanded: boolean;
  isToday: boolean;
  isDone: boolean;
  onToggle: () => void;
  onStartWorkout: () => void;
  onOpenDemo: (id: string, name: string, muscles: string[]) => void;
}

function DayCard({ day, dayLabel, dayFull, workout, isExpanded, isToday, isDone, onToggle, onStartWorkout, onOpenDemo }: DayCardProps) {
  const color = workout.type === 'musculacao' ? 'var(--accent-orange)' :
    workout.type === 'corrida' ? 'var(--accent-cyan)' : 'var(--text-muted)';

  const colorDim = workout.type === 'musculacao' ? 'var(--accent-orange-dim)' :
    workout.type === 'corrida' ? 'var(--accent-cyan-dim)' : 'var(--bg-elevated)';

  const typeLabel = workout.type === 'musculacao' ? 'Musculação' :
    workout.type === 'corrida' ? 'Corrida' :
    workout.type === 'ativo' ? 'Ativo' : 'Descanso';

  return (
    <div style={{
      borderRadius: 'var(--radius-xl)',
      border: `1px solid ${isToday ? 'var(--accent-lime)' : isDone ? 'rgba(200,255,0,0.2)' : 'var(--border-subtle)'}`,
      background: isToday ? 'rgba(200,255,0,0.04)' : isDone ? 'rgba(200,255,0,0.02)' : 'var(--bg-card)',
      overflow: 'hidden',
      transition: 'all 0.3s',
    }}>
      {/* Day header */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Day number/icon */}
        <div style={{
          width: 44, height: 44,
          borderRadius: 12,
          background: isDone ? 'var(--accent-lime-dim)' : colorDim,
          border: `1px solid ${isDone ? 'rgba(200,255,0,0.3)' : color + '33'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          gap: 1,
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: isDone ? 'var(--accent-lime)' : color, fontFamily: 'var(--font-ui)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {dayLabel.substring(0, 3)}
          </span>
          {isDone ? (
            <span style={{ fontSize: 14 }}>✓</span>
          ) : workout.type === 'musculacao' ? (
            <Dumbbell size={14} color={color} />
          ) : workout.type === 'corrida' ? (
            <Activity size={14} color={color} />
          ) : (
            <Zap size={14} color={color} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15, color: isToday ? 'var(--accent-lime)' : 'var(--text-primary)' }}>
              {workout.title}
            </span>
            {isToday && <span className="badge badge-lime" style={{ fontSize: 9, padding: '2px 8px' }}>HOJE</span>}
            {isDone && <span className="badge badge-lime" style={{ fontSize: 9, padding: '2px 8px' }}>✓ FEITO</span>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-ui)' }}>
            {dayFull} · <span style={{ color }}>{typeLabel}</span>
            {workout.type === 'musculacao' && (
              <span> · {(workout as StrengthWorkout).exercises.length} exercícios · {(workout as StrengthWorkout).duration}min</span>
            )}
            {workout.type === 'corrida' && (
              <span> · {(workout as RunWorkout).distance}km · Pace {(workout as RunWorkout).paceTarget}</span>
            )}
          </div>
        </div>

        {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '16px 20px 20px',
          animation: 'fadeIn 0.3s ease-out',
        }}>
          {/* Description */}
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            {workout.description}
          </p>

          {/* Strength workout details */}
          {workout.type === 'musculacao' && (
            <StrengthDetails workout={workout as StrengthWorkout} onOpenDemo={onOpenDemo} />
          )}

          {/* Run workout details */}
          {workout.type === 'corrida' && (
            <RunDetails workout={workout as RunWorkout} />
          )}

          {/* Rest day details */}
          {(workout.type === 'descanso' || workout.type === 'ativo') && (
            <RestDetails workout={workout as RestDay} />
          )}

          {/* Action button */}
          {workout.type !== 'descanso' && workout.type !== 'ativo' && (
            <button
              className={`btn ${workout.type === 'corrida' ? '' : 'btn-primary'}`}
              style={{
                width: '100%',
                marginTop: 16,
                background: workout.type === 'corrida' ? 'var(--gradient-cyan)' : undefined,
                color: workout.type === 'corrida' ? '#08080E' : undefined,
              }}
              onClick={onStartWorkout}
            >
              <Play size={16} fill="currentColor" />
              {isToday ? 'Iniciar treino' : 'Ver treino'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StrengthDetails({
  workout,
  onOpenDemo,
}: {
  workout: StrengthWorkout;
  onOpenDemo: (id: string, name: string, muscles: string[]) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)', marginBottom: 12 }}>
        EXERCÍCIOS (CLIQUE PARA VER O GUIA & DEMO)
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {workout.exercises.map((ex, i) => (
          <div
            key={ex.id}
            onClick={() => onOpenDemo(ex.id, ex.name, ex.muscleGroups)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'background var(--transition-fast)',
            }}
          >
            <div style={{
              width: 24, height: 24,
              borderRadius: 6,
              background: 'var(--accent-orange-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'var(--accent-orange)',
              fontFamily: 'var(--font-ui)',
              flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{ex.name}</span>
                <Info size={13} style={{ color: 'var(--accent-lime)' }} />
              </div>
              {ex.technique && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ex.technique}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-orange)', fontFamily: 'var(--font-ui)' }}>
                {ex.sets}×{ex.reps}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
                {ex.rest}s desc.
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RunDetails({ workout }: { workout: RunWorkout }) {
  return (
    <div>
      {/* Run stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Distância', value: `${workout.distance}km` },
          { label: 'Pace alvo', value: workout.paceTarget || '--' },
          { label: 'Duração', value: `~${workout.duration}min` },
        ].map(stat => (
          <div key={stat.label} style={{
            padding: '12px 10px',
            background: 'var(--accent-cyan-dim)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--accent-cyan)', lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Heart rate zone */}
      {workout.heartRateZone && (
        <div style={{
          padding: '10px 14px',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 12,
          fontSize: 13,
          color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Heart size={16} style={{ color: 'var(--accent-orange)' }} />
          <strong style={{ color: 'var(--text-primary)' }}>Zona FC:</strong> {workout.heartRateZone}
        </div>
      )}

      {/* Warmup/cooldown */}
      {workout.warmup && (
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Flame size={14} style={{ color: 'var(--accent-orange)' }} />
          <strong style={{ color: 'var(--text-primary)' }}>Aquecimento:</strong> {workout.warmup}
        </div>
      )}
      {workout.cooldown && (
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Wind size={14} style={{ color: 'var(--accent-cyan)' }} />
          <strong style={{ color: 'var(--text-primary)' }}>Desaquecimento:</strong> {workout.cooldown}
        </div>
      )}

      {/* Intervals */}
      {workout.intervals && workout.intervals.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)', marginBottom: 10 }}>
            INTERVALOS
          </div>
          {workout.intervals.map((interval, i) => (
            <div key={i} style={{
              padding: '12px 14px',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                background: 'var(--accent-cyan-dim)',
                borderRadius: 8,
                padding: '6px 10px',
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                color: 'var(--accent-cyan)',
                flexShrink: 0,
              }}>
                ×{interval.repetitions}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>
                  {interval.effort} @ {interval.pace}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Recuperação: {interval.recovery}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RestDetails({ workout }: { workout: RestDay }) {
  return (
    <div>
      {workout.activities && workout.activities.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {workout.activities.map((activity, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
            }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 14, flexShrink: 0 }}>→</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{activity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
