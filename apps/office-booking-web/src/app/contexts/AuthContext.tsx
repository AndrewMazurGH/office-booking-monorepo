import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole } from '@office-booking-monorepo/types';
import api from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  isManager: () => boolean;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return {
      isAuthenticated: !!token,
      user
    };
  });

  const login = useCallback(async (email: string, password: string) => {
    try {
      // Login request
      const { data: tokens } = await api.post<LoginResponse>('/api/auth/login', {
        email,
        password
      });

      // Store tokens
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);

      // Set token in axios defaults
      api.defaults.headers.common['Authorization'] = `Bearer ${tokens.access_token}`;

      // Fetch user data
      const { data: userData } = await api.get<User>('/api/users/me');

      // Store user data
      localStorage.setItem('user', JSON.stringify(userData));
      setAuthState({
        isAuthenticated: true,
        user: userData
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setAuthState({
      isAuthenticated: false,
      user: null
    });
  }, []);

  const isAdmin = useCallback(() => {
    return authState.user?.role === UserRole.ADMIN;
  }, [authState.user]);

  const isManager = useCallback(() => {
    return authState.user?.role === UserRole.MANAGER;
  }, [authState.user]);

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      isAdmin,
      isManager
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}