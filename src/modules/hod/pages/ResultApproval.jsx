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
    case 'PUBLISHED': return 'success';
    case 'APPROVED':
    case 'VERIFIED': return 'info';
    case 'PENDING': return 'warning';
    case 'REJECTED': return 'danger';
    default: return 'neutral';
  }
}

export default function ResultApproval() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/platform/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success) setResults(body.data);
      else setError(body.message || 'Failed to load results');
    } catch (e) {
      setError('Could not reach the platform API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  async function approveResult(id) {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE}/api/admin/platform/results/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r)));
    } catch (e) {
      setError('Could not approve selected result.');
    }
  }

  const pending = results.filter((r) => r.status === 'PENDING').length;
  const approved = results.filter((r) => r.status === 'APPROVED').length;
  const published = results.filter((r) => r.status === 'PUBLISHED').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Department approval"
          title="Result Approval"
          description="Approve verified departmental results before they progress to the dean."
          badge={<Badge tone="info">{results.length} records</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Pending" value={pending} description="Awaiting approval" badgeTone="warning" badge="Queue" />
          <MetricTile title="Approved" value={approved} description="Approved by HOD" badgeTone="success" badge="Approved" />
          <MetricTile title="Published" value={published} description="Finalized results" badgeTone="info" badge="Published" />
        </div>

        <Card title="Approval queue" description="Department results that require your approval.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading results...</p>
          ) : (
            <Table
              columns={[
                { header: 'Student', accessor: 'student', render: (_value, row) => row.student ? `${row.student.firstName || ''} ${row.student.lastName || ''}`.trim() || '—' : '—' },
                { header: 'Course', accessor: 'course', render: (_value, row) => row.course?.title || row.courseId || '—' },
                { header: 'Score', accessor: 'score', render: (value) => value ?? '—' },
                { header: 'Grade', accessor: 'grade', render: (value) => <Badge tone="info">{value || '—'}</Badge> },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value)}>{value || 'PENDING'}</Badge> },
                { header: 'Action', accessor: 'id', render: (value, row) => (
                  <Button variant={row.status === 'PENDING' ? 'primary' : 'secondary'} size="sm" onClick={() => approveResult(value)}>
                    {row.status === 'PENDING' ? 'Approve' : 'Approved'}
                  </Button>
                ) },
              ]}
              rows={results}
              emptyText="No results are waiting for HOD approval."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
