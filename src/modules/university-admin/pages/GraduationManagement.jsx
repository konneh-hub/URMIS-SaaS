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

function tone(v) {
  if (v === 'CLEARED') return 'success';
  if (v === 'FLAGGED') return 'warning';
  return 'neutral';
}

export default function GraduationManagement() {
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
          if (!clrBody.success) setError(clrBody.message || 'Failed to load graduation data');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const cleared = clearances.filter((c) => c.status === 'CLEARED').length;
  const flagged = clearances.filter((c) => c.status === 'FLAGGED').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Convocation"
          title="Graduation Management"
          description="Coordinate graduation lists and certificates."
          badge={<Badge tone="info">{clearances.length} clearances</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-4">
          <MetricTile title="Clearances" value={clearances.length} description="Total clearances" badge="All" />
          <MetricTile title="Cleared" value={cleared} description="Eligible candidates" badgeTone="success" badge="Ready" />
          <MetricTile title="Flagged" value={flagged} description="Needs attention" badgeTone="warning" badge="Flagged" />
          <MetricTile title="Ceremonies" value={lists.length} description="Graduation lists" badgeTone="info" badge="Lists" />
        </div>

        <Card title="Graduation clearances" description="Student clearance status for graduation.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading clearances...</p>
          ) : (
            <Table
              columns={[
                { header: 'Student', accessor: 'student', render: (_v, row) => row.student ? `${row.student.firstName} ${row.student.lastName}` : '—' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={tone(value)}>{value}</Badge> },
                { header: 'Notes', accessor: 'notes' },
              ]}
              rows={clearances}
              emptyText="No graduation clearances yet."
            />
          )}
        </Card>

        <Card title="Graduation lists" description="Planned graduation ceremonies.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading graduation lists...</p>
          ) : (
            <Table
              columns={[
                { header: 'Title', accessor: 'title' },
                { header: 'Students', accessor: 'studentCount' },
                { header: 'Date', accessor: 'graduationDate', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
              ]}
              rows={lists}
              emptyText="No graduation lists yet."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
