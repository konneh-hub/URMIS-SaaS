"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/auth/AuthProvider';
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
    case 'COMPLETED': return 'success';
    case 'UPCOMING': return 'info';
    case 'ONGOING': return 'warning';
    default: return 'neutral';
  }
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d) ? '—' : d.toLocaleDateString();
}

export default function Assessments() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/institution/student/assessments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          setAssessments(Array.isArray(body) ? body : (body.data || []));
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  const upcoming = assessments.filter((a) => a.status === 'UPCOMING').length;
  const completed = assessments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Assessment"
          title="Assessments"
          description="Scheduled and completed assessments for your registered courses."
          badge={<Badge tone="info">{assessments.length} assessments</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Total" value={assessments.length} description="All assessments" badge="All" />
          <MetricTile title="Upcoming" value={upcoming} description="Scheduled ahead" badgeTone="info" badge="Upcoming" />
          <MetricTile title="Completed" value={completed} description="Already taken" badgeTone="success" badge="Done" />
        </div>

        <Card title="Assessment schedule" description="Assessments associated with your registered courses.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading assessments...</p>
          ) : (
            <Table
              columns={[
                { header: 'Course', accessor: 'course', render: (_v, row) => row.course?.title || row.courseId || '—' },
                { header: 'Type', accessor: 'type', render: (value) => <Badge tone="info">{value || '—'}</Badge> },
                { header: 'Date', accessor: 'date', render: formatDate },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value || 'UPCOMING')}>{value || 'UPCOMING'}</Badge> },
              ]}
              rows={assessments}
              emptyText="No assessments scheduled yet."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
