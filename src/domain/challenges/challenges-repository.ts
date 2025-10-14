import type {
  Challenge,
  ChallengeStatus,
  ChallengeType,
} from '~/shared/types/music';
import { supabase } from '~/data/supabase/client';
import {
  addCurrencyTransaction,
  getUserBalance,
} from '../currency/currency-repository';
import { getUserProfile } from '../user/user-profile-repository';

/**
 * Fetches all available challenges and the user's progress on them
 */
export async function fetchUserChallenges(
  userId: string,
): Promise<Challenge[]> {
  try {
    // Ensure user profile exists first
    await getUserProfile(userId);

    // Fetch all challenges
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: true });

    if (challengesError) throw challengesError;
    if (!challenges) return [];

    // Fetch user's progress on challenges
    const { data: userChallenges, error: userChallengesError } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId);

    if (userChallengesError) throw userChallengesError;

    // Merge challenges with user progress
    const mergedChallenges: Challenge[] = (challenges as any[]).map(
      (challenge: any) => {
        const userChallenge = (userChallenges as any[])?.find(
          (uc: any) => uc.challenge_id === challenge.id,
        );

        return {
          id: challenge.id as string,
          type: challenge.type as ChallengeType,
          title: challenge.title as string,
          description: challenge.description as string,
          icon: challenge.icon as string,
          requirement: challenge.requirement as number,
          reward: challenge.reward as number,
          progress: (userChallenge?.progress as number) ?? 0,
          status: (userChallenge?.status as ChallengeStatus) ?? 'available',
          targetRoute: challenge.target_route as string | undefined,
        };
      },
    );

    return mergedChallenges;
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    throw error;
  }
}

/**
 * Starts a challenge for a user
 */
