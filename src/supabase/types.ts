import type { ChallengeStatus, ChallengeType } from '~/shared/types/music';

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          username: string | null;
          is_anonymous: boolean;
          golden_note_shards: number;
          preferred_instrument: string | null;
          skill_level: string | null;
          onboarding_completed: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          is_anonymous?: boolean;
          golden_note_shards?: number;
          preferred_instrument?: string | null;
          skill_level?: string | null;
          onboarding_completed?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          is_anonymous?: boolean;
          golden_note_shards?: number;
          preferred_instrument?: string | null;
          skill_level?: string | null;
          onboarding_completed?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      challenges: {
        Row: {
          id: string;
          type: ChallengeType;
          title: string;
          description: string;
          icon: string;
          requirement: number;
          reward: number;
          target_route: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          type: ChallengeType;
          title: string;
          description: string;
          icon: string;
          requirement: number;
          reward: number;
          target_route?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: ChallengeType;
          title?: string;
          description?: string;
          icon?: string;
          requirement?: number;
          reward?: number;
          target_route?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_challenges: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          progress: number;
          status: ChallengeStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_id: string;
          progress?: number;
          status?: ChallengeStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_id?: string;
          progress?: number;
          status?: ChallengeStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type ChallengeRow = Database['public']['Tables']['challenges']['Row'];
export type UserChallengeRow =
  Database['public']['Tables']['user_challenges']['Row'];

// Currency transaction types
export type CurrencyType = 'golden_note_shards';

export type TransactionSource =
  | 'challenge_reward'
  | 'purchase'
  | 'initial_balance'
  | 'admin_adjustment'
  | 'migration';

export interface CurrencyTransaction {
  id: string;
  user_id: string;
  currency_type: CurrencyType;
  amount: number;
  source: TransactionSource;
  source_id?: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
}
