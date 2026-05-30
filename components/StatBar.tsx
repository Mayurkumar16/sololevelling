import React from 'react';
import { motion } from 'framer-motion';
import { StatType } from '../types';
import { cn } from '../lib/utils';

interface StatBarProps {
  label: string;
  value: number;
  type: StatType;
  max?: number;
  className?: string;
}

export const StatBar: React.FC<StatBarProps> = ({
  label,
  value,
  type,
  max = 100,
  className,
}) => {
  const colors = {
    str: 'bg-red-500',
    int: 'bg-blue-500',
    agi: 'bg-green-500',
    vit: 'bg-orange-500',
    sen: 'bg-purple-500',
  };

  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
          {label}
        </span>
        <span className="text-xs font-bold font-mono">{value}</span>
      </div>
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn('h-full shadow-[0_0_10px_rgba(255,255,255,0.2)]', colors[type])}
        />
      </div>
    </div>
  );
};
