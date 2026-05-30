import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Swords, User, Ruler, Weight, Settings } from 'lucide-react';
import { Mode, UserProfile } from '../types';
import { cn } from '../lib/utils';

interface OnboardingProps {
  onComplete: (data: Partial<UserProfile>) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: '',
    height: 170,
    weight: 70,
    mode: 'disciplined' as Mode,
  });

  const steps = [
    { id: 1, title: 'IDENTITY', icon: User },
    { id: 2, title: 'PHYSICAL', icon: Ruler },
    { id: 3, title: 'SYSTEM MODE', icon: Settings },
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onComplete(formData);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl overflow-hidden">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl p-8 rounded-3xl bg-white/5 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      >
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-12">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 border-2',
                  step >= s.id ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-white/5 border-white/10 text-white/30'
                )}>
                  <s.icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  'text-[10px] font-bold uppercase tracking-widest',
                  step >= s.id ? 'text-blue-400' : 'text-white/30'
                )}>
                  {s.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-4 rounded-full transition-all duration-500',
                  step > s.id ? 'bg-blue-600' : 'bg-white/10'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-black uppercase tracking-tight mb-2">IDENTIFY YOURSELF</h2>
                <p className="text-sm font-bold uppercase tracking-widest opacity-50">THE SYSTEM REQUIRES A NAME</p>
              </div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
                <input
                  type="text"
                  placeholder="HUNTER NAME"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-bold tracking-widest"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-black uppercase tracking-tight mb-2">PHYSICAL ANALYSIS</h2>
                <p className="text-sm font-bold uppercase tracking-widest opacity-50">CALIBRATING SYSTEM PARAMETERS</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-1">HEIGHT (CM)</label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-mono font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-1">WEIGHT (KG)</label>
                  <div className="relative">
                    <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-black uppercase tracking-tight mb-2">SELECT MODE</h2>
                <p className="text-sm font-bold uppercase tracking-widest opacity-50">CHOOSE YOUR PATH OF GROWTH</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'relaxed', title: 'RELAXED', icon: Zap, desc: '7 days for demotion. Easier quests.' },
                  { id: 'disciplined', title: 'DISCIPLINED', icon: Shield, desc: '5 days for demotion. Medium quests.' },
                  { id: 'strict', title: 'STRICT', icon: Swords, desc: '3 days for demotion. Harder quests.' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setFormData({ ...formData, mode: m.id as Mode })}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all duration-300 flex items-center gap-4',
                      formData.mode === m.id ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-white/5 border-white/10 hover:border-white/20'
                    )}
                  >
                    <div className={cn(
                      'p-2 rounded-lg',
                      formData.mode === m.id ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/50'
                    )}>
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest">{m.title}</h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 flex gap-4">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-[0.3em] transition-all duration-300"
            >
              BACK
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={step === 1 && !formData.displayName}
            className="flex-[2] py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-[0.3em] text-xs transition-all duration-300 shadow-[0_0_30px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 3 ? 'AWAKEN' : 'NEXT'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
