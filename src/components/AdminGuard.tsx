import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface AdminGuardProps {
  children: React.ReactNode;
}

const ADMIN_EMAILS = ['ferramentastech.apps@gmail.com'];

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { authProfile, user, authLoading } = useAuthStore();

  if (authLoading) return null;

  const currentEmail = (authProfile?.email || user?.email || '').toLowerCase();
  const isAdminEmail = ADMIN_EMAILS.includes(currentEmail);
  const isAdminFlag = !!authProfile?.is_admin;

  // Garante que se o email for ferramentastech.apps@gmail.com ou tiver is_admin = true no Supabase, tem acesso garantido!
  if (!isAdminFlag && !isAdminEmail) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
