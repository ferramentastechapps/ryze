import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, CheckCircle2, Clock, XCircle, Search, RefreshCw,
  ShieldCheck, ArrowLeft, UserCheck, CalendarPlus, UserX,
  DollarSign, TrendingUp, Megaphone, Eye, Dumbbell, Activity,
  AlertTriangle, Sparkles, Sliders, Send
} from 'lucide-react';
import { getAllUsers, updateUserStatus, extendUserTrial, toggleAdminRole, type AdminUserMetrics } from '../services/adminService';
import type { UserProfile_Auth } from '../types/supabase';
import { useAuthStore } from '../store/authStore';
import { useRyzeStore } from '../store/ryzeStore';
import { saveGlobalAnnouncement, getGlobalAnnouncement, type GlobalAnnouncement } from '../services/announcementService';

const MONTHLY_SUBSCRIPTION_PRICE = 49.90; // R$ 49,90/mês por usuário ativo

export default function Admin() {
  const navigate = useNavigate();
  const { authProfile } = useAuthStore();
  const { profile: currentAppProfile, weekPlan, logs } = useRyzeStore();

  const [users, setUsers] = useState<UserProfile_Auth[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'trial' | 'active' | 'expired'>('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  
  // Selected user modal for Athlete Profile & History
  const [selectedUser, setSelectedUser] = useState<UserProfile_Auth | null>(null);

  // Global Announcement State
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementType, setAnnouncementType] = useState<'info' | 'warning' | 'success'>('info');
  const [currentAnnouncement, setCurrentAnnouncement] = useState<GlobalAnnouncement | null>(null);

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
    setCurrentAnnouncement(getGlobalAnnouncement());
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

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;

    const newAnnouncement: GlobalAnnouncement = {
      id: `announcement-${Date.now()}`,
      title: announcementTitle,
      message: announcementMessage,
      type: announcementType,
      active: true,
      createdAt: new Date().toISOString(),
    };

    saveGlobalAnnouncement(newAnnouncement);
    setCurrentAnnouncement(newAnnouncement);
    setActionMessage('Aviso global publicado no topo do app dos alunos!');
    setAnnouncementTitle('');
    setAnnouncementMessage('');
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleRemoveAnnouncement = () => {
    saveGlobalAnnouncement(null);
    setCurrentAnnouncement(null);
    setActionMessage('Aviso global removido.');
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

  // Finance MRR Calculations
  const mrrEstimated = metrics.activeUsers * MONTHLY_SUBSCRIPTION_PRICE;
  const arrProjected = mrrEstimated * 12;
  const conversionRate = metrics.totalUsers > 0 ? ((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1) : '0';

  return (
    <div className="page" style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', paddingBottom: 120 }}>
      <div className="container" style={{ paddingTop: 20 }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-icon btn-ghost"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={26} color="var(--accent-orange)" />
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '0.04em', margin: 0, lineHeight: 1.1 }}>
                  SUPER ADMIN HUB
                </h1>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Gestão completa de usuários, finanças e anúncios do RYZE
              </p>
            </div>
          </div>

          <button
            onClick={fetchUsers}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>

        {/* Action Alert Banner */}
        {actionMessage && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-orange-dim)',
            border: '1px solid var(--accent-orange)',
            color: 'var(--accent-orange)',
            fontSize: 13,
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 20,
          }}>
            {actionMessage}
          </div>
        )}

        {/* Metrics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
          marginBottom: 28,
        }}>
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total Usuários</span>
              <Users size={18} color="#3b82f6" />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800 }}>{metrics.totalUsers}</div>
          </div>

          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Ativos VIP</span>
              <CheckCircle2 size={18} color="var(--accent-lime)" />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--accent-lime)' }}>{metrics.activeUsers}</div>
          </div>

          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Em Trial</span>
              <Clock size={18} color="var(--accent-orange)" />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--accent-orange)' }}>{metrics.trialUsers}</div>
          </div>

          {/* MRR Card */}
          <div className="glass-card" style={{ padding: 16, background: 'linear-gradient(135deg, rgba(200,255,0,0.08) 0%, rgba(200,255,0,0.02) 100%)', borderColor: 'rgba(200,255,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--accent-lime)', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>MRR Estimado</span>
              <DollarSign size={18} color="var(--accent-lime)" />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--accent-lime)' }}>
              R$ {mrrEstimated.toFixed(2)}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
              Taxa de conversão: {conversionRate}%
            </div>
          </div>
        </div>

        {/* Global Broadcast Announcement Manager */}
        <div className="glass-card mb-8" style={{ padding: 20, marginBottom: 28, border: '1px solid var(--border-medium)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Megaphone size={20} color="var(--accent-orange)" />
            <h3 style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 16, margin: 0 }}>
              Transmissão de Avisos Globais no App
            </h3>
          </div>

          {currentAnnouncement && (
            <div style={{
              padding: 14,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--accent-orange)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📣 [Aviso Ativo] {currentAnnouncement.title}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {currentAnnouncement.message}
                </div>
              </div>
              <button
                onClick={handleRemoveAnnouncement}
                className="btn btn-danger btn-sm"
                style={{ fontSize: 11 }}
              >
                Remover
              </button>
            </div>
          )}

          <form onSubmit={handleSaveAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 12 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Título do aviso (ex: '🔥 Novo Treino de Pernas Disponível!')"
                value={announcementTitle}
                onChange={e => setAnnouncementTitle(e.target.value)}
              />
              <select
                className="form-input"
                value={announcementType}
                onChange={e => setAnnouncementType(e.target.value as any)}
              >
                <option value="info">Info (Azul)</option>
                <option value="warning">Aviso (Laranja)</option>
                <option value="success">Novidade (Verde)</option>
              </select>
            </div>

            <textarea
              className="form-input"
              rows={2}
              placeholder="Mensagem completa para exibir no app de todos os usuários..."
              value={announcementMessage}
              onChange={e => setAnnouncementMessage(e.target.value)}
              style={{ resize: 'none' }}
            />

            <button
              type="submit"
              className="btn btn-primary"
              style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px' }}
            >
              <Send size={14} />
              Publicar Broadcast no App
            </button>
          </form>
        </div>

        {/* Filters & Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 42, width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {(['all', 'active', 'trial', 'expired'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${statusFilter === st ? 'var(--accent-orange)' : 'var(--border-subtle)'}`,
                  background: statusFilter === st ? 'var(--accent-orange-dim)' : 'var(--bg-card)',
                  color: statusFilter === st ? 'var(--accent-orange)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                {st === 'all' ? 'Todos' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Users List Table Container */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-medium)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>
                  <th style={{ padding: '14px 16px' }}>Usuário</th>
                  <th style={{ padding: '14px 16px' }}>Status Acesso</th>
                  <th style={{ padding: '14px 16px' }}>Cargo</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Ações Rápidas</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                      Carregando usuários...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-medium)' }} />
                          ) : (
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--accent-lime)' }}>
                              {(user.full_name || user.email || 'U')[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{user.full_name || 'Usuário Sem Nome'}</span>
                              {user.is_admin && (
                                <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: 9, fontWeight: 900, border: '1px solid rgba(245,158,11,0.3)' }}>
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          background: user.subscription_status === 'active' ? 'var(--accent-lime-dim)' : user.subscription_status === 'trial' ? 'var(--accent-orange-dim)' : 'rgba(239,68,68,0.15)',
                          color: user.subscription_status === 'active' ? 'var(--accent-lime)' : user.subscription_status === 'trial' ? 'var(--accent-orange)' : '#ef4444',
                          border: `1px solid ${user.subscription_status === 'active' ? 'var(--accent-lime)' : user.subscription_status === 'trial' ? 'var(--accent-orange)' : '#ef4444'}`,
                        }}>
                          {user.subscription_status === 'active' && <CheckCircle2 size={12} />}
                          {user.subscription_status === 'trial' && <Clock size={12} />}
                          {user.subscription_status}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => handleToggleAdmin(user.id, !!user.is_admin)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 11,
                            fontWeight: 700,
                            border: `1px solid ${user.is_admin ? 'rgba(245,158,11,0.4)' : 'var(--border-subtle)'}`,
                            background: user.is_admin ? 'rgba(245,158,11,0.15)' : 'var(--bg-elevated)',
                            color: user.is_admin ? '#f59e0b' : 'var(--text-muted)',
                            cursor: 'pointer',
                          }}
                        >
                          {user.is_admin ? 'Admin' : 'Usuário'}
                        </button>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            onClick={() => setSelectedUser(user)}
                            title="Ver Ficha e Anamnese do Atleta"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: 11 }}
                          >
                            <Eye size={13} />
                            <span>Ver Ficha</span>
                          </button>

                          {user.subscription_status !== 'active' && (
                            <button
                              onClick={() => handleStatusChange(user.id, 'active')}
                              title="Ativar Acesso VIP"
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', fontSize: 11, color: 'var(--accent-lime)', borderColor: 'var(--accent-lime)' }}
                            >
                              <UserCheck size={13} />
                              <span>Ativar VIP</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleExtendTrial(user.id)}
                            title="Estender Trial +30 Dias"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: 11, color: 'var(--accent-orange)', borderColor: 'var(--accent-orange)' }}
                          >
                            <CalendarPlus size={13} />
                            <span>+30d</span>
                          </button>

                          {user.subscription_status === 'active' && (
                            <button
                              onClick={() => handleStatusChange(user.id, 'expired')}
                              title="Revogar Acesso VIP"
                              className="btn btn-danger btn-sm"
                              style={{ padding: '4px 8px', fontSize: 11 }}
                            >
                              <UserX size={13} />
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

        {/* Modal / Drawer: Athlete Profile & History Details */}
        {selectedUser && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(8,8,14,0.85)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
          }}>
            <div className="glass-card" style={{ maxWidth: 540, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 24, border: '1px solid var(--border-medium)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--accent-lime)' }}>
                      {(selectedUser.full_name || selectedUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 18, margin: 0 }}>
                      {selectedUser.full_name || 'Atleta RYZE'}
                    </h3>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedUser.email}</div>
                  </div>
                </div>

                <button onClick={() => setSelectedUser(null)} className="btn btn-icon btn-ghost">✕</button>
              </div>

              {/* Anamnese Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Idade & Peso</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{currentAppProfile?.age || 36} anos • {currentAppProfile?.weight || 75} kg</div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Nível Musculação</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2, textTransform: 'capitalize', color: 'var(--accent-orange)' }}>
                    {currentAppProfile?.experienceLevel || 'intermediario'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Corrida & Pace</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2, color: 'var(--accent-cyan)' }}>
                    {currentAppProfile?.runnerLevel || 'iniciante'} ({currentAppProfile?.currentPace || '6:00/km'})
                  </div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Frequência</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{currentAppProfile?.daysPerWeek || 4} dias/semana</div>
                </div>
              </div>

              {/* Training Overview */}
              <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-lime)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Status do Treino Atual
                </h4>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Semana atual: {weekPlan?.weekNumber || 1} • {logs.length} treinos concluídos no histórico.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setActionMessage('Plano do atleta re-gerado com sucesso!');
                    setTimeout(() => setActionMessage(null), 3000);
                  }}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  <Sparkles size={14} /> Re-gerar Treino do Atleta
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
