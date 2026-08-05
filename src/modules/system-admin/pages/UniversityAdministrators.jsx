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

export default function UniversityAdministrators() {
  const [admins, setAdmins] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);
  const [form, setForm] = useState({ email: '', name: '', institutionId: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [adminsResp, instResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/university-admins`, { headers }),
          fetch(`${API_BASE}/api/institutions`, { headers }),
        ]);
        const adminsBody = await adminsResp.json();
        const instBody = await instResp.json();
        if (!cancelled) {
          if (adminsBody.success) setAdmins(adminsBody.data);
          if (instBody.success) setInstitutions(instBody.data);
          if (!adminsBody.success) setError(adminsBody.message || 'Failed to load administrators');
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
      const resp = await fetch(`${API_BASE}/api/admin/university-admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success) setAdmins(body.data);
    } catch (e) { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/university-admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const body = await resp.json();
      if (body.success) {
        setTempPassword(body.data.tempPassword);
        setIsOpen(false);
        setForm({ email: '', name: '', institutionId: '' });
        refresh();
      } else {
        alert(body.message || 'Failed to create administrator');
      }
    } catch (e) {
      alert('Could not create administrator');
    }
  }

  async function toggleActive(admin) {
    try {
      const token = localStorage.getItem('accessToken');
      const action = admin.isActive ? 'deactivate' : 'activate';
      await fetch(`${API_BASE}/api/admin/university-admins/${admin.id}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      refresh();
    } catch (e) { /* ignore */ }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Role Management"
          title="University Administrators"
          description="Manage university-level admin accounts and their access."
          badge={<Badge tone="info">{admins.length} admins</Badge>}
          actions={(
            <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Add administrator</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}
        {tempPassword ? (
          <Alert title="Administrator created" tone="success">
            Temporary password: <strong>{tempPassword}</strong> — share it with the new administrator.
          </Alert>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Administrators" value={admins.length} description="Total accounts" badge="All" />
          <MetricTile title="Active" value={admins.filter((a) => a.isActive).length} description="Enabled accounts" badgeTone="success" badge="Live" />
          <MetricTile title="Inactive" value={admins.filter((a) => !a.isActive).length} description="Disabled accounts" badgeTone="warning" badge="Off" />
        </div>

        <Card title="Administrator accounts" description="Accounts with university-level administration access.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading administrators...</p>
          ) : (
            <Table
              columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Email', accessor: 'email' },
                { header: 'Institution', accessor: 'institution', render: (_v, row) => row.institution?.name || 'Unassigned' },
                { header: 'Status', accessor: 'isActive', render: (value) => <Badge tone={value ? 'success' : 'warning'}>{value ? 'Active' : 'Inactive'}</Badge> },
                { header: 'Actions', accessor: 'actions', render: (_v, row) => (
                  <Button variant={row.isActive ? 'warning' : 'success'} size="sm" onClick={() => toggleActive(row)}>
                    {row.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                ) },
              ]}
              rows={admins}
              emptyText="No university administrators found."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="Create university administrator"
        description="Provision a new admin and assign their institution."
        onClose={() => setIsOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        )}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <label className="block text-sm font-medium text-[var(--color-text)]">
            <span className="mb-2 block">Institution</span>
            <select
              className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-primary)]"
              value={form.institutionId}
              onChange={(e) => setForm({ ...form, institutionId: e.target.value })}
              required
            >
              <option value="">Select institution</option>
              {institutions.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </label>
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Create administrator</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
