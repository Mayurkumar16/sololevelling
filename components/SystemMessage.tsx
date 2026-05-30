import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface SystemMessageProps {
  message: string;
  type?: 'info' | 'warning' | 'success';
  isVisible: boolean;
  onClose: () => void;
}

export const SystemMessage: React.FC<SystemMessageProps> = ({
  message,
  type = 'info',
  isVisible,
  onClose,
}) => {
  const colors = {
    info: 'border-blue-500/50 bg-blue-950/20 text-blue-400',
    warning: 'border-red-500/50 bg-red-950/20 text-red-400',
    success: 'border-green-500/50 bg-green-950/20 text-green-400',
  };

  const Icons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
  };

  const Icon = Icons[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={cn(
            'fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md',
            'border-2 px-6 py-4 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)]',
            'backdrop-blur-md flex items-center gap-4',
            colors[type]
          )}
          onClick={onClose}
        >
          <Icon className="w-6 h-6 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
              System Notification
            </p>
            <p className="text-sm font-medium leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
          >
            [Close]
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
