// src/app/components/Layout.tsx
import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <header className="header">
        <div className="container header-content">
          <Link to="/" className="logo">
            <h1>Office Booking</h1>
          </Link>

          <nav className="nav-menu">
            <Link 
              to="/" 
              className={'nav-link ' + (location.pathname === '/' ? 'active' : '')}
            >
              Home
            </Link>
            <Link 
              to="/bookings" 
              className={'nav-link ' + (location.pathname === '/bookings' ? 'active' : '')}
            >
              Bookings
            </Link>
            <Link 
              to="/profile" 
              className={'nav-link ' + (location.pathname === '/profile' ? 'active' : '')}
            >
              Profile
            </Link>
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Link 
                to="/admin" 
                className={'nav-link ' + (location.pathname.startsWith('/admin') ? 'active' : '')}
              >
                Admin Panel
              </Link>
            )}
            <button onClick={handleLogout} className="button button-secondary">
              Sign out
            </button>
          </nav>
        </div>
      </header>

      <main className="container" style={{ padding: '2rem 0' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;