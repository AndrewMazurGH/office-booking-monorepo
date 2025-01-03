// src/app/components/AdminLayout.tsx
import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './common';
import { UserRole } from '@office-booking-monorepo/types';

const AdminUserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex items-center gap-4">
      <div className="text-white">
        <div className="text-sm opacity-90">
          {user?.firstName} {user?.lastName}
        </div>
        <div className="text-xs opacity-75">
          {user?.role === UserRole.ADMIN ? 'Administrator' : 'Manager'}
        </div>
      </div>
      <Button 
        variant="secondary" 
        onClick={handleLogout}
        className="text-sm"
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-indigo-800 to-indigo-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link to="/admin" className="flex items-center gap-2">
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="white"
                  className="opacity-90"
                >
                  <path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V8h14v12z"/>
                </svg>
                <span className="text-white font-semibold text-xl">
                  Admin Panel
                </span>
              </Link>

              <nav className="flex items-center gap-1">
                {adminNavLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActiveLink(link.to)
                        ? 'bg-white/15 text-white'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-white/80 hover:text-white text-sm font-medium px-3 py-2"
              >
                Back to Site
              </Link>
              <AdminUserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;