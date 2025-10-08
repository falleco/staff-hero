import { useEffect, useState } from 'react';
import type { UserCurrency } from '@/types/music';
import type { CurrencyTransaction, CurrencyType } from '~/features/supabase';
import {
  addGoldenShards as addGoldenShardsAPI,
  getTransactionHistory,
  getTransactionSummary,
  getUserBalance,
  hasSufficientBalance as hasSufficientBalanceAPI,
  useAuth,
} from '~/features/supabase';

export interface UseCurrencyReturn {
  /** User's current currency */
  currency: UserCurrency;
  /** Loading state */
  isLoading: boolean;
  /** Refresh currency data */
  refresh: () => Promise<void>;
  /** Add golden note shards directly */
  addGoldenShards: (amount: number, description?: string) => Promise<void>;
  /** Get transaction history */
  getHistory: (limit?: number) => Promise<CurrencyTransaction[]>;
  /** Get transaction summary */
  getSummary: () => Promise<{
    balance: number;
    totalCredits: number;
    totalDebits: number;
    transactionCount: number;
  }>;
  /** Check if user has sufficient balance */
  hasSufficientBalance: (amount: number) => Promise<boolean>;
}

/**
 * Custom hook for managing user currency (Golden Note Shards)
 *
 * Handles currency balance, transactions, and currency operations.
 * Uses the transaction-based currency system from Supabase.
 *
 * @returns Object containing currency state and management functions
 *
 * @example
 * ```tsx
 * const {
 *   currency,
 *   isLoading,
 *   addGoldenShards,
 *   hasSufficientBalance,
 *   getHistory
 * } = useCurrency();
 *
 * // Check balance
 * console.log(`Balance: ${currency.goldenNoteShards}`);
 *
 * // Check if can afford item
 * const canAfford = await hasSufficientBalance(50);
 *
 * // Add shards (admin/testing)
 * await addGoldenShards(100, 'Bonus shards');
 *
 * // View transaction history
 * const history = await getHistory(20);
 * ```
 */
export function useCurrency(): UseCurrencyReturn {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [currency, setCurrency] = useState<UserCurrency>({
    goldenNoteShards: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load currency when user is available
  useEffect(() => {
    if (user && !isAuthLoading) {
      loadCurrency();
    }
  }, [user, isAuthLoading]);

  /**
   * Loads currency balance from Supabase
   */
  const loadCurrency = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const balance = await getUserBalance(user.id, 'golden_note_shards');
      setCurrency({ goldenNoteShards: balance });
    } catch (error) {
      console.error('Error loading currency:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refreshes currency data
   */
  const refresh = async () => {
    await loadCurrency();
  };

  /**
   * Adds golden note shards directly to user's account
   * @param amount - Amount of shards to add
   * @param description - Optional description for the transaction
   */
  const addGoldenShards = async (amount: number, description?: string) => {
    if (!user) return;

    try {
      await addGoldenShardsAPI(user.id, amount, description);
      await loadCurrency(); // Reload to get updated balance
    } catch (error) {
      console.error('Error adding golden shards:', error);
      throw error;
    }
  };

  /**
   * Gets transaction history for the user
   * @param limit - Number of transactions to fetch (default: 20)
   */
  const getHistory = async (limit = 20): Promise<CurrencyTransaction[]> => {
    if (!user) return [];

    try {
      return await getTransactionHistory(user.id, {
        currencyType: 'golden_note_shards',
        limit,
      });
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  };

  /**
   * Gets transaction summary for the user
   */
  const getSummary = async () => {
    if (!user) {
      return {
        balance: 0,
        totalCredits: 0,
        totalDebits: 0,
        transactionCount: 0,
      };
    }

    try {
      return await getTransactionSummary(user.id, 'golden_note_shards');
    } catch (error) {
      console.error('Error getting transaction summary:', error);
      return {
        balance: 0,
        totalCredits: 0,
        totalDebits: 0,
        transactionCount: 0,
      };
    }
  };

  /**
   * Checks if user has sufficient balance
   * @param amount - Amount to check
   */
  const hasSufficientBalance = async (amount: number): Promise<boolean> => {
    if (!user) return false;

    try {
      return await hasSufficientBalanceAPI(
        user.id,
        amount,
        'golden_note_shards',
      );
    } catch (error) {
      console.error('Error checking balance:', error);
      return false;
    }
  };

  return {
    currency,
    isLoading,
    refresh,
    addGoldenShards,
    getHistory,
    getSummary,
    hasSufficientBalance,
  };
}
