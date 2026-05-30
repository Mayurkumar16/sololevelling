import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Target, Trophy } from 'lucide-react';
import { Quest } from '../types';
import { cn } from '../lib/utils';

interface QuestCardProps {
  quest: Quest;
  onComplete: (id: string) => void;
  className?: string;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  onComplete,
  className,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group relative p-4 rounded-lg border-2 transition-all duration-300 overflow-hidden',
        quest.isCompleted
          ? 'border-green-500/30 bg-green-950/10 opacity-70'
          : 'border-blue-500/30 bg-blue-950/10 hover:border-blue-400/50',
        className
      )}
    >
      {/* Background Glow */}
      <div className={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity',
        quest.isCompleted ? 'bg-green-500' : 'bg-blue-500'
      )} />

      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/10 text-white/70">
              {quest.type}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
              +{quest.statType}
            </span>
          </div>
          <h3 className="text-sm font-bold uppercase tracking-tight mb-1">
            {quest.title}
          </h3>
          <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
            {quest.description}
          </p>
        </div>

        <button
          onClick={() => !quest.isCompleted && onComplete(quest.id)}
          disabled={quest.isCompleted}
          className={cn(
            'p-2 rounded-lg transition-all duration-300',
            quest.isCompleted
              ? 'text-green-400 bg-green-500/20 cursor-default'
              : 'text-blue-400 bg-blue-500/20 hover:bg-blue-500/40'
          )}
        >
          {quest.isCompleted ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-70 relative z-10">
        <div className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          <span>{quest.rewardXp} XP</span>
        </div>
        <div className="flex items-center gap-1">
          <Trophy className="w-3 h-3" />
          <span>{quest.rewardGold} Gold</span>
        </div>
      </div>
    </motion.div>
  );
};