export async function startChallenge(
  userId: string,
  challengeId: string,
): Promise<void> {
  try {
    // Check if user challenge already exists
    const { data: existing } = await supabase
      .from('user_challenges')
      .select('id')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .maybeSingle();

    if (existing) {
      // Update existing challenge
      const { error } = await supabase
        .from('user_challenges')
        .update({ status: 'in-progress' } as any)
        .eq('user_id', userId)
        .eq('challenge_id', challengeId);

      if (error) throw error;
    } else {
      // Create new user challenge
      const { error } = await supabase.from('user_challenges').insert({
        user_id: userId,
        challenge_id: challengeId,
        status: 'in-progress',
        progress: 0,
      } as any);

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error starting challenge:', error);
    throw error;
  }
}

/**
 * Updates progress for challenges of a specific type
 */
export async function updateChallengeProgress(
  userId: string,
  type: ChallengeType,
  amount: number,
): Promise<void> {
  try {
    // Get all challenges of this type
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('id, requirement')
      .eq('type', type);

    if (challengesError) throw challengesError;
    if (!challenges || challenges.length === 0) return;

    const challengeIds = (challenges as any[]).map((c: any) => c.id);

    const { data: userChallenges, error: userChallengesError } = await supabase
      .from('user_challenges')
      .select('challenge_id, progress, status')
      .eq('user_id', userId)
      .in('challenge_id', challengeIds);

    if (userChallengesError) throw userChallengesError;

    const existingMap = new Map<string, any>();
    (userChallenges as any[] | null)?.forEach((uc: any) => {
      existingMap.set(uc.challenge_id, uc);
    });

    const rowsToUpsert: any[] = [];

    for (const challenge of challenges as any[]) {
      const existing = existingMap.get(challenge.id);

      if (existing?.status === 'redeemed') {
        continue;
      }

      const currentProgress = existing?.progress ?? 0;
      const newProgress = Math.min(
        currentProgress + amount,
        challenge.requirement,
      );

      const newStatus =
        newProgress >= challenge.requirement ? 'completed' : 'in-progress';

      if (
        newProgress === currentProgress &&
        existing &&
        existing.status === newStatus
      ) {
        continue;
      }

      rowsToUpsert.push({
        user_id: userId,
        challenge_id: challenge.id,
        progress: newProgress,
        status: newStatus,
      });
    }

    if (rowsToUpsert.length > 0) {
      const { error } = await supabase
        .from('user_challenges')
        .upsert(rowsToUpsert, { onConflict: 'user_id,challenge_id' });

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    throw error;
  }
}

/**
 * Sets challenge progress to a specific value (auto-sync helper).
 */
export async function setChallengeProgress(
  userId: string,
  challengeId: string,
  progress: number,
  requirement: number,
  status: ChallengeStatus,
): Promise<void> {
  try {
    const clampedProgress = Math.min(Math.max(progress, 0), requirement);

    const { data: existing, error: existingError } = await supabase
      .from('user_challenges')
      .select('id, status')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing?.status === 'redeemed') {
      return;
    }

    const payload = {
      user_id: userId,
      challenge_id: challengeId,
      progress: clampedProgress,
      status,
    } as any;

    if (existing) {
      const { error } = await supabase
        .from('user_challenges')
        .update(payload)
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from('user_challenges').insert(payload);
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error setting challenge progress:', error);
    throw error;
  }
}

/**
 * Redeems a completed challenge and awards golden note shards
 */
export async function redeemChallenge(
  userId: string,
  challengeId: string,
): Promise<void> {
  try {
    // Get challenge details
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('reward, title')
      .eq('id', challengeId)
      .single();

    if (challengeError) throw challengeError;
    if (!challenge) throw new Error('Challenge not found');

    // Get user challenge
    const { data: userChallenge, error: userChallengeError } = await supabase
      .from('user_challenges')
      .select('status')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single();

    if (userChallengeError) throw userChallengeError;
    if (!userChallenge) throw new Error('User challenge not found');

    if ((userChallenge as any).status !== 'completed') {
      throw new Error('Challenge must be completed before redeeming');
    }

    // Add currency transaction for the reward
    await addCurrencyTransaction(
      userId,
      (challenge as any).reward,
      'challenge_reward',
      {
        sourceId: challengeId,
        description: `Reward for completing "${(challenge as any).title}"`,
        metadata: {
          challengeId,
          challengeTitle: (challenge as any).title,
          reward: (challenge as any).reward,
        },
      },
    );

    // Mark challenge as redeemed
    const { error: markError } = await supabase
      .from('user_challenges')
      .update({ status: 'redeemed' } as any)
      .eq('user_id', userId)
      .eq('challenge_id', challengeId);

    if (markError) throw markError;
  } catch (error) {
    console.error('Error redeeming challenge:', error);
    throw error;
  }
}

/**
 * Adds golden note shards directly to user's account
 */
export async function addGoldenShards(
  userId: string,
  amount: number,
  description?: string,
): Promise<void> {
  try {
    await addCurrencyTransaction(userId, amount, 'admin_adjustment', {
      description: description || `Added ${amount} golden note shards`,
      metadata: { amount },
    });
  } catch (error) {
    console.error('Error adding golden shards:', error);
    throw error;
  }
}

/**
 * Gets user's currency (golden note shards)
 * Creates profile if it doesn't exist
 */
export async function getUserCurrency(userId: string): Promise<number> {
  try {
    // Ensure user profile exists
    await getUserProfile(userId);

    // Get balance from transactions
    return await getUserBalance(userId, 'golden_note_shards');
  } catch (error) {
    console.error('Error getting user currency:', error);
    return 0;
  }
}

/**
 * Resets all user challenges (for testing)
 */
export async function resetUserChallenges(userId: string): Promise<void> {
  try {
    // Delete all user challenges
    const { error: deleteChallengesError } = await supabase
      .from('user_challenges')
      .delete()
      .eq('user_id', userId);

    if (deleteChallengesError) throw deleteChallengesError;

    // Delete all currency transactions (this resets balance to 0)
    const { error: deleteTransactionsError } = await supabase
      .from('currency_transactions')
      .delete()
      .eq('user_id', userId);

    if (deleteTransactionsError) throw deleteTransactionsError;
  } catch (error) {
    console.error('Error resetting user challenges:', error);
    throw error;
  }
}
