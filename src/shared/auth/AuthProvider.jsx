"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

async function parseResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.success === false) {
    const error = new Error(body?.message || 'Request failed');
    error.status = response.status;
    throw error;
  }
  return body;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    const body = await parseResponse(response);
    setAccessToken(body.data.accessToken);
    return body.data.accessToken;
  }, []);

  const request = useCallback(async (path, options = {}, retry = true) => {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

    let response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === 401 && retry) {
      try {
        const token = await refresh();
        headers.set('Authorization', `Bearer ${token}`);
        response = await fetch(`${API_BASE}${path}`, {
          ...options,
          headers,
          credentials: 'include',
        });
      } catch {
        setUser(null);
        setAccessToken(null);
        setIsAuthenticated(false);
      }
    }

    return response;
  }, [accessToken, refresh]);

  const login = useCallback((userData) => {
    const token = userData?.accessToken || null;
    const nextUser = userData?.user || userData || null;
    setAccessToken(token);
    setUser(nextUser);
    setIsAuthenticated(Boolean(nextUser && token));
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } finally {
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        const token = await refresh();
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        const body = await parseResponse(response);
        if (!cancelled) {
          setUser(body.data);
          setIsAuthenticated(true);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setAccessToken(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    hydrate();
    return () => { cancelled = true; };
  }, [refresh]);

  const hasRole = useCallback((roles) => {
    const list = Array.isArray(roles) ? roles : [roles];
    const normalized = list.filter(Boolean).map((role) => String(role).toUpperCase());
    return normalized.includes(String(user?.role || '').toUpperCase())
      || (user?.assignedRoles || []).some((role) => normalized.includes(String(role).toUpperCase()));
  }, [user]);

  const hasPermission = useCallback((permission) => {
    if (!permission) return true;
    return (user?.permissions || []).includes(permission);
  }, [user]);

  const value = useMemo(() => ({
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refresh,
    request,
    hasRole,
    hasPermission,
  }), [user, accessToken, isAuthenticated, isLoading, login, logout, refresh, request, hasRole, hasPermission]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
