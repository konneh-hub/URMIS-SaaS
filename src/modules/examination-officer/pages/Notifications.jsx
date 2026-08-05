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

function statusTone(status) {
  switch (status) {
    case 'SENT': return 'success';
    case 'READ': return 'info';
    case 'PENDING': return 'warning';
    case 'FAILED': return 'danger';
    default: return 'neutral';
  }
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/admin/platform/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) setNotifications(body.data);
          else setError(body.message || 'Failed to load notifications');
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
          eyebrow="Notifications"
          title="Notifications"
          description="Review notifications and alerts sent to academic users."
          badge={<Badge tone="info">{notifications.length} notices</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Notifications" value={notifications.length} description="Total notifications" badge="Total" />
          <MetricTile title="Sent" value={notifications.filter((item) => item.status === 'SENT').length} description="Delivered" badgeTone="success" badge="Sent" />
          <MetricTile title="Pending" value={notifications.filter((item) => item.status === 'PENDING').length} description="Awaiting" badgeTone="warning" badge="Pending" />
        </div>

        <Card title="Notification list" description="Notifications created or managed by the exam office.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading notifications...</p>
          ) : (
            <Table
              columns={[
                { header: 'Title', accessor: 'title' },
                { header: 'Channel', accessor: 'channel' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value)}>{value}</Badge> },
                { header: 'Created', accessor: 'createdAt', render: (value) => value ? new Date(value).toLocaleDateString() : '—' },
              ]}
              rows={notifications}
              emptyText="No notifications found."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
