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

function statusTone(status) {
  switch (status) {
    case 'COMPLETED': return 'success';
    case 'APPROVED': return 'info';
    case 'PENDING': return 'warning';
    case 'REJECTED': return 'danger';
    default: return 'neutral';
  }
}

export default function TranscriptManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/admin/platform/transcript-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) setRequests(body.data);
          else setError(body.message || 'Failed to load transcript requests');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/platform/transcript-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success) setRequests(body.data);
    } catch (e) { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function transition(id, action) {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE}/api/admin/platform/transcript-requests/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      refresh();
    } catch (e) { /* ignore */ }
  }

  const pending = requests.filter((r) => r.status === 'PENDING').length;
  const completed = requests.filter((r) => r.status === 'COMPLETED').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Records"
          title="Transcript Management"
          description="Handle transcript generation and review."
          badge={<Badge tone="info">{requests.length} requests</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Requests" value={requests.length} description="Total requests" badge="All" />
          <MetricTile title="Pending" value={pending} description="Awaiting action" badgeTone="warning" badge="Queue" />
          <MetricTile title="Completed" value={completed} description="Generated & issued" badgeTone="success" badge="Done" />
        </div>

        <Card title="Transcript requests" description="Manage transcript request lifecycle.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading transcript requests...</p>
          ) : (
            <Table
              columns={[
                { header: 'Student', accessor: 'student', render: (_v, row) => row.student ? `${row.student.firstName} ${row.student.lastName}` : '—' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value)}>{value}</Badge> },
                { header: 'Requested at', accessor: 'requestedAt', render: (value) => value ? new Date(value).toLocaleDateString() : '—' },
                { header: 'Actions', accessor: 'actions', render: (_v, row) => (
                  <div className="flex flex-wrap gap-2">
                    {row.status === 'PENDING' ? <Button variant="success" size="sm" onClick={() => transition(row.id, 'approve')}>Approve</Button> : null}
                    {row.status === 'APPROVED' ? <Button variant="primary" size="sm" onClick={() => transition(row.id, 'generate')}>Generate</Button> : null}
                  </div>
                ) },
              ]}
              rows={requests}
              emptyText="No transcript requests yet."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
