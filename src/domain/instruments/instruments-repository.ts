import type {
  Instrument,
  InstrumentRarity,
  InstrumentType,
} from '~/shared/types/music';
import { supabase } from '~/supabase/client';
import { getUserProfile } from '../user/user-profile-repository';

/**
 * Fetches all available instruments with user ownership data
 */
export async function fetchUserInstruments(
  userId: string,
): Promise<Instrument[]> {
  try {
    // Ensure user profile exists
    await getUserProfile(userId);

    // Call the database function to get instruments with user data
    const { data, error } = await supabase.rpc('get_user_instruments', {
      p_user_id: userId,
    });

    if (error) throw error;
    if (!data) return [];

    // Map database response to Instrument type
    const instruments: Instrument[] = (data as any[]).map((item: any) => ({
      id: item.id as string,
      name: item.name as string,
      type: item.type as InstrumentType,
      rarity: item.rarity as InstrumentRarity,
      level: item.level as number,
      tuning: item.tuning as number,
      bonuses: {
        scoreMultiplier: Number(item.score_multiplier),
        accuracyBonus: item.accuracy_bonus as number,
        streakBonus: item.streak_bonus as number,
      },
      price: item.price as number,
      upgradePrice: item.upgrade_price as number,
      tunePrice: item.tune_price as number,
      icon: item.icon as string,
      description: item.description as string,
      isOwned: item.is_owned as boolean,
      isEquipped: item.is_equipped as boolean,
    }));

    return instruments;
  } catch (error) {
    console.error('Error fetching user instruments:', error);
    throw error;
  }
}

/**
 * Purchases instrument for a user
 */
export async function purchaseInstrument(
  userId: string,
  instrumentId: string,
): Promise<void> {
  try {
    const { error } = await supabase.rpc('purchase_instrument', {
      p_user_id: userId,
      p_instrument_id: instrumentId,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error purchasing instrument:', error);
    throw error;
  }
}

/**
 * Upgrades owned instrument
 */
export async function upgradeInstrument(
  userId: string,
  instrumentId: string,
): Promise<void> {
  try {
    const { error } = await supabase.rpc('upgrade_instrument', {
      p_user_id: userId,
      p_instrument_id: instrumentId,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error upgrading instrument:', error);
    throw error;
  }
}

/**
 * Tunes owned instrument
 */
export async function tuneInstrument(
  userId: string,
  instrumentId: string,
): Promise<void> {
  try {
    const { error } = await supabase.rpc('tune_instrument', {
      p_user_id: userId,
      p_instrument_id: instrumentId,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tuning instrument:', error);
    throw error;
  }
}

/**
 * Equips an instrument
 */
export async function equipInstrument(
  userId: string,
  instrumentId: string,
): Promise<void> {
  try {
    const { error } = await supabase.rpc('toggle_instrument', {
      p_user_id: userId,
      p_instrument_id: instrumentId,
      p_equip: true,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error equipping instrument:', error);
    throw error;
  }
}

/**
 * Unequips an instrument
 */
export async function unequipInstrument(
  userId: string,
  instrumentId: string,
): Promise<void> {
  try {
    const { error } = await supabase.rpc('toggle_instrument', {
      p_user_id: userId,
      p_instrument_id: instrumentId,
      p_equip: false,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error unequipping instrument:', error);
    throw error;
  }
}

/**
 * Initializes instruments for a new user (gives starter instrument)
 */
export async function initializeUserInstrument(userId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('initialize_user_instrument', {
      p_user_id: userId,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error initializing user instrument:', error);
    throw error;
  }
}

/**
 * Resets all user instruments (for testing)
 */
export async function resetUserInstruments(userId: string): Promise<void> {
  try {
    // Delete all user instruments
    const { error } = await supabase
      .from('user_instruments')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    // Reinitialize with starter instrument
    await initializeUserInstrument(userId);
  } catch (error) {
    console.error('Error resetting user instruments:', error);
    throw error;
  }
}
