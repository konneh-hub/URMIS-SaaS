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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

function statusTone(status) {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'SUSPENDED': return 'warning';
    case 'PENDING': return 'info';
    default: return 'neutral';
  }
}

export default function Institutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/institutions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) setInstitutions(body.data);
          else setError(body.message || 'Failed to load institutions');
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
          eyebrow="Platform Administration"
          title="Institutions"
          description="Overview of all institutions on the platform."
          badge={<Badge tone="info">{institutions.length} institutions</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Total" value={institutions.length} description="Registered tenants" badge="All" />
          <MetricTile title="Active" value={institutions.filter((i) => i.status === 'ACTIVE').length} description="Operating" badgeTone="success" badge="Live" />
          <MetricTile title="Suspended" value={institutions.filter((i) => i.status === 'SUSPENDED').length} description="On hold" badgeTone="warning" badge="Hold" />
        </div>

        <Card title="Institution list" description="Every tenant on the URMIS platform.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading institutions...</p>
          ) : (
            <Table
              columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Code', accessor: 'code' },
                { header: 'Domain', accessor: 'domain' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value)}>{value}</Badge> },
                { header: 'Plan', accessor: 'subscriptionPlan' },
              ]}
              rows={institutions}
              emptyText="No institutions registered yet."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
