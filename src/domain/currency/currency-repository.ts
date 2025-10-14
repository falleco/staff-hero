import { supabase } from '~/data/supabase/client';
import type {
  CurrencyTransaction,
  CurrencyType,
  TransactionSource,
} from '~/data/supabase/types';

/**
 * Gets the current balance for a user
 */
export async function getUserBalance(
  userId: string,
  currencyType: CurrencyType = 'golden_note_shards',
): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_user_balance', {
      p_user_id: userId,
      p_currency_type: currencyType,
    });

    if (error) throw error;
    return data as number;
  } catch (error) {
    console.error('Error getting user balance:', error);
    return 0;
  }
}

/**
 * Adds a currency transaction
 */
export async function addCurrencyTransaction(
  userId: string,
  amount: number,
  source: TransactionSource,
  options?: {
    sourceId?: string;
    description?: string;
    metadata?: Record<string, any>;
    currencyType?: CurrencyType;
  },
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('add_currency_transaction', {
      p_user_id: userId,
      p_amount: amount,
      p_source: source,
      p_source_id: options?.sourceId || null,
      p_description: options?.description || null,
      p_metadata: options?.metadata || null,
      p_currency_type: options?.currencyType || 'golden_note_shards',
    });

    if (error) throw error;
    return data as string;
  } catch (error) {
    console.error('Error adding currency transaction:', error);
    throw error;
  }
}

/**
 * Gets transaction history for a user
 */
export async function getTransactionHistory(
  userId: string,
  options?: {
    currencyType?: CurrencyType;
    limit?: number;
    offset?: number;
  },
): Promise<CurrencyTransaction[]> {
  try {
    let query = supabase
      .from('currency_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.currencyType) {
      query = query.eq('currency_type', options.currencyType);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1,
      );
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data as any[]) || [];
  } catch (error) {
    console.error('Error getting transaction history:', error);
    return [];
  }
}

/**
 * Gets transaction summary for a user
 */
export async function getTransactionSummary(
  userId: string,
  currencyType: CurrencyType = 'golden_note_shards',
): Promise<{
  balance: number;
  totalCredits: number;
  totalDebits: number;
  transactionCount: number;
}> {
  try {
    const { data, error } = await supabase
      .from('currency_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('currency_type', currencyType);

    if (error) throw error;

    const transactions = (data as any[]) || [];
    const totalCredits = transactions
      .filter((t: any) => t.amount > 0)
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalDebits = Math.abs(
      transactions
        .filter((t: any) => t.amount < 0)
        .reduce((sum: number, t: any) => sum + t.amount, 0),
    );
    const balance = totalCredits - totalDebits;

    return {
      balance: Math.max(balance, 0),
      totalCredits,
      totalDebits,
      transactionCount: transactions.length,
    };
  } catch (error) {
    console.error('Error getting transaction summary:', error);
    return {
      balance: 0,
      totalCredits: 0,
      totalDebits: 0,
      transactionCount: 0,
    };
  }
}

/**
 * Checks if user has sufficient balance
 */
export async function hasSufficientBalance(
  userId: string,
  requiredAmount: number,
  currencyType: CurrencyType = 'golden_note_shards',
): Promise<boolean> {
  const balance = await getUserBalance(userId, currencyType);
  return balance >= requiredAmount;
}
