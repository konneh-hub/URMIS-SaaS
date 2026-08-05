
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

export default function ResultSubmission() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const resp = await fetch(`${API_BASE}/api/admin/platform/results`, { headers });
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

  async function submitResult(id) {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE}/api/admin/platform/results/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r)));
    } catch (e) {
      setError('Could not submit result for approval.');
    }
  }

  const pending = results.filter((r) => r.status === 'PENDING').length;
  const submitted = results.filter((r) => r.status === 'APPROVED' || r.status === 'SUBMITTED').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Submission Workflow"
          title="Result Submission"
          description="Submit verified results for review and approval."
          badge={<Badge tone="info">{results.length} results</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Total results" value={results.length} description="All records" badge="All" />
          <MetricTile title="Pending" value={pending} description="Awaiting submission" badgeTone="warning" badge="Queue" />
          <MetricTile title="Submitted" value={submitted} description="Sent for approval" badgeTone="success" badge="Sent" />
        </div>

        <Card title="Submission queue" description="Results requiring your submission for the approval workflow.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading results...</p>
          ) : (
            <Table
              columns={[
                { header: 'Student', accessor: 'student', render: (_v, row) => row.student ? `${row.student.firstName || ''} ${row.student.lastName || ''}`.trim() || '—' : '—' },
                { header: 'Course', accessor: 'course', render: (_v, row) => row.course?.title || row.courseId || '—' },
                { header: 'Score', accessor: 'score', render: (value) => value ?? '—' },
                { header: 'Grade', accessor: 'grade', render: (value) => <Badge tone="info">{value || '—'}</Badge> },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={value === 'PENDING' ? 'warning' : 'success'}>{value || 'PENDING'}</Badge> },
                { header: 'Action', accessor: 'id', render: (value, row) => (
                  <Button variant={row.status === 'PENDING' ? 'primary' : 'secondary'} size="sm" onClick={() => submitResult(value)}>
                    {row.status === 'PENDING' ? 'Submit' : 'Submitted'}
                  </Button>
                ) },
              ]}
              rows={results}
              emptyText="No result records available for submission."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
