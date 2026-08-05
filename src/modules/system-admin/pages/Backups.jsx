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

function backupTone(status) {
  switch (status) {
    case 'COMPLETED': return 'success';
    case 'RUNNING': return 'info';
    case 'PENDING': return 'warning';
    case 'FAILED': return 'danger';
    default: return 'neutral';
  }
}

export default function Backups() {
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
          else setError(body.message || 'Failed to load institutions for backups');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function triggerBackup(institutionId, name) {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE}/api/institutions/${institutionId}/backups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: `${name} snapshot`, provider: 'LOCAL', type: 'FULL' }),
      });
      alert('Backup job created.');
    } catch (e) {
      alert('Could not create backup job');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Operations"
          title="Backups"
          description="Create on-demand backups and review restore points for tenants."
          badge={<Badge tone="info">{institutions.length} tenants</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Tenants" value={institutions.length} description="Backup capable" badge="All" />
          <MetricTile title="Storage avg" value={`${institutions.length ? Math.round(institutions.reduce((s, i) => s + (i.storageUsedMb || 0), 0) / institutions.length) : 0} MB`} description="Average usage" badgeTone="info" badge="Used" />
          <MetricTile title="Storage limit" value={`${institutions[0]?.storageLimitMb || 1024} MB`} description="Default tenant limit" badgeTone="success" badge="Limit" />
        </div>

        <Card title="Backup management" description="Trigger and manage backups for each institution.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading institutions...</p>
          ) : (
            <Table
              columns={[
                { header: 'Institution', accessor: 'name' },
                { header: 'Code', accessor: 'code' },
                { header: 'Storage used', accessor: 'storageUsedMb', render: (value) => `${Math.round(value || 0)} MB` },
                { header: 'Storage limit', accessor: 'storageLimitMb', render: (value) => `${Math.round(value || 0)} MB` },
                { header: 'Actions', accessor: 'actions', render: (_v, row) => (
                  <Button variant="secondary" size="sm" onClick={() => triggerBackup(row.id, row.name)}>Backup now</Button>
                ) },
              ]}
              rows={institutions}
              emptyText="No institutions available for backup."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
