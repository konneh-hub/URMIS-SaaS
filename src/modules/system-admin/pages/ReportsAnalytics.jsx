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

export default function ReportsAnalytics() {
  const [report, setReport] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [reportResp, instResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/platform/reports/academic`, { headers }),
          fetch(`${API_BASE}/api/institutions`, { headers }),
        ]);
        const reportBody = await reportResp.json();
        const instBody = await instResp.json();
        if (!cancelled) {
          if (reportBody.success) setReport(reportBody.data);
          if (instBody.success) setInstitutions(instBody.data);
          if (!reportBody.success) setError(reportBody.message || 'Failed to load report');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const resultSummary = report?.resultSummary || [];
  const pendingResults = resultSummary.find((r) => r.status === 'PENDING')?._count?._all || 0;
  const approvedResults = resultSummary.find((r) => r.status === 'APPROVED')?._count?._all || 0;
  const publishedResults = resultSummary.find((r) => r.status === 'PUBLISHED')?._count?._all || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Analytics"
          title="Reports & Analytics"
          description="Track platform performance, enrollment, and academic activity."
          badge={<Badge tone="info">Live analytics</Badge>}
          actions={(
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>Refresh</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        {!loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            <MetricTile title="Institutions" value={institutions.length} description="Registered tenants" badge="All" />
            <MetricTile title="Students" value={report?.totalStudents || 0} description="Enrolled students" badgeTone="info" badge="Count" />
            <MetricTile title="Courses" value={report?.totalCourses || 0} description="Active courses" badgeTone="success" badge="Count" />
            <MetricTile title="Assessments" value={report?.totalAssessments || 0} description="Created assessments" badgeTone="warning" badge="Count" />
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
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <MetricTile title="Pending" value={pendingResults} description="Awaiting approval" badgeTone="warning" badge="Queue" />
              <MetricTile title="Approved" value={approvedResults} description="Approved results" badgeTone="info" badge="Done" />
              <MetricTile title="Published" value={publishedResults} description="Live results" badgeTone="success" badge="Live" />
            </div>
          </Card>

          <Card title="Platform growth" description="Visual summary of platform activity.">
            <Charts
              title="Institution activity"
              series={['Institutions', 'Students', 'Courses', 'Assessments']}
            />
          </Card>
        </div>

        <Card title="Institution overview" description="Every tenant and their current status.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading institutions...</p>
          ) : (
            <Table
              columns={[
                { header: 'Institution', accessor: 'name' },
                { header: 'Code', accessor: 'code' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={value === 'ACTIVE' ? 'success' : value === 'SUSPENDED' ? 'warning' : 'info'}>{value}</Badge> },
                { header: 'Plan', accessor: 'subscriptionPlan' },
              ]}
              rows={institutions}
              emptyText="No institutions found."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
