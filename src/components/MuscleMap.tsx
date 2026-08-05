import { useState } from 'react';
import type { ExerciseGuide, MuscleZone } from '../data/exerciseGuides';
import { MUSCLE_ACTIVATION_MAP } from '../data/exerciseGuides';

interface MuscleMapProps {
  guide: ExerciseGuide;
}

function getCategoryColor(category: ExerciseGuide['category']): string {
  if (category === 'peito' || category === 'pernas') return '#FF5F1F'; // Neon Orange
  if (category === 'costas' || category === 'gluteos') return '#00D4FF'; // Neon Cyan
  return '#C8FF00'; // Neon Lime
}

// ─── ANTERIOR (FRONTAL) ANATOMICAL SILHOUETTE ────────────────────────────────
function AnteriorSilhouette({ primaryZones, secondaryZones, primaryColor }: {
  primaryZones: MuscleZone[];
  secondaryZones: MuscleZone[];
  primaryColor: string;
}) {
  const isPrimary = (zone: MuscleZone) => primaryZones.includes(zone);
  const isSecondary = (zone: MuscleZone) => secondaryZones.includes(zone);

  const getFill = (zone: MuscleZone) => {
    if (isPrimary(zone)) return primaryColor;
    if (isSecondary(zone)) return '#00D4FF';
    return '#1A1A28';
  };

  const getOpacity = (zone: MuscleZone) => {
    if (isPrimary(zone)) return 0.95;
    if (isSecondary(zone)) return 0.75;
    return 0.35;
  };

  const getGlow = (zone: MuscleZone) => {
    if (isPrimary(zone)) return `drop-shadow(0 0 8px ${primaryColor})`;
    if (isSecondary(zone)) return 'drop-shadow(0 0 6px #00D4FF)';
    return 'none';
  };

  return (
    <svg viewBox="0 0 200 420" style={{ width: '100%', height: '100%', maxHeight: 310, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.6))' }}>
      <defs>
        <linearGradient id="bodyBaseGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E1E2E" />
          <stop offset="100%" stopColor="#0D0D18" />
        </linearGradient>
      </defs>

      {/* BODY CONTOUR BASE SILHOUETTE (Human proportioned outline) */}
      <g stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="url(#bodyBaseGrad)">
        {/* Head & Neck */}
        <path d="M100 12 C110 12 118 20 118 32 C118 44 110 50 106 52 L106 62 L94 62 L94 52 C90 50 82 44 82 32 C82 20 90 12 100 12 Z" />
        {/* Torso & Limbs silhouette outline background */}
        <path d="M94 62 L74 68 L50 88 L38 135 L42 180 L52 180 L56 142 L66 122 L68 185 L74 240 L70 320 L78 395 L96 395 L96 280 L100 240 L104 280 L104 395 L122 395 L130 320 L126 240 L132 185 L134 122 L144 142 L148 180 L158 180 L162 135 L150 88 L126 68 L106 62 Z" />
      </g>

      {/* ANATOMICAL MUSCLE PATHS */}

      {/* TRAPÉZIO FRENTE */}
      <path
        d="M84 64 Q100 58 116 64 L114 74 Q100 70 86 74 Z"
        fill={getFill('trapezio')} opacity={getOpacity('trapezio')} style={{ filter: getGlow('trapezio') }}
      />

      {/* PEITORAL MAIOR (Esquerda & Direita) */}
      <g style={{ filter: getGlow('peitoral') }}>
        {/* Peitoral Esquerdo */}
        <path
          d="M98 76 C90 75 76 78 72 85 C70 98 76 112 96 114 C98 102 98 88 98 76 Z"
          fill={getFill('peitoral')} opacity={getOpacity('peitoral')}
          stroke={isPrimary('peitoral') ? primaryColor : 'none'} strokeWidth="0.5"
        />
        {/* Peitoral Direito */}
        <path
          d="M102 76 C110 75 124 78 128 85 C130 98 124 112 104 114 C102 102 102 88 102 76 Z"
          fill={getFill('peitoral')} opacity={getOpacity('peitoral')}
          stroke={isPrimary('peitoral') ? primaryColor : 'none'} strokeWidth="0.5"
        />
      </g>

      {/* DELTOIDE ANTERIOR (Ombros) */}
      <g style={{ filter: getGlow('deltoide_ant') }}>
        <path
          d="M72 72 C64 74 54 82 52 95 C58 100 66 102 70 94 C74 88 74 78 72 72 Z"
          fill={getFill('deltoide_ant')} opacity={getOpacity('deltoide_ant')}
        />
        <path
          d="M128 72 C136 74 146 82 148 95 C142 100 134 102 130 94 C126 88 126 78 128 72 Z"
          fill={getFill('deltoide_ant')} opacity={getOpacity('deltoide_ant')}
        />
      </g>

      {/* BÍCEPS BRAQUIAL */}
      <g style={{ filter: getGlow('biceps') }}>
        <path
          d="M52 98 C46 104 42 120 44 136 C50 138 56 136 58 124 C60 112 56 102 52 98 Z"
          fill={getFill('biceps')} opacity={getOpacity('biceps')}
        />
        <path
          d="M148 98 C154 104 158 120 156 136 C150 138 144 136 142 124 C140 112 144 102 148 98 Z"
          fill={getFill('biceps')} opacity={getOpacity('biceps')}
        />
      </g>

      {/* ANTEBRAÇO FRENTE */}
      <g style={{ filter: getGlow('antebraco') }}>
        <path d="M44 138 C38 148 38 168 42 178 C48 178 50 165 52 148 Z" fill={getFill('antebraco')} opacity={getOpacity('antebraco')} />
        <path d="M156 138 C162 148 162 168 158 178 C152 178 150 165 148 148 Z" fill={getFill('antebraco')} opacity={getOpacity('antebraco')} />
      </g>

      {/* SERRÁTIL ANTERIOR */}
      <g style={{ filter: getGlow('serratiil') }}>
        <path d="M72 104 L68 124 L76 122 Z" fill={getFill('serratiil')} opacity={getOpacity('serratiil')} />
        <path d="M128 104 L132 124 L124 122 Z" fill={getFill('serratiil')} opacity={getOpacity('serratiil')} />
      </g>

      {/* ABDÔMEN (RECTUS ABDOMINIS - 6 Pack Anatómicamente definido) */}
      <g style={{ filter: getGlow('abs') }}>
        {/* Gomo Superior */}
        <path d="M90 118 L98 118 L98 130 L90 130 Z" fill={getFill('abs')} opacity={getOpacity('abs')} rx="2" />
        <path d="M102 118 L110 118 L110 130 L102 130 Z" fill={getFill('abs')} opacity={getOpacity('abs')} rx="2" />
        {/* Gomo Médio */}
        <path d="M90 134 L98 134 L98 148 L90 148 Z" fill={getFill('abs')} opacity={getOpacity('abs')} rx="2" />
        <path d="M102 134 L110 134 L110 148 L102 148 Z" fill={getFill('abs')} opacity={getOpacity('abs')} rx="2" />
        {/* Gomo Inferior */}
        <path d="M91 152 L98 152 L98 168 L92 168 Z" fill={getFill('abs')} opacity={getOpacity('abs')} rx="2" />
        <path d="M102 152 L109 152 L108 168 L102 168 Z" fill={getFill('abs')} opacity={getOpacity('abs')} rx="2" />
      </g>

      {/* OBLÍQUOS EXTERNOS */}
      <g style={{ filter: getGlow('obliquos') }}>
        <path d="M74 124 C72 140 76 160 84 172 C88 156 86 138 82 126 Z" fill={getFill('obliquos')} opacity={getOpacity('obliquos')} />
        <path d="M126 124 C128 140 124 160 116 172 C112 156 114 138 118 126 Z" fill={getFill('obliquos')} opacity={getOpacity('obliquos')} />
      </g>

      {/* QUADRÍCEPS (Vasto Lateral, Vasto Medial, Reto Femoral) */}
      <g style={{ filter: getGlow('quadriceps') }}>
        {/* Coxa Esquerda */}
        <path
          d="M72 186 C68 210 70 245 74 265 C86 268 96 260 96 235 C98 210 94 186 86 182 Z"
          fill={getFill('quadriceps')} opacity={getOpacity('quadriceps')}
          stroke={isPrimary('quadriceps') ? primaryColor : 'none'} strokeWidth="0.5"
        />
        {/* Coxa Direita */}
        <path
          d="M128 186 C132 210 130 245 126 265 C114 268 104 260 104 235 C102 210 106 186 114 182 Z"
          fill={getFill('quadriceps')} opacity={getOpacity('quadriceps')}
          stroke={isPrimary('quadriceps') ? primaryColor : 'none'} strokeWidth="0.5"
        />
      </g>

      {/* ADUTORES */}
      <g style={{ filter: getGlow('adutores') }}>
        <path d="M88 184 L96 184 L96 230 L90 220 Z" fill={getFill('adutores')} opacity={getOpacity('adutores')} />
        <path d="M112 184 L104 184 L104 230 L110 220 Z" fill={getFill('adutores')} opacity={getOpacity('adutores')} />
      </g>

      {/* TIBIAL ANTERIOR & PANTURRILHA FRENTE */}
      <g style={{ filter: getGlow('tibial') }}>
        <path d="M74 275 C70 300 72 340 76 370 C84 372 90 365 90 330 C90 300 84 275 78 275 Z" fill={getFill('tibial')} opacity={getOpacity('tibial')} />
        <path d="M126 275 C130 300 128 340 124 370 C116 372 110 365 110 330 C110 300 116 275 122 275 Z" fill={getFill('tibial')} opacity={getOpacity('tibial')} />
      </g>

      {/* ANATOMICAL GUIDE OVERLAY LINES & CALLOUTS */}
      {primaryZones.map((zone, i) => {
        let cx = 100, cy = 100, label = zone;
        if (zone === 'peitoral') { cx = 86; cy = 95; }
        else if (zone === 'quadriceps') { cx = 82; cy = 220; }
        else if (zone === 'deltoide_ant') { cx = 60; cy = 84; }
        else if (zone === 'biceps') { cx = 50; cy = 115; }
        else if (zone === 'abs') { cx = 106; cy = 140; }

        return (
          <g key={i} className="animate-fade-in">
            <circle cx={cx} cy={cy} r="4" fill={primaryColor} />
            <circle cx={cx} cy={cy} r="8" fill="none" stroke={primaryColor} strokeWidth="1" opacity="0.6" />
          </g>
        );
      })}
    </svg>
  );
}

