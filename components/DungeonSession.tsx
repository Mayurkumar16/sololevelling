import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Swords, Skull, Shield, Trophy, X, ChevronRight } from 'lucide-react';
import { Dungeon, MonsterInstance } from '../types';
import { cn } from '../lib/utils';

interface DungeonSessionProps {
  dungeon: Dungeon;
  onComplete: (xp: number, gold: number) => void;
  onCancel: () => void;
}

export const DungeonSession: React.FC<DungeonSessionProps> = ({
  dungeon,
  onComplete,
  onCancel,
}) => {
  const [timeLeft, setTimeLeft] = useState(dungeon.timeLimit * 60);
  const [monsters, setMonsters] = useState<MonsterInstance[]>(dungeon.monsters);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0 && !isFinished) {
      setIsFailed(true);
      return;
    }

    const timer = setInterval(() => {
      if (!isFinished && !isFailed) {
        setTimeLeft((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, isFailed]);

  const currentMonster = monsters[currentIndex];

  const handleDefeat = () => {
    const updatedMonsters = [...monsters];
    updatedMonsters[currentIndex].isDefeated = true;
    setMonsters(updatedMonsters);

    if (currentIndex < monsters.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (monsters.filter(m => m.isDefeated).length / monsters.length) * 100;

  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
      >
        <div className="max-w-md w-full text-center space-y-8">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"
            />
            <Trophy className="w-24 h-24 text-blue-500 mx-auto relative z-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black uppercase tracking-widest text-white">DUNGEON CLEAR</h2>
            <p className="text-blue-400 font-bold tracking-[0.3em] uppercase text-xs">Rank {dungeon.difficulty} Lair Conquered</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">XP GAINED</p>
              <p className="text-2xl font-black text-blue-400">+{dungeon.rewardXp}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">GOLD GAINED</p>
              <p className="text-2xl font-black text-yellow-500">+{dungeon.rewardGold}</p>
            </div>
          </div>
          <button
            onClick={() => onComplete(dungeon.rewardXp, dungeon.rewardGold)}
            className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-blue-500 hover:text-white transition-all duration-500"
          >
            COLLECT REWARDS
          </button>
        </div>
      </motion.div>
    );
  }

  if (isFailed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
      >
        <div className="max-w-md w-full text-center space-y-8">
          <Skull className="w-24 h-24 text-red-600 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-4xl font-black uppercase tracking-widest text-red-600">MISSION FAILED</h2>
            <p className="text-white/50 font-bold tracking-[0.3em] uppercase text-xs">Time Limit Exceeded</p>
          </div>
          <p className="text-sm text-white/70 italic">"The weak have no place in this world."</p>
          <button
            onClick={onCancel}
            className="w-full py-4 rounded-xl bg-red-600 text-white font-black uppercase tracking-widest text-sm hover:bg-red-500 transition-all duration-500"
          >
            RETURN TO GUILD
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-[150] bg-[#050505] overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 lg:p-8 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onCancel} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10">
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">{dungeon.name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">RANK {dungeon.difficulty}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">•</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{monsters.length} MONSTERS</span>
              </div>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all duration-500",
            timeLeft < 60 ? "border-red-500/50 bg-red-500/10 text-red-500 animate-pulse" : "border-blue-500/30 bg-blue-500/10 text-blue-400"
          )}>
            <Timer className="w-5 h-5" />
            <span className="text-2xl font-black font-mono">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-12">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.5)]"
          />
        </div>

        {/* Monster Encounter */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-12 pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMonster.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 1.1 }}
              className="w-full max-w-lg text-center space-y-8"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative w-48 h-48 mx-auto rounded-3xl border-2 border-white/10 bg-white/5 overflow-hidden flex items-center justify-center">
                  <Skull className="w-24 h-24 text-white/20" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-0 right-0">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400">TARGET ACQUIRED</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase tracking-widest">{currentMonster.name}</h3>
                <p className="text-sm text-white/50 italic">"{currentMonster.description}"</p>
              </div>

              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">REQUIRED EXERCISE</p>
                  <p className="text-4xl font-black text-white">{currentMonster.reps} {currentMonster.exercise}</p>
                </div>
                
                <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-widest opacity-50">
                  <Shield className="w-4 h-4" />
                  <span>DEFEAT TO ADVANCE</span>
                </div>

                <button
                  onClick={handleDefeat}
                  className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-sm hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] transition-all duration-500 flex items-center justify-center gap-3 group"
                >
                  <Swords className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  DEFEAT MONSTER
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Monster Queue */}
          <div className="flex gap-4 overflow-x-auto pb-4 w-full justify-center no-scrollbar">
            {monsters.map((m, idx) => (
              <div
                key={m.id}
                className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-500",
                  idx === currentIndex ? "border-blue-500 bg-blue-500/20 scale-110" : 
                  m.isDefeated ? "border-green-500/50 bg-green-500/10 opacity-50" : "border-white/10 bg-white/5 opacity-30"
                )}
              >
                {m.isDefeated ? <Trophy className="w-5 h-5 text-green-500" /> : <Skull className="w-5 h-5" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
