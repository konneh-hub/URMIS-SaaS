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
import Charts from '../../../shared/components/Charts';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function DepartmentReports() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [resultsResp, academicResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/platform/results`, { headers }),
          fetch(`${API_BASE}/api/admin/platform/reports/academic`, { headers }).catch(() => ({ json: async () => ({ success: false }) })),
        ]);
        const resultsBody = await resultsResp.json();
        const academicBody = await academicResp.json();
        if (!cancelled) {
          if (resultsBody.success) setResults(resultsBody.data);
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const approved = results.filter((r) => r.status === 'APPROVED').length;
  const published = results.filter((r) => r.status === 'PUBLISHED').length;
  const pending = results.filter((r) => r.status === 'PENDING').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Reporting"
          title="Department Reports"
          description="Review departmental performance and academic result reports."
          badge={<Badge tone="info">Live reports</Badge>}
          actions={<Button variant="secondary" size="sm" onClick={() => window.location.reload()}>Refresh</Button>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-4">
          <MetricTile title="Results" value={results.length} description="Total result records" badge="Count" />
          <MetricTile title="Approved" value={approved} description="Approved by HOD" badgeTone="success" badge="Count" />
          <MetricTile title="Published" value={published} description="Finalized results" badgeTone="info" badge="Count" />
          <MetricTile title="Pending" value={pending} description="Awaiting review" badgeTone="warning" badge="Count" />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card title="Result pipeline" description="Department results grouped by approval status.">
            {loading ? (
              <p className="text-sm text-[var(--color-muted-text)]">Loading reports...</p>
            ) : (
              <Table
                columns={[
                  { header: 'Status', accessor: 'status', render: (value) => <Badge tone={value === 'PUBLISHED' ? 'success' : value === 'APPROVED' ? 'info' : 'warning'}>{value}</Badge> },
                  { header: 'Count', accessor: 'count' },
                ]}
                rows={[
                  { status: 'PENDING', count: pending },
                  { status: 'APPROVED', count: approved },
                  { status: 'PUBLISHED', count: published },
                ]}
                emptyText="No result data available."
              />
            )}
          </Card>

          <Card title="Department summary" description="Visual summary of departmental workload.">
            <Charts title="Department activity" series={['Courses', 'Students', 'Results', 'Published']} />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
