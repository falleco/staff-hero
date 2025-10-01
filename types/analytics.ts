export interface GameSession {
  id: string;
  date: string;
  gameMode: 'single-note' | 'sequence' | 'rhythm';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  notationSystem: 'letter' | 'solfege';
  score: number;
  streak: number;
  maxStreak: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  duration: number; // in seconds
}

export interface UserAnalytics {
  totalGamesPlayed: number;
  totalScore: number;
  bestStreak: number;
  averageAccuracy: number;
  totalPlayTime: number; // in seconds
  favoriteGameMode: string;
  favoriteNotation: string;
  favoriteDifficulty: string;
  gamesPerMode: {
    'single-note': number;
    sequence: number;
    rhythm: number;
  };
  gamesPerNotation: {
    letter: number;
    solfege: number;
  };
  gamesPerDifficulty: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  recentSessions: GameSession[];
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_game',
    title: 'First Steps',
    description: 'Complete your first game',
    icon: '🎵',
    isUnlocked: false,
  },
  {
    id: 'streak_5',
    title: 'Hot Streak',
    description: 'Get a 5-note streak',
    icon: '🔥',
    isUnlocked: false,
  },
  {
    id: 'streak_10',
    title: 'Blazing Notes',
    description: 'Get a 10-note streak',
    icon: '🔥🔥',
    isUnlocked: false,
  },
  {
    id: 'perfect_game',
    title: 'Perfect Pitch',
    description: 'Complete a game with 100% accuracy',
    icon: '⭐',
    isUnlocked: false,
  },
  {
    id: 'notation_master',
    title: 'Notation Master',
    description: 'Play games in both notation systems',
    icon: '🎼',
    isUnlocked: false,
  },
  {
    id: 'dedicated_player',
    title: 'Dedicated Player',
    description: 'Play 50 games',
    icon: '🏆',
    isUnlocked: false,
  },
];