// ─── POSTERIOR (DORSAL) ANATOMICAL SILHOUETTE ───────────────────────────────
function PosteriorSilhouette({ primaryZones, secondaryZones, primaryColor }: {
  primaryZones: MuscleZone[];
  secondaryZones: MuscleZone[];
  primaryColor: string;
}) {
  const isPrimary = (zone: MuscleZone) => primaryZones.includes(zone);
  const isSecondary = (zone: MuscleZone) => secondaryZones.includes(zone);

  const getFill = (zone: MuscleZone) => {
    if (isPrimary(zone)) return primaryColor;
    if (isSecondary(zone)) return '#00D4FF';
    return '#1A1A28';
  };

  const getOpacity = (zone: MuscleZone) => {
    if (isPrimary(zone)) return 0.95;
    if (isSecondary(zone)) return 0.75;
    return 0.35;
  };

  const getGlow = (zone: MuscleZone) => {
    if (isPrimary(zone)) return `drop-shadow(0 0 8px ${primaryColor})`;
    if (isSecondary(zone)) return 'drop-shadow(0 0 6px #00D4FF)';
    return 'none';
  };

  return (
    <svg viewBox="0 0 200 420" style={{ width: '100%', height: '100%', maxHeight: 310, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.6))' }}>
      <defs>
        <linearGradient id="bodyBaseGradPost" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E1E2E" />
          <stop offset="100%" stopColor="#0D0D18" />
        </linearGradient>
      </defs>

      {/* BASE CONTOUR */}
      <g stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="url(#bodyBaseGradPost)">
        <path d="M100 12 C110 12 118 20 118 32 C118 44 110 50 106 52 L106 62 L94 62 L94 52 C90 50 82 44 82 32 C82 20 90 12 100 12 Z" />
        <path d="M94 62 L74 68 L50 88 L38 135 L42 180 L52 180 L56 142 L66 122 L68 185 L74 240 L70 320 L78 395 L96 395 L96 280 L100 240 L104 280 L104 395 L122 395 L130 320 L126 240 L132 185 L134 122 L144 142 L148 180 L158 180 L162 135 L150 88 L126 68 L106 62 Z" />
      </g>

      {/* TRAPÉZIO DORSAL */}
      <g style={{ filter: getGlow('trapezio') }}>
        <path
          d="M100 62 L80 72 L72 90 L100 108 L128 90 L120 72 Z"
          fill={getFill('trapezio')} opacity={getOpacity('trapezio')}
        />
      </g>

      {/* DELTOIDE POSTERIOR */}
      <g style={{ filter: getGlow('deltoide_post') }}>
        <path d="M72 72 C64 74 54 82 52 95 C58 100 68 98 72 90 Z" fill={getFill('deltoide_post')} opacity={getOpacity('deltoide_post')} />
        <path d="M128 72 C136 74 146 82 148 95 C142 100 132 98 128 90 Z" fill={getFill('deltoide_post')} opacity={getOpacity('deltoide_post')} />
      </g>

      {/* ROMBOIDES & INFRAESPINHAL */}
      <g style={{ filter: getGlow('romboides') }}>
        <path d="M80 92 L100 108 L84 122 L74 100 Z" fill={getFill('romboides')} opacity={getOpacity('romboides')} />
        <path d="M120 92 L100 108 L116 122 L126 100 Z" fill={getFill('romboides')} opacity={getOpacity('romboides')} />
      </g>

      {/* LATÍSSIMO DO DORSO (LATS V-TAPER) */}
      <g style={{ filter: getGlow('latissimo') }}>
        <path
          d="M74 100 L84 122 L96 142 L72 165 C64 142 66 118 74 100 Z"
          fill={getFill('latissimo')} opacity={getOpacity('latissimo')}
          stroke={isPrimary('latissimo') ? primaryColor : 'none'} strokeWidth="0.5"
        />
        <path
          d="M126 100 L116 122 L104 142 L128 165 C136 142 134 118 126 100 Z"
          fill={getFill('latissimo')} opacity={getOpacity('latissimo')}
          stroke={isPrimary('latissimo') ? primaryColor : 'none'} strokeWidth="0.5"
        />
      </g>

      {/* ERETORES DA ESPINHA (LOMBAR) */}
      <g style={{ filter: getGlow('eretores') }}>
        <path d="M92 110 L98 110 L98 175 L92 175 Z" fill={getFill('eretores')} opacity={getOpacity('eretores')} />
        <path d="M102 110 L108 110 L108 175 L102 175 Z" fill={getFill('eretores')} opacity={getOpacity('eretores')} />
      </g>

      {/* TRÍCEPS BRAQUIAL DORSAL */}
      <g style={{ filter: getGlow('triceps') }}>
        <path
          d="M52 98 C46 104 44 120 46 136 C52 138 58 134 56 120 C56 108 54 100 52 98 Z"
          fill={getFill('triceps')} opacity={getOpacity('triceps')}
        />
        <path
          d="M148 98 C154 104 156 120 154 136 C148 138 142 134 144 120 C144 108 146 100 148 98 Z"
          fill={getFill('triceps')} opacity={getOpacity('triceps')}
        />
      </g>

      {/* GLÚTEO MÁXIMO & MÉDIO */}
      <g style={{ filter: getGlow('gluteo_max') }}>
        <path
          d="M72 175 C82 170 98 174 98 215 C88 220 74 218 70 195 Z"
          fill={getFill('gluteo_max')} opacity={getOpacity('gluteo_max')}
          stroke={isPrimary('gluteo_max') ? primaryColor : 'none'} strokeWidth="0.5"
        />
        <path
          d="M128 175 C118 170 102 174 102 215 C112 220 126 218 130 195 Z"
          fill={getFill('gluteo_max')} opacity={getOpacity('gluteo_max')}
          stroke={isPrimary('gluteo_max') ? primaryColor : 'none'} strokeWidth="0.5"
        />
      </g>

      {/* ISQUIOTIBIAIS (HAMSTRINGS) */}
      <g style={{ filter: getGlow('isquiotibiais') }}>
        <path
          d="M72 220 C82 222 96 220 96 265 C84 268 74 262 72 238 Z"
          fill={getFill('isquiotibiais')} opacity={getOpacity('isquiotibiais')}
        />
        <path
          d="M128 220 C118 222 104 220 104 265 C116 268 126 262 128 238 Z"
          fill={getFill('isquiotibiais')} opacity={getOpacity('isquiotibiais')}
        />
      </g>

      {/* PANTURRILHA DORSAL (GASTROCNÊMIO) */}
      <g style={{ filter: getGlow('panturrilha') }}>
        <path
          d="M72 275 C68 295 72 330 80 340 C88 340 92 315 88 285 Z"
          fill={getFill('panturrilha')} opacity={getOpacity('panturrilha')}
        />
        <path
          d="M128 275 C132 295 128 330 120 340 C112 340 108 315 112 285 Z"
          fill={getFill('panturrilha')} opacity={getOpacity('panturrilha')}
        />
      </g>
    </svg>
  );
}

