// apps/office-booking-web/src/app/components/AdminRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '@office-booking-monorepo/types';

interface AdminRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const AdminRoute = ({ 
  children, 
  allowedRoles = [UserRole.ADMIN, UserRole.MANAGER] 
}: AdminRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user || !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};