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

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const resp = await fetch(`${API_BASE}/api/institutions`, { headers });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success && body.data.length > 0) {
            const inst = body.data[0];
            const auditResp = await fetch(`${API_BASE}/api/institutions/${inst.id}/audit-logs`, { headers });
            const auditBody = await auditResp.json();
            if (auditBody.success) setLogs(auditBody.data);
            else setError(auditBody.message || 'Failed to load audit logs');
          } else if (!body.success) {
            setError(body.message || 'Failed to load institution');
          }
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
          eyebrow="Compliance"
          title="Audit Logs"
          description="Review security, access, and activity events within your university."
          badge={<Badge tone="info">{logs.length} events</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Audit events" value={logs.length} description="Total recorded events" badge="Trail" />
          <MetricTile title="Institution events" value={logs.filter((l) => l.event || l.action).length} description="Recorded activities" badgeTone="info" badge="Events" />
          <MetricTile title="Actors" value={new Set(logs.map((l) => l.performedBy || l.actor)).size} description="Distinct actors" badgeTone="success" badge="Actors" />
        </div>

        <Card title="Audit trail" description="Chronological record of institution activity.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading audit logs...</p>
          ) : (
            <Table
              columns={[
                { header: 'Timestamp', accessor: 'createdAt', render: (value) => value ? new Date(value).toLocaleString() : '—' },
                { header: 'Event', accessor: 'event', render: (value) => <Badge tone="info">{value || '—'}</Badge> },
                { header: 'Details', accessor: 'details' },
                { header: 'Performed by', accessor: 'performedBy' },
              ]}
              rows={logs}
              emptyText="No audit events recorded yet."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
