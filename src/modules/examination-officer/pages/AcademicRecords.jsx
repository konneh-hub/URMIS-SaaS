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
    case 'PENDING': return 'warning';
    case 'APPROVED': return 'info';
    case 'PUBLISHED': return 'success';
    default: return 'neutral';
  }
}

export default function AcademicRecords() {
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
          else setError(body.message || 'Failed to load academic records');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const total = results.length;
  const approved = results.filter((item) => item.status === 'APPROVED').length;
  const published = results.filter((item) => item.status === 'PUBLISHED').length;
  const pending = results.filter((item) => item.status === 'PENDING').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Records"
          title="Academic Records"
          description="Review academic records and student result history across the institution."
          badge={<Badge tone="info">{total} records</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-4">
          <MetricTile title="Total records" value={total} description="All academic records" badge="Total" />
          <MetricTile title="Pending" value={pending} description="Awaiting approval" badgeTone="warning" badge="Pending" />
          <MetricTile title="Approved" value={approved} description="Verified records" badgeTone="info" badge="Approved" />
          <MetricTile title="Published" value={published} description="Finalized records" badgeTone="success" badge="Published" />
        </div>

        <Card title="Student academic records" description="Browse individual result entries and academic history metrics.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading academic records...</p>
          ) : (
            <Table
              columns={[
                { header: 'Student', accessor: 'student', render: (_value, row) => row.student ? `${row.student.firstName} ${row.student.lastName}` : '—' },
                { header: 'Course', accessor: 'course', render: (_value, row) => row.course?.title || '—' },
                { header: 'Score', accessor: 'score' },
                { header: 'Grade', accessor: 'grade' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value)}>{value}</Badge> },
              ]}
              rows={results}
              emptyText="No academic records available."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
