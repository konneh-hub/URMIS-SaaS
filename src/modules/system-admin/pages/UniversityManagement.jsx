"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Table from '../../../shared/components/ui/Table';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Dialog from '../../../shared/components/ui/Dialog';
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

export default function UniversityManagement() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', domain: '', email: '', phone: '', address: '' });

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

  async function refresh() {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/institutions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success) setInstitutions(body.data);
    } catch (e) { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/institutions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const body = await resp.json();
      if (body.success) {
        setIsOpen(false);
        setForm({ name: '', code: '', domain: '', email: '', phone: '', address: '' });
        refresh();
      } else {
        alert(body.message || 'Failed to create institution');
      }
    } catch (e) {
      alert('Could not create institution');
    }
  }

  async function updateStatus(id, status) {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE}/api/institutions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      refresh();
    } catch (e) { /* ignore */ }
  }

  const active = institutions.filter((i) => i.status === 'ACTIVE').length;
  const pending = institutions.filter((i) => i.status === 'PENDING').length;
  const suspended = institutions.filter((i) => i.status === 'SUSPENDED').length;
  const total = institutions.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Platform Administration"
          title="University Management"
          description="Create and manage institutions across the URMIS platform."
          badge={<Badge tone="info">{total} institutions</Badge>}
          actions={(
            <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Add institution</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-4">
          <MetricTile title="Institutions" value={total} description="Total registered" badge="All" />
          <MetricTile title="Active" value={active} description="Operating tenants" badgeTone="success" badge="Live" />
          <MetricTile title="Pending" value={pending} description="Awaiting activation" badgeTone="info" badge="Queue" />
          <MetricTile title="Suspended" value={suspended} description="Account on hold" badgeTone="warning" badge="On hold" />
        </div>

        <Card title="Registered institutions" description="Overview of every tenant on the platform.">
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
                { header: 'Actions', accessor: 'actions', render: (_v, row) => (
                  <div className="flex gap-2">
                    {row.status !== 'ACTIVE' ? <Button variant="success" size="sm" onClick={() => updateStatus(row.id, 'ACTIVE')}>Activate</Button> : null}
                    {row.status !== 'SUSPENDED' ? <Button variant="warning" size="sm" onClick={() => updateStatus(row.id, 'SUSPENDED')}>Suspend</Button> : null}
                  </div>
                ) },
              ]}
              rows={institutions.map((i) => ({ ...i, actions: '' }))}
              emptyText="No institutions registered yet."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="Create institution"
        description="Provision a new university tenant."
        onClose={() => setIsOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        )}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Institution name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            <Input label="Domain" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} required />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Create institution</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
