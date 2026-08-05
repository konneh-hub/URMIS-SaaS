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

export default function CourseAllocation() {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [allocResp, staffResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/academic/allocations`, { headers }),
          fetch(`${API_BASE}/api/admin/staff`, { headers }),
        ]);
        const allocBody = await allocResp.json();
        const staffBody = await staffResp.json();
        if (!cancelled) {
          const staffList = staffBody.success ? staffBody.data : [];
          const current = staffList.find((s) => s.email === user?.email) || staffList[0];
          const all = allocBody.success ? allocBody.data : [];
          setAllocations(current ? all.filter((a) => a.staffId === current.id || a.lecturerId === current.id) : all);
          if (!allocBody.success) setError(allocBody.message || 'Failed to load allocations');
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
          eyebrow="Teaching Allocation"
          title="Course Allocation"
          description="View course allocations assigned to you for the academic session."
          badge={<Badge tone="info">{allocations.length} allocations</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="My allocations" value={allocations.length} description="Courses assigned to you" badge="All" />
          <MetricTile title="Active" value={allocations.filter((a) => a.status === 'ACTIVE').length} description="Currently running" badgeTone="success" badge="Live" />
          <MetricTile title="Pending" value={allocations.filter((a) => a.status !== 'ACTIVE').length} description="Awaiting activation" badgeTone="warning" badge="Queue" />
        </div>

        <Card title="Course allocations" description="Allocations linked to your lecturer profile.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading allocations...</p>
          ) : (
            <Table
              columns={[
                { header: 'Course', accessor: 'course', render: (_v, row) => row.course?.title || row.courseId || '—' },
                { header: 'Code', accessor: 'code', render: (_v, row) => row.course?.code || '—' },
                { header: 'Department', accessor: 'department', render: (_v, row) => row.department?.name || row.departmentId || '—' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={value === 'ACTIVE' ? 'success' : 'warning'}>{value || 'ACTIVE'}</Badge> },
                { header: 'Action', accessor: 'id', render: () => <Button variant="secondary" size="sm">Manage</Button> },
              ]}
              rows={allocations}
              emptyText="No course allocations found for you."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
