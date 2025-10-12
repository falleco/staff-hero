import type { Challenge, ChallengeType } from '~/shared/types/music';
import {
  fetchUserChallenges,
  redeemChallenge,
  resetUserChallenges,
  startChallenge,
  updateChallengeProgress,
} from '~/data/supabase';

/**
 * Challenge service keeps Supabase details isolated from UI hooks.
 */
export const challengeService = {
  /**
   * Fetch all challenges for the given user.
   */
  async getUserChallenges(userId: string): Promise<Challenge[]> {
    return fetchUserChallenges(userId);
  },

  /**
   * Mark a challenge as started.
   */
  async start(userId: string, challengeId: string) {
    return startChallenge(userId, challengeId);
  },

  /**
   * Increment progress for challenges of the provided type.
   */
  async updateProgress(userId: string, type: ChallengeType, amount: number) {
    return updateChallengeProgress(userId, type, amount);
  },

  /**
   * Redeem a completed challenge.
   */
  async redeem(userId: string, challengeId: string) {
    return redeemChallenge(userId, challengeId);
  },

  /**
   * Reset all challenge state for the user.
   */
  async reset(userId: string) {
    return resetUserChallenges(userId);
  },
};

export type ChallengeService = typeof challengeService;
