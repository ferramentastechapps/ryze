// ============================================================
// RYZE — Subscription Service
// ============================================================

import { supabase } from './supabase';
import type { UserProfile_Auth, AccessStatus } from '../types/supabase';

// ─── Get user profile from DB ─────────────────────────────────────────────────
export async function getUserProfile(userId: string): Promise<UserProfile_Auth | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as UserProfile_Auth;
}

// ─── Calculate access status ──────────────────────────────────────────────────
export function getAccessStatus(profile: UserProfile_Auth | null): AccessStatus {
  if (!profile) return 'unauthenticated';

  if (profile.subscription_status === 'active') return 'active';

  if (profile.subscription_status === 'trial') {
    const now = new Date();
    const trialEnd = new Date(profile.trial_end_date);
    if (now <= trialEnd) return 'trial';
    return 'expired';
  }

  if (profile.subscription_status === 'canceled' || profile.subscription_status === 'expired') {
    return 'expired';
  }

  return 'expired';
}

// ─── Get days remaining in trial ─────────────────────────────────────────────
export function getTrialDaysRemaining(profile: UserProfile_Auth): number {
  const now = new Date();
  const trialEnd = new Date(profile.trial_end_date);
  const diffMs = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// ─── Redirect to Stripe Checkout ─────────────────────────────────────────────
export async function redirectToCheckout(userId: string, email: string): Promise<void> {
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  if (!stripeKey) {
    alert('Pagamento em breve! Por enquanto seu trial está ativo.');
    return;
  }

  try {
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email }),
    });

    const { url, error } = await response.json();

    if (error) throw new Error(error);
    if (url) window.location.href = url;
  } catch (err) {
    console.error('Checkout error:', err);
    alert('Erro ao iniciar pagamento. Tente novamente.');
  }
}

// ─── Open Stripe Customer Portal ─────────────────────────────────────────────
export async function openCustomerPortal(userId: string): Promise<void> {
  try {
    const response = await fetch('/api/create-portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    const { url, error } = await response.json();
    if (error) throw new Error(error);
    if (url) window.location.href = url;
  } catch (err) {
    console.error('Portal error:', err);
    alert('Erro ao abrir portal. Tente novamente.');
  }
}
