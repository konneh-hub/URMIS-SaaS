"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../shared/auth/AuthProvider';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import Card from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';

export default function Logout() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    const timer = setTimeout(() => router.push('/login'), 800);
    return () => clearTimeout(timer);
  }, [logout, router]);

  return (
    <DashboardLayout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card title="Signing out" description="You are being securely signed out of the platform.">
          <div className="flex items-center justify-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
            <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>Go to login</Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
