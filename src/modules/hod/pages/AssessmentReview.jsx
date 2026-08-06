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
    case 'ACTIVE': return 'success';
    case 'CLOSED': return 'info';
    case 'DRAFT':
    case 'PENDING': return 'warning';
    default: return 'neutral';
  }
}

export default function AssessmentReview() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/admin/platform/assessments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) setAssessments(body.data);
          else setError(body.message || 'Failed to load assessments');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Assessment review"
          title="Assessment Review"
          description="Review assessments submitted across the department for approval."
          badge={<Badge tone="info">{assessments.length} assessments</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Assessments" value={assessments.length} description="Total assessment plans" badge="All" />
          <MetricTile title="Active" value={assessments.filter((a) => a.status === 'ACTIVE').length} description="Currently running" badgeTone="success" badge="Live" />
          <MetricTile title="Draft" value={assessments.filter((a) => a.status === 'DRAFT' || a.status === 'PENDING').length} description="Awaiting review" badgeTone="warning" badge="Queue" />
        </div>

        <Card title="Assessment inventory" description="Current assessment plans and evaluation records.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading assessments...</p>
          ) : (
            <Table
              columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Course', accessor: 'course', render: (_value, row) => row.course?.title || row.courseId || '—' },
                { header: 'Weight', accessor: 'weight', render: (value) => value ?? '—' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value)}>{value || 'DRAFT'}</Badge> },
              ]}
              rows={assessments}
              emptyText="No assessments have been submitted for review."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
