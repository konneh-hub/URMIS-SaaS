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
import { useAuth } from '../../../shared/auth/AuthProvider';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

function statusTone(status) {
  switch (status) {
    case 'PUBLISHED': return 'success';
    case 'HOD_APPROVED':
    case 'DEAN_APPROVED':
    case 'VERIFIED': return 'info';
    case 'SUBMITTED':
    case 'PENDING': return 'warning';
    case 'REJECTED': return 'danger';
    default: return 'neutral';
  }
}

export default function ResultVerification() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/admin/platform/results`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) setResults(body.data);
          else setError(body.message || 'Failed to load results');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function verifyResult(id) {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE}/api/admin/platform/results/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'HOD_APPROVED' } : r)));
    } catch (e) {
      setError('Could not verify selected result.');
    }
  }

  const pending = results.filter((r) => r.status === 'SUBMITTED').length;
  const verified = results.filter((r) => r.status === 'HOD_APPROVED').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Department oversight"
          title="Result Verification"
          description={`Verify submitted results from your department lecturers. ${user?.name || ''}`.trim()}
          badge={<Badge tone="info">{pending} awaiting verification</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Total results" value={results.length} description="All records" badge="All" />
          <MetricTile title="Pending" value={pending} description="Awaiting verification" badgeTone="warning" badge="Queue" />
          <MetricTile title="Verified" value={verified} description="Checked and confirmed" badgeTone="success" badge="Verified" />
        </div>

        <Card title="Verification queue" description="Results submitted by lecturers that require departmental verification.">
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
                  row.status === 'SUBMITTED' ? (
                    <Button variant="primary" size="sm" onClick={() => verifyResult(value)}>
                      Verify
                    </Button>
                  ) : (
                    <span className="text-sm text-[var(--color-muted-text)]">No action</span>
                  )
                ) },
              ]}
              rows={results}
              emptyText="No results are awaiting verification."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
