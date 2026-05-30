import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, RefreshCw, Check, Copy, Users, Shield, Zap } from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface FriendSystemProps {
  user: UserProfile;
  friends: UserProfile[];
  onGenerateCode: () => void;
  onAddFriend: (code: string) => void;
  className?: string;
}

export const FriendSystem: React.FC<FriendSystemProps> = ({
  user,
  friends,
  onGenerateCode,
  onAddFriend,
  className,
}) => {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(user.friendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onAddFriend(code.toUpperCase());
      setCode('');
    }
  };

  return (
    <div className={cn('p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl', className)}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 text-blue-500">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest">
              FRIEND SYSTEM
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              GUILD RECRUITMENT
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Your Code */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-4">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
            YOUR HUNTER CODE
          </span>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-black tracking-[0.2em] font-mono text-blue-400">
              {user.friendCode || '------'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={onGenerateCode}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Add Friend */}
        <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-4">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
            RECRUIT HUNTER
          </span>
          <div className="flex gap-2 w-full">
            <input
              type="text"
              maxLength={6}
              placeholder="ENTER CODE"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-center font-mono font-bold tracking-[0.2em] text-sm focus:outline-none focus:border-blue-500/50 transition-all"
            />
            <button
              type="submit"
              className="px-6 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-xs transition-all duration-300"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-50 mb-4">
          <Shield className="w-3 h-3" />
          <span>GUILD MEMBERS ({friends.length})</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {friends.map((friend) => (
            <motion.div
              key={friend.uid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold uppercase tracking-widest border border-white/10">
                  {friend.rank}
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-tight">
                    {friend.displayName}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-50">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span>STREAK: {friend.streak}</span>
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                {friend.jobClass}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
