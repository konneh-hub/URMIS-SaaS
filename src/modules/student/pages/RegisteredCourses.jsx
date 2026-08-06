"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/auth/AuthProvider';
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
    case 'REGISTERED': return 'success';
    case 'PENDING': return 'warning';
    case 'DROPPED': return 'danger';
    default: return 'neutral';
  }
}

export default function RegisteredCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/institution/student/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          setCourses(Array.isArray(body) ? body : (body.data || []));
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  const active = courses.filter((c) => c.status !== 'DROPPED').length;
  const totalCredits = courses.filter((c) => c.status !== 'DROPPED').reduce((sum, c) => sum + (c.creditHours || c.credits || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Enrollment"
          title="Registered Courses"
          description="Courses you are currently registered for in the active academic session."
          badge={<Badge tone="info">{active} active courses</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Registered" value={courses.length} description="Total registrations" badge="All" />
          <MetricTile title="Active" value={active} description="Currently enrolled" badgeTone="success" badge="Active" />
          <MetricTile title="Credit hours" value={totalCredits} description="Total credits" badgeTone="info" badge="Credits" />
        </div>

        <Card title="Course list" description="All courses registered for the current session.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading courses...</p>
          ) : (
            <Table
              columns={[
                { header: 'Course', accessor: 'title', render: (_v, row) => row.title || row.code || '—' },
                { header: 'Code', accessor: 'code' },
                { header: 'Credits', accessor: 'creditHours', render: (v) => v ?? '—' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value || 'REGISTERED')}>{value || 'REGISTERED'}</Badge> },
                { header: 'Action', accessor: 'id', render: () => <Button variant="secondary" size="sm">View details</Button> },
              ]}
              rows={courses}
              emptyText="You have not registered for any courses yet."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

