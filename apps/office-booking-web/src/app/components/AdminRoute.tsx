import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '@office-booking-monorepo/types';

export interface AdminRouteProps {
  children: React.ReactNode;
  requiredRoles: UserRole[];
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  requiredRoles 
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !requiredRoles.includes(user.role as UserRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};