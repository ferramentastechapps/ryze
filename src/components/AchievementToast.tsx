import React from 'react';
import type { Badge } from '../types';
import { Trophy, Zap, X } from 'lucide-react';

interface AchievementToastProps {
  badges: Badge[];
  earnedXp: number;
  onClose: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  badges,
  earnedXp,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-3xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(245,158,11,0.2)] text-center relative overflow-hidden">
        {/* Glow backdrop effect */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-800/50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
          🏆
        </div>

        <h3 className="text-xl font-black text-white mb-1">Treino Concluído!</h3>
        <p className="text-sm text-zinc-400 mb-4">Você acumulou novos pontos e conquistas.</p>

        {/* XP Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 px-4 py-2 rounded-full font-bold text-amber-400 text-sm mb-6">
          <Zap className="w-4 h-4 fill-amber-400" />
          <span>+{earnedXp} XP Adicionados</span>
        </div>

        {/* Unlocked Badges */}
        {badges.length > 0 && (
          <div className="space-y-3 mb-6">
            <p className="text-xs uppercase tracking-wider font-bold text-zinc-400">
              Novas Conquistas Desbloqueadas ({badges.length})
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {badges.map(badge => (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 bg-zinc-800/80 border border-amber-500/30 rounded-xl p-3 text-left"
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <h4 className="font-bold text-sm text-amber-300">{badge.name}</h4>
                    <p className="text-xs text-zinc-400">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold rounded-xl transition shadow-lg"
        >
          Continuar Treinando
        </button>
      </div>
    </div>
  );
};
