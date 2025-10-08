import { useEffect, useState } from 'react';
import type { Challenge, ChallengeType } from '@/types/music';
import {
  fetchUserChallenges,
  redeemChallenge as redeemChallengeAPI,
  resetUserChallenges,
  startChallenge as startChallengeAPI,
  updateChallengeProgress as updateChallengeProgressAPI,
  useAuth,
} from '~/features/supabase';

export interface UseChallengesReturn {
  /** Current list of challenges */
  challenges: Challenge[];
  /** Loading state */
  isLoading: boolean;
  /** Refresh challenges data */
  refresh: () => Promise<void>;
  /** Start a challenge (mark as in progress) */
  startChallenge: (challengeId: string) => Promise<void>;
  /** Update challenge progress */
  updateChallengeProgress: (
    type: ChallengeType,
    amount: number,
  ) => Promise<void>;
  /** Redeem completed challenge rewards */
  redeemChallenge: (challengeId: string) => Promise<void>;
  /** Reset all challenges (for testing) */
  resetChallenges: () => Promise<void>;
}

/**
 * Custom hook for managing challenges
 *
 * Handles challenge progress tracking and reward redemption.
 * Data is persisted to Supabase database.
 *
 * Note: For currency management, use the `useCurrency()` hook.
 *
 * @returns Object containing challenges and management functions
 *
 * @example
 * ```tsx
 * const {
 *   challenges,
 *   isLoading,
 *   startChallenge,
 *   updateChallengeProgress,
 *   redeemChallenge
 * } = useChallenges();
 *
 * // Start a challenge
 * await startChallenge('dominate-violin-notes');
 *
 * // Update progress
 * await updateChallengeProgress(ChallengeType.SCORE_POINTS, 100);
 *
 * // Redeem rewards
 * await redeemChallenge('score-master');
 * ```
 */
export function useChallenges(): UseChallengesReturn {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load challenges when user is available
  useEffect(() => {
    if (user && !isAuthLoading) {
      loadChallenges();
    }
  }, [user, isAuthLoading]);

  /**
   * Loads challenges from Supabase
   */
  const loadChallenges = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const fetchedChallenges = await fetchUserChallenges(user.id);
      setChallenges(fetchedChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refreshes challenge data
   */
  const refresh = async () => {
    await loadChallenges();
  };

  /**
   * Starts a challenge by marking it as in progress
   * @param challengeId - ID of the challenge to start
   */
  const startChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      await startChallengeAPI(user.id, challengeId);
      await loadChallenges(); // Reload to get updated data
    } catch (error) {
      console.error('Error starting challenge:', error);
      throw error;
    }
  };

  /**
   * Updates progress for challenges of a specific type
   * @param type - Type of challenge to update
   * @param amount - Amount to add to progress
   */
  const updateChallengeProgress = async (
    type: ChallengeType,
    amount: number,
  ) => {
    if (!user) return;

    try {
      await updateChallengeProgressAPI(user.id, type, amount);
      await loadChallenges(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      throw error;
    }
  };

  /**
   * Redeems a completed challenge and awards golden note shards
   * Note: This creates a currency transaction. Use useCurrency() to see updated balance.
   * @param challengeId - ID of the challenge to redeem
   */
  const redeemChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      await redeemChallengeAPI(user.id, challengeId);
      await loadChallenges(); // Reload to get updated data
    } catch (error) {
      console.error('Error redeeming challenge:', error);
      throw error;
    }
  };

  /**
   * Resets all challenges (for testing)
   * Note: This also resets currency transactions. Use useCurrency().refresh() to update balance.
   */
  const resetChallenges = async () => {
    if (!user) return;

    try {
      await resetUserChallenges(user.id);
      await loadChallenges(); // Reload to get updated data
    } catch (error) {
      console.error('Error resetting challenges:', error);
      throw error;
    }
  };

  return {
    challenges,
    isLoading,
    refresh,
    startChallenge,
    updateChallengeProgress,
    redeemChallenge,
    resetChallenges,
  };
}
