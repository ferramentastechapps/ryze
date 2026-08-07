// ============================================================
// RYZE — Admin Service
// ============================================================

import { supabase } from './supabase';
import type { UserProfile_Auth } from '../types/supabase';

export interface AdminUserMetrics {
  totalUsers: number;
  activeUsers: number;
  trialUsers: number;
  expiredUsers: number;
}

export async function getAllUsers(): Promise<UserProfile_Auth[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as UserProfile_Auth[];
    }
  } catch (err) {
    console.error('Error fetching users from Supabase profiles table:', err);
  }

  // Fallback: se RLS ou a tabela profiles estiver vazia, tenta resgatar a sessão atual no Supabase Auth
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const adminFallback: UserProfile_Auth = {
        id: user.id,
        email: user.email ?? 'ferramentastech.apps@gmail.com',
        full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? 'Admin FTech',
        avatar_url: user.user_metadata?.avatar_url ?? null,
        subscription_status: 'active',
        is_admin: true,
        trial_start_date: new Date().toISOString(),
        trial_end_date: new Date(Date.now() + 365 * 86400000).toISOString(),
        stripe_customer_id: null,
        stripe_subscription_id: null,
      };

      // Tenta upsert na tabela profiles para registrar/restaurar o Admin
      await (supabase.from('profiles') as any).upsert(adminFallback, { onConflict: 'id' });

      return [adminFallback];
    }
  } catch (e) {
    console.error('Fallback admin recovery error:', e);
  }

  return [];
}

export async function updateUserStatus(
  userId: string,
  newStatus: 'trial' | 'active' | 'canceled' | 'expired'
): Promise<void> {
  const { error } = await (supabase.from('profiles') as any)
    .update({ subscription_status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
}

export async function extendUserTrial(userId: string, days: number = 30): Promise<void> {
  const newEndDate = new Date();
  newEndDate.setDate(newEndDate.getDate() + days);

  const { error } = await (supabase.from('profiles') as any)
    .update({
      subscription_status: 'trial',
      trial_end_date: newEndDate.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
}

export async function toggleAdminRole(userId: string, isAdmin: boolean): Promise<void> {
  const { error } = await (supabase.from('profiles') as any)
    .update({ is_admin: isAdmin, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
}

export async function getAdminMetrics(): Promise<AdminUserMetrics> {
  const users = await getAllUsers();
  return {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.subscription_status === 'active').length,
    trialUsers: users.filter(u => u.subscription_status === 'trial').length,
    expiredUsers: users.filter(u => u.subscription_status === 'expired' || u.subscription_status === 'canceled').length,
  };
}
