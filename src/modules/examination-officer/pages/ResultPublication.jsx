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

export default function ResultPublication() {
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

  async function handlePublish(id) {
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/platform/results/${id}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (!body.success) throw new Error(body.message || 'Publish failed');
      loadResults();
    } catch (err) {
      setError(err.message || 'Publish failed');
    }
  }

  const approved = results.filter((r) => r.status === 'APPROVED').length;
  const published = results.filter((r) => r.status === 'PUBLISHED').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Publication"
          title="Result Publication"
          description="Publish approved results for students and academic stakeholders."
          badge={<Badge tone="info">{published} published</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Approved" value={approved} description="Ready to publish" badgeTone="info" badge="Approved" />
          <MetricTile title="Published" value={published} description="Already published" badgeTone="success" badge="Published" />
          <MetricTile title="Total" value={results.length} description="Total result entries" badge="Total" />
        </div>

        <Card title="Publication queue" description="Publish approved results when they are ready to be shared.">
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
                    row.status === 'APPROVED' ? <Button variant="success" size="sm" onClick={() => handlePublish(row.id)}>Publish</Button> : <span className="text-sm text-[var(--color-muted-text)]">No action</span>
                  ),
                },
              ]}
              rows={results}
              emptyText="No results available for publication."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
