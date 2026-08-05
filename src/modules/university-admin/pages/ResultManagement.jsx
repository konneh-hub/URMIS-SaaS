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
    case 'PUBLISHED': return 'success';
    case 'APPROVED': return 'info';
    case 'PENDING': return 'warning';
    case 'REJECTED': return 'danger';
    default: return 'neutral';
  }
}

export default function ResultManagement() {
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

  const pending = results.filter((r) => r.status === 'PENDING').length;
  const approved = results.filter((r) => r.status === 'APPROVED').length;
  const published = results.filter((r) => r.status === 'PUBLISHED').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Examinations"
          title="Result Management"
          description="Review, organize, and oversee results."
          badge={<Badge tone="info">{results.length} results</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-4">
          <MetricTile title="Results" value={results.length} description="Total records" badge="All" />
          <MetricTile title="Pending" value={pending} description="Awaiting approval" badgeTone="warning" badge="Queue" />
          <MetricTile title="Approved" value={approved} description="Approved records" badgeTone="info" badge="Done" />
          <MetricTile title="Published" value={published} description="Live results" badgeTone="success" badge="Live" />
        </div>

        <Card title="Results" description="All result records within your institution.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading results...</p>
          ) : (
            <Table
              columns={[
                { header: 'Grade', accessor: 'grade', render: (value) => <Badge tone="info">{value}</Badge> },
                { header: 'Score', accessor: 'score' },
                { header: 'Grade point', accessor: 'gradePoint' },
                { header: 'Course', accessor: 'course', render: (_v, row) => row.course?.title || '—' },
                { header: 'Student', accessor: 'student', render: (_v, row) => row.student ? `${row.student.firstName} ${row.student.lastName}` : '—' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value)}>{value}</Badge> },
              ]}
              rows={results}
              emptyText="No results recorded yet."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
