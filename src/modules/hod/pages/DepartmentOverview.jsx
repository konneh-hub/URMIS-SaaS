"use client";

import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Table from '../../../shared/components/ui/Table';
import Badge from '../../../shared/components/ui/Badge';
import MetricTile from '../../../shared/components/ui/MetricTile';
import Alert from '../../../shared/components/ui/Alert';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

function useHodData(fetcher, deps = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const value = await fetcher(token);
        if (!active) return;
        setData(Array.isArray(value) ? value : value ?? []);
        setError(null);
      } catch (e) {
        if (!active) return;
        setError(e.message || 'Unable to load department data.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, deps);

  return { data, loading, error };
}

export default function DepartmentOverview() {
  const { data: departments, loading, error } = useHodData(async (token) => {
    const resp = await fetch(`${API_BASE}/api/admin/academic/departments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await resp.json();
    if (!body.success) throw new Error(body.message || 'Failed to load departments');
    return body.data;
  });

  const summary = useMemo(() => {
    const list = Array.isArray(departments) ? departments : [];
    return {
      total: list.length,
      active: list.filter((d) => d.status === 'ACTIVE').length,
      programmes: list.reduce((acc, d) => acc + (d._count?.programmes || 0), 0),
    };
  }, [departments]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Department"
          title="Department Overview"
          description="Monitor departmental performance, staff, courses, and enrollment."
          badge={<Badge tone="info">{summary.total} departments</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Departments" value={summary.total} description="Academic departments" badge="Units" />
          <MetricTile title="Active" value={summary.active} description="Currently operational" badgeTone="success" badge="Live" />
          <MetricTile title="Programmes" value={summary.programmes} description="Linked programmes" badgeTone="info" badge="Count" />
        </div>

        <Card title="Department portfolio" description="Academic units under the current institution.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading department overview...</p>
          ) : (
            <Table
              columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Code', accessor: 'code', render: (value) => <Badge tone="info">{value || '—'}</Badge> },
                { header: 'Head', accessor: 'headName', render: (value) => value || 'Not assigned' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={value === 'ACTIVE' ? 'success' : 'warning'}>{value || 'ACTIVE'}</Badge> },
              ]}
              rows={departments}
              emptyText="No department records found."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
