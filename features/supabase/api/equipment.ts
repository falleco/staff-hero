import type { Equipment, EquipmentCategory, EquipmentRarity } from '@/types/music';
import { supabase } from '../client';
import { getUserProfile } from './user-profile';

/**
 * Fetches all available equipment with user ownership data
 */
export async function fetchUserEquipment(userId: string): Promise<Equipment[]> {
  try {
    // Ensure user profile exists
    await getUserProfile(userId);

    // Call the database function to get equipment with user data
    const { data, error } = await supabase.rpc('get_user_equipments', {
      p_user_id: userId,
    });

    if (error) throw error;
    if (!data) return [];

    // Map database response to Equipment type
    const equipment: Equipment[] = (data as any[]).map((item: any) => ({
      id: item.id as string,
      name: item.name as string,
      category: item.category as EquipmentCategory,
      rarity: item.rarity as EquipmentRarity,
      level: item.level as number,
      bonuses: {
        scoreBonus: item.score_bonus as number,
        accuracyBonus: item.accuracy_bonus as number,
        streakBonus: item.streak_bonus as number,
        specialEffect: item.special_effect as string | undefined,
      },
      price: item.price as number,
      upgradePrice: item.upgrade_price as number,
      icon: item.icon as string,
      description: item.description as string,
      isOwned: item.is_owned as boolean,
      isEquipped: item.is_equipped as boolean,
    }));

    return equipment;
  } catch (error) {
    console.error('Error fetching user equipment:', error);
    throw error;
  }
}

/**
 * Purchases equipment for a user
 */
export async function purchaseEquipment(
  userId: string,
  equipmentId: string,
): Promise<void> {
  try {
    const { error } = await supabase.rpc('purchase_equipment', {
      p_user_id: userId,
      p_equipment_id: equipmentId,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error purchasing equipment:', error);
    throw error;
  }
}

/**
 * Upgrades owned equipment
 */
export async function upgradeEquipment(
  userId: string,
  equipmentId: string,
): Promise<void> {
  try {
    const { error } = await supabase.rpc('upgrade_equipment', {
      p_user_id: userId,
      p_equipment_id: equipmentId,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error upgrading equipment:', error);
    throw error;
  }
}

/**
 * Equips an item
 */
export async function equipItem(
  userId: string,
  equipmentId: string,
): Promise<void> {
  try {
    const { error } = await supabase.rpc('toggle_equipment', {
      p_user_id: userId,
      p_equipment_id: equipmentId,
      p_equip: true,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error equipping item:', error);
    throw error;
  }
}

/**
 * Unequips an item
 */
export async function unequipItem(
  userId: string,
  equipmentId: string,
): Promise<void> {
  try {
    const { error } = await supabase.rpc('toggle_equipment', {
      p_user_id: userId,
      p_equipment_id: equipmentId,
      p_equip: false,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error unequipping item:', error);
    throw error;
  }
}

/**
 * Initializes equipment for a new user (gives starter equipment)
 */
export async function initializeUserEquipment(userId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('initialize_user_equipment', {
      p_user_id: userId,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error initializing user equipment:', error);
    throw error;
  }
}

/**
 * Resets all user equipment (for testing)
 */
export async function resetUserEquipment(userId: string): Promise<void> {
  try {
    // Delete all user equipment
    const { error } = await supabase
      .from('user_equipments')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    // Reinitialize with starter equipment
    await initializeUserEquipment(userId);
  } catch (error) {
    console.error('Error resetting user equipment:', error);
    throw error;
  }
}

