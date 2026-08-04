"use client";

import React from 'react';
import { useAuth } from './AuthProvider';
import { hasPermission } from '../permissions/permissions';

export default function ProtectedRoute({ children, permission = null, fallback = null }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback || <div className="p-6 text-sm text-slate-600">Please sign in to continue.</div>}</>;
  }

  if (permission && !hasPermission(user, permission)) {
    return <>{fallback || <div className="p-6 text-sm text-slate-600">You do not have access to this section.</div>}</>;
  }

  return <>{children}</>;
}
