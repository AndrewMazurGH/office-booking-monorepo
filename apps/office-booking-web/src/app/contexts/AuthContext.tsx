import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@office-booking-monorepo/types';
import { AxiosError } from 'axios';
import api from '../services/api';

interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

interface UserProfileData {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfileData | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfileData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUserInfo();
    }
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await api.get<UserProfileData>('/api/users/me');
      // Handle the data directly since our axios interceptor returns response.data
      setUser(response.data || null);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login...');
      const response = await api.post<AuthResponse>('/api/auth/login', {
        email,
        password
      });

      // Handle the data directly since our axios interceptor returns response.data
      const authData = response.data;
      
      if (authData && authData.access_token && authData.refresh_token) {
        localStorage.setItem('access_token', authData.access_token);
        localStorage.setItem('refresh_token', authData.refresh_token);
        await fetchUserInfo();
      } else {
        throw new Error('Invalid server response');
      }
    } catch (error) {
      console.error('Login error:', error);

      if ((error as AxiosError).response?.status === 404) {
        throw new Error('Login service is currently unavailable');
      }

      if ((error as AxiosError).response?.status === 401) {
        throw new Error('Invalid email or password');
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('An error occurred during login');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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