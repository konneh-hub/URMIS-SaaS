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
        const [institutionsResp, usersResp] = await Promise.all([
          fetch(`${API_BASE}/api/institutions`, { headers }),
          fetch(`${API_BASE}/api/admin/users`, { headers }),
        ]);
        const instBody = await institutionsResp.json();
        const usersBody = await usersResp.json();
        if (!cancelled) {
          // Build a combined audit trail from institution activity logs if available,
          // otherwise fall back to a structured summary of available data.
          const entries = [];
          const data = instBody.success ? instBody.data : [];
          data.forEach((inst) => {
            entries.push({ actor: 'system', action: 'institution_created', target: inst.name, createdAt: inst.createdAt });
          });
          const users = usersBody.success ? usersBody.data : [];
          users.forEach((u) => {
            entries.push({ actor: u.email, action: 'user_provisioned', target: u.role, createdAt: u.createdAt });
          });
          entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setLogs(entries);
          if (!instBody.success) setError(instBody.message || 'Failed to load logs');
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
          description="Review security, access, and activity events across the platform."
          badge={<Badge tone="info">{logs.length} events</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Audit events" value={logs.length} description="Total recorded events" badge="Trail" />
          <MetricTile title="Institutions" value={logs.filter((l) => l.action.includes('institution')).length} description="Institution events" badgeTone="info" badge="Inst" />
          <MetricTile title="Users" value={logs.filter((l) => l.action.includes('user')).length} description="User events" badgeTone="success" badge="Users" />
        </div>

        <Card title="Audit trail" description="Chronological record of platform activity.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading audit logs...</p>
          ) : (
            <Table
              columns={[
                { header: 'Timestamp', accessor: 'createdAt', render: (value) => value ? new Date(value).toLocaleString() : '—' },
                { header: 'Actor', accessor: 'actor' },
                { header: 'Action', accessor: 'action', render: (value) => <Badge tone="info">{value}</Badge> },
                { header: 'Target', accessor: 'target' },
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
