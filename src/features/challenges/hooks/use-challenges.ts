import { useContext } from 'react';
import { GameContext } from '~/features/game/state/game-context';
import type { Challenge, ChallengeType } from '~/shared/types/music';
import { useAuth } from '~/data/supabase';
import { currencyService } from '~/features/currency/services/currency-service';
import { challengeService } from '~/features/challenges/services/challenge-service';

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
 * This hook implements all challenge-related business logic:
 * - Loading challenges
 * - Starting/progressing challenges
 * - Redeeming rewards
 * - Resetting challenges
 *
 * State is managed centrally in GameContext, this hook provides
 * the business logic and operations.
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
  const context = useContext(GameContext);
  const { user } = useAuth();

  if (!context) {
    throw new Error('useChallenges must be used within a GameProvider');
  }

  const {
    challenges,
    challengesLoading,
    setChallenges,
    setChallengesLoading,
    setCurrency,
    setCurrencyLoading,
  } = context;

  /**
   * Refreshes challenges data from database
   */
  const refresh = async () => {
    if (!user) return;

    try {
      setChallengesLoading(true);
      const fetchedChallenges = await challengeService.getUserChallenges(user.id);
      setChallenges(fetchedChallenges);
    } catch (error) {
      console.error('Error refreshing challenges:', error);
    } finally {
      setChallengesLoading(false);
    }
  };

  /**
   * Starts a challenge by marking it as in progress
   * @param challengeId - ID of the challenge to start
   */
  const startChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      await challengeService.start(user.id, challengeId);
      await refresh();
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
      await challengeService.updateProgress(user.id, type, amount);
      await refresh();
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      throw error;
    }
  };

  /**
   * Redeems a completed challenge and awards golden note shards
   * Note: This also updates currency balance
   * @param challengeId - ID of the challenge to redeem
   */
  const redeemChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      await challengeService.redeem(user.id, challengeId);

      // Refresh both challenges and currency (redeeming awards currency)
      await refresh();

      // Refresh currency too
      setCurrencyLoading(true);
      const balance = await currencyService.getBalance(user.id);
      setCurrency({ goldenNoteShards: balance });
      setCurrencyLoading(false);
    } catch (error) {
      console.error('Error redeeming challenge:', error);
      throw error;
    }
  };

  /**
   * Resets all challenges (for testing)
   * Note: This also resets currency
   */
  const resetChallenges = async () => {
    if (!user) return;

    try {
      await challengeService.reset(user.id);

      // Refresh both challenges and currency (reset clears currency too)
      await refresh();

      // Refresh currency too
      setCurrencyLoading(true);
      const balance = await currencyService.getBalance(user.id);
      setCurrency({ goldenNoteShards: balance });
      setCurrencyLoading(false);
    } catch (error) {
      console.error('Error resetting challenges:', error);
      throw error;
    }
  };

  return {
    challenges,
    isLoading: challengesLoading,
    refresh,
    startChallenge,
    updateChallengeProgress,
    redeemChallenge,
    resetChallenges,
  };
}
