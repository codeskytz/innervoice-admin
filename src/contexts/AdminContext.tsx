import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import adminApi from '../services/api';
import type { User } from '../services/api';

interface AdminContextType {
  admin: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      // Verify token is still valid
      adminApi
        .getMe(savedToken)
        .then((response) => {
          setAdmin(response.user);
        })
        .catch(() => {
          localStorage.removeItem('admin_token');
          setToken(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await adminApi.login(email, password);
      setToken(response.token);
      setAdmin(response.user);
      localStorage.setItem('admin_token', response.token);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await adminApi.logout(token);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('admin_token');
  };

  const value: AdminContextType = {
    admin,
    token,
    isLoading,
    isAuthenticated: !!token && !!admin,
    login,
    logout,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
