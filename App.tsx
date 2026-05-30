import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, where, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Swords, 
  Users, 
  Flame, 
  Youtube, 
  Settings, 
  LogOut, 
  Zap, 
  Shield, 
  Trophy,
  Menu,
  X,
  ChevronRight,
  Plus
} from 'lucide-react';

import { auth, db, signInWithGoogle } from './firebase';
import { UserProfile, Rank, Mode, JobClass, Quest, Showdown, CalorieLog, Dungeon, MonsterInstance } from './types';
import { RANKS, MODE_SETTINGS, RANK_XP_REQUIREMENTS, MONSTER_POOLS, EXERCISE_POOLS, DAILY_QUEST_TEMPLATES } from './constants';
import { cn } from './lib/utils';

// Components
import { Avatar } from './components/Avatar';
import { StatBar } from './components/StatBar';
import { QuestCard } from './components/QuestCard';
import { ShowdownCard } from './components/ShowdownCard';
import { CalorieTracker } from './components/CalorieTracker';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { FriendSystem } from './components/FriendSystem';
import { Onboarding } from './components/Onboarding';
import { SystemMessage } from './components/SystemMessage';
import { DungeonCard } from './components/DungeonCard';
import { DungeonSession } from './components/DungeonSession';

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemMsg, setSystemMsg] = useState<{ text: string; type: 'info' | 'warning' | 'success' } | null>(null);
  const [activeDungeon, setActiveDungeon] = useState<Dungeon | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Listen to profile changes
        const profileRef = doc(db, 'users', u.uid);
        const unsubProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            const p = docSnap.data() as UserProfile;
            setProfile(p);
            generateDailyQuests(u, p);
          } else {
            setProfile(null);
          }
          setLoading(false);
        });
        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const generateDailyQuests = async (u: User, p: UserProfile) => {
    const today = new Date().toISOString().split('T')[0];
    const questsRef = collection(db, 'users', u.uid, 'quests');
    // Check if daily quests for today already exist
    const q = query(questsRef, where('type', '==', 'daily'), where('createdAt', '>=', today));
    const snap = await getDocs(q);

    if (snap.empty) {
      const templates = DAILY_QUEST_TEMPLATES[p.mode];
      for (const t of templates) {
        await addDoc(questsRef, {
          userId: u.uid,
          title: t.title,
          description: `${t.reps} ${t.title === 'Run' ? 'km' : 'reps'}`,
          type: 'daily',
          isCompleted: false,
          rewardXp: 100,
          rewardGold: 50,
          statType: t.stat,
          createdAt: new Date().toISOString()
        });
      }
    }
  };

  const handleOnboarding = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const initialProfile: UserProfile = {
      uid: user.uid,
      displayName: data.displayName || user.displayName || 'Hunter',
      email: user.email || '',
      height: data.height || 170,
      weight: data.weight || 70,
      mode: data.mode || 'disciplined',
      rank: 'E',
      jobClass: 'Awakened',
      stats: { str: 10, int: 10, agi: 10, vit: 10, sen: 10 },
      xp: 0,
      gold: 0,
      streak: 0,
      lastActive: new Date().toISOString(),
      friendCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      friends: [],
    };
    await setDoc(doc(db, 'users', user.uid), initialProfile);
    await setDoc(doc(db, 'friendCodes', initialProfile.friendCode), { userId: user.uid });
    setSystemMsg({ text: 'SYSTEM AWAKENED. WELCOME, HUNTER.', type: 'success' });
  };

  const handleEnterDungeon = (dungeonInfo: any) => {
    const rank = dungeonInfo.difficulty as Rank;
    const monsterPool = MONSTER_POOLS[rank];
    const exercisePool = EXERCISE_POOLS[rank];
    
    // Determine number of monsters based on rank
    const monsterCounts: Record<Rank, number> = { E: 3, D: 5, C: 7, B: 10, A: 15, S: 20 };
    const count = monsterCounts[rank];
    
    const monsters: MonsterInstance[] = Array.from({ length: count }).map((_, i) => {
      const monsterTemplate = monsterPool[Math.floor(Math.random() * monsterPool.length)];
      const exerciseTemplate = exercisePool[Math.floor(Math.random() * exercisePool.length)];
      const reps = Math.floor(Math.random() * (exerciseTemplate.maxReps - exerciseTemplate.minReps + 1)) + exerciseTemplate.minReps;
      
      return {
        id: `${dungeonInfo.id}-monster-${i}`,
        ...monsterTemplate,
        exercise: exerciseTemplate.name,
        reps,
        isDefeated: false
      };
    });

    setActiveDungeon({
      ...dungeonInfo,
      monsters
    });
  };

  const handleCompleteDungeon = async (xp: number, gold: number) => {
    if (!user || !profile) return;
    
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      xp: profile.xp + xp,
      gold: profile.gold + gold
    });
    
    setActiveDungeon(null);
    setSystemMsg({ text: `DUNGEON CLEAR! +${xp} XP, +${gold} GOLD`, type: 'success' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (!profile) {
    return <Onboarding onComplete={handleOnboarding} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
        <Sidebar profile={profile} />
        <main className="lg:pl-64 min-h-screen pb-20 lg:pb-0">
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard profile={profile} />} />
              <Route path="/quests" element={<Quests profile={profile} />} />
              <Route path="/dungeons" element={<Dungeons profile={profile} onEnter={handleEnterDungeon} />} />
              <Route path="/showdown" element={<ShowdownPage profile={profile} setSystemMsg={setSystemMsg} />} />
              <Route path="/friends" element={<FriendsPage profile={profile} setSystemMsg={setSystemMsg} />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
        
        <AnimatePresence>
          {activeDungeon && (
            <DungeonSession 
              dungeon={activeDungeon} 
              onComplete={handleCompleteDungeon} 
              onCancel={() => setActiveDungeon(null)} 
            />
          )}
        </AnimatePresence>

        <SystemMessage 
          isVisible={!!systemMsg} 
          message={systemMsg?.text || ''} 
          type={systemMsg?.type} 
          onClose={() => setSystemMsg(null)} 
        />
        
        <MobileNav />
      </div>
    </Router>
  );
}

// --- Sub-Pages & Components ---

function LoginScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center space-y-8 max-w-md w-full"
      >
        <div className="space-y-2">
          <motion.h1 
            initial={{ letterSpacing: '0.1em' }}
            animate={{ letterSpacing: '0.3em' }}
            className="text-5xl font-black text-white tracking-[0.3em] uppercase"
          >
            LEVEL UP
          </motion.h1>
          <p className="text-blue-400 font-bold tracking-[0.5em] uppercase text-xs">Solo Levelling</p>
        </div>
        
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-6 shadow-[0_0_50px_rgba(37,99,235,0.1)]">
          <p className="text-sm text-white/50 leading-relaxed">
            "Only those who are willing to risk everything can truly level up."
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-blue-500 hover:text-white transition-all duration-500 flex items-center justify-center gap-3 group"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            INITIALIZE AWAKENING
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Sidebar({ profile }: { profile: UserProfile }) {
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Quests', icon: Zap, path: '/quests' },
    { label: 'Dungeons', icon: Swords, path: '/dungeons' },
    { label: 'Showdown', icon: Trophy, path: '/showdown' },
    { label: 'Friends', icon: Users, path: '/friends' },
    { label: 'Library', icon: Youtube, path: '/library' },
  ];

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-black border-r border-white/10 z-40">
      <div className="p-8">
        <h1 className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
          <div className="w-2 h-8 bg-blue-600 rounded-full" />
          LEVEL UP
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 transition-all group"
          >
            <item.icon className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-black text-lg">
              {profile.rank}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest">{profile.displayName}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">{profile.jobClass}</p>
            </div>
          </div>
          <button 
            onClick={() => auth.signOut()}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-all text-[10px] font-bold uppercase tracking-widest"
          >
            <LogOut className="w-3 h-3" />
            Disconnect
          </button>
        </div>
      </div>
    </aside>
  );
}

