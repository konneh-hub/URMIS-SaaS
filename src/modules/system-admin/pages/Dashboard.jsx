"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/auth/AuthProvider';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import MetricTile from '../../../shared/components/ui/MetricTile';
import Alert from '../../../shared/components/ui/Alert';
import NotificationPanel from '../../../shared/components/ui/NotificationPanel';
import Charts from '../../../shared/components/Charts';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function SystemAdminDashboard() {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [instResp, usersResp] = await Promise.all([
          fetch(`${API_BASE}/api/institutions`, { headers }),
          fetch(`${API_BASE}/api/admin/users`, { headers }),
        ]);
        const instBody = await instResp.json();
        const usersBody = await usersResp.json();
        if (!cancelled) {
          if (instBody.success) setInstitutions(instBody.data);
          if (usersBody.success) setUsers(usersBody.data);
          if (!instBody.success) setError(instBody.message || 'Failed to load data');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const active = institutions.filter((i) => i.status === 'ACTIVE').length;
  const suspended = institutions.filter((i) => i.status === 'SUSPENDED').length;
  const pending = institutions.filter((i) => i.status === 'PENDING').length;
  const admins = users.filter((u) => u.role === 'UNIVERSITY_ADMIN' || u.role === 'SYSTEM_ADMIN').length;
  const activeUsers = users.filter((u) => u.isActive).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="URMIS Platform"
          title={`Welcome back, ${user?.name || 'Administrator'}`}
          description="Platform-wide overview of institutions, users, and system health."
          badge={<Badge tone="info">System Administrator</Badge>}
          actions={(
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>Refresh</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        {!loading ? (
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <MetricTile title="Institutions" value={institutions.length} description="Total tenants" badge="All" />
            <MetricTile title="Active" value={active} description="Operating tenants" badgeTone="success" badge="Live" />
            <MetricTile title="Pending" value={pending} description="Awaiting activation" badgeTone="info" badge="Queue" />
            <MetricTile title="Suspended" value={suspended} description="On hold" badgeTone="warning" badge="Hold" />
            <MetricTile title="Platform users" value={users.length} description="All accounts" badgeTone="info" badge="Users" />
            <MetricTile title="Administrators" value={admins} description="Admin roles" badgeTone="success" badge="Admins" />
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[0.7fr_0.3fr]">
          <Card title="Platform analytics" description="Key metrics across the URMIS platform.">
            <Charts
              title="Platform activity"
              series={['Institutions', 'Users', 'Active', 'Admins']}
            />
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <MetricTile title="Active users" value={activeUsers} description="Enabled accounts" badgeTone="success" badge="Live" />
              <MetricTile title="Inactive users" value={users.length - activeUsers} description="Disabled accounts" badgeTone="warning" badge="Off" />
              <MetricTile title="Storage avg" value={`${institutions.length ? Math.round(institutions.reduce((s, i) => s + (i.storageUsedMb || 0), 0) / institutions.length) : 0} MB`} description="Per tenant" badgeTone="info" badge="Used" />
            </div>
          </Card>

          <NotificationPanel
            title="Platform alerts"
            items={[
              { title: 'New institution registered', message: 'A new tenant is awaiting activation.', time: 'Today' },
              { title: 'Subscription renewal due', message: 'A tenant subscription expires soon.', time: '3d' },
              { title: 'Security event logged', message: 'A security alert requires review.', time: '1h' },
            ]}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
