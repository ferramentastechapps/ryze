import React from 'react';
import { useGamificationStore, getNextLevelXp } from '../store/gamificationStore';
import { Zap, Flame, Trophy } from 'lucide-react';

interface XpBarProps {
  compact?: boolean;
}

export const XpBar: React.FC<XpBarProps> = ({ compact = false }) => {
  const { xp, level, streak, unlockedBadges } = useGamificationStore();

  const prevLevelXp = (level - 1) * 100;
  const nextLevelXp = getNextLevelXp(level);
  const currentLevelProgress = xp - prevLevelXp;
  const xpNeededForNext = nextLevelXp - prevLevelXp;
  const progressPercent = Math.min(100, Math.max(0, (currentLevelProgress / xpNeededForNext) * 100));

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300">
        <div className="flex items-center gap-1 font-bold text-amber-400">
          <Zap className="w-3.5 h-3.5 fill-amber-400" />
          <span>Nível {level}</span>
        </div>
        <div className="w-16 bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center gap-1 font-semibold text-orange-400">
          <Flame className="w-3.5 h-3.5 fill-orange-400" />
          <span>{streak}d</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800/80 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-extrabold text-lg">
            {level}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Atleta Nível {level}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {xp} Total XP
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {xpNeededForNext - currentLevelProgress} XP para o Nível {level + 1}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-orange-400 font-black text-base">
              <Flame className="w-4 h-4 fill-orange-400 animate-pulse" />
              <span>{streak} {streak === 1 ? 'dia' : 'dias'}</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Sequência</span>
          </div>

          <div className="text-right pl-3 border-l border-zinc-800">
            <div className="flex items-center justify-end gap-1 text-emerald-400 font-black text-base">
              <Trophy className="w-4 h-4" />
              <span>{unlockedBadges.length}</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Conquistas</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="w-full bg-zinc-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-zinc-700/50">
          <div
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
          <span>{currentLevelProgress} XP</span>
          <span>{xpNeededForNext} XP</span>
        </div>
      </div>
    </div>
  );
};
