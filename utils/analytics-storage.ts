import { ACHIEVEMENTS, GameSession, UserAnalytics } from '@/types/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ANALYTICS_KEY = '@staff_hero_analytics';
const SESSIONS_KEY = '@staff_hero_sessions';

const defaultAnalytics: UserAnalytics = {
  totalGamesPlayed: 0,
  totalScore: 0,
  bestStreak: 0,
  averageAccuracy: 0,
  totalPlayTime: 0,
  favoriteGameMode: 'single-note',
  favoriteNotation: 'letter',
  favoriteDifficulty: 'beginner',
  gamesPerMode: {
    'single-note': 0,
    'sequence': 0,
    'rhythm': 0,
  },
  gamesPerNotation: {
    'letter': 0,
    'solfege': 0,
  },
  gamesPerDifficulty: {
    'beginner': 0,
    'intermediate': 0,
    'advanced': 0,
  },
  recentSessions: [],
  achievements: [...ACHIEVEMENTS],
};

export async function getAnalytics(): Promise<UserAnalytics> {
  try {
    const data = await AsyncStorage.getItem(ANALYTICS_KEY);
    if (data) {
      const analytics = JSON.parse(data) as UserAnalytics;
      // Ensure all achievements are present (for app updates)
      const updatedAchievements = ACHIEVEMENTS.map(defaultAchievement => {
        const existingAchievement = analytics.achievements.find(a => a.id === defaultAchievement.id);
        return existingAchievement || defaultAchievement;
      });
      return { ...analytics, achievements: updatedAchievements };
    }
    return defaultAnalytics;
  } catch (error) {
    console.error('Error loading analytics:', error);
    return defaultAnalytics;
  }
}

export async function saveAnalytics(analytics: UserAnalytics): Promise<void> {
  try {
    await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  } catch (error) {
    console.error('Error saving analytics:', error);
  }
}

export async function addGameSession(session: GameSession): Promise<UserAnalytics> {
  const analytics = await getAnalytics();
  
  // Update counters
  analytics.totalGamesPlayed += 1;
  analytics.totalScore += session.score;
  analytics.bestStreak = Math.max(analytics.bestStreak, session.maxStreak);
  analytics.totalPlayTime += session.duration;
  
  // Update game mode counters
  analytics.gamesPerMode[session.gameMode] += 1;
  analytics.gamesPerNotation[session.notationSystem] += 1;
  analytics.gamesPerDifficulty[session.difficulty] += 1;
  
  // Calculate average accuracy
  const totalAccuracy = analytics.averageAccuracy * (analytics.totalGamesPlayed - 1) + session.accuracy;
  analytics.averageAccuracy = Math.round(totalAccuracy / analytics.totalGamesPlayed);
  
  // Update favorites (most played)
  analytics.favoriteGameMode = Object.entries(analytics.gamesPerMode)
    .reduce((a, b) => analytics.gamesPerMode[a[0] as keyof typeof analytics.gamesPerMode] > 
                      analytics.gamesPerMode[b[0] as keyof typeof analytics.gamesPerMode] ? a : b)[0] as any;
  
  analytics.favoriteNotation = Object.entries(analytics.gamesPerNotation)
    .reduce((a, b) => analytics.gamesPerNotation[a[0] as keyof typeof analytics.gamesPerNotation] > 
                      analytics.gamesPerNotation[b[0] as keyof typeof analytics.gamesPerNotation] ? a : b)[0] as any;
  
  analytics.favoriteDifficulty = Object.entries(analytics.gamesPerDifficulty)
    .reduce((a, b) => analytics.gamesPerDifficulty[a[0] as keyof typeof analytics.gamesPerDifficulty] > 
                      analytics.gamesPerDifficulty[b[0] as keyof typeof analytics.gamesPerDifficulty] ? a : b)[0] as any;
  
  // Add to recent sessions (keep last 20)
  analytics.recentSessions.unshift(session);
  analytics.recentSessions = analytics.recentSessions.slice(0, 20);
  
  // Check for new achievements
  checkAndUnlockAchievements(analytics, session);
  
  await saveAnalytics(analytics);
  return analytics;
}

function checkAndUnlockAchievements(analytics: UserAnalytics, session: GameSession): void {
  const now = new Date().toISOString();
  
  // First game
  if (analytics.totalGamesPlayed === 1) {
    unlockAchievement(analytics, 'first_game', now);
  }
  
  // Streak achievements
  if (session.maxStreak >= 5) {
    unlockAchievement(analytics, 'streak_5', now);
  }
  if (session.maxStreak >= 10) {
    unlockAchievement(analytics, 'streak_10', now);
  }
  
  // Perfect game
  if (session.accuracy === 100) {
    unlockAchievement(analytics, 'perfect_game', now);
  }
  
  // Notation master (played both systems)
  if (analytics.gamesPerNotation.letter > 0 && analytics.gamesPerNotation.solfege > 0) {
    unlockAchievement(analytics, 'notation_master', now);
  }
  
  // Dedicated player
  if (analytics.totalGamesPlayed >= 50) {
    unlockAchievement(analytics, 'dedicated_player', now);
  }
}

function unlockAchievement(analytics: UserAnalytics, achievementId: string, unlockedAt: string): void {
  const achievement = analytics.achievements.find(a => a.id === achievementId);
  if (achievement && !achievement.isUnlocked) {
    achievement.isUnlocked = true;
    achievement.unlockedAt = unlockedAt;
  }
}

export async function clearAnalytics(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ANALYTICS_KEY);
    await AsyncStorage.removeItem(SESSIONS_KEY);
  } catch (error) {
    console.error('Error clearing analytics:', error);
  }
}

export function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function getStreakEmoji(streak: number): string {
  if (streak < 5) return '⚡';
  if (streak < 10) return '🔥';
  if (streak < 20) return '🔥🔥';
  return '🔥🔥🔥';
}
