// ============================================================
// RYZE — Supabase Type Definitions
// ============================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          trial_start_date: string;
          trial_end_date: string;
          subscription_status: 'trial' | 'active' | 'canceled' | 'expired';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          trial_start_date?: string;
          trial_end_date?: string;
          subscription_status?: 'trial' | 'active' | 'canceled' | 'expired';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_status?: 'trial' | 'active' | 'canceled' | 'expired';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}

export interface UserProfile_Auth {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  trial_start_date: string;
  trial_end_date: string;
  subscription_status: 'trial' | 'active' | 'canceled' | 'expired';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export type AccessStatus = 'loading' | 'unauthenticated' | 'trial' | 'active' | 'expired';
