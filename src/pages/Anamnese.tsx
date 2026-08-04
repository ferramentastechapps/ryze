import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, Dumbbell, Activity, Target, Clock, Zap, Sparkles, BarChart3, Sprout, Flame, Award, Home, Building2, Sunrise, Sun, Moon, Lightbulb, Timer, ShieldAlert, Calendar, AlertTriangle } from 'lucide-react';
import { saveProfileWithPlan } from '../store/appStore';
import { analyzeProfile } from '../engine/aiEngine';
import { generateAICoaching, saveAICoach, type AICoachResponse } from '../services/geminiService';
import type { UserProfile, Sex, ExperienceLevel, PrimaryGoal, RunnerLevel } from '../types';

interface AnamneseProps {
  onComplete: () => void;
}

const TOTAL_STEPS = 5;

const initialProfile: Partial<UserProfile> = {
  name: '',
  age: 25,
  weight: 75,
  height: 175,
  sex: 'masculino',
  experienceLevel: 'intermediario',
  injuries: [],
  hasGymAccess: true,
  equipment: ['barra', 'halter', 'maquinas'],
  primaryGoal: 'equilibrio',
  estheticGoal: '',
  daysPerWeek: 4,
  sessionDuration: 60,
  preferredTime: 'manha',
  runnerLevel: 'iniciante',
  weeklyKm: 0,
  runGoal: '',
};

