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
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as UserProfile_Auth[]) || [];
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
