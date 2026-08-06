import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { userProfile, isAuthConfigured } = useAuthStore();

  // Se o Supabase Auth não estiver ativado ou o perfil for local, permite acesso de dev
  if (!isAuthConfigured) {
    return <>{children}</>;
  }

  // Verifica permissão admin no Supabase
  if (!userProfile || !userProfile.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
