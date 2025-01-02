// apps/office-booking-web/src/app/components/AdminLayout.tsx
import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/cabins', label: 'Cabins' },
    { path: '/admin/bookings', label: 'Bookings' },
    { path: '/admin/payments', label: 'Payments' },
  ];

  return (
    <div className={styles['adminContainer']}>
      <header className={styles['header']}>
        <div className={styles['headerContent']}>
          <Link to="/admin" className={styles['logo']}>
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="white"
              style={{ opacity: 0.9 }}
            >
              <path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V8h14v12z"/>
            </svg>
            <span className={styles['logoText']}>Admin Panel</span>
          </Link>

          <div className={styles['nav']}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles['navLink']} ${
                  location.pathname === item.path ? styles['active'] : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button onClick={handleSignOut} className={styles['signOutButton']}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className={styles['content']}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;