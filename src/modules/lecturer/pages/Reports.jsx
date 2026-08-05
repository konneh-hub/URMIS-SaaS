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
import Charts from '../../../shared/components/Charts';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function Reports() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [staffResp, resultsResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/staff`, { headers }),
          fetch(`${API_BASE}/api/admin/platform/results`, { headers }),
        ]);
        const staffBody = await staffResp.json();
        const resultsBody = await resultsResp.json();
        if (!cancelled) {
          if (resultsBody.success) setResults(resultsBody.data);
          const staffList = staffBody.success ? staffBody.data : [];
          const current = staffList.find((s) => s.email === user?.email) || staffList[0];
          if (current) {
            const assignResp = await fetch(`${API_BASE}/api/admin/staff/${current.id}/assignments`, { headers });
            const assignBody = await assignResp.json();
            if (assignBody.success) setAssignments(assignBody.data);
          }
          if (!resultsBody.success) setError(resultsBody.message || 'Failed to load reports');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  const pending = results.filter((r) => r.status === 'PENDING').length;
  const approved = results.filter((r) => r.status === 'APPROVED').length;
  const published = results.filter((r) => r.status === 'PUBLISHED').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Analytics"
          title="Reports"
          description="Course-level reports and performance summaries for your classes."
          badge={<Badge tone="info">Live reports</Badge>}
          actions={(<Button variant="secondary" size="sm" onClick={() => window.location.reload()}>Refresh</Button>)}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        {!loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            <MetricTile title="Courses" value={assignments.length} description="Assigned courses" badge="Count" />
            <MetricTile title="Results" value={results.length} description="Total result records" badgeTone="info" badge="Count" />
            <MetricTile title="Approved" value={approved} description="Sent for approval" badgeTone="success" badge="Count" />
            <MetricTile title="Pending" value={pending} description="Awaiting submission" badgeTone="warning" badge="Count" />
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          <Card title="Result pipeline" description="Your results by approval status.">
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

          <Card title="Teaching summary" description="Visual summary of your teaching workload.">
            <Charts title="Course activity" series={['Assigned courses', 'Students', 'Results', 'Published']} />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
