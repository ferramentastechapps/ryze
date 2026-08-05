import { useAuthStore } from '../store/authStore';
import { getTrialDaysRemaining } from '../services/subscriptionService';
import { openCustomerPortal } from '../services/subscriptionService';

export default function SubscriptionBadge() {
  const { user, authProfile, accessStatus } = useAuthStore();

  if (!authProfile || accessStatus === 'loading' || accessStatus === 'unauthenticated') {
    return null;
  }

  if (accessStatus === 'active') {
    return (
      <div
        id="subscription-badge-pro"
        title="Gerenciar assinatura"
        onClick={() => user && openCustomerPortal(user.id)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          background: 'rgba(200,255,0,0.12)',
          border: '1px solid rgba(200,255,0,0.3)',
          borderRadius: 100,
          padding: '4px 10px',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--accent-lime)',
          letterSpacing: '0.06em',
          fontFamily: 'var(--font-ui)',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        ✦ PRO
      </div>
    );
  }

  if (accessStatus === 'trial') {
    const daysLeft = getTrialDaysRemaining(authProfile);
    const isUrgent = daysLeft <= 7;

    return (
      <div
        id="subscription-badge-trial"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          background: isUrgent ? 'rgba(255,95,31,0.12)' : 'rgba(200,255,0,0.08)',
          border: `1px solid ${isUrgent ? 'rgba(255,95,31,0.3)' : 'rgba(200,255,0,0.2)'}`,
          borderRadius: 100,
          padding: '4px 10px',
          fontSize: 11,
          fontWeight: 700,
          color: isUrgent ? '#FF5F1F' : 'var(--text-muted)',
          letterSpacing: '0.04em',
          fontFamily: 'var(--font-ui)',
          whiteSpace: 'nowrap',
        }}
      >
        {isUrgent ? '⏰' : '✦'} TRIAL: {daysLeft}d
      </div>
    );
  }

  return null;
}
