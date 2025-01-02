import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Layout.module.css';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <header className={styles['header']}>
        <div className={styles['headerContent']}>
          <Link to="/" className={styles['logo']}>
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="white"
              style={{ opacity: 0.9 }}
            >
              <path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V8h14v12z"/>
            </svg>
            <span className={styles['logoText']}>Office Booking</span>
          </Link>

          <nav className={styles['nav']}>
            <Link
              to="/"
              className={`${styles['navLink']} ${location.pathname === '/' ? styles['active'] : ''}`}
            >
              Home
            </Link>
            <Link
              to="/bookings"
              className={`${styles['navLink']} ${location.pathname === '/bookings' ? styles['active'] : ''}`}
            >
              Bookings
            </Link>
            <Link
              to="/profile"
              className={`${styles['navLink']} ${location.pathname === '/profile' ? styles['active'] : ''}`}
            >
              Profile
            </Link>
            <Link
              to="/admin"
              className={`${styles['navLink']} ${location.pathname === '/admin' ? styles['active'] : ''}`}
            >
              Admin Panel
            </Link>
            <button 
              onClick={handleSignOut}
              className={styles['signOutButton']}
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>

      <main className={styles['mainContent']}>
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;