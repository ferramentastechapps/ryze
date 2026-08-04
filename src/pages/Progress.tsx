import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, TrendingUp, Activity, Dumbbell, Flame, Calendar, Settings, LogOut, Search, BookOpen, Info } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, RadialBarChart, RadialBar, Legend,
} from 'recharts';
import type { AppState, WorkoutLog } from '../types';
import { getProgressStats, resetApp } from '../store/appStore';
import { EXERCISE_GUIDES, type ExerciseGuide } from '../data/exerciseGuides';
import ExerciseDemoModal from '../components/ExerciseDemoModal';

interface ProgressProps {
  state: AppState;
}

export default function Progress({ state }: ProgressProps) {
  const navigate = useNavigate();
  const { logs, profile } = state;
  const [activeTab, setActiveTab] = useState<'overview' | 'strength' | 'running' | 'history' | 'library'>('overview');
  const [showReset, setShowReset] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<{ id: string; name: string; muscles: string[] } | null>(null);

  const stats = getProgressStats(logs);
  const completed = logs.filter(l => l.completed);

  // Build weekly volume data for the last 8 weeks
  const weeklyData = buildWeeklyData(completed);

  // Build last 10 workouts history
  const recentWorkouts = completed
    .slice(-10)
    .reverse();

  return (
    <div className="page">
      <div style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(155,89,255,0.05) 0%, transparent 50%), var(--bg-base)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 28 }}>
          <div>
            <h1 className="page-title">
              PROGRESSO<br />
              <span style={{
                background: 'linear-gradient(135deg, #9B59FF, #C8FF00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>& STATS</span>
            </h1>
          </div>
          <button
            className="btn btn-icon btn-ghost"
            style={{ marginTop: 8 }}
            onClick={() => setShowReset(!showReset)}
          >
            <Settings size={18} />
          </button>
        </div>

        {/* Reset panel */}
        {showReset && (
          <div className="glass-card animate-fade-in" style={{ padding: 16, marginBottom: 20, borderColor: 'var(--accent-orange)' }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-orange)', marginBottom: 8, fontFamily: 'var(--font-ui)' }}>
              ⚠️ Zona de Perigo
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Isso apagará todos os seus dados, treinos e histórico. Esta ação não pode ser desfeita.
            </p>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                resetApp();
                window.location.href = '/';
              }}
            >
              <LogOut size={14} />
              Resetar tudo
            </button>
          </div>
        )}

        {/* Highlight stats */}
        <div
          className="stagger-children animate-fade-in"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}
        >
          <div className="metric-card animate-fade-in" style={{
            background: 'linear-gradient(135deg, rgba(200,255,0,0.08) 0%, rgba(200,255,0,0.03) 100%)',
            borderColor: 'rgba(200,255,0,0.15)',
          }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>🔥</div>
            <div className="metric-value" style={{ color: 'var(--accent-lime)' }}>{stats.currentStreak}</div>
            <div className="metric-label">Dias de streak</div>
          </div>
          <div className="metric-card animate-fade-in">
            <div style={{ fontSize: 20, marginBottom: 8 }}>🏆</div>
            <div className="metric-value" style={{ color: 'var(--text-primary)' }}>{stats.totalWorkouts}</div>
            <div className="metric-label">Total de treinos</div>
          </div>
          <div className="metric-card animate-fade-in">
            <div style={{ fontSize: 20, marginBottom: 8 }}>💪</div>
            <div className="metric-value" style={{ color: 'var(--accent-orange)', fontSize: 32 }}>
              {stats.totalVolume.toLocaleString('pt-BR')}
            </div>
            <div className="metric-label">Reps totais</div>
          </div>
          <div className="metric-card animate-fade-in">
            <div style={{ fontSize: 20, marginBottom: 8 }}>🏃</div>
            <div className="metric-value" style={{ color: 'var(--accent-cyan)', fontSize: 32 }}>
              {stats.totalKm.toFixed(1)}km
            </div>
            <div className="metric-label">Total rodado</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          padding: 4,
          marginBottom: 20,
          gap: 4,
        }}>
          {([
            { key: 'overview', label: 'Geral', icon: <BarChart2 size={14} /> },
            { key: 'library', label: 'Guias & Demos', icon: <BookOpen size={14} /> },
            { key: 'strength', label: 'Força', icon: <Dumbbell size={14} /> },
            { key: 'running', label: 'Corrida', icon: <Activity size={14} /> },
            { key: 'history', label: 'Histórico', icon: <Calendar size={14} /> },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                padding: '10px 4px',
                borderRadius: 'var(--radius-md)',
                background: activeTab === tab.key ? 'var(--bg-card)' : 'transparent',
                border: `1px solid ${activeTab === tab.key ? 'var(--border-medium)' : 'transparent'}`,
                color: activeTab === tab.key ? 'var(--accent-lime)' : 'var(--text-muted)',
                fontFamily: 'var(--font-ui)',
                fontWeight: 600,
                fontSize: 11,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab weeklyData={weeklyData} stats={stats} logs={completed} />
        )}
        {activeTab === 'library' && (
          <LibraryTab onSelectExercise={(id, name, muscles) => setSelectedDemo({ id, name, muscles })} />
        )}
        {activeTab === 'strength' && (
          <StrengthTab logs={completed.filter(l => l.workout.type === 'musculacao')} />
        )}
        {activeTab === 'running' && (
          <RunningTab logs={completed.filter(l => l.workout.type === 'corrida')} totalKm={stats.totalKm} />
        )}
        {activeTab === 'history' && (
          <HistoryTab workouts={recentWorkouts} />
        )}

        {/* Exercise Demo Modal */}
        {selectedDemo && (
          <ExerciseDemoModal
            exerciseId={selectedDemo.id}
            exerciseName={selectedDemo.name}
            muscleGroups={selectedDemo.muscles}
            onClose={() => setSelectedDemo(null)}
          />
        )}
      </div>
    </div>
  );
}

