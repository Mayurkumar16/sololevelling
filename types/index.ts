export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type JobClass = 'Awakened' | 'Undead Commander' | 'Monarch';
export type Mode = 'relaxed' | 'disciplined' | 'strict';
export type StatType = 'str' | 'int' | 'agi' | 'vit' | 'sen';

export interface Stats {
  str: number;
  int: number;
  agi: number;
  vit: number;
  sen: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  height: number;
  weight: number;
  mode: Mode;
  rank: Rank;
  jobClass: JobClass;
  stats: Stats;
  xp: number;
  gold: number;
  streak: number;
  lastActive: string;
  friendCode: string;
  friends: string[];
}

export interface Quest {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'daily' | 'custom';
  isCompleted: boolean;
  rewardXp: number;
  rewardGold: number;
  statType: StatType;
  createdAt: string;
}

export interface Showdown {
  id: string;
  creatorId: string;
  opponentId: string;
  exercise: string;
  sets: number;
  reps: number;
  creatorTime: number;
  opponentTime?: number;
  status: 'pending' | 'completed';
  winnerId?: string;
  createdAt: string;
}

export interface CalorieLog {
  userId: string;
  date: string;
  calories: number;
  foodItems: string[];
}

export interface Monster {
  name: string;
  description: string;
}

export interface MonsterInstance extends Monster {
  id: string;
  exercise: string;
  reps: number;
  isDefeated: boolean;
}

export interface Dungeon {
  id: string;
  name: string;
  difficulty: Rank;
  timeLimit: number;
  rewardXp: number;
  rewardGold: number;
  monsters: MonsterInstance[];
}
