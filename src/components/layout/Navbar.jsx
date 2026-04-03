import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, GitFork, User, LogOut, Sparkles, GitCompare, Menu, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import logo from '../../assets/logo.png';
import '../../styles/components/Navbar.css';

export default function Navbar() {
  const { logout } = useAuthStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/compare', label: 'Compare', icon: GitCompare },
    { to: '/insights', label: 'Insights', icon: Sparkles },
    { to: '/graph', label: 'Graph', icon: GitFork },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        <img src={logo} alt="Synapse" className="navbar-logo" />
      </Link>

      <div className="hidden md:flex navbar-desktop">
        {navLinks.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`navbar-link${active ? ' navbar-link--active' : ''}`}
            >
              <Icon size={15} />
              {label}
              {active && <span className="navbar-link-dot" />}
            </Link>
          );
        })}
        <button onClick={handleLogout} className="navbar-logout">
          <LogOut size={15} /> Logout
        </button>
      </div>

      <button
        className="md:hidden navbar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <div className="navbar-mobile-menu">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`navbar-mobile-link${active ? ' navbar-mobile-link--active' : ''}`}
              >
                <Icon size={16} /> {label}
              </Link>
            );
          })}
          <button
            onClick={() => { setMobileOpen(false); handleLogout(); }}
            className="navbar-mobile-logout"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}
