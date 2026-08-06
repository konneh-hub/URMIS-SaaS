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

export default function Lecturers() {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/admin/staff`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) {
            setLecturers(body.data.filter((person) => person.role === 'LECTURER' || person.role === 'HOD'));
          } else {
            setError(body.message || 'Failed to load lecturers');
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
          eyebrow="Department staff"
          title="Lecturers"
          description="Review the teaching staff active within the department."
          badge={<Badge tone="info">{lecturers.length} staff</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Lecturers" value={lecturers.length} description="Active academic staff" badge="Staff" />
          <MetricTile title="HODs" value={lecturers.filter((l) => l.role === 'HOD').length} description="Department leaders" badgeTone="info" badge="Leads" />
          <MetricTile title="Teaching" value={lecturers.filter((l) => l.role === 'LECTURER').length} description="Course facilitators" badgeTone="success" badge="Teach" />
        </div>

        <Card title="Staff roster" description="Lecturers and academic leaders available for course oversight.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading lecturers...</p>
          ) : (
            <Table
              columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Email', accessor: 'email' },
                { header: 'Role', accessor: 'role', render: (value) => <Badge tone="info">{value || 'LECTURER'}</Badge> },
                { header: 'Department', accessor: 'departmentName', render: (value) => value || '—' },
              ]}
              rows={lecturers}
              emptyText="No lecturers are registered for this department."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
