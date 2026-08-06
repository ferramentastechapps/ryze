import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, CheckCircle2, Clock, XCircle, Search, RefreshCw,
  ShieldCheck, ArrowLeft, UserCheck, CalendarPlus, Sparkles, UserX
} from 'lucide-react';
import { getAllUsers, updateUserStatus, extendUserTrial, toggleAdminRole, type AdminUserMetrics } from '../services/adminService';
import type { UserProfile_Auth } from '../types/supabase';
import { useAuthStore } from '../store/authStore';

export default function Admin() {
  const navigate = useNavigate();
  const { authProfile } = useAuthStore();
  const [users, setUsers] = useState<UserProfile_Auth[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'trial' | 'active' | 'expired'>('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users for admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId: string, status: 'trial' | 'active' | 'canceled' | 'expired') => {
    try {
      await updateUserStatus(userId, status);
      setActionMessage(`Status atualizado para "${status}".`);
      fetchUsers();
    } catch {
      setActionMessage('Erro ao atualizar status.');
    }
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleExtendTrial = async (userId: string) => {
    try {
      await extendUserTrial(userId, 30);
      setActionMessage('Trial estendido por +30 dias.');
      fetchUsers();
    } catch {
      setActionMessage('Erro ao estender trial.');
    }
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleToggleAdmin = async (userId: string, currentAdminState: boolean) => {
    try {
      await toggleAdminRole(userId, !currentAdminState);
      setActionMessage(!currentAdminState ? 'Usuário promovido a Admin.' : 'Permissão Admin removida.');
      fetchUsers();
    } catch {
      setActionMessage('Erro ao alterar cargo de admin.');
    }
    setTimeout(() => setActionMessage(null), 3000);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const metrics: AdminUserMetrics = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.subscription_status === 'active').length,
    trialUsers: users.filter(u => u.subscription_status === 'trial').length,
    expiredUsers: users.filter(u => u.subscription_status === 'expired' || u.subscription_status === 'canceled').length,
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-8 font-sans pb-24">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-500" />
              <h1 className="text-2xl font-black tracking-tight">Painel Administrativo</h1>
            </div>
            <p className="text-xs text-zinc-400">Gestão central de usuários e assinaturas do RYZE</p>
          </div>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {actionMessage && (
        <div className="max-w-6xl mx-auto mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-sm font-semibold text-center animate-fade-in">
          {actionMessage}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase">Total de Usuários</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white">{metrics.totalUsers}</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase">Assinantes Ativos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">{metrics.activeUsers}</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase">Em Trial</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400">{metrics.trialUsers}</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase">Expirados / Cancelados</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-3xl font-black text-zinc-500">{metrics.expiredUsers}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
          {(['all', 'active', 'trial', 'expired'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                statusFilter === st
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {st === 'all' ? 'Todos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="max-w-6xl mx-auto bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-950/80 text-zinc-500 uppercase text-[11px] font-bold border-b border-zinc-800">
              <tr>
                <th className="p-4">Usuário</th>
                <th className="p-4">Status de Acesso</th>
                <th className="p-4">Permissão</th>
                <th className="p-4 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-zinc-500">
                    Carregando usuários...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-zinc-500">
                    Nenhum usuário encontrado com esse filtro.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-zinc-800/30 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-zinc-700" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-amber-400">
                            {(user.full_name || user.email || 'U')[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {user.full_name || 'Usuário Sem Nome'}
                            {user.is_admin && (
                              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase px-1.5 py-0.5 rounded border border-amber-500/30">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-400">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                        user.subscription_status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : user.subscription_status === 'trial'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {user.subscription_status === 'active' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {user.subscription_status === 'trial' && <Clock className="w-3.5 h-3.5" />}
                        {user.subscription_status}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggleAdmin(user.id, !!user.is_admin)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                          user.is_admin
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {user.is_admin ? 'Admin' : 'Usuário Comum'}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.subscription_status !== 'active' && (
                          <button
                            onClick={() => handleStatusChange(user.id, 'active')}
                            title="Ativar Acesso Permanente"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition text-xs font-semibold flex items-center gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Ativar VIP</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleExtendTrial(user.id)}
                          title="Estender Trial +30 Dias"
                          className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition text-xs font-semibold flex items-center gap-1"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          <span>+30d Trial</span>
                        </button>

                        {user.subscription_status === 'active' && (
                          <button
                            onClick={() => handleStatusChange(user.id, 'expired')}
                            title="Revogar Acesso VIP"
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition text-xs font-semibold flex items-center gap-1"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Expirar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