export default function MuscleMap({ guide }: MuscleMapProps) {
  // Se o exercício tem o foco primário/secundário nas costas, padrão é mostrar vista posterior
  const isBackFocused = ['costas', 'gluteos', 'triceps'].includes(guide.category);
  const [view, setView] = useState<'front' | 'back'>(isBackFocused ? 'back' : 'front');

  const activation = MUSCLE_ACTIVATION_MAP[guide.category];
  const primaryColor = getCategoryColor(guide.category);

  return (
    <div style={{
      padding: '16px 18px',
      background: 'rgba(12, 12, 22, 0.95)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      {/* Header */}
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontWeight: 800,
        fontSize: 12,
        color: 'var(--text-muted)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>🎯</span>
          <span>MAPA ANATÔMICO 3D</span>
        </div>
        <span style={{ fontSize: 11, color: primaryColor, fontWeight: 800 }}>{guide.difficulty}</span>
      </div>

      {/* Toggle Vista Frontal / Dorsal */}
      <div style={{
        display: 'flex',
        gap: 4,
        marginBottom: 14,
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 'var(--radius-md)',
        padding: 3,
      }}>
        {([
          { id: 'front', label: 'Vista Anterior (Frente)' },
          { id: 'back', label: 'Vista Posterior (Costas)' },
        ] as const).map(btn => (
          <button
            key={btn.id}
            onClick={() => setView(btn.id)}
            style={{
              flex: 1,
              padding: '8px 0',
              border: 'none',
              borderRadius: 'calc(var(--radius-md) - 2px)',
              background: view === btn.id ? primaryColor : 'transparent',
              color: view === btn.id ? '#08080E' : 'var(--text-muted)',
              fontFamily: 'var(--font-ui)',
              fontWeight: 800,
              fontSize: 11,
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.04em',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Grid de Conteúdo */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14,
        alignItems: 'center',
      }}>
        {/* Renderizador Anatômico SVG */}
        <div style={{
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.5) 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${primaryColor}22`,
          minHeight: 280,
        }}>
          {view === 'front' ? (
            <AnteriorSilhouette
              primaryZones={activation.primary}
              secondaryZones={activation.secondary}
              primaryColor={primaryColor}
            />
          ) : (
            <PosteriorSilhouette
              primaryZones={activation.primary}
              secondaryZones={activation.secondary}
              primaryColor={primaryColor}
            />
          )}
        </div>

        {/* Lista Detalhada de Músculos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Músculo Alvo Primário */}
          <div style={{
            padding: '10px 12px',
            background: `${primaryColor}15`,
            borderRadius: 'var(--radius-md)',
            borderLeft: `3px solid ${primaryColor}`,
          }}>
            <div style={{
              fontSize: 10,
              color: primaryColor,
              fontFamily: 'var(--font-ui)',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: 4,
              letterSpacing: '0.06em',
            }}>
              🔥 ALVO PRINCIPAL
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {guide.primaryMuscles.map((m, i) => (
                <div key={i} style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-ui)',
                  lineHeight: 1.3,
                }}>
                  {m}
                </div>
              ))}
            </div>
          </div>

          {/* Músculos Sinergistas */}
          <div style={{
            padding: '10px 12px',
            background: 'rgba(0,212,255,0.08)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid #00D4FF',
          }}>
            <div style={{
              fontSize: 10,
              color: '#00D4FF',
              fontFamily: 'var(--font-ui)',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: 4,
              letterSpacing: '0.06em',
            }}>
              ⚡ SINERGISTAS & AUXILIARES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {guide.secondaryMuscles.map((m, i) => (
                <div key={i} style={{
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.3,
                  fontWeight: 600,
                }}>
                  • {m}
                </div>
              ))}
            </div>
          </div>

          {/* Barra de Ativação Geral */}
          <div style={{
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 700, marginBottom: 6 }}>
              <span>ÍNDICE DE RECRUTAMENTO</span>
              <span style={{ color: primaryColor, fontWeight: 900 }}>{guide.activationLevel}%</span>
            </div>
            <div style={{
              height: 6,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 99,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${guide.activationLevel}%`,
                background: `linear-gradient(90deg, ${primaryColor}88, ${primaryColor})`,
                boxShadow: `0 0 10px ${primaryColor}`,
                borderRadius: 99,
                transition: 'width 0.8s ease-out',
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
