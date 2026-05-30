import React from 'react';
import { motion } from 'framer-motion';
import { Rank } from '../types';
import { cn } from '../lib/utils';

interface AvatarProps {
  rank: Rank;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ rank, className }) => {
  const rankScale = {
    E: 0.8,
    D: 0.9,
    C: 1.0,
    B: 1.1,
    A: 1.2,
    S: 1.3,
  };

  const rankColors = {
    E: 'bg-gray-400',
    D: 'bg-green-400',
    C: 'bg-blue-400',
    B: 'bg-purple-400',
    A: 'bg-orange-400',
    S: 'bg-red-500',
  };

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <motion.div
        animate={{ scale: rankScale[rank] }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="relative w-32 h-32"
      >
        {/* Simple SVG Avatar representing a "Hunter" */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
        >
          {/* Body */}
          <motion.path
            d="M30 80 Q50 70 70 80 L75 95 L25 95 Z"
            fill="#2c2c2c"
            stroke="#444"
            strokeWidth="2"
          />
          {/* Head */}
          <circle cx="50" cy="40" r="20" fill="#f5d0b0" stroke="#d4a373" strokeWidth="2" />
          {/* Eyes */}
          <circle cx="43" cy="38" r="2" fill="#000" />
          <circle cx="57" cy="38" r="2" fill="#000" />
          {/* Rank Glow */}
          <motion.circle
            cx="50"
            cy="40"
            r="25"
            fill="none"
            stroke={rankColors[rank].replace('bg-', '')}
            strokeWidth="2"
            strokeDasharray="5 5"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
          {/* Accessories based on rank */}
          {['A', 'S'].includes(rank) && (
            <path d="M20 30 L30 20 M80 30 L70 20" stroke="#ffd700" strokeWidth="3" />
          )}
          {['B', 'A', 'S'].includes(rank) && (
            <path d="M40 15 L50 5 L60 15" fill="#ffd700" />
          )}
        </svg>
      </motion.div>
      <div className="absolute -bottom-2 px-3 py-1 bg-black/80 border border-white/20 rounded-full text-[10px] font-bold tracking-widest uppercase">
        Rank {rank}
      </div>
    </div>
  );
};
