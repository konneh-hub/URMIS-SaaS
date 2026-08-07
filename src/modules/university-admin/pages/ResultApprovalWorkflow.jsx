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
    case 'SUBMITTED':
    case 'HOD_APPROVED':
    case 'DEAN_APPROVED':
    case 'VERIFIED': return 'info';
    case 'PENDING': return 'warning';
    case 'REJECTED': return 'danger';
    default: return 'neutral';
  }
}

export default function ResultApprovalWorkflow() {
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

  async function refresh() {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/platform/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success) setResults(body.data);
    } catch (e) { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function transitionResult(id, action) {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE}/api/admin/platform/results/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      refresh();
    } catch (e) { /* ignore */ }
  }

  const pending = results.filter((r) => r.status === 'PENDING').length;
  const submitted = results.filter((r) => r.status === 'SUBMITTED').length;
  const hodApproved = results.filter((r) => r.status === 'HOD_APPROVED').length;
  const deanApproved = results.filter((r) => r.status === 'DEAN_APPROVED').length;
  const verified = results.filter((r) => r.status === 'VERIFIED').length;
  const published = results.filter((r) => r.status === 'PUBLISHED').length;
  const approved = submitted + hodApproved + deanApproved + verified;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Examinations"
          title="Result Approval Workflow"
          description="Coordinate result approvals across stakeholders."
          badge={<Badge tone="info">{results.length} results in pipeline</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Pending" value={pending} description="Awaiting approval" badgeTone="warning" badge="Queue" />
          <MetricTile title="Approved" value={approved} description="Ready to publish" badgeTone="info" badge="Approved" />
          <MetricTile title="Published" value={published} description="Live to students" badgeTone="success" badge="Live" />
        </div>

        <Card title="Approval pipeline" description="Move results through the approval workflow.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading results...</p>
          ) : (
            <Table
              columns={[
                { header: 'Course', accessor: 'course', render: (_v, row) => row.course?.title || '—' },
                { header: 'Student', accessor: 'student', render: (_v, row) => row.student ? `${row.student.firstName} ${row.student.lastName}` : '—' },
                { header: 'Score', accessor: 'score' },
                { header: 'Grade', accessor: 'grade', render: (value) => <Badge tone="info">{value}</Badge> },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value)}>{value}</Badge> },
                { header: 'Actions', accessor: 'actions', render: (_v, row) => (
                  <div className="flex flex-wrap gap-2">
                    {['PENDING', 'SUBMITTED', 'HOD_APPROVED', 'DEAN_APPROVED'].includes(row.status) ? (
                      <Button variant="success" size="sm" onClick={() => transitionResult(row.id, 'approve')}>
                        {row.status === 'PENDING'
                          ? 'Submit'
                          : row.status === 'SUBMITTED'
                          ? 'Verify'
                          : row.status === 'HOD_APPROVED'
                          ? 'Approve'
                          : 'Verify'}
                      </Button>
                    ) : null}
                    {row.status === 'VERIFIED' ? (
                      <Button variant="primary" size="sm" onClick={() => transitionResult(row.id, 'publish')}>
                        Publish
                      </Button>
                    ) : null}
                  </div>
                ) },
              ]}
              rows={results}
              emptyText="No results in the approval pipeline."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
