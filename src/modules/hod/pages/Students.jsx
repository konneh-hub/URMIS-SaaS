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

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/admin/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) setStudents(body.data);
          else setError(body.message || 'Failed to load students');
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
          eyebrow="Academic records"
          title="Students"
          description="Review enrolled students and departmental student population."
          badge={<Badge tone="info">{students.length} students</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Students" value={students.length} description="Registered students" badge="All" />
          <MetricTile title="Active" value={students.filter((s) => s.status === 'ACTIVE').length} description="Currently enrolled" badgeTone="success" badge="Live" />
          <MetricTile title="Pending" value={students.filter((s) => s.status !== 'ACTIVE').length} description="Awaiting enrollment" badgeTone="warning" badge="Queue" />
        </div>

        <Card title="Student directory" description="Student list under the department's institutions.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading students...</p>
          ) : (
            <Table
              columns={[
                { header: 'Name', accessor: 'name', render: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || value || '—' },
                { header: 'Email', accessor: 'email' },
                { header: 'Matric', accessor: 'matricNumber', render: (value) => value || '—' },
                { header: 'Programme', accessor: 'programme', render: (value) => value || '—' },
              ]}
              rows={students}
              emptyText="No students available in the department directory."
            />
          )}
        </Card>
      </div>
</DashboardLayout>
  );
}
