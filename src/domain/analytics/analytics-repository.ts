import type {
  Achievement,
  GameSession,
  UserAnalytics,
} from '~/shared/types/analytics';
import { Difficulty, GameMode, NotationSystem } from '~/shared/types/music';
import { supabase } from '~/data/supabase/client';
import { getUserProfile } from '../user/user-profile-repository';

/**
 * Adds a game session to the database and checks for achievements
 */
export async function addGameSession(
  userId: string,
  session: Omit<GameSession, 'id' | 'date'>,
): Promise<string> {
  try {
    const { data, error } = await supabase.rpc('add_game_session', {
      p_user_id: userId,
      p_game_mode: session.gameMode,
      p_difficulty: session.difficulty,
      p_notation_system: session.notationSystem,
      p_score: session.score,
      p_streak: session.streak,
      p_max_streak: session.maxStreak,
      p_total_questions: session.totalQuestions,
      p_correct_answers: session.correctAnswers,
      p_accuracy: session.accuracy,
      p_duration: session.duration,
    });

    if (error) throw error;
    return data as string;
  } catch (error) {
    console.error('Error adding game session:', error);
    throw error;
  }
}

/**
 * Gets aggregated analytics for a user
 */
export async function getUserAnalytics(userId: string): Promise<UserAnalytics> {
  try {
    // Ensure user profile exists
    await getUserProfile(userId);

    // Get aggregated analytics
    const { data: analyticsData, error: analyticsError } = await supabase.rpc(
      'get_user_analytics',
      {
        p_user_id: userId,
      },
    );

    if (analyticsError) throw analyticsError;

    // Get user achievements
    const { data: achievementsData, error: achievementsError } =
      await supabase.rpc('get_user_achievements', {
        p_user_id: userId,
      });

    if (achievementsError) throw achievementsError;

    // Get recent sessions
    const { data: sessionsData, error: sessionsError } = await supabase.rpc(
      'get_recent_sessions',
      {
        p_user_id: userId,
        p_limit: 20,
      },
    );

    if (sessionsError) throw sessionsError;

    // Parse analytics data
    const analytics = analyticsData as any;

    // Ensure default values for counts if no games played
    const gamesPerMode = analytics.gamesPerMode || {
      [GameMode.SINGLE_NOTE]: 0,
      [GameMode.SEQUENCE]: 0,
      [GameMode.RHYTHM]: 0,
    };

    const gamesPerNotation = analytics.gamesPerNotation || {
      [NotationSystem.LETTER]: 0,
      [NotationSystem.SOLFEGE]: 0,
    };

    const gamesPerDifficulty = analytics.gamesPerDifficulty || {
      [Difficulty.BEGINNER]: 0,
      [Difficulty.INTERMEDIATE]: 0,
      [Difficulty.ADVANCED]: 0,
    };

    // Map database response to UserAnalytics type
    const userAnalytics: UserAnalytics = {
      totalGamesPlayed: analytics.totalGamesPlayed || 0,
      totalScore: analytics.totalScore || 0,
      bestStreak: analytics.bestStreak || 0,
      averageAccuracy: analytics.averageAccuracy || 0,
      totalPlayTime: analytics.totalPlayTime || 0,
      favoriteGameMode: (analytics.favoriteGameMode ||
        GameMode.SINGLE_NOTE) as GameMode,
      favoriteNotation: (analytics.favoriteNotation ||
        NotationSystem.LETTER) as NotationSystem,
      favoriteDifficulty: (analytics.favoriteDifficulty ||
        Difficulty.BEGINNER) as Difficulty,
      gamesPerMode,
      gamesPerNotation,
      gamesPerDifficulty,
      recentSessions:
        (sessionsData as any[])?.map((session: any) => ({
          id: session.id,
          date: session.created_at,
          gameMode: session.game_mode as GameMode,
          difficulty: session.difficulty as Difficulty,
          notationSystem: session.notation_system as NotationSystem,
          score: session.score,
          streak: session.streak,
          maxStreak: session.max_streak,
          totalQuestions: session.total_questions,
          correctAnswers: session.correct_answers,
          accuracy: session.accuracy,
          duration: session.duration,
        })) || [],
      achievements:
        (achievementsData as any[])?.map((achievement: any) => ({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          isUnlocked: achievement.is_unlocked,
          unlockedAt: achievement.unlocked_at,
        })) || [],
    };

    return userAnalytics;
  } catch (error) {
    console.error('Error getting user analytics:', error);
    throw error;
  }
}

/**
 * Gets recent game sessions for a user
 */
export async function getRecentSessions(
  userId: string,
  limit = 20,
): Promise<GameSession[]> {
  try {
    const { data, error } = await supabase.rpc('get_recent_sessions', {
      p_user_id: userId,
      p_limit: limit,
    });

    if (error) throw error;

    return (
      (data as any[])?.map((session: any) => ({
        id: session.id,
        date: session.created_at,
        gameMode: session.game_mode as GameMode,
        difficulty: session.difficulty as Difficulty,
        notationSystem: session.notation_system as NotationSystem,
        score: session.score,
        streak: session.streak,
        maxStreak: session.max_streak,
        totalQuestions: session.total_questions,
        correctAnswers: session.correct_answers,
        accuracy: session.accuracy,
        duration: session.duration,
      })) || []
    );
  } catch (error) {
    console.error('Error getting recent sessions:', error);
    throw error;
  }
}

/**
 * Gets aggregated totals from all stored game sessions for a user.
 */
export async function getGameSessionTotals(userId: string): Promise<{
  totalQuestions: number;
  totalCorrectAnswers: number;
}> {
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('total_questions, correct_answers')
      .eq('user_id', userId);

    if (error) throw error;

    const sessions = (data as any[] | null) ?? [];

    return sessions.reduce(
      (acc, session) => {
        acc.totalQuestions += session.total_questions ?? 0;
        acc.totalCorrectAnswers += session.correct_answers ?? 0;
        return acc;
      },
      { totalQuestions: 0, totalCorrectAnswers: 0 },
    );
  } catch (error) {
    console.error('Error getting game session totals:', error);
    throw error;
  }
}

/**
 * Gets user achievements with unlock status
 */
export async function getUserAchievements(
  userId: string,
): Promise<Achievement[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_achievements', {
      p_user_id: userId,
    });

    if (error) throw error;

    return (
      (data as any[])?.map((achievement: any) => ({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        isUnlocked: achievement.is_unlocked,
        unlockedAt: achievement.unlocked_at,
      })) || []
    );
  } catch (error) {
    console.error('Error getting user achievements:', error);
    throw error;
  }
}

/**
 * Manually unlocks an achievement for a user
 */
export async function unlockAchievement(
  userId: string,
  achievementId: string,
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('unlock_achievement', {
      p_user_id: userId,
      p_achievement_id: achievementId,
    });

    if (error) throw error;
    return data as boolean;
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    throw error;
  }
}

/**
 * Clears all analytics data for a user (for testing)
 */
export async function clearUserAnalytics(userId: string): Promise<void> {
  try {
    // Delete all game sessions (cascades to achievements)
    const { error } = await supabase
      .from('game_sessions')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    // Delete all user achievements
    const { error: achievementsError } = await supabase
      .from('user_achievements')
      .delete()
      .eq('user_id', userId);

    if (achievementsError) throw achievementsError;
  } catch (error) {
    console.error('Error clearing user analytics:', error);
    throw error;
  }
}
