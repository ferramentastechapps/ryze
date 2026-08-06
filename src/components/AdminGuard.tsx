import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { authProfile, authLoading } = useAuthStore();

  if (authLoading) return null;

  // Verifica permissão admin no Supabase
  if (!authProfile || !authProfile.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
