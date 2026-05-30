import { Rank, Mode, JobClass } from '../types';

export const RANKS: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S'];

export const JOB_CLASSES: JobClass[] = ['Awakened', 'Undead Commander', 'Monarch'];

export const MODE_SETTINGS: Record<Mode, { questsDifficulty: string; demotionDays: number }> = {
  relaxed: {
    questsDifficulty: 'Easy',
    demotionDays: 7,
  },
  disciplined: {
    questsDifficulty: 'Medium',
    demotionDays: 5,
  },
  strict: {
    questsDifficulty: 'Hard',
    demotionDays: 3,
  },
};

export const RANK_XP_REQUIREMENTS: Record<Rank, number> = {
  E: 0,
  D: 1000,
  C: 5000,
  B: 15000,
  A: 50000,
  S: 150000,
};

export const RANK_COLORS: Record<Rank, string> = {
  E: 'text-gray-400',
  D: 'text-green-400',
  C: 'text-blue-400',
  B: 'text-purple-400',
  A: 'text-orange-400',
  S: 'text-red-500',
};

export const MONSTER_POOLS: Record<Rank, { name: string; description: string }[]> = {
  E: [
    { name: 'Goblin Scout', description: 'A small, weak creature that relies on numbers.' },
    { name: 'Giant Ant (Scout)', description: 'A scout from the ant colony. Fast but fragile.' },
    { name: 'Dire Wolf (Pup)', description: 'A young wolf with sharp teeth but low stamina.' },
  ],
  D: [
    { name: 'Orc Warrior', description: 'A standard orc soldier. Stronger than goblins.' },
    { name: 'Stone Golem', description: 'A slow-moving creature made of rock. High defense.' },
    { name: 'Snow Bear', description: 'A fierce predator from the frozen regions.' },
  ],
  C: [
    { name: 'Undead Knight', description: 'A fallen warrior reanimated by dark magic.' },
    { name: 'Frost Elf', description: 'An agile elf with ice-based attacks.' },
    { name: 'Shadow Mage', description: 'A sorcerer who manipulates shadows.' },
  ],
  B: [
    { name: 'High Orc', description: 'An elite orc warrior with superior strength.' },
    { name: 'Giant Spider', description: 'A massive arachnid that traps its prey in webs.' },
    { name: 'Wyvern', description: 'A flying reptile with poisonous breath.' },
  ],
  A: [
    { name: 'Red Dragon', description: 'A powerful dragon capable of breathing fire.' },
    { name: 'Archdemon', description: 'A high-ranking demon from the abyss.' },
    { name: 'Monarch Shadow', description: 'A fragment of a Monarch\'s power.' },
  ],
  S: [
    { name: 'Ant King (Beru)', description: 'The absolute ruler of the ant colony.' },
    { name: 'Shadow Sovereign', description: 'The ultimate power of the shadows.' },
    { name: 'Kamish', description: 'The greatest dragon in history.' },
  ],
};

export const EXERCISE_POOLS: Record<Rank, { name: string; minReps: number; maxReps: number }[]> = {
  E: [
    { name: 'Pushups', minReps: 5, maxReps: 10 },
    { name: 'Squats', minReps: 10, maxReps: 15 },
    { name: 'Jumping Jacks', minReps: 20, maxReps: 30 },
  ],
  D: [
    { name: 'Pushups', minReps: 15, maxReps: 20 },
    { name: 'Squats', minReps: 25, maxReps: 35 },
    { name: 'Mountain Climbers', minReps: 30, maxReps: 40 },
  ],
  C: [
    { name: 'Diamond Pushups', minReps: 10, maxReps: 15 },
    { name: 'Pistol Squats', minReps: 5, maxReps: 8 },
    { name: 'Burpees', minReps: 10, maxReps: 15 },
  ],
  B: [
    { name: 'Handstand Pushups', minReps: 5, maxReps: 8 },
    { name: 'Muscle Ups', minReps: 3, maxReps: 5 },
    { name: 'One-arm Pushups', minReps: 5, maxReps: 8 },
  ],
  A: [
    { name: 'Handstand Pushups', minReps: 10, maxReps: 15 },
    { name: 'Muscle Ups', minReps: 5, maxReps: 10 },
    { name: 'Burpees', minReps: 30, maxReps: 50 },
  ],
  S: [
    { name: 'Handstand Pushups', minReps: 20, maxReps: 30 },
    { name: 'Muscle Ups', minReps: 15, maxReps: 25 },
    { name: 'One-arm Pushups', minReps: 15, maxReps: 25 },
  ],
};

export const DAILY_QUEST_TEMPLATES: Record<Mode, { title: string; reps: number; stat: string }[]> = {
  relaxed: [
    { title: 'Pushups', reps: 10, stat: 'str' },
    { title: 'Squats', reps: 15, stat: 'vit' },
    { title: 'Sit-ups', reps: 15, stat: 'agi' },
    { title: 'Run', reps: 1, stat: 'agi' }, // 1km
  ],
  disciplined: [
    { title: 'Pushups', reps: 50, stat: 'str' },
    { title: 'Squats', reps: 50, stat: 'vit' },
    { title: 'Sit-ups', reps: 50, stat: 'agi' },
    { title: 'Run', reps: 5, stat: 'agi' }, // 5km
  ],
  strict: [
    { title: 'Pushups', reps: 100, stat: 'str' },
    { title: 'Squats', reps: 100, stat: 'vit' },
    { title: 'Sit-ups', reps: 100, stat: 'agi' },
    { title: 'Run', reps: 10, stat: 'agi' }, // 10km
  ],
};
