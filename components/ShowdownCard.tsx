import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Timer, Trophy, User } from 'lucide-react';
import { Showdown } from '../types';
import { cn } from '../lib/utils';

interface ShowdownCardProps {
  showdown: Showdown;
  currentUserId: string;
  onAccept: (id: string) => void;
  record?: string;
  className?: string;
}

export const ShowdownCard: React.FC<ShowdownCardProps> = ({
  showdown,
  currentUserId,
  onAccept,
  record,
  className,
}) => {
  const isCreator = showdown.creatorId === currentUserId;
  const isOpponent = showdown.opponentId === currentUserId;
  const isPending = showdown.status === 'pending';
  const isCompleted = showdown.status === 'completed';

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={cn(
        'relative p-5 rounded-xl border-2 transition-all duration-300 overflow-hidden',
        isCompleted
          ? 'border-green-500/30 bg-green-950/10'
          : 'border-red-500/30 bg-red-950/10',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest">
              SHOWDOWN: {showdown.exercise}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              {showdown.sets} SETS × {showdown.reps} REPS
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {record && (
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              RECORD: {record}
            </span>
          )}
          {isCompleted && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
              <Trophy className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {showdown.winnerId === currentUserId ? 'VICTORY' : 'DEFEAT'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
          <User className="w-4 h-4 opacity-50" />
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
            CHALLENGER
          </span>
          <div className="flex items-center gap-1 text-lg font-mono font-bold text-red-400">
            <Timer className="w-4 h-4" />
            <span>{showdown.creatorTime}s</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
          <User className="w-4 h-4 opacity-50" />
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
            OPPONENT
          </span>
          <div className="flex items-center gap-1 text-lg font-mono font-bold text-blue-400">
            <Timer className="w-4 h-4" />
            <span>{showdown.opponentTime ? `${showdown.opponentTime}s` : '--'}</span>
          </div>
        </div>
      </div>

      {isPending && isOpponent && (
        <button
          onClick={() => onAccept(showdown.id)}
          className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
        >
          ACCEPT CHALLENGE
        </button>
      )}

      {isPending && isCreator && (
        <div className="w-full py-3 rounded-lg bg-white/5 border border-white/10 text-center text-white/50 font-bold uppercase tracking-widest text-[10px]">
          WAITING FOR OPPONENT...
        </div>
      )}
    </motion.div>
  );
};
