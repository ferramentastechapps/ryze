import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, TrendingUp, User } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 60) {
        // Always show nav near top of page
        setVisible(true);
      } else if (currentScrollY > lastScrollY + 8) {
        // Scrolling DOWN -> Hide nav
        setVisible(false);
      } else if (currentScrollY < lastScrollY - 8) {
        // Scrolling UP -> Show nav
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Hide nav on active workout route (/treino/...)
  if (location.pathname.startsWith('/treino/')) {
    return null;
  }

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Hoje' },
    { to: '/plano', icon: CalendarDays, label: 'Plano' },
    { to: '/progresso', icon: TrendingUp, label: 'Progresso' },
    { to: '/anamnese', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className={`nav-container ${visible ? 'visible' : 'hidden'}`}>
      <div className="nav-dock">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`nav-dock-item ${isActive ? 'active' : ''}`}
            >
              <div className="nav-icon-wrapper">
                <Icon size={19} strokeWidth={isActive ? 2.3 : 1.7} />
              </div>
              <span className="nav-dock-label">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
