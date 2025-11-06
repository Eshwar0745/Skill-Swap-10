"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  averageRating?: number;
  reviewsCount?: number;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  ready: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  refresh: () => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const isAuthenticated = !!user && !!token;

  const setAccessToken = (t: string | null) => {
    setToken(t);
    if (typeof window === 'undefined') return;
    if (t) localStorage.setItem('accessToken', t);
    else localStorage.removeItem('accessToken');
  };

  const hydrate = async () => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (stored) setToken(stored);
    try {
      const me = await api.auth.me();
      setUser(me.user);
      setReady(true);
      return;
    } catch (e: any) {
      // try refresh
      try {
        const r = await api.auth.refresh();
        setAccessToken(r.token);
        const me = await api.auth.me();
        setUser(me.user);
      } catch {
        setUser(null);
        setAccessToken(null);
      } finally {
        setReady(true);
      }
    }
  };

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const { token: t, user } = await api.auth.login({ email, password });
    setUser(user);
    setAccessToken(t);
  };

  const register = async (name: string, email: string, password: string) => {
    const { token: t, user } = await api.auth.register({ name, email, password });
    setUser(user);
    setAccessToken(t);
  };

  const refresh = async () => {
    try {
      const r = await api.auth.refresh();
      setAccessToken(r.token);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {}
    setUser(null);
    setAccessToken(null);
  };

  const value = useMemo(
    () => ({ user, token, ready, isAuthenticated, login, register, refresh, logout }),
    [user, token, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