export default function Anamnese({ onComplete }: AnamneseProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>(initialProfile);
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiCoach, setAiCoach] = useState<AICoachResponse | null>(null);
  const [aiError, setAiError] = useState(false);

  const update = (key: keyof UserProfile, value: unknown) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const next = () => {
    if (step < TOTAL_STEPS) setStep(s => s + 1);
    else handleSubmit();
  };

  const back = () => {
    if (step > 1) setStep(s => s - 1);
    else navigate('/');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setAiError(false);

    const fullProfile: UserProfile = {
      ...initialProfile,
      ...profile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as UserProfile;

    try {
      const { weekPlan, aiCoach: coach } = await generateAICoaching(fullProfile);
      saveProfileWithPlan(fullProfile, weekPlan);
      if (coach) {
        saveAICoach(coach);
        setAiCoach(coach);
      } else {
        setAiError(true);
      }
    } catch (err) {
      console.error('AI generation failed:', err);
      setAiError(true);
    }

    onComplete();
    setShowResult(true);
    setSubmitting(false);
  };

  const progress = (step / TOTAL_STEPS) * 100;

  if (showResult) {
    return <ResultScreen profile={profile as UserProfile} aiCoach={aiCoach} aiError={aiError} onContinue={() => navigate('/dashboard')} />;
  }

  if (submitting) {
    return <LoadingAnalysis />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Background */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(200,255,0,0.07) 0%, transparent 50%), #08080E',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          maxWidth: 680,
          margin: '0 auto',
          width: '100%',
        }}>
          <button onClick={back} className="btn btn-icon btn-ghost">
            <ChevronLeft size={20} />
          </button>
          
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 8,
              fontSize: 12,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-ui)',
              fontWeight: 600,
              letterSpacing: '0.06em',
            }}>
              <span>ETAPA {step} DE {TOTAL_STEPS}</span>
              <span style={{ color: 'var(--accent-lime)' }}>{Math.round(progress)}%</span>
            </div>
            <div style={{
              height: 4,
              background: 'var(--border-subtle)',
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'var(--gradient-lime)',
                borderRadius: 4,
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </div>
          </div>
        </div>

        {/* Step Icons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          padding: '0 24px 24px',
        }}>
          {[
            { icon: <Zap size={14} />, label: 'Perfil' },
            { icon: <Dumbbell size={14} />, label: 'Exp.' },
            { icon: <Target size={14} />, label: 'Goal' },
            { icon: <Clock size={14} />, label: 'Tempo' },
            { icon: <Activity size={14} />, label: 'Corrida' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                opacity: i + 1 <= step ? 1 : 0.3,
                transition: 'opacity 0.3s',
              }}
            >
              <div style={{
                width: 32, height: 32,
                borderRadius: '50%',
                background: i + 1 < step ? 'var(--gradient-lime)' :
                  i + 1 === step ? 'var(--accent-lime-dim)' : 'var(--bg-elevated)',
                border: i + 1 === step ? '2px solid var(--accent-lime)' : '2px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: i + 1 < step ? '#08080E' : i + 1 === step ? 'var(--accent-lime)' : 'var(--text-muted)',
                transition: 'all 0.3s',
              }}>
                {i + 1 < step ? <Check size={14} /> : s.icon}
              </div>
              <span style={{
                fontSize: 10,
                fontFamily: 'var(--font-ui)',
                fontWeight: 600,
                color: i + 1 === step ? 'var(--accent-lime)' : 'var(--text-muted)',
                letterSpacing: '0.04em',
              }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div
          key={step}
          className="animate-fade-in"
          style={{ flex: 1, padding: '0 24px 40px', maxWidth: 680, margin: '0 auto', width: '100%' }}
        >
          {step === 1 && <Step1 profile={profile} update={update} />}
          {step === 2 && <Step2 profile={profile} update={update} />}
          {step === 3 && <Step3 profile={profile} update={update} />}
          {step === 4 && <Step4 profile={profile} update={update} />}
          {step === 5 && <Step5 profile={profile} update={update} />}
        </div>

        {/* Next Button */}
        <div style={{
          padding: '16px 24px 32px',
          maxWidth: 680,
          margin: '0 auto',
          width: '100%',
        }}>
          <button
            className="btn btn-primary"
            style={{ width: '100%', fontSize: 16, padding: '16px' }}
            onClick={next}
          >
            {step === TOTAL_STEPS ? 'Gerar meu plano' : 'Continuar'}
            {step < TOTAL_STEPS && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}



// ─── Step Components ───────────────────────────────────────────────────────

function Step1({ profile, update }: { profile: Partial<UserProfile>; update: (k: keyof UserProfile, v: unknown) => void }) {
  return (
    <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="animate-fade-in">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: '0.04em', color: 'var(--text-primary)', marginBottom: 8 }}>
          SEU PERFIL
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Vamos começar com o básico. Esses dados são usados para personalizar sua programação.
        </p>
      </div>

      <div className="animate-fade-in form-group">
        <label className="form-label">Seu nome</label>
        <input
          className="form-input"
          type="text"
          placeholder="Ex: Lucas Silva"
          value={profile.name || ''}
          onChange={e => update('name', e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="animate-fade-in">
        <div className="form-group">
          <label className="form-label">Idade</label>
          <input
            className="form-input"
            type="number"
            min={14} max={80}
            value={profile.age || 25}
            onChange={e => update('age', parseInt(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Sexo biológico</label>
          <div style={{ display: 'flex', gap: 6, height: 48 }}>
            {[
              { v: 'masculino', label: 'Masculino' },
              { v: 'feminino', label: 'Feminino' },
            ].map(s => {
              const active = (profile.sex || 'masculino') === s.v;
              return (
                <button
                  key={s.v}
                  type="button"
                  onClick={() => update('sex', s.v as Sex)}
                  style={{
                    flex: 1,
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${active ? 'var(--accent-lime)' : 'var(--border-medium)'}`,
                    background: active ? 'var(--accent-lime-dim)' : 'var(--bg-card)',
                    color: active ? 'var(--accent-lime)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: 13,
                    fontFamily: 'var(--font-ui)',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="animate-fade-in">
        <div className="form-group">
          <label className="form-label">Peso (kg)</label>
          <input
            className="form-input"
            type="number"
            min={40} max={200}
            value={profile.weight || 75}
            onChange={e => update('weight', parseFloat(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Altura (cm)</label>
          <input
            className="form-input"
            type="number"
            min={140} max={230}
            value={profile.height || 175}
            onChange={e => update('height', parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* BMI preview */}
      {profile.weight && profile.height && (
        <div className="animate-fade-in glass-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44,
            background: 'var(--accent-lime-dim)',
            border: '1px solid rgba(200,255,0,0.2)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-lime)',
          }}>
            <BarChart3 size={20} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--accent-lime)', lineHeight: 1 }}>
              {(profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              IMC calculado
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Step2({ profile, update }: { profile: Partial<UserProfile>; update: (k: keyof UserProfile, v: unknown) => void }) {
  const levels = [
    { value: 'iniciante', label: 'Iniciante', desc: 'Menos de 1 ano de treino consistente', icon: Sprout, color: 'var(--accent-lime)' },
    { value: 'intermediario', label: 'Intermediário', desc: '1-3 anos de treino com consistência', icon: Zap, color: 'var(--accent-cyan)' },
    { value: 'avancado', label: 'Avançado', desc: 'Mais de 3 anos, periodização conhecida', icon: Flame, color: 'var(--accent-orange)' },
  ];

  const injuryOptions = ['Joelho', 'Ombro', 'Lombar', 'Quadril', 'Tornozelo', 'Cervical', 'Cotovelo'];

  const toggleInjury = (injury: string) => {
    const current = profile.injuries || [];
    const updated = current.includes(injury)
      ? current.filter(i => i !== injury)
      : [...current, injury];
    update('injuries', updated);
  };

  return (
    <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="animate-fade-in">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: '0.04em', color: 'var(--text-primary)', marginBottom: 8 }}>
          EXPERIÊNCIA
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Seu nível define a carga, volume e complexidade dos treinos gerados.
        </p>
      </div>

      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label className="form-label">Nível de treino</label>
        {levels.map(level => {
          const Icon = level.icon;
          const isSelected = profile.experienceLevel === level.value;
          return (
            <button
              key={level.value}
              onClick={() => update('experienceLevel', level.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${isSelected ? 'var(--accent-lime)' : 'var(--border-subtle)'}`,
                background: isSelected ? 'var(--accent-lime-dim)' : 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                width: '100%',
              }}
            >
              <div style={{
                width: 40, height: 40,
                borderRadius: 12,
                background: level.color + '22',
                border: `1px solid ${level.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: level.color,
                flexShrink: 0,
              }}>
                <Icon size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>{level.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{level.desc}</div>
              </div>
              {isSelected && (
                <Check size={18} style={{ color: 'var(--accent-lime)', marginLeft: 'auto', flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </div>

      <div className="animate-fade-in">
        <label className="form-label" style={{ display: 'block', marginBottom: 12 }}>
          Lesões ou restrições (opcional)
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {injuryOptions.map(injury => {
            const selected = (profile.injuries || []).includes(injury);
            return (
              <button
                key={injury}
                onClick={() => toggleInjury(injury)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${selected ? 'var(--accent-orange)' : 'var(--border-medium)'}`,
                  background: selected ? 'var(--accent-orange-dim)' : 'var(--bg-card)',
                  color: selected ? 'var(--accent-orange)' : 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-ui)',
                }}
              >
                {selected && '✓ '}{injury}
              </button>
            );
          })}
        </div>
      </div>

      <div className="animate-fade-in">
        <label className="form-label" style={{ display: 'block', marginBottom: 8 }}>Acesso à academia?</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { v: true, label: 'Academia completa', icon: Building2 },
            { v: false, label: 'Treino em casa', icon: Home },
          ].map(opt => {
            const Icon = opt.icon;
            const isSelected = profile.hasGymAccess === opt.v;
            return (
              <button
                key={String(opt.v)}
                onClick={() => update('hasGymAccess', opt.v)}
                style={{
                  flex: 1,
                  padding: '14px 6px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${isSelected ? 'var(--accent-lime)' : 'var(--border-subtle)'}`,
                  background: isSelected ? 'var(--accent-lime-dim)' : 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-ui)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={16} style={{ color: isSelected ? 'var(--accent-lime)' : 'var(--text-muted)', flexShrink: 0 }} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Step3({ profile, update }: { profile: Partial<UserProfile>; update: (k: keyof UserProfile, v: unknown) => void }) {
  const goals = [
    { value: 'hipertrofia', label: 'Hipertrofia Máxima', desc: 'Foco em massa muscular e estética', color: 'var(--accent-orange)', icon: Dumbbell },
    { value: 'perda_gordura', label: 'Perda de Gordura', desc: 'Definição e redução do % de gordura', color: 'var(--accent-cyan)', icon: Flame },
    { value: 'performance', label: 'Performance Híbrida', desc: 'Força + condicionamento avançado', color: 'var(--accent-purple)', icon: Zap },
    { value: 'equilibrio', label: 'Equilíbrio Estético', desc: 'Corpo bonito, saúde e bem-estar', color: 'var(--accent-lime)', icon: Award },
  ];

  return (
    <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="animate-fade-in">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: '0.04em', color: 'var(--text-primary)', marginBottom: 8 }}>
          OBJETIVO
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Seu objetivo principal define toda a estrutura de periodização do treino.
        </p>
      </div>

      <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {goals.map(goal => {
          const selected = profile.primaryGoal === goal.value;
          const Icon = goal.icon;
          return (
            <button
              key={goal.value}
              onClick={() => update('primaryGoal', goal.value)}
              style={{
                padding: '20px 16px',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${selected ? goal.color : 'var(--border-subtle)'}`,
                background: selected ? `${goal.color}15` : 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                width: 40, height: 40,
                borderRadius: 10,
                background: goal.color + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: goal.color,
                marginBottom: 12,
              }}>
                <Icon size={20} />
              </div>
              <div style={{
                fontWeight: 700,
                fontSize: 14,
                color: selected ? goal.color : 'var(--text-primary)',
                fontFamily: 'var(--font-ui)',
                marginBottom: 6,
              }}>
                {goal.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {goal.desc}
              </div>
              {selected && (
                <div style={{
                  position: 'absolute',
                  top: 12, right: 12,
                  width: 20, height: 20,
                  borderRadius: '50%',
                  background: goal.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={12} color="#08080E" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="animate-fade-in form-group">
        <label className="form-label">Descreva o corpo que você quer atingir</label>
        <textarea
          className="form-input"
          placeholder="Ex: Quero definir o abdômen, ganhar volume nos ombros e melhorar meu condicionamento para correr 5km com facilidade..."
          value={profile.estheticGoal || ''}
          onChange={e => update('estheticGoal', e.target.value)}
        />
      </div>
    </div>
  );
}

function Step4({ profile, update }: { profile: Partial<UserProfile>; update: (k: keyof UserProfile, v: unknown) => void }) {
  return (
    <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="animate-fade-in">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: '0.04em', color: 'var(--text-primary)', marginBottom: 8 }}>
          DISPONIBILIDADE
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Com base na sua rotina, criamos um plano que cabe na sua vida.
        </p>
      </div>

      <div className="animate-fade-in">
        <label className="form-label" style={{ display: 'block', marginBottom: 12 }}>
          Dias de treino por semana: <strong style={{ color: 'var(--accent-lime)' }}>{profile.daysPerWeek || 4} dias</strong>
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[3, 4, 5, 6].map(days => (
            <button
              key={days}
              onClick={() => update('daysPerWeek', days)}
              style={{
                flex: 1,
                height: 56,
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${profile.daysPerWeek === days ? 'var(--accent-lime)' : 'var(--border-subtle)'}`,
                background: profile.daysPerWeek === days ? 'var(--accent-lime-dim)' : 'var(--bg-card)',
                color: profile.daysPerWeek === days ? 'var(--accent-lime)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {days}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, padding: '0 4px' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mínimo</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Máximo</span>
        </div>
      </div>

      <div className="animate-fade-in">
        <label className="form-label" style={{ display: 'block', marginBottom: 12 }}>
          Duração da sessão: <strong style={{ color: 'var(--accent-lime)' }}>{profile.sessionDuration || 60} min</strong>
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[45, 60, 75, 90].map(min => (
            <button
              key={min}
              onClick={() => update('sessionDuration', min)}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${profile.sessionDuration === min ? 'var(--accent-lime)' : 'var(--border-subtle)'}`,
                background: profile.sessionDuration === min ? 'var(--accent-lime-dim)' : 'var(--bg-card)',
                color: profile.sessionDuration === min ? 'var(--accent-lime)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-ui)',
              }}
            >
              {min}min
            </button>
          ))}
        </div>
      </div>

      <div className="animate-fade-in">
        <label className="form-label" style={{ display: 'block', marginBottom: 12 }}>Período preferido</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { v: 'manha', label: 'Manhã', icon: Sunrise },
            { v: 'tarde', label: 'Tarde', icon: Sun },
            { v: 'noite', label: 'Noite', icon: Moon },
          ].map(opt => {
            const Icon = opt.icon;
            const isSelected = profile.preferredTime === opt.v;
            return (
              <button
                key={opt.v}
                onClick={() => update('preferredTime', opt.v)}
                style={{
                  flex: 1,
                  padding: '14px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${isSelected ? 'var(--accent-lime)' : 'var(--border-subtle)'}`,
                  background: isSelected ? 'var(--accent-lime-dim)' : 'var(--bg-card)',
                  color: isSelected ? 'var(--accent-lime)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-ui)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Icon size={16} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Step5({ profile, update }: { profile: Partial<UserProfile>; update: (k: keyof UserProfile, v: unknown) => void }) {
  const runLevels = [
    { value: 'nenhum', label: 'Não corro', desc: 'Foco total em musculação', icon: Dumbbell, color: 'var(--accent-orange)' },
    { value: 'iniciante', label: 'Iniciante', desc: 'Corridas curtas, ritmo confortável', icon: Activity, color: 'var(--accent-lime)' },
    { value: 'intermediario', label: 'Intermediário', desc: '5-15km por semana com regularidade', icon: Flame, color: 'var(--accent-cyan)' },
    { value: 'avancado', label: 'Avançado', desc: '15km+ por semana, faz provas', icon: Zap, color: 'var(--accent-purple)' },
  ];

  return (
    <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="animate-fade-in">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: '0.04em', color: 'var(--text-primary)', marginBottom: 8 }}>
          CORRIDA
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Integrar corrida com musculação é a chave do método híbrido para um corpo estético e funcional.
        </p>
      </div>

      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label className="form-label">Seu nível como corredor</label>
        {runLevels.map(level => {
          const Icon = level.icon;
          const isSelected = profile.runnerLevel === level.value;
          return (
            <button
              key={level.value}
              onClick={() => update('runnerLevel', level.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 18px',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                background: isSelected ? 'var(--accent-cyan-dim)' : 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                width: '100%',
              }}
            >
              <div style={{
                width: 36, height: 36,
                borderRadius: 10,
                background: level.color + '22',
                border: `1px solid ${level.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: level.color,
                flexShrink: 0,
              }}>
                <Icon size={18} />
              </div>
              <div>
                <div style={{
                  fontWeight: 700,
                  color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 14,
                }}>{level.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{level.desc}</div>
              </div>
              {isSelected && (
                <Check size={16} style={{ color: 'var(--accent-cyan)', marginLeft: 'auto', flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </div>

      {profile.runnerLevel !== 'nenhum' && (
        <>
          <div className="animate-fade-in form-group">
            <label className="form-label">Pace atual (aproximado)</label>
            <select
              className="form-input"
              value={profile.currentPace || '6:00/km'}
              onChange={e => update('currentPace', e.target.value)}
              style={{ backgroundColor: '#12121E', color: '#F0F2F5' }}
            >
              <option value="8:00/km" style={{ backgroundColor: '#12121E', color: '#F0F2F5' }}>+8:00/km — Caminhada acelerada</option>
              <option value="7:30/km" style={{ backgroundColor: '#12121E', color: '#F0F2F5' }}>7:00-7:30/km — Corrida tranquila</option>
              <option value="6:30/km" style={{ backgroundColor: '#12121E', color: '#F0F2F5' }}>6:00-6:30/km — Ritmo confortável</option>
              <option value="5:30/km" style={{ backgroundColor: '#12121E', color: '#F0F2F5' }}>5:00-5:30/km — Ritmo moderado</option>
              <option value="4:30/km" style={{ backgroundColor: '#12121E', color: '#F0F2F5' }}>4:00-4:30/km — Ritmo forte</option>
              <option value="4:00/km" style={{ backgroundColor: '#12121E', color: '#F0F2F5' }}>-4:00/km — Ritmo avançado</option>
            </select>
          </div>

          <div className="animate-fade-in form-group">
            <label className="form-label">Seu objetivo de corrida</label>
            <input
              className="form-input"
              type="text"
              placeholder="Ex: Correr 10km, melhorar pace, completar meia maratona..."
              value={profile.runGoal || ''}
              onChange={e => update('runGoal', e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Loading & Result Screens ──────────────────────────────────────────────

function LoadingAnalysis() {
  const steps = [
    { text: 'Analisando seu perfil...', delay: 0 },
    { text: 'Calculando periodização com motor de regras...', delay: 600 },
    { text: 'Balanceando musculação e corrida...', delay: 1200 },
    { text: 'Coach RYZE personalizando seu plano...', delay: 1800 },
    { text: 'IA Híbrida de Elite elaborando suas recomendações...', delay: 2400 },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#08080E',
      gap: 32,
      padding: 24,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 56,
          color: 'var(--accent-lime)',
          letterSpacing: '0.08em',
          animation: 'glow-pulse 2s ease-in-out infinite',
          marginBottom: 8,
        }}>
          FORGE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-secondary)' }}>
          <Sparkles size={14} style={{ color: 'var(--accent-lime)' }} />
          <span>Coach RYZE analisando seu perfil</span>
        </div>
      </div>

      {/* Animated spinner */}
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border-subtle)" strokeWidth="3" />
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke="url(#grad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="213"
            strokeDashoffset="160"
            style={{ animation: 'spin 1.2s linear infinite', transformOrigin: 'center' }}
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C8FF00" />
              <stop offset="100%" stopColor="#FF5F1F" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 340 }}>
        {steps.map((s, i) => (
          <div
            key={i}
            className="animate-fade-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              animationDelay: `${s.delay}ms`,
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            <div style={{
              width: 20, height: 20,
              borderRadius: '50%',
              background: i === 3 || i === 4 ? 'rgba(155,89,255,0.2)' : 'var(--accent-lime-dim)',
              border: `1px solid ${i === 3 || i === 4 ? 'var(--accent-purple)' : 'var(--accent-lime)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {i === 3 || i === 4
                ? <Sparkles size={10} color="var(--accent-purple)" />
                : <Check size={12} color="var(--accent-lime)" />
              }
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{s.text}</span>
          </div>
        ))}
      </div>

      {/* Model badge */}
      <div style={{
        padding: '8px 16px',
        background: 'rgba(155,89,255,0.1)',
        border: '1px solid rgba(155,89,255,0.25)',
        borderRadius: 'var(--radius-full)',
        fontSize: 12,
        color: 'var(--accent-purple)',
        fontFamily: 'var(--font-ui)',
        fontWeight: 600,
        letterSpacing: '0.04em',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <Sparkles size={12} />
        google/gemini-2.5-flash via OpenRouter
      </div>
    </div>
  );
}

function ResultScreen({ profile, aiCoach, aiError, onContinue }: { profile: UserProfile; aiCoach: AICoachResponse | null; aiError: boolean; onContinue: () => void }) {
  const analysis = analyzeProfile(profile);
  const goalLabels: Record<string, string> = {
    hipertrofia: 'Hipertrofia Máxima',
    perda_gordura: 'Perda de Gordura',
    performance: 'Performance Híbrida',
    equilibrio: 'Equilíbrio Estético',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(200,255,0,0.08) 0%, transparent 50%), #08080E',
      padding: '40px 24px 120px',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: 20,
            background: 'var(--gradient-lime)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: 'var(--shadow-glow-lime)',
          }}>
            <Target size={32} color="#08080E" strokeWidth={2.5} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 48,
            color: 'var(--text-primary)',
            letterSpacing: '0.04em',
            marginBottom: 8,
          }}>
            PLANO GERADO!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
            {profile.name ? `${profile.name}, sua` : 'Sua'} programação híbrida personalizada está pronta.
          </p>
        </div>

        {/* Analysis Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* 🔮 Gemini AI Coach Card */}
          {aiCoach && (
            <div className="glass-card animate-fade-in" style={{
              padding: 22,
              background: 'linear-gradient(135deg, rgba(155,89,255,0.12) 0%, rgba(200,255,0,0.05) 100%)',
              borderColor: 'rgba(155,89,255,0.3)',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 36, height: 36,
                  borderRadius: 10,
                  background: 'rgba(155,89,255,0.2)',
                  border: '1px solid rgba(155,89,255,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={16} color="var(--accent-purple)" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>
                    Seu Personal Híbrido — Coach RYZE
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--accent-purple)', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>
                    Inteligência de Elite
                  </div>
                </div>
              </div>

              {/* Coach message */}
              <p style={{
                fontSize: 14,
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                marginBottom: 16,
                padding: '12px 14px',
                background: 'rgba(155,89,255,0.08)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid var(--accent-purple)',
              }}>
                {aiCoach.coachMessage}
              </p>

              {/* Key focus points */}
              {aiCoach.keyFocusPoints && aiCoach.keyFocusPoints.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)', marginBottom: 8 }}>
                    FOCOS DA SEMANA
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {aiCoach.keyFocusPoints.map((point, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: 8, alignItems: 'flex-start',
                        fontSize: 13, color: 'var(--text-secondary)',
                      }}>
                        <span style={{ color: 'var(--accent-purple)', flexShrink: 0, marginTop: 1 }}>◆</span>
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Motivational quote */}
              {aiCoach.motivationalQuote && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(200,255,0,0.06)',
                  border: '1px solid rgba(200,255,0,0.15)',
                  borderRadius: 'var(--radius-md)',
                  fontStyle: 'italic',
                  fontSize: 14,
                  color: 'var(--accent-lime)',
                  textAlign: 'center',
                  fontWeight: 600,
                }}>
                  "{aiCoach.motivationalQuote}"
                </div>
              )}
            </div>
          )}

          {/* Error state - using rule-based */}
          {aiError && (
            <div className="glass-card animate-fade-in" style={{
              padding: 16,
              borderColor: 'rgba(255,95,31,0.2)',
              background: 'rgba(255,95,31,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                <AlertTriangle size={16} style={{ color: 'var(--accent-orange)', flexShrink: 0 }} />
                <span>IA indisponível no momento. Usando motor de regras científico como fallback. Seu plano está completo!</span>
              </div>
            </div>
          )}

          {/* Goal */}
          <div className="glass-card animate-fade-in" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32,
                borderRadius: 8,
                background: 'var(--accent-lime-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-lime)',
              }}>
                <Target size={18} />
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15 }}>Objetivo Principal</div>
            </div>
            <div className="badge badge-lime">{goalLabels[profile?.primaryGoal || 'equilibrio'] || 'Equilíbrio Estético'}</div>
          </div>

          {/* Weekly load */}
          <div className="glass-card animate-fade-in" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
              <Calendar size={18} style={{ color: 'var(--accent-lime)' }} />
              Carga Semanal
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'Musculação', value: analysis.weeklyLoad.strengthDays, color: 'var(--accent-orange)' },
                { label: 'Corrida', value: analysis.weeklyLoad.runDays, color: 'var(--accent-cyan)' },
                { label: 'Descanso', value: analysis.weeklyLoad.restDays, color: 'var(--text-muted)' },
              ].map(item => (
                <div key={item.label} style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '16px 8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 32,
                    color: item.color,
                    lineHeight: 1,
                  }}>{item.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-ui)', fontWeight: 600 }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="glass-card animate-fade-in" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
              <Lightbulb size={18} style={{ color: 'var(--accent-lime)' }} />
              Recomendações da IA
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analysis.recommendations.slice(0, 3).map((rec, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10,
                  padding: '10px 12px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <span style={{ color: 'var(--accent-lime)', fontSize: 12, marginTop: 2, flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Time estimate */}
          <div className="glass-card animate-fade-in" style={{
            padding: 20,
            background: 'var(--accent-lime-dim)',
            borderColor: 'var(--border-accent)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40,
                borderRadius: 10,
                background: 'rgba(200,255,0,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-lime)',
                flexShrink: 0,
              }}>
                <Timer size={20} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: 'var(--accent-lime)' }}>
                  Previsão de resultados
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {analysis.estimatedTimeToGoal}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          className="btn btn-primary btn-lg animate-glow"
          style={{ width: '100%', marginTop: 32 }}
          onClick={onContinue}
        >
          Ver meu plano semanal
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
