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
    case 'PENDING': return 'warning';
    case 'APPROVED': return 'info';
    case 'COMPLETED': return 'success';
    case 'REJECTED': return 'danger';
    default: return 'neutral';
  }
}

export default function TranscriptRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadRequests() {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/platform/transcript-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success) setRequests(body.data);
      else setError(body.message || 'Failed to load transcript requests');
    } catch (e) {
      setError('Could not reach the platform API.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function transition(id, action) {
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/platform/transcript-requests/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (!body.success) throw new Error(body.message || 'Action failed');
      loadRequests();
    } catch (err) {
      setError(err.message || 'Action failed');
    }
  }

  const pending = requests.filter((r) => r.status === 'PENDING').length;
  const completed = requests.filter((r) => r.status === 'COMPLETED').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Transcripts"
          title="Transcript Requests"
          description="Review and process transcript requests from students."
          badge={<Badge tone="info">{requests.length} requests</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Pending" value={pending} description="Awaiting action" badgeTone="warning" badge="Pending" />
          <MetricTile title="Completed" value={completed} description="Fulfilled requests" badgeTone="success" badge="Done" />
          <MetricTile title="Total" value={requests.length} description="Total transcript requests" badge="Total" />
        </div>

        <Card title="Transcript requests" description="Manage transcript request lifecycle.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading transcript requests...</p>
          ) : (
            <Table
              columns={[
                { header: 'Student', accessor: 'student', render: (_value, row) => row.student ? `${row.student.firstName} ${row.student.lastName}` : '—' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value)}>{value}</Badge> },
                { header: 'Requested', accessor: 'requestedAt', render: (value) => value ? new Date(value).toLocaleDateString() : '—' },
                {
                  header: 'Actions',
                  accessor: 'actions',
                  render: (_value, row) => (
                    <div className="flex flex-wrap gap-2">
                      {row.status === 'PENDING' && (
                        <> 
                          <Button variant="success" size="sm" onClick={() => transition(row.id, 'approve')}>Approve</Button>
                          <Button variant="danger" size="sm" onClick={() => transition(row.id, 'reject')}>Reject</Button>
                        </>
                      )}
                      {row.status === 'APPROVED' && (
                        <Button variant="primary" size="sm" onClick={() => transition(row.id, 'generate')}>Generate</Button>
                      )}
                    </div>
                  ),
                },
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
