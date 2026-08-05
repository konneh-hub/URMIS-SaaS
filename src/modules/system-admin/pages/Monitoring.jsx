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

function healthTone(status) {
  switch (status) {
    case 'OK': return 'success';
    case 'WARNING': return 'warning';
    case 'CRITICAL': return 'danger';
    default: return 'neutral';
  }
}

export default function Monitoring() {
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/admin/platform/health-checks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) setChecks(body.data);
          else setError(body.message || 'Failed to load health checks');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const ok = checks.filter((c) => c.status === 'OK').length;
  const warning = checks.filter((c) => c.status === 'WARNING').length;
  const critical = checks.filter((c) => c.status === 'CRITICAL').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Operations"
          title="Monitoring"
          description="System health, API, database, and infrastructure monitoring."
          badge={<Badge tone={critical > 0 ? 'danger' : warning > 0 ? 'warning' : 'success'}>{critical > 0 ? 'Issues found' : warning > 0 ? 'Attention' : 'All systems operational'}</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-4">
          <MetricTile title="Checks" value={ok} description="Healthy components" badgeTone="success" badge="OK" />
          <MetricTile title="Warnings" value={warning} description="Needs attention" badgeTone="warning" badge="Watch" />
          <MetricTile title="Critical" value={critical} description="Action required" badgeTone="danger" badge="Critical" />
          <MetricTile title="Total" value={checks.length} description="Monitored components" badge="All" />
        </div>

        <Card title="Health checks" description="Latest status of platform components.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading health checks...</p>
          ) : (
            <Table
              columns={[
                { header: 'Category', accessor: 'category', render: (value) => <Badge tone="info">{value}</Badge> },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={healthTone(value)}>{value}</Badge> },
                { header: 'Details', accessor: 'details' },
                { header: 'Checked', accessor: 'checkedAt', render: (value) => value ? new Date(value).toLocaleString() : '—' },
              ]}
              rows={checks}
              emptyText="No health checks recorded yet."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
