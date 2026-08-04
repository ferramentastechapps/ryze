import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, TrendingUp, User } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Hoje' },
    { to: '/plano', icon: Calendar, label: 'Plano' },
    { to: '/progresso', icon: TrendingUp, label: 'Progresso' },
  ];

  return (
    <nav className="nav">
      <div className="nav-inner">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              <span className="nav-label">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
