"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Table from '../../../shared/components/ui/Table';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import MetricTile from '../../../shared/components/ui/MetricTile';
import Alert from '../../../shared/components/ui/Alert';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

function alertTone(severity) {
  switch (severity) {
    case 'CRITICAL': return 'danger';
    case 'HIGH': return 'danger';
    case 'MEDIUM': return 'warning';
    case 'LOW': return 'info';
    default: return 'neutral';
  }
}

export default function SecurityCenter() {
  const [alerts, setAlerts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [alertResp, sessionResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/platform/security-alerts`, { headers }),
          fetch(`${API_BASE}/api/admin/platform/sessions`, { headers }),
        ]);
        const alertBody = await alertResp.json();
        const sessionBody = await sessionResp.json();
        if (!cancelled) {
          if (alertBody.success) setAlerts(alertBody.data);
          if (sessionBody.success) setSessions(sessionBody.data);
          if (!alertBody.success) setError(alertBody.message || 'Failed to load alerts');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function resolveAlert(id) {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE}/api/admin/platform/security-alerts/${id}/resolve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const headers = { Authorization: `Bearer ${token}` };
      const resp = await fetch(`${API_BASE}/api/admin/platform/security-alerts`, { headers });
      const body = await resp.json();
      if (body.success) setAlerts(body.data);
    } catch (e) { /* ignore */ }
  }

  async function revokeSession(id) {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE}/api/admin/platform/sessions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (e) { /* ignore */ }
  }

  const openAlerts = alerts.filter((a) => !a.resolvedAt).length;
  const critical = alerts.filter((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Security"
          title="Security Center"
          description="Monitor security alerts and manage active user sessions."
          badge={<Badge tone={critical > 0 ? 'danger' : 'success'}>{critical > 0 ? `${critical} high priority` : 'No critical alerts'}</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Open alerts" value={openAlerts} description="Unresolved alerts" badgeTone="warning" badge="Open" />
          <MetricTile title="High priority" value={critical} description="Critical & high" badgeTone="danger" badge="Priority" />
          <MetricTile title="Active sessions" value={sessions.length} description="User sessions" badgeTone="info" badge="Live" />
        </div>

        <Card title="Security alerts" description="Anomalies and security events detected on the platform.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading security alerts...</p>
          ) : (
            <Table
              columns={[
                { header: 'Severity', accessor: 'severity', render: (value) => <Badge tone={alertTone(value)}>{value}</Badge> },
                { header: 'Type', accessor: 'type' },
                { header: 'Message', accessor: 'message' },
                { header: 'Status', accessor: 'resolvedAt', render: (value) => <Badge tone={value ? 'success' : 'warning'}>{value ? 'Resolved' : 'Open'}</Badge> },
                { header: 'Actions', accessor: 'actions', render: (_v, row) => (
                  !row.resolvedAt ? <Button variant="success" size="sm" onClick={() => resolveAlert(row.id)}>Resolve</Button> : null
                ) },
              ]}
              rows={alerts}
              emptyText="No security alerts recorded yet."
            />
          )}
        </Card>

        <Card title="Active sessions" description="Manage user sessions across the platform.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading sessions...</p>
          ) : (
            <Table
              columns={[
                { header: 'User', accessor: 'userId', render: (value) => value ? <code className="rounded bg-[var(--color-muted)] px-2 py-0.5 text-xs">{value.slice(0, 8)}</code> : '—' },
                { header: 'Last seen', accessor: 'lastSeenAt', render: (value) => value ? new Date(value).toLocaleString() : '—' },
                { header: 'Actions', accessor: 'actions', render: (_v, row) => (
                  <Button variant="danger" size="sm" onClick={() => revokeSession(row.id)}>Revoke</Button>
                ) },
              ]}
              rows={sessions}
              emptyText="No active sessions found."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
