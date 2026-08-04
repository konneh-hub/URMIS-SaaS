"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    // store user in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', userData?.accessToken || '');
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      // call backend to clear refresh cookie
      const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
      fetch(`${base}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    }
  };

  useEffect(() => {
    // on mount, try to hydrate user from /api/auth/me
    async function hydrate() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) return;
        const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
        const resp = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } , credentials: 'include'});
        if (!resp.ok) return;
        const body = await resp.json();
        if (body?.success) {
          setUser(body.data);
          setIsAuthenticated(true);
        }
      } catch (e) {
        // ignore
      }
    }
    hydrate();
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated, login, logout }),
    [user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
