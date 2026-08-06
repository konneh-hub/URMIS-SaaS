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
    case 'IN_PROGRESS': return 'info';
    case 'PENDING': return 'warning';
    default: return 'neutral';
  }
}

export default function AcademicHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/institution/student/academic-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          setHistory(Array.isArray(body) ? body : (body.data || []));
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  const sessions = history.length;
  const completed = history.filter((h) => h.status === 'COMPLETED').length;
  const totalCredits = history.reduce((sum, h) => sum + (h.creditHours || h.credits || (h.courses || []).reduce((s, c) => s + (c.creditHours || 0), 0)), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Academic"
          title="Academic History"
          description="Your academic progression across sessions and semesters."
          badge={<Badge tone="info">{sessions} sessions</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Sessions" value={sessions} description="Academic sessions" badge="All" />
          <MetricTile title="Completed" value={completed} description="Finished sessions" badgeTone="success" badge="Done" />
          <MetricTile title="Credit hours" value={totalCredits} description="Total credits" badgeTone="info" badge="Credits" />
        </div>

        <Card title="Academic history" description="Your progression record by academic session.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading history...</p>
          ) : (
            <Table
              columns={[
                { header: 'Session', accessor: 'session', render: (_v, row) => row.session?.name || row.academicYear || row.session || '—' },
                { header: 'Semester', accessor: 'semester', render: (v) => v?.name || v || '—' },
                { header: 'Level', accessor: 'level', render: (v) => v ?? '—' },
                { header: 'GPA', accessor: 'gpa', render: (v) => v ?? '—' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value || 'PENDING')}>{value || 'PENDING'}</Badge> },
              ]}
              rows={history}
              emptyText="No academic history available yet."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