// ─── Helper ────────────────────────────────────────────────────────────────

function buildWeeklyData(logs: WorkoutLog[]) {
  const weeks: Record<string, { week: string; strength: number; run: number; total: number }> = {};

  logs.forEach(log => {
    const date = new Date(log.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    const key = weekStart.toISOString().split('T')[0];
    const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;

    if (!weeks[key]) weeks[key] = { week: label, strength: 0, run: 0, total: 0 };

    if (log.workout.type === 'musculacao') {
      weeks[key].strength += 1;
    } else if (log.workout.type === 'corrida') {
      weeks[key].run += (log.workout as any).distance || 0;
    }
    weeks[key].total += 1;
  });

  return Object.values(weeks).slice(-8);
}

// ─── Tabs ──────────────────────────────────────────────────────────────────

const CHART_STYLE = {
  background: 'transparent',
  fontSize: 11,
  fontFamily: 'Space Grotesk, sans-serif',
};

function OverviewTab({ weeklyData, stats, logs }: { weeklyData: any[]; stats: any; logs: WorkoutLog[] }) {
  const hasData = weeklyData.length > 0;
  
  // Distribution
  const strengthCount = logs.filter(l => l.workout.type === 'musculacao').length;
  const runCount = logs.filter(l => l.workout.type === 'corrida').length;
  const total = strengthCount + runCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Weekly treinos chart */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Treinos por semana</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Últimas 8 semanas</div>
        {hasData ? (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} style={CHART_STYLE}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: '#8A8A9A', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8A8A9A', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#F2F2F7' }}
              />
              <Bar dataKey="strength" name="Musculação" fill="#FF5F1F" radius={[4, 4, 0, 0]} />
              <Bar dataKey="run" name="Corrida (km)" fill="#00D4FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="Nenhum treino registrado ainda." />
        )}
      </div>

      {/* Type distribution */}
      {total > 0 && (
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Distribuição de treinos</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{
              flex: strengthCount / total,
              height: 12, borderRadius: 6,
              background: 'var(--gradient-orange)',
              transition: 'flex 0.8s ease',
            }} />
            <div style={{
              flex: runCount / total,
              height: 12, borderRadius: 6,
              background: 'var(--gradient-cyan)',
              transition: 'flex 0.8s ease',
            }} />
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-orange)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Musculação ({strengthCount})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-cyan)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Corrida ({runCount})</span>
            </div>
          </div>
        </div>
      )}

      {/* Esta semana */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Esta semana</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'Treinos', value: stats.weeklyWorkouts, color: 'var(--accent-lime)' },
            { label: 'Volume', value: `${stats.weeklyVolume}`, color: 'var(--accent-orange)' },
            { label: 'km', value: stats.weeklyKm.toFixed(1), color: 'var(--accent-cyan)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.04em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StrengthTab({ logs }: { logs: WorkoutLog[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {logs.length === 0 ? (
        <EmptyState message="Nenhum treino de musculação registrado ainda. Complete seus treinos de força e veja as estatísticas aqui!" />
      ) : (
        <>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Sessões de musculação</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Histórico completo</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {[
                { label: 'Total de sessões', value: logs.length, color: 'var(--accent-orange)' },
                { label: 'Tempo médio', value: `${Math.round(logs.reduce((s, l) => s + (l.duration || 0), 0) / logs.length)}min`, color: 'var(--accent-lime)' },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.04em' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
              💡 Dica de progresso
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, padding: '12px 14px', background: 'var(--accent-orange-dim)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,95,31,0.2)' }}>
              Aumente a carga em 2.5-5kg quando conseguir completar todas as séries com facilidade. A progressão de carga é o principal driver da hipertrofia.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function RunningTab({ logs, totalKm }: { logs: WorkoutLog[]; totalKm: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {logs.length === 0 ? (
        <EmptyState message="Nenhuma corrida registrada ainda. Complete suas corridas e veja as estatísticas aqui!" />
      ) : (
        <>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Estatísticas de corrida</div>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 72, color: 'var(--accent-cyan)', lineHeight: 1 }}>
                {totalKm.toFixed(1)}
              </div>
              <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.08em', fontSize: 12, textTransform: 'uppercase', marginTop: 8 }}>
                quilômetros rodados no total
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 16 }}>
              {[
                { label: 'Corridas', value: logs.length },
                { label: 'Média por corrida', value: `${(totalKm / logs.length).toFixed(1)}km` },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--accent-cyan)', lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.04em' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>💡 Dica de corrida</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, padding: '12px 14px', background: 'var(--accent-cyan-dim)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,212,255,0.2)' }}>
              80% das corridas deve ser em Zona 2 (você consegue conversar). Os 20% restantes são treinos intensos. Esta regra é usada por todos os corredores de elite.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function HistoryTab({ workouts }: { workouts: WorkoutLog[] }) {
  if (workouts.length === 0) {
    return <EmptyState message="Seu histórico de treinos aparecerá aqui depois que você completar suas primeiras sessões." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)', marginBottom: 4 }}>
        ÚLTIMOS {workouts.length} TREINOS
      </div>
      {workouts.map((log, i) => {
        const color = log.workout.type === 'musculacao' ? 'var(--accent-orange)' :
          log.workout.type === 'corrida' ? 'var(--accent-cyan)' : 'var(--text-muted)';
        const emoji = log.workout.type === 'musculacao' ? '💪' : log.workout.type === 'corrida' ? '🏃' : '😴';
        const date = new Date(log.date);
        const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });

        return (
          <div key={log.id} className="glass-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: 12,
              background: color + '22',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
              flexShrink: 0,
            }}>
              {emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {log.workout.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{dateStr}</div>
            </div>
            {log.duration && (
              <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: 'var(--font-ui)', flexShrink: 0 }}>
                {log.duration}min
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function LibraryTab({ onSelectExercise }: { onSelectExercise: (id: string, name: string, muscles: string[]) => void }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  const guidesList = Object.values(EXERCISE_GUIDES);

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'peito', label: 'Peito' },
    { id: 'costas', label: 'Costas' },
    { id: 'pernas', label: 'Pernas' },
    { id: 'ombros', label: 'Ombros' },
    { id: 'biceps', label: 'Bíceps' },
    { id: 'triceps', label: 'Tríceps' },
    { id: 'gluteos', label: 'Glúteos' },
  ];

  const filtered = guidesList.filter(g => {
    const matchesCategory = categoryFilter === 'todos' || g.category === categoryFilter;
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.primaryMuscles.some(m => m.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="form-input"
          placeholder="Buscar exercício ou grupo muscular..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 44 }}
        />
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${categoryFilter === cat.id ? 'var(--accent-lime)' : 'var(--border-subtle)'}`,
              background: categoryFilter === cat.id ? 'var(--accent-lime-dim)' : 'var(--bg-card)',
              color: categoryFilter === cat.id ? 'var(--accent-lime)' : 'var(--text-muted)',
              fontFamily: 'var(--font-ui)',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Exercise Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(guide => {
          const color = guide.category === 'peito' || guide.category === 'pernas'
            ? 'var(--accent-orange)'
            : guide.category === 'costas' || guide.category === 'gluteos'
            ? 'var(--accent-cyan)'
            : 'var(--accent-lime)';

          return (
            <div
              key={guide.id}
              className="glass-card"
              onClick={() => onSelectExercise(guide.id, guide.name, [guide.category])}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 44, height: 44,
                borderRadius: 12,
                background: color + '22',
                border: `1px solid ${color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                color,
                flexShrink: 0,
              }}>
                💪
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{guide.name}</span>
                  <span className="badge badge-lime" style={{ fontSize: 9, background: color + '22', color, border: `1px solid ${color}44` }}>
                    {guide.category.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {guide.primaryMuscles.join(', ')}
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-lime-dim)',
                color: 'var(--accent-lime)',
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'var(--font-ui)',
                flexShrink: 0,
              }}>
                <Info size={13} />
                Guia
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{
      padding: '40px 20px',
      textAlign: 'center',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
    }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{message}</p>
    </div>
  );
}
