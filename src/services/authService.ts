// ============================================================
// RYZE — Auth Service (Supabase + Google OAuth)
// ============================================================

import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import type { UserProfile_Auth } from '../types/supabase';

// ─── Sign in with Google ──────────────────────────────────────────────────────
export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw error;
}

// ─── Sign out ─────────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ─── Get current session ──────────────────────────────────────────────────────
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ─── Get or create user profile (trial setup) ─────────────────────────────────
export async function getOrCreateProfile(user: User): Promise<UserProfile_Auth> {
  const trialStart = new Date();
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 30);

  const fallbackProfile: UserProfile_Auth = {
    id: user.id,
    email: user.email ?? null,
    full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    avatar_url: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
    trial_start_date: trialStart.toISOString(),
    trial_end_date: trialEnd.toISOString(),
    subscription_status: 'trial',
    stripe_customer_id: null,
    stripe_subscription_id: null,
  };

  try {
    // Try to get existing profile
    const { data: existing, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existing && !fetchError) {
      return existing as UserProfile_Auth;
    }

    // Create new profile with 30-day trial
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: created, error: createError } = await supabase
      .from('profiles')
      .insert(fallbackProfile as any)
      .select()
      .single();

    if (createError) {
      console.warn('Could not insert profile into Supabase (using local fallback profile):', createError.message);
      return fallbackProfile;
    }

    return created as UserProfile_Auth;
  } catch (err) {
    console.warn('Error fetching or creating profile (using local fallback profile):', err);
    return fallbackProfile;
  }
}


// ─── Listen to auth state changes ─────────────────────────────────────────────
export function onAuthStateChange(
  callback: (event: string, user: User | null) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session?.user ?? null);
    }
  );

  return () => subscription.unsubscribe();
}
