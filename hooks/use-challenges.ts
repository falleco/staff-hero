import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import type { Challenge, ChallengeStatus, UserCurrency } from '@/types/music';
import { ChallengeType, ChallengeStatus as Status } from '@/types/music';

const CHALLENGES_KEY = '@staff_hero_challenges';
const CURRENCY_KEY = '@staff_hero_currency';

// Default challenges
const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: 'dominate-violin-notes',
    type: ChallengeType.DOMINATE_NOTES,
    title: 'Dominate Violin Notes',
    description: 'Master the art of violin note recognition',
    icon: '🎻',
    requirement: 1, // Just need to play violin notes (simplified for demo)
    progress: 0,
    reward: 3,
    status: Status.AVAILABLE,
    targetRoute: '/(tabs)/',
  },
  {
    id: 'score-master',
    type: ChallengeType.SCORE_POINTS,
    title: 'Score Master',
    description: 'Achieve 1,000 points in total gameplay',
    icon: '🎯',
    requirement: 1000,
    progress: 0,
    reward: 5,
    status: Status.AVAILABLE,
    targetRoute: '/(tabs)/',
  },
  {
    id: 'battle-warrior',
    type: ChallengeType.BATTLE_COUNT,
    title: 'Battle Warrior',
    description: 'Complete 5 game battles',
    icon: '⚔️',
    requirement: 5,
    progress: 0,
    reward: 10,
    status: Status.AVAILABLE,
    targetRoute: '/(tabs)/',
  },
];

const DEFAULT_CURRENCY: UserCurrency = {
  goldenNoteShards: 0,
};

export interface UseChallengesReturn {
  /** Current list of challenges */
  challenges: Challenge[];
  /** User's current currency */
  currency: UserCurrency;
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
  /** Add golden note shards directly */
  addGoldenShards: (amount: number) => Promise<void>;
}

/**
 * Custom hook for managing challenges and currency system
 *
 * Handles challenge progress tracking, currency management, and reward redemption.
 * Persists data to AsyncStorage for persistence across app sessions.
 *
 * @returns Object containing challenges, currency, and management functions
 *
 * @example
 * ```tsx
 * const {
 *   challenges,
 *   currency,
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
  const [challenges, setChallenges] = useState<Challenge[]>(DEFAULT_CHALLENGES);
  const [currency, setCurrency] = useState<UserCurrency>(DEFAULT_CURRENCY);

  // Load data on mount
  useEffect(() => {
    loadChallenges();
    loadCurrency();
  }, []);

  /**
   * Loads challenges from AsyncStorage
   */
  const loadChallenges = async () => {
    try {
      const stored = await AsyncStorage.getItem(CHALLENGES_KEY);
      if (stored) {
        const parsedChallenges = JSON.parse(stored);
        setChallenges(parsedChallenges);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  };

  /**
   * Saves challenges to AsyncStorage
   */
  const saveChallenges = async (challengesToSave: Challenge[]) => {
    try {
      await AsyncStorage.setItem(
        CHALLENGES_KEY,
        JSON.stringify(challengesToSave),
      );
      setChallenges(challengesToSave);
    } catch (error) {
      console.error('Error saving challenges:', error);
    }
  };

  /**
   * Loads currency from AsyncStorage
   */
  const loadCurrency = async () => {
    try {
      const stored = await AsyncStorage.getItem(CURRENCY_KEY);
      if (stored) {
        const parsedCurrency = JSON.parse(stored);
        setCurrency(parsedCurrency);
      }
    } catch (error) {
      console.error('Error loading currency:', error);
    }
  };

  /**
   * Saves currency to AsyncStorage
   */
  const saveCurrency = async (currencyToSave: UserCurrency) => {
    try {
      await AsyncStorage.setItem(CURRENCY_KEY, JSON.stringify(currencyToSave));
      setCurrency(currencyToSave);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  /**
   * Starts a challenge by marking it as in progress
   * @param challengeId - ID of the challenge to start
   */
  const startChallenge = async (challengeId: string) => {
    const updatedChallenges = challenges.map((challenge) =>
      challenge.id === challengeId
        ? { ...challenge, status: Status.IN_PROGRESS }
        : challenge,
    );
    await saveChallenges(updatedChallenges);
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
    const updatedChallenges = challenges.map((challenge) => {
      if (challenge.type === type && challenge.status === Status.IN_PROGRESS) {
        const newProgress = Math.min(
          challenge.progress + amount,
          challenge.requirement,
        );
        const newStatus =
          newProgress >= challenge.requirement
            ? Status.COMPLETED
            : Status.IN_PROGRESS;

        return {
          ...challenge,
          progress: newProgress,
          status: newStatus,
        };
      }
      return challenge;
    });

    await saveChallenges(updatedChallenges);
  };

  /**
   * Redeems a completed challenge and awards golden note shards
   * @param challengeId - ID of the challenge to redeem
   */
  const redeemChallenge = async (challengeId: string) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge || challenge.status !== Status.COMPLETED) {
      return;
    }

    // Award golden note shards
    const newCurrency = {
      ...currency,
      goldenNoteShards: currency.goldenNoteShards + challenge.reward,
    };
    await saveCurrency(newCurrency);

    // Mark challenge as redeemed
    const updatedChallenges = challenges.map((c) =>
      c.id === challengeId ? { ...c, status: Status.REDEEMED } : c,
    );
    await saveChallenges(updatedChallenges);
  };

  /**
   * Resets all challenges to default state (for testing)
   */
  const resetChallenges = async () => {
    await saveChallenges(DEFAULT_CHALLENGES);
    await saveCurrency(DEFAULT_CURRENCY);
  };

  /**
   * Adds golden note shards directly to user's currency
   * @param amount - Amount of shards to add
   */
  const addGoldenShards = async (amount: number) => {
    const newCurrency = {
      ...currency,
      goldenNoteShards: currency.goldenNoteShards + amount,
    };
    await saveCurrency(newCurrency);
  };

  return {
    challenges,
    currency,
    startChallenge,
    updateChallengeProgress,
    redeemChallenge,
    resetChallenges,
    addGoldenShards,
  };
}
