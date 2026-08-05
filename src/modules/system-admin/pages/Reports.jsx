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

export default function Reports() {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Analytics"
          title="Reports"
          description="System-wide academic and operational reports."
          badge={<Badge tone="info">Summary</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        {!loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            <MetricTile title="Institutions" value={institutions.length} description="Registered tenants" badge="All" />
            <MetricTile title="Students" value={report?.totalStudents || 0} description="Enrolled" badgeTone="info" badge="Count" />
            <MetricTile title="Courses" value={report?.totalCourses || 0} description="Active courses" badgeTone="success" badge="Count" />
            <MetricTile title="Assessments" value={report?.totalAssessments || 0} description="Created" badgeTone="warning" badge="Count" />
          </div>
        ) : null}

        <Card title="Result summary" description="Results grouped by approval status.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading report...</p>
          ) : (
            <Table
              columns={[
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={value === 'PUBLISHED' ? 'success' : value === 'APPROVED' ? 'info' : 'warning'}>{value}</Badge> },
                { header: 'Count', accessor: 'count' },
              ]}
              rows={resultSummary.map((r) => ({ status: r.status, count: r._count?._all || 0 }))}
              emptyText="No result data available."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
