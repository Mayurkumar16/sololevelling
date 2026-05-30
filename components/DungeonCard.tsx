import React from 'react';
import { motion } from 'framer-motion';
import { Castle, Timer, Swords, Skull } from 'lucide-react';
import { cn } from '../lib/utils';

interface DungeonCardProps {
  id: string;
  name: string;
  difficulty: 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
  timeLimit: number; // in minutes
  rewardXp: number;
  rewardGold: number;
  onEnter: (id: string) => void;
  className?: string;
}

export const DungeonCard: React.FC<DungeonCardProps> = ({
  id,
  name,
  difficulty,
  timeLimit,
  rewardXp,
  rewardGold,
  onEnter,
  className,
}) => {
  const difficultyColors = {
    E: 'text-gray-400 border-gray-400/30 bg-gray-950/10',
    D: 'text-green-400 border-green-400/30 bg-green-950/10',
    C: 'text-blue-400 border-blue-400/30 bg-blue-950/10',
    B: 'text-purple-400 border-purple-400/30 bg-purple-950/10',
    A: 'text-orange-400 border-orange-400/30 bg-orange-950/10',
    S: 'text-red-500 border-red-500/30 bg-red-950/10',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group relative p-6 rounded-2xl border-2 transition-all duration-500 overflow-hidden cursor-pointer',
        difficultyColors[difficulty],
        className
      )}
      onClick={() => onEnter(id)}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
        <Castle className="absolute -right-8 -bottom-8 w-48 h-48 rotate-12" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skull className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              DUNGEON INSTANCE
            </span>
          </div>
          <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest">
            RANK {difficulty}
          </div>
        </div>

        <h3 className="text-xl font-black uppercase tracking-tight mb-2 group-hover:tracking-widest transition-all duration-500">
          {name}
        </h3>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest opacity-70">
            <Timer className="w-4 h-4" />
            <span>{timeLimit} MIN</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest opacity-70">
            <Swords className="w-4 h-4" />
            <span>BOSS CLEAR</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
            <span className="text-[8px] font-bold uppercase tracking-widest opacity-50 mb-1">
              XP REWARD
            </span>
            <span className="text-sm font-bold font-mono">+{rewardXp}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
            <span className="text-[8px] font-bold uppercase tracking-widest opacity-50 mb-1">
              GOLD REWARD
            </span>
            <span className="text-sm font-bold font-mono">+{rewardGold}</span>
          </div>
        </div>

        <button className="w-full mt-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold uppercase tracking-[0.3em] transition-all duration-300">
          ENTER GATE
        </button>
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-current to-transparent opacity-20" />
      </div>
    </motion.div>
  );
};
