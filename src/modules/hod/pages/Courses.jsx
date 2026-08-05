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
    case 'PENDING': return 'warning';
    default: return 'neutral';
  }
}

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const resp = await fetch(`${API_BASE}/api/admin/academic/curricula`, { headers });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) setCourses(body.data);
          else {
            const programmesResp = await fetch(`${API_BASE}/api/admin/academic/programmes`, { headers });
            const programmesBody = await programmesResp.json();
            if (programmesBody.success) setCourses(programmesBody.data);
            else setError(programmesBody.message || 'Failed to load courses');
          }
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
          eyebrow="Academic planning"
          title="Courses"
          description="Keep the course catalog and academic delivery aligned to department needs."
          badge={<Badge tone="info">{courses.length} courses</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Courses" value={courses.length} description="Department courses" badge="All" />
          <MetricTile title="Active" value={courses.filter((c) => c.status === 'ACTIVE').length} description="Currently offered" badgeTone="success" badge="Live" />
          <MetricTile title="Pending" value={courses.filter((c) => c.status !== 'ACTIVE').length} description="Not yet active" badgeTone="warning" badge="Queue" />
        </div>

        <Card title="Course catalogue" description="Courses and programme-linked academic offerings.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading course records...</p>
          ) : (
            <Table
              columns={[
                { header: 'Title', accessor: 'title', render: (value, row) => value || row.name || '—' },
                { header: 'Code', accessor: 'code', render: (value) => value || '—' },
                { header: 'Credits', accessor: 'creditUnits', render: (value, row) => value ?? row.creditHours ?? '—' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value)}>{value || 'ACTIVE'}</Badge> },
              ]}
              rows={courses}
              emptyText="No course records have been created yet."
            />
          )}
        </Card>
</div>
    </DashboardLayout>
  );
}
