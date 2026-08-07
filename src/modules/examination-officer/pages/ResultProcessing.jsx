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
    case 'SUBMITTED':
    case 'HOD_APPROVED':
    case 'DEAN_APPROVED':
    case 'VERIFIED': return 'info';
    case 'PUBLISHED':
    case 'CORRECTED': return 'success';
    default: return 'neutral';
  }
}

export default function ResultProcessing() {
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

  async function handleApprove(id) {
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

  const pending = results.filter((r) => r.status === 'DEAN_APPROVED' || r.status === 'VERIFIED').length;
  const approved = results.filter((r) => r.status === 'DEAN_APPROVED').length;
  const published = results.filter((r) => r.status === 'PUBLISHED').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Results"
          title="Result Processing"
          description="Process submitted student results and move them through the verification workflow."
          badge={<Badge tone="info">{results.length} results</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Pending" value={pending} description="Awaiting processing" badgeTone="warning" badge="Pending" />
          <MetricTile title="Approved" value={approved} description="Ready for publication" badgeTone="info" badge="Approved" />
          <MetricTile title="Published" value={published} description="Delivered to students" badgeTone="success" badge="Published" />
        </div>

        <Card title="Result queue" description="Review submitted results and advance them through the workflow.">
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
                    <div className="flex flex-wrap gap-2">
                      {row.status === 'DEAN_APPROVED' ? (
                        <Button variant="primary" size="sm" onClick={() => handleApprove(row.id)}>Verify</Button>
                      ) : null}
                      {row.status === 'VERIFIED' ? (
                        <Button variant="success" size="sm" onClick={() => handlePublish(row.id)}>Publish</Button>
                      ) : null}
                    </div>
                  ),
                },
              ]}
              rows={results}
              emptyText="No results available for processing."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
