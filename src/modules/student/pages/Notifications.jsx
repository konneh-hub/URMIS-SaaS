"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/auth/AuthProvider';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Table from '../../../shared/components/ui/Table';
import Badge from '../../../shared/components/ui/Badge';
import MetricTile from '../../../shared/components/ui/MetricTile';
import Alert from '../../../shared/components/ui/Alert';
import NotificationPanel from '../../../shared/components/ui/NotificationPanel';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

function statusTone(status) {
  switch (status) {
    case 'READ': return 'info';
    case 'UNREAD': return 'warning';
    case 'SENT': return 'success';
    default: return 'neutral';
  }
}

export default function Notifications() {
  const { user } = useAuth();
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
          if (body.success) setNotifications(body.data || []);
          else setNotifications(Array.isArray(body) ? body : []);
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  const unread = notifications.filter((n) => n.status === 'UNREAD').length;
  const read = notifications.filter((n) => n.status === 'READ').length;

  const recentPanelItems = notifications.slice(0, 5).map((n) => ({
    title: n.title,
    message: n.message,
    time: n.createdAt ? new Date(n.createdAt).toLocaleString() : '—',
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Alerts"
          title="Notifications"
          description="Broadcasts, alerts, and messages relevant to your student account."
          badge={<Badge tone="info">{notifications.length} notifications</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Total" value={notifications.length} description="All notifications" badge="All" />
          <MetricTile title="Unread" value={unread} description="Awaiting review" badgeTone="warning" badge="Unread" />
          <MetricTile title="Read" value={read} description="Already viewed" badgeTone="success" badge="Read" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.6fr_0.4fr]">
          <Card title="Notification log" description="Messages sent to your student workspace.">
            {loading ? (
              <p className="text-sm text-[var(--color-muted-text)]">Loading notifications...</p>
            ) : (
              <Table
                columns={[
                  { header: 'Title', accessor: 'title' },
                  { header: 'Channel', accessor: 'channel', render: (value) => <Badge tone="info">{value || '—'}</Badge> },
                  { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value || 'UNREAD')}>{value || 'UNREAD'}</Badge> },
                ]}
                rows={notifications}
                emptyText="No notifications recorded yet."
              />
            )}
          </Card>

          <NotificationPanel title="Recent notifications" items={recentPanelItems} />
        </div>
      </div>
    </DashboardLayout>
  );
}
