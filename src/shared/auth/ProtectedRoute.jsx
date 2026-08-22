"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function ProtectedRoute({ children, permission = null, roles = null, fallback = null }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/dashboard')}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return <div className="flex min-h-[40vh] items-center justify-center p-6 text-sm text-slate-500">Checking your secure session…</div>;
  }

  if (!isAuthenticated) return fallback || null;

  if (roles && !hasRole(roles)) {
    return fallback || <div className="p-6 text-sm text-slate-600">You do not have access to this area.</div>;
  }

  if (permission && !hasPermission(permission)) {
    return fallback || <div className="p-6 text-sm text-slate-600">You do not have permission to access this section.</div>;
  }

  return <>{children}</>;
}
