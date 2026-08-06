"use client";

import React, { useState } from 'react';
import { useAuth } from '../../../shared/auth/AuthProvider';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Alert from '../../../shared/components/ui/Alert';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ phone: user?.phone || '', address: user?.address || '' });
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  async function handleProfileSave(e) {
    e.preventDefault();
    setSaved(false);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile),
      });
      const body = await resp.json();
      if (body.success || resp.ok) setSaved(true);
      else setError(body.message || 'Failed to update profile');
    } catch (err) {
      setError('Could not reach the platform API.');
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setSaved(false);
    setError(null);
    if (password.next !== password.confirm) {
      setError('New password and confirmation do not match.');
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: password.current, newPassword: password.next }),
      });
      const body = await resp.json();
      if (body.success || resp.ok) {
        setSaved(true);
        setPassword({ current: '', next: '', confirm: '' });
      } else {
        setError(body.message || 'Failed to change password');
      }
    } catch (err) {
      setError('Could not reach the platform API.');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Account"
          title="Profile Settings"
          description="Manage your contact details and account security."
          badge={<Badge tone="info">{user?.role || 'Student'}</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}
        {saved ? <Alert title="Success" tone="success">Your changes have been saved.</Alert> : null}

        <div className="max-w-3xl space-y-4">
          <Card title="Contact details" description="Update your personal contact information.">
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                <Input label="Address" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="sm">Save changes</Button>
              </div>
            </form>
          </Card>

          <Card title="Change password" description="Update your account password.">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input label="Current password" type="password" value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} required />
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="New password" type="password" value={password.next} onChange={(e) => setPassword({ ...password, next: e.target.value })} required />
                <Input label="Confirm new password" type="password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} required />
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="sm">Update password</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
