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

const roleOptions = ['UNIVERSITY_ADMIN', 'EXAM_OFFICER', 'DEAN', 'HOD', 'LECTURER', 'STUDENT'];

function roleTone(role) {
  if (role === 'UNIVERSITY_ADMIN') return 'info';
  if (role === 'STUDENT') return 'neutral';
  return 'success';
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);
  const [form, setForm] = useState({ email: '', name: '', role: 'LECTURER' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) setUsers(body.data);
          else setError(body.message || 'Failed to load users');
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
      const resp = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success) setUsers(body.data);
    } catch (e) { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const body = await resp.json();
      if (body.success) {
        setTempPassword(body.data.tempPassword);
        setIsOpen(false);
        setForm({ email: '', name: '', role: 'LECTURER' });
        refresh();
      } else {
        alert(body.message || 'Failed to create user');
      }
    } catch (e) {
      alert('Could not create user');
    }
  }

  async function toggleActive(user) {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE}/api/admin/users/${user.id}/active`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active: !user.isActive }),
      });
      refresh();
    } catch (e) { /* ignore */ }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Access Control"
          title="User Management"
          description="Manage users and their access permissions."
          badge={<Badge tone="info">{users.length} users</Badge>}
          actions={(
            <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Add user</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}
        {tempPassword ? (
          <Alert title="User created" tone="success">
            Temporary password: <strong>{tempPassword}</strong> — share it securely with the user.
          </Alert>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          <MetricTile title="Total users" value={users.length} description="Active & inactive" badge="All" />
          <MetricTile title="Active" value={users.filter((u) => u.isActive).length} description="Enabled accounts" badgeTone="success" badge="Live" />
          <MetricTile title="Academic staff" value={users.filter((u) => ['LECTURER', 'HOD', 'DEAN', 'EXAM_OFFICER'].includes(u.role)).length} description="Teaching roles" badgeTone="info" badge="Staff" />
          <MetricTile title="Students" value={users.filter((u) => u.role === 'STUDENT').length} description="Student accounts" badgeTone="warning" badge="Stud" />
        </div>

        <Card title="All users" description="Manage access and roles for every account.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading users...</p>
          ) : (
            <Table
              columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Email', accessor: 'email' },
                { header: 'Role', accessor: 'role', render: (value) => <Badge tone={roleTone(value)}>{value}</Badge> },
                { header: 'Status', accessor: 'isActive', render: (value) => <Badge tone={value ? 'success' : 'warning'}>{value ? 'Active' : 'Inactive'}</Badge> },
                { header: 'Actions', accessor: 'actions', render: (_v, row) => (
                  <Button variant={row.isActive ? 'warning' : 'success'} size="sm" onClick={() => toggleActive(row)}>
                    {row.isActive ? 'Disable' : 'Enable'}
                  </Button>
                ) },
              ]}
              rows={users}
              emptyText="No users found."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="Create user"
        description="Provision a new account within your university."
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
            <span className="mb-2 block">Role</span>
            <select
              className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-primary)]"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Create user</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