function MobileNav() {
  const navItems = [
    { icon: LayoutDashboard, path: '/' },
    { icon: Zap, path: '/quests' },
    { icon: Swords, path: '/dungeons' },
    { icon: Trophy, path: '/showdown' },
    { icon: Users, path: '/friends' },
    { icon: Youtube, path: '/library' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-4 z-50">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className="p-3 text-white/50 hover:text-blue-500 transition-colors"
        >
          <item.icon className="w-6 h-6" />
        </Link>
      ))}
    </nav>
  );
}

// --- Page Components ---

function Dashboard({ profile }: { profile: UserProfile }) {
  const [logs, setLogs] = useState<CalorieLog[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users', profile.uid, 'calories'), (snap) => {
      setLogs(snap.docs.map(d => d.data() as CalorieLog));
    });
    return () => unsub();
  }, [profile.uid]);

  const handleAddCalorie = async (calories: number, food: string) => {
    const date = new Date().toISOString().split('T')[0];
    const logRef = doc(db, 'users', profile.uid, 'calories', date);
    const snap = await getDoc(logRef);
    
    if (snap.exists()) {
      await updateDoc(logRef, {
        calories: snap.data().calories + calories,
        foodItems: [...snap.data().foodItems, food]
      });
    } else {
      await setDoc(logRef, {
        userId: profile.uid,
        date,
        calories,
        foodItems: [food]
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <Avatar rank={profile.rank} className="w-48 h-48" />
        <div className="flex-1 space-y-6 w-full">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight mb-1">{profile.displayName}</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold uppercase tracking-widest text-blue-400">{profile.jobClass}</span>
              <div className="h-1 w-1 rounded-full bg-white/20" />
              <span className="text-sm font-bold uppercase tracking-widest text-white/50">Level {Math.floor(profile.xp / 1000) + 1}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatBar label="Strength" value={profile.stats.str} type="str" />
            <StatBar label="Intelligence" value={profile.stats.int} type="int" />
            <StatBar label="Agility" value={profile.stats.agi} type="agi" />
            <StatBar label="Vitality" value={profile.stats.vit} type="vit" />
            <StatBar label="Sense" value={profile.stats.sen} type="sen" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <CalorieTracker logs={logs} onAddLog={handleAddCalorie} />
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest">SYSTEM STATUS</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-green-500/20 text-green-400">ONLINE</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs font-bold uppercase tracking-widest opacity-50">Current Streak</span>
              <span className="text-xl font-black text-orange-400">{profile.streak} DAYS</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs font-bold uppercase tracking-widest opacity-50">System Mode</span>
              <span className="text-xs font-black uppercase tracking-widest text-blue-400">{profile.mode}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs font-bold uppercase tracking-widest opacity-50">Gold Balance</span>
              <span className="text-xl font-black text-yellow-400">{profile.gold} G</span>
            </div>
          </div>
        </div>
      </div>

      <ExerciseLibrary />
    </div>
  );
}

function Quests({ profile }: { profile: UserProfile }) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newQuest, setNewQuest] = useState({ title: '', desc: '', stat: 'str' as any });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users', profile.uid, 'quests'), (snap) => {
      setQuests(snap.docs.map(d => ({ id: d.id, ...d.data() } as Quest)));
    });
    return () => unsub();
  }, [profile.uid]);

  const handleComplete = async (id: string) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.isCompleted) return;

    await updateDoc(doc(db, 'users', profile.uid, 'quests', id), { isCompleted: true });
    
    // Update user stats and XP
    const userRef = doc(db, 'users', profile.uid);
    await updateDoc(userRef, {
      xp: profile.xp + quest.rewardXp,
      gold: profile.gold + quest.rewardGold,
      [`stats.${quest.statType}`]: profile.stats[quest.statType] + 1
    });
  };

  const handleAddQuest = async () => {
    if (!newQuest.title) return;
    await addDoc(collection(db, 'users', profile.uid, 'quests'), {
      userId: profile.uid,
      title: newQuest.title,
      description: newQuest.desc,
      type: 'custom',
      isCompleted: false,
      rewardXp: 100,
      rewardGold: 50,
      statType: newQuest.stat,
      createdAt: new Date().toISOString()
    });
    setShowAdd(false);
    setNewQuest({ title: '', desc: '', stat: 'str' });
  };

  const dailyQuests = quests.filter(q => q.type === 'daily');
  const customQuests = quests.filter(q => q.type === 'custom');

  return (
    <div className="space-y-12">
      {/* Daily Quests Section */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">DAILY QUESTS</h1>
          <p className="text-xs font-bold uppercase tracking-widest opacity-50">MANDATORY SYSTEM TASKS • {profile.mode.toUpperCase()} MODE</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dailyQuests.map(q => (
            <QuestCard key={q.id} quest={q} onComplete={handleComplete} />
          ))}
          {dailyQuests.length === 0 && (
            <div className="col-span-full p-8 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center">
              <p className="text-xs font-bold uppercase tracking-widest opacity-30">INITIALIZING DAILY TASKS...</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Quests Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">CUSTOM QUESTS</h1>
            <p className="text-xs font-bold uppercase tracking-widest opacity-50">SELF-ASSIGNED CHALLENGES</p>
          </div>
          <button 
            onClick={() => setShowAdd(true)}
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customQuests.map(q => (
            <QuestCard key={q.id} quest={q} onComplete={handleComplete} />
          ))}
          {customQuests.length === 0 && (
            <div className="col-span-full p-12 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4">
              <Plus className="w-12 h-12 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest opacity-50">NO CUSTOM QUESTS</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 space-y-6"
            >
              <h2 className="text-2xl font-black uppercase tracking-tight">NEW QUEST</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="QUEST TITLE"
                  value={newQuest.title}
                  onChange={e => setNewQuest({ ...newQuest, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500/50"
                />
                <textarea
                  placeholder="DESCRIPTION"
                  value={newQuest.desc}
                  onChange={e => setNewQuest({ ...newQuest, desc: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500/50 h-24"
                />
                <select
                  value={newQuest.stat}
                  onChange={e => setNewQuest({ ...newQuest, stat: e.target.value as any })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                >
                  <option value="str" className="bg-[#0a0a0a] text-white">STRENGTH</option>
                  <option value="int" className="bg-[#0a0a0a] text-white">INTELLIGENCE</option>
                  <option value="agi" className="bg-[#0a0a0a] text-white">AGILITY</option>
                  <option value="vit" className="bg-[#0a0a0a] text-white">VITALITY</option>
                  <option value="sen" className="bg-[#0a0a0a] text-white">SENSE</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest">CANCEL</button>
                <button onClick={handleAddQuest} className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-widest">CREATE</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ExerciseLibrary />
    </div>
  );
}

function Dungeons({ profile, onEnter }: { profile: UserProfile; onEnter: (d: any) => void }) {
  const dungeons = [
    { id: '1', name: 'Goblins Lair', difficulty: 'E' as Rank, timeLimit: 15, rewardXp: 500, rewardGold: 200 },
    { id: '2', name: 'Shadow Realm', difficulty: 'D' as Rank, timeLimit: 20, rewardXp: 1200, rewardGold: 500 },
    { id: '3', name: 'Frozen Peak', difficulty: 'C' as Rank, timeLimit: 30, rewardXp: 3000, rewardGold: 1200 },
    { id: '4', name: 'Dragon Nest', difficulty: 'A' as Rank, timeLimit: 45, rewardXp: 15000, rewardGold: 5000 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">DUNGEON GATES</h1>
        <p className="text-xs font-bold uppercase tracking-widest opacity-50">ENTER AT YOUR OWN RISK</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dungeons.map(d => (
          <DungeonCard key={d.id} {...d} onEnter={() => onEnter(d)} />
        ))}
      </div>

      <ExerciseLibrary />
    </div>
  );
}

function ShowdownPage({ profile, setSystemMsg }: { profile: UserProfile; setSystemMsg: (m: any) => void }) {
  const [showdowns, setShowdowns] = useState<Showdown[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showAccept, setShowAccept] = useState<Showdown | null>(null);
  const [newShowdown, setNewShowdown] = useState({ opponentCode: '', exercise: 'Pushups', sets: 1, reps: 20, time: 0 });
  const [acceptTime, setAcceptTime] = useState(0);
  const [isTiming, setIsTiming] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isTiming) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTiming]);

  useEffect(() => {
    const q1 = query(collection(db, 'showdowns'), where('opponentId', '==', profile.uid));
    const q2 = query(collection(db, 'showdowns'), where('creatorId', '==', profile.uid));
    
    // Fetch both and merge
    const unsub1 = onSnapshot(q1, (snap) => {
      const s = snap.docs.map(d => ({ id: d.id, ...d.data() } as Showdown));
      setShowdowns(prev => {
        const filtered = prev.filter(p => p.creatorId === profile.uid);
        const merged = [...s, ...filtered];
        const unique = merged.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        return unique.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      });
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      const s = snap.docs.map(d => ({ id: d.id, ...d.data() } as Showdown));
      setShowdowns(prev => {
        const filtered = prev.filter(p => p.opponentId === profile.uid);
        const merged = [...s, ...filtered];
        const unique = merged.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        return unique.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      });
    });

    return () => { unsub1(); unsub2(); };
  }, [profile.uid]);

  const handleCreateShowdown = async () => {
    if (!newShowdown.opponentCode) return;
    
    // Lookup opponent by code
    const codeSnap = await getDoc(doc(db, 'friendCodes', newShowdown.opponentCode));
    if (!codeSnap.exists()) {
      setSystemMsg({ text: 'INVALID HUNTER CODE', type: 'warning' });
      return;
    }

    const opponentId = codeSnap.data().userId;
    if (opponentId === profile.uid) {
      setSystemMsg({ text: 'CANNOT CHALLENGE YOURSELF', type: 'warning' });
      return;
    }
    
    await addDoc(collection(db, 'showdowns'), {
      creatorId: profile.uid,
      opponentId: opponentId,
      exercise: newShowdown.exercise,
      sets: newShowdown.sets,
      reps: newShowdown.reps,
      creatorTime: timer,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    setShowCreate(false);
    setIsTiming(false);
    setTimer(0);
    setSystemMsg({ text: 'CHALLENGE SENT TO HUNTER', type: 'success' });
  };

  const handleAcceptShowdown = async () => {
    if (!showAccept) return;
    
    const winnerId = timer < showAccept.creatorTime ? profile.uid : showAccept.creatorId;
    
    await updateDoc(doc(db, 'showdowns', showAccept.id), {
      opponentTime: timer,
      status: 'completed',
      winnerId
    });

    setShowAccept(null);
    setIsTiming(false);
    setTimer(0);
    setSystemMsg({ 
      text: winnerId === profile.uid ? 'VICTORY! YOU WON THE SHOWDOWN' : 'DEFEAT. BETTER LUCK NEXT TIME', 
      type: winnerId === profile.uid ? 'success' : 'warning' 
    });
  };

  const getRecord = (opponentId: string) => {
    const relevant = showdowns.filter(s => 
      s.status === 'completed' && 
      ((s.creatorId === profile.uid && s.opponentId === opponentId) || 
       (s.creatorId === opponentId && s.opponentId === profile.uid))
    );
    const wins = relevant.filter(s => s.winnerId === profile.uid).length;
    const losses = relevant.length - wins;
    return `${wins}-${losses}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">SHOWDOWN</h1>
          <p className="text-xs font-bold uppercase tracking-widest opacity-50">CHALLENGE YOUR FRIENDS</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]"
        >
          NEW CHALLENGE
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {showdowns.map(s => (
          <ShowdownCard 
            key={s.id} 
            showdown={s} 
            currentUserId={profile.uid} 
            onAccept={() => { setShowAccept(s); setTimer(0); setIsTiming(false); }} 
            record={getRecord(s.creatorId === profile.uid ? s.opponentId : s.creatorId)}
          />
        ))}
        {showdowns.length === 0 && (
          <div className="col-span-full p-12 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4">
            <Swords className="w-12 h-12 opacity-20" />
            <p className="text-sm font-bold uppercase tracking-widest opacity-50">NO ACTIVE CHALLENGES</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 space-y-6"
            >
              <h2 className="text-2xl font-black uppercase tracking-tight">CREATE SHOWDOWN</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="OPPONENT HUNTER CODE"
                  value={newShowdown.opponentCode}
                  onChange={e => setNewShowdown({ ...newShowdown, opponentCode: e.target.value.toUpperCase() })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-red-500/50 uppercase font-mono"
                />
                <select
                  value={newShowdown.exercise}
                  onChange={e => setNewShowdown({ ...newShowdown, exercise: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-red-500/50 cursor-pointer"
                >
                  <option value="Pushups" className="bg-[#0a0a0a] text-white">Pushups</option>
                  <option value="Squats" className="bg-[#0a0a0a] text-white">Squats</option>
                  <option value="Burpees" className="bg-[#0a0a0a] text-white">Burpees</option>
                  <option value="Pullups" className="bg-[#0a0a0a] text-white">Pullups</option>
                  <option value="Lunges" className="bg-[#0a0a0a] text-white">Lunges</option>
                  <option value="Plank (Seconds)" className="bg-[#0a0a0a] text-white">Plank (Seconds)</option>
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">SETS</p>
                    <input
                      type="number"
                      value={newShowdown.sets}
                      onChange={e => setNewShowdown({ ...newShowdown, sets: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">REPS/SET</p>
                    <input
                      type="number"
                      value={newShowdown.reps}
                      onChange={e => setNewShowdown({ ...newShowdown, reps: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-4">
                  <div className="text-4xl font-black font-mono tracking-tighter text-red-500">
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="flex gap-2 w-full">
                    {!isTiming && timer === 0 && (
                      <button 
                        onClick={() => setIsTiming(true)}
                        className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        START WORKOUT
                      </button>
                    )}
                    {isTiming && (
                      <button 
                        onClick={() => setIsTiming(false)}
                        className="flex-1 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        FINISH
                      </button>
                    )}
                    {!isTiming && timer > 0 && (
                      <button 
                        onClick={() => { setTimer(0); setIsTiming(false); }}
                        className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest"
                      >
                        RESET
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => { setShowCreate(false); setIsTiming(false); setTimer(0); }} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest">CANCEL</button>
                <button 
                  onClick={handleCreateShowdown} 
                  disabled={timer === 0 || isTiming}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  SEND CHALLENGE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAccept && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 space-y-6"
            >
              <h2 className="text-2xl font-black uppercase tracking-tight">ACCEPT SHOWDOWN</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">CHALLENGE</p>
                  <p className="text-xl font-black uppercase">{showAccept.sets} SETS × {showAccept.reps} {showAccept.exercise}</p>
                  <p className="text-xs font-bold text-red-500 mt-2">CHALLENGER TIME: {showAccept.creatorTime}s</p>
                </div>
                
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-4">
                  <div className="text-4xl font-black font-mono tracking-tighter text-blue-500">
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="flex gap-2 w-full">
                    {!isTiming && timer === 0 && (
                      <button 
                        onClick={() => setIsTiming(true)}
                        className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        START CHALLENGE
                      </button>
                    )}
                    {isTiming && (
                      <button 
                        onClick={() => setIsTiming(false)}
                        className="flex-1 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        FINISH
                      </button>
                    )}
                    {!isTiming && timer > 0 && (
                      <button 
                        onClick={() => { setTimer(0); setIsTiming(false); }}
                        className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest"
                      >
                        RESET
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => { setShowAccept(null); setIsTiming(false); setTimer(0); }} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest">CANCEL</button>
                <button 
                  onClick={handleAcceptShowdown} 
                  disabled={timer === 0 || isTiming}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  SUBMIT RESULT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ExerciseLibrary />
    </div>
  );
}

function FriendsPage({ profile, setSystemMsg }: { profile: UserProfile; setSystemMsg: (m: any) => void }) {
  const [friends, setFriends] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (profile.friends.length > 0) {
      const q = query(collection(db, 'users'), where('uid', 'in', profile.friends));
      const unsub = onSnapshot(q, (snap) => {
        setFriends(snap.docs.map(d => d.data() as UserProfile));
      });
      return () => unsub();
    } else {
      setFriends([]);
    }
  }, [profile.friends]);

  const handleGenerateCode = async () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    // Delete old code if exists
    if (profile.friendCode) {
      // Note: This might fail if the code was already taken or changed, but it's a good cleanup
      // For simplicity, we'll just set the new one
    }
    await updateDoc(doc(db, 'users', profile.uid), { friendCode: newCode });
    await setDoc(doc(db, 'friendCodes', newCode), { userId: profile.uid });
  };

  const handleAddFriend = async (code: string) => {
    if (code === profile.friendCode) {
      setSystemMsg({ text: 'CANNOT ADD YOURSELF AS FRIEND', type: 'warning' });
      return;
    }
    
    const codeSnap = await getDoc(doc(db, 'friendCodes', code));
    if (codeSnap.exists()) {
      const friendId = codeSnap.data().userId;
      if (friendId === profile.uid) return;
      if (profile.friends.includes(friendId)) {
        setSystemMsg({ text: 'HUNTER ALREADY IN GUILD', type: 'info' });
        return;
      }
      
      await updateDoc(doc(db, 'users', profile.uid), {
        friends: [...profile.friends, friendId]
      });
      // Bi-directional friend add
      const friendRef = doc(db, 'users', friendId);
      const friendSnap = await getDoc(friendRef);
      if (friendSnap.exists()) {
        const friendData = friendSnap.data();
        if (!friendData.friends.includes(profile.uid)) {
          await updateDoc(friendRef, {
            friends: [...friendData.friends, profile.uid]
          });
        }
      }
      setSystemMsg({ text: 'NEW ALLIANCE FORMED', type: 'success' });
    } else {
      setSystemMsg({ text: 'INVALID HUNTER CODE', type: 'warning' });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">HUNTER GUILD</h1>
        <p className="text-xs font-bold uppercase tracking-widest opacity-50">MANAGE YOUR ALLIANCES</p>
      </div>
      <FriendSystem 
        user={profile} 
        friends={friends} 
        onGenerateCode={handleGenerateCode} 
        onAddFriend={handleAddFriend} 
      />
    </div>
  );
}

function LibraryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">KNOWLEDGE BASE</h1>
        <p className="text-xs font-bold uppercase tracking-widest opacity-50">MASTER EVERY TECHNIQUE</p>
      </div>
      <ExerciseLibrary />
    </div>
  );
}
