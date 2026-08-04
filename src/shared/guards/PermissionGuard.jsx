"use client";

import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { hasPermission } from '../permissions/permissions';

export default function PermissionGuard({ permission, children, fallback = null }) {
  const { user } = useAuth();

  if (!permission || hasPermission(user, permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
