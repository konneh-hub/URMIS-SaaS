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

export default function Reports() {
  const [academic, setAcademic] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [accResp, resResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/platform/reports/academic`, { headers }),
          fetch(`${API_BASE}/api/admin/platform/reports/results`, { headers }),
        ]);
        const accBody = await accResp.json();
        const resBody = await resResp.json();
        if (!cancelled) {
          if (accBody.success) setAcademic(accBody.data);
          if (resBody.success) setResult(resBody.data);
          if (!accBody.success) setError(accBody.message || 'Failed to load reports');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const resultSummary = result?.resultSummary || [];
  const pending = resultSummary.find((r) => r.status === 'PENDING')?._count?._all || 0;
  const approved = resultSummary.find((r) => r.status === 'APPROVED')?._count?._all || 0;
  const published = resultSummary.find((r) => r.status === 'PUBLISHED')?._count?._all || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Analytics"
          title="Reports"
          description="Institution reports and summary dashboards."
          badge={<Badge tone="info">Live reports</Badge>}
          actions={(
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>Refresh</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        {!loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            <MetricTile title="Students" value={academic?.totalStudents || 0} description="Enrolled students" badge="Count" />
            <MetricTile title="Courses" value={academic?.totalCourses || 0} description="Active courses" badgeTone="info" badge="Count" />
            <MetricTile title="Assessments" value={academic?.totalAssessments || 0} description="Created assessments" badgeTone="success" badge="Count" />
            <MetricTile title="Results" value={result?.totalResults || pending + approved + published} description="Total results" badgeTone="warning" badge="Count" />
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          <Card title="Result pipeline" description="Results by approval status.">
            <Table
              columns={[
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={value === 'PUBLISHED' ? 'success' : value === 'APPROVED' ? 'info' : 'warning'}>{value}</Badge> },
                { header: 'Count', accessor: 'count' },
              ]}
              rows={resultSummary.map((r) => ({ status: r.status, count: r._count?._all || 0 }))}
              emptyText="No result data available."
            />
          </Card>

          <Card title="Academic summary" description="Visual summary of academic activity.">
            <Charts
              title="Institution activity"
              series={['Students', 'Courses', 'Assessments', 'Results']}
            />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
