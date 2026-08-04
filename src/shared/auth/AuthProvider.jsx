"use client";

import React, { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const defaultUser = {
  id: 'demo-user',
  name: 'Demo User',
  email: 'demo@urmis.com',
  role: 'LECTURER',
  institution_id: 'inst-demo',
  permissions: [
    'VIEW_ASSIGNED_COURSES',
    'ENTER_RESULTS',
    'SUBMIT_RESULTS',
    'VIEW_RESULTS',
  ],
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

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
