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

export default function MyCourses() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const staffResp = await fetch(`${API_BASE}/api/admin/staff`, { headers });
        const staffBody = await staffResp.json();
        if (!cancelled) {
          const staffList = staffBody.success ? staffBody.data : [];
          const current = staffList.find((s) => s.email === user?.email) || staffList[0];
          if (current) {
            const assignResp = await fetch(`${API_BASE}/api/admin/staff/${current.id}/assignments`, { headers });
            const assignBody = await assignResp.json();
            if (assignBody.success) setAssignments(assignBody.data);
            else setError(assignBody.message || 'Failed to load assignments');
          } else {
            setError('No staff profile found for this account.');
          }
        } else {
          setError(staffBody.message || 'Failed to load staff');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Teaching"
          title="My Courses"
          description="Courses assigned to you for the current academic session."
          badge={<Badge tone="info">{assignments.length} courses</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Assigned courses" value={assignments.length} description="In this session" badge="Courses" />
          <MetricTile title="Active" value={assignments.filter((a) => a.status === 'ACTIVE').length} description="Currently taught" badgeTone="success" badge="Live" />
          <MetricTile title="Pending" value={assignments.filter((a) => a.status !== 'ACTIVE').length} description="Not yet active" badgeTone="warning" badge="Queue" />
        </div>

        <Card title="My course assignments" description="All courses currently allocated to you.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading assignments...</p>
          ) : (
            <Table
              columns={[
                { header: 'Course', accessor: 'course', render: (_v, row) => row.course?.title || row.courseId || '—' },
                { header: 'Code', accessor: 'code', render: (_v, row) => row.course?.code || '—' },
                { header: 'Credits', accessor: 'credits', render: (_v, row) => row.course?.creditHours ?? '—' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={value === 'ACTIVE' ? 'success' : 'warning'}>{value || 'ACTIVE'}</Badge> },
                { header: 'Action', accessor: 'id', render: () => <Button variant="secondary" size="sm">View details</Button> },
              ]}
              rows={assignments}
              emptyText="No courses assigned to you yet."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
