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
    case 'PUBLISHED': return 'success';
    default: return 'neutral';
  }
}

export default function ResultVerification() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadResults() {
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
  }

  useEffect(() => {
    loadResults();
  }, []);

  async function handleVerify(id) {
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/platform/results/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (!body.success) throw new Error(body.message || 'Verification failed');
      loadResults();
    } catch (err) {
      setError(err.message || 'Verification failed');
    }
  }

  const pending = results.filter((r) => r.status === 'PENDING').length;
  const verified = results.filter((r) => r.status === 'APPROVED').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Verification"
          title="Result Verification"
          description="Verify submitted results before they are approved for publication."
          badge={<Badge tone="info">{pending} pending</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Pending" value={pending} description="Needs verification" badgeTone="warning" badge="Pending" />
          <MetricTile title="Verified" value={verified} description="Verified results" badgeTone="info" badge="Verified" />
          <MetricTile title="Total" value={results.length} description="Total results" badge="Total" />
        </div>

        <Card title="Verification queue" description="Review results and verify them for the next workflow stage.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading results...</p>
          ) : (
            <Table
              columns={[
                { header: 'Student', accessor: 'student', render: (_value, row) => row.student ? `${row.student.firstName} ${row.student.lastName}` : '—' },
                { header: 'Course', accessor: 'course', render: (_value, row) => row.course?.title || '—' },
                { header: 'Score', accessor: 'score' },
                { header: 'Grade', accessor: 'grade' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value)}>{value}</Badge> },
                {
                  header: 'Action',
                  accessor: 'id',
                  render: (_value, row) => (
                    row.status === 'PENDING' ? <Button variant="primary" size="sm" onClick={() => handleVerify(row.id)}>Verify</Button> : <span className="text-sm text-[var(--color-muted-text)]">No action</span>
                  ),
                },
              ]}
              rows={results}
              emptyText="No results available for verification."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
