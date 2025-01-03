import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './common';
import { UserRole } from '@office-booking-monorepo/types';
import styles from './AdminLayout.module.css';

const AdminUserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles['adminLayoutFlexRow']}>
      <div className={styles['adminLayoutUserInfo']}>
        <div className={styles['adminLayoutUserName']}>
          {user?.firstName} {user?.lastName}
        </div>
        <div className={styles['adminLayoutUserRole']}>
          {user?.role === UserRole.ADMIN ? 'Administrator' : 'Manager'}
        </div>
      </div>
      <Button
        variant="secondary"
        onClick={handleLogout}
        className={styles['adminLayoutSignOutButton']}
      >
        Sign out
      </Button>
    </div>
  );
};

const AdminLayout = () => {
  const location = useLocation();

  const adminNavLinks = [
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/cabins', label: 'Cabins' },
    { to: '/admin/bookings', label: 'Bookings' },
    { to: '/admin/payments', label: 'Payments' },
  ];

  const isActiveLink = (path: string) => location.pathname === path;

  return (
    <div className={styles['adminLayoutContainer']}>
      <header className={styles['adminLayoutHeader']}>
        <div className={styles['adminLayoutHeaderContent']}>
          <div className={styles['adminLayoutNavGroup']}>
            <Link to="/admin" className={styles['adminLayoutLogo']}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="white"
                className={styles['adminLayoutLogoIcon']}
              >
                <path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V8h14v12z" />
              </svg>
              <span className={styles['adminLayoutLogoText']}>
                Admin Panel
              </span>
            </Link>

            <nav className={styles['adminLayoutNav']}>
              {adminNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`${styles['adminLayoutNavLink']} ${
                    isActiveLink(link.to)
                      ? styles['adminLayoutNavLinkActive']
                      : styles['adminLayoutNavLinkInactive']
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className={styles['adminLayoutHeaderRight']}>
            <Link
              to="/"
              className={styles['adminLayoutBackToSite']}
            >
              Back to Site
            </Link>
            <AdminUserMenu />
          </div>
        </div>
      </header>

      <main className={styles['adminLayoutContent']}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
