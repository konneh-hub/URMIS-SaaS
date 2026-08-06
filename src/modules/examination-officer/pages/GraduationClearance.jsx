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

function tone(status) {
  if (status === 'CLEARED') return 'success';
  if (status === 'FLAGGED') return 'warning';
  return 'neutral';
}

export default function GraduationClearance() {
  const [clearances, setClearances] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [clrResp, lstResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/platform/graduation-clearances`, { headers }),
          fetch(`${API_BASE}/api/admin/platform/graduation-lists`, { headers }),
        ]);
        const clrBody = await clrResp.json();
        const lstBody = await lstResp.json();

        if (!cancelled) {
          if (clrBody.success) setClearances(clrBody.data);
          if (lstBody.success) setLists(lstBody.data);
          if (!clrBody.success) setError(clrBody.message || 'Failed to load graduation clearance data');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const cleared = clearances.filter((item) => item.status === 'CLEARED').length;
  const flagged = clearances.filter((item) => item.status === 'FLAGGED').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Clearance"
          title="Graduation Clearance"
          description="Review and manage graduation clearance status for eligible students."
          badge={<Badge tone="info">{clearances.length} clearances</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-4">
          <MetricTile title="Total clearances" value={clearances.length} description="Graduation clearance records" badge="Total" />
          <MetricTile title="Cleared" value={cleared} description="Eligible candidates" badgeTone="success" badge="Cleared" />
          <MetricTile title="Flagged" value={flagged} description="Students needing review" badgeTone="warning" badge="Flagged" />
          <MetricTile title="Ceremonies" value={lists.length} description="Graduation lists" badgeTone="info" badge="Lists" />
        </div>

        <Card title="Graduation clearances" description="Student graduation clearance status and review notes.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading graduation clearance data...</p>
          ) : (
            <Table
              columns={[
                { header: 'Student', accessor: 'student', render: (_value, row) => row.student ? `${row.student.firstName} ${row.student.lastName}` : '—' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={tone(value)}>{value}</Badge> },
                { header: 'Notes', accessor: 'notes' },
                { header: 'Updated', accessor: 'updatedAt', render: (value) => value ? new Date(value).toLocaleDateString() : '—' },
              ]}
              rows={clearances}
              emptyText="No graduation clearances available."
            />
          )}
        </Card>

        <Card title="Upcoming ceremonies" description="Planned graduation events based on clearance data.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading graduation lists...</p>
          ) : (
            <Table
              columns={[
                { header: 'Title', accessor: 'title' },
                { header: 'Date', accessor: 'graduationDate', render: (value) => value ? new Date(value).toLocaleDateString() : '—' },
                { header: 'Students', accessor: 'studentCount' },
              ]}
              rows={lists}
              emptyText="No graduation lists available."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
