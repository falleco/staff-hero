import { supabase } from '~/data/supabase/client';
import type { UserProfile } from '~/data/supabase/types';

/**
 * Gets or creates a user profile
 */
export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // If profile doesn't exist, it will be created by the trigger
      // But we can also create it manually if needed
      if (error.code === 'PGRST116') {
        // Row not found
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            is_anonymous: true,
            golden_note_shards: 0,
            onboarding_completed: false,
          } as any)
          .select()
          .single();

        if (createError) throw createError;
        return newProfile as UserProfile;
      }
      throw error;
    }

    if (!data) {
      throw new Error('Profile update failed');
    }
    return {
      ...(data as UserProfile),
      onboarding_completed: (data as any).onboarding_completed ?? false,
    } as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

/**
 * Updates user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>,
): Promise<UserProfile> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates as any)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error('Profile update failed');
    }
    return {
      ...(data as UserProfile),
      onboarding_completed: (data as any).onboarding_completed ?? false,
    } as UserProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}
