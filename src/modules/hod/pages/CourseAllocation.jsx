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
    case 'ACTIVE': return 'success';
    case 'PENDING': return 'warning';
    default: return 'neutral';
  }
}

export default function CourseAllocation() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/admin/academic/allocations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) setAllocations(body.data);
          else setError(body.message || 'Failed to load course allocations');
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
          eyebrow="Course assignment"
          title="Course Allocation"
          description="Assign and review course allocations for department lecturers."
          badge={<Badge tone="info">{allocations.length} allocations</Badge>}
          actions={<Button variant="primary" size="sm">Assign course</Button>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Allocations" value={allocations.length} description="Total course assignments" badge="All" />
          <MetricTile title="Active" value={allocations.filter((a) => a.status === 'ACTIVE').length} description="Currently assigned" badgeTone="success" badge="Live" />
          <MetricTile title="Pending" value={allocations.filter((a) => a.status !== 'ACTIVE').length} description="Awaiting confirmation" badgeTone="warning" badge="Queue" />
        </div>

        <Card title="Allocation list" description="Course-to-lecturer assignments in the department.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading allocations...</p>
          ) : (
            <Table
              columns={[
                { header: 'Course', accessor: 'course', render: (_value, row) => row.course?.title || row.courseId || '—' },
                { header: 'Lecturer', accessor: 'lecturer', render: (_value, row) => row.lecturer?.name || row.lecturerId || '—' },
                { header: 'Session', accessor: 'session', render: (_value, row) => row.session?.name || row.sessionId || '—' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value)}>{value || 'ACTIVE'}</Badge> },
              ]}
              rows={allocations}
              emptyText="No course allocations have been created yet."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
