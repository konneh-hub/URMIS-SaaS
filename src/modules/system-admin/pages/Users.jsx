"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Table from '../../../shared/components/ui/Table';
import Badge from '../../../shared/components/ui/Badge';
import MetricTile from '../../../shared/components/ui/MetricTile';
import Alert from '../../../shared/components/ui/Alert';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

function roleTone(role) {
  if (role === 'SYSTEM_ADMIN') return 'warning';
  if (role === 'UNIVERSITY_ADMIN') return 'info';
  if (role === 'STUDENT') return 'neutral';
  return 'success';
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) setUsers(body.data);
          else setError(body.message || 'Failed to load users');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Access Control"
          title="Users"
          description="Manage all platform users and their roles."
          badge={<Badge tone="info">{users.length} users</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Total users" value={users.length} description="All accounts" badge="All" />
          <MetricTile title="Active" value={users.filter((u) => u.isActive).length} description="Enabled accounts" badgeTone="success" badge="Live" />
          <MetricTile title="Inactive" value={users.filter((u) => !u.isActive).length} description="Disabled accounts" badgeTone="warning" badge="Off" />
        </div>

        <Card title="User directory" description="Every account on the platform.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading users...</p>
          ) : (
            <Table
              columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Email', accessor: 'email' },
                { header: 'Role', accessor: 'role', render: (value) => <Badge tone={roleTone(value)}>{value}</Badge> },
                { header: 'Status', accessor: 'isActive', render: (value) => <Badge tone={value ? 'success' : 'warning'}>{value ? 'Active' : 'Inactive'}</Badge> },
              ]}
              rows={users}
              emptyText="No users found."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
