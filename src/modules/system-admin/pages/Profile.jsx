"use client";

import React from 'react';
import { useAuth } from '../../../shared/auth/AuthProvider';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';

export default function Profile() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Account"
          title="Profile"
          description="Manage your personal account details."
          badge={<Badge tone="info">{user?.role || 'User'}</Badge>}
        />

        <div className="max-w-3xl">
          <Card title="Account information" description="Your profile details as they appear on the platform.">
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              <Input label="Full name" defaultValue={user?.name || ''} readOnly />
              <Input label="Email" defaultValue={user?.email || ''} readOnly />
            </div>
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              <Input label="Role" defaultValue={user?.role || ''} readOnly />
              <Input label="Institution ID" defaultValue={user?.institution_id || '—'} readOnly />
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" size="sm">Edit profile</Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
