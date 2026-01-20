import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '../types/models';
import * as AuthService from '../services/authService';
import { LoadingFallback } from '../components/LoadingFallback';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const current = await AuthService.getCurrentUser();
      if (active) {
        setUser(current || null);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { user: loggedUser } = await AuthService.login(email, password);
    setUser(loggedUser);
  };

  const register = async (name: string, email: string, password: string) => {
    const { user: newUser } = await AuthService.register(name, email, password);
    setUser(newUser);
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  const refresh = async () => {
    const current = await AuthService.getCurrentUser();
    setUser(current || null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refresh,
    }),
    [user, loading],
  );

  if (loading) {
    return <LoadingFallback message="Carregando sessão..." />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
