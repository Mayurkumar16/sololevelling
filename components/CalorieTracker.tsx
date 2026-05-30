import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Utensils, Flame, History } from 'lucide-react';
import { CalorieLog } from '../types';
import { cn } from '../lib/utils';

interface CalorieTrackerProps {
  logs: CalorieLog[];
  onAddLog: (calories: number, food: string) => void;
  className?: string;
}

export const CalorieTracker: React.FC<CalorieTrackerProps> = ({
  logs,
  onAddLog,
  className,
}) => {
  const [calories, setCalories] = useState('');
  const [food, setFood] = useState('');

  const todayLog = logs.find(log => log.date === new Date().toISOString().split('T')[0]);
  const totalToday = todayLog?.calories || 0;
  const goal = 2500; // Default goal
  const percentage = Math.min((totalToday / goal) * 100, 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calories && food) {
      onAddLog(parseInt(calories), food);
      setCalories('');
      setFood('');
    }
  };

  return (
    <div className={cn('p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl', className)}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest">
              CALORIE TRACKER
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              DAILY INTAKE LOG
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-mono font-bold text-orange-400">
            {totalToday}
          </span>
          <span className="text-xs font-bold opacity-50 ml-1">/ {goal} kcal</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden mb-8 border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
        />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative">
          <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
          <input
            type="text"
            placeholder="Food Item"
            value={food}
            onChange={(e) => setFood(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
          />
        </div>
        <div className="relative">
          <Flame className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
          <input
            type="number"
            placeholder="Calories"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="bg-orange-600 hover:bg-orange-500 text-white font-bold uppercase tracking-widest text-xs py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          ADD LOG
        </button>
      </form>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">
          <History className="w-3 h-3" />
          <span>RECENT LOGS</span>
        </div>
        {todayLog?.foodItems.slice(-5).reverse().map((item, i) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={i}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 text-xs"
          >
            <span className="font-medium">{item}</span>
            <span className="text-orange-400 font-mono font-bold">LOGGED</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
