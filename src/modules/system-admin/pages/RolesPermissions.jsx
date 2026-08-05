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

export default function RolesPermissions() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [rolesResp, permResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/rbac/roles`, { headers }),
          fetch(`${API_BASE}/api/admin/rbac/permissions`, { headers }),
        ]);
        const rolesBody = await rolesResp.json();
        const permBody = await permResp.json();
        if (!cancelled) {
          if (rolesBody.success) setRoles(rolesBody.data);
          if (permBody.success) setPermissions(permBody.data);
          if (!rolesBody.success) setError(rolesBody.message || 'Failed to load roles');
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
    const token = localStorage.getItem('accessToken');
    const headers = { Authorization: `Bearer ${token}` };
    const [rolesResp, permResp] = await Promise.all([
      fetch(`${API_BASE}/api/admin/rbac/roles`, { headers }),
      fetch(`${API_BASE}/api/admin/rbac/permissions`, { headers }),
    ]);
    const rolesBody = await rolesResp.json();
    const permBody = await permResp.json();
    if (rolesBody.success) setRoles(rolesBody.data);
    if (permBody.success) setPermissions(permBody.data);
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/rbac/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const body = await resp.json();
      if (body.success) {
        setIsOpen(false);
        setForm({ name: '', description: '' });
        refresh();
      } else {
        alert(body.message || 'Failed to create role');
      }
    } catch (e) {
      alert('Could not create role');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Access Control"
          title="Roles & Permissions"
          description="Configure role-based access and platform permissions."
          badge={<Badge tone="info">{roles.length} roles</Badge>}
          actions={(
            <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Create role</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Roles" value={roles.length} description="Defined roles" badge="All" />
          <MetricTile title="Permissions" value={permissions.length} description="Granular permissions" badgeTone="info" badge="Grants" />
          <MetricTile title="Permission groups" value={new Set(permissions.map((p) => p.groupId)).size} description="Grouped modules" badgeTone="success" badge="Modules" />
        </div>

        <Card title="Roles" description="Role definitions and their assigned permissions.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading roles...</p>
          ) : (
            <Table
              columns={[
                { header: 'Role', accessor: 'name', render: (value) => <Badge tone="info">{value}</Badge> },
                { header: 'Description', accessor: 'description' },
                { header: 'Permissions', accessor: 'permissions', render: (value) => <span className="text-sm text-[var(--color-muted-text)]">{value?.length || 0} granted</span> },
              ]}
              rows={roles}
              emptyText="No roles defined yet."
            />
          )}
        </Card>

        <Card title="Permissions" description="All available permissions on the platform.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading permissions...</p>
          ) : (
            <Table
              columns={[
                { header: 'Permission', accessor: 'name', render: (value) => <code className="rounded bg-[var(--color-muted)] px-2 py-0.5 text-xs">{value}</code> },
                { header: 'Module', accessor: 'module' },
                { header: 'Type', accessor: 'type', render: (value) => <Badge>{value}</Badge> },
                { header: 'Description', accessor: 'description' },
              ]}
              rows={permissions}
              emptyText="No permissions defined yet."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="Create role"
        description="Add a new role to the access control matrix."
        onClose={() => setIsOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        )}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Role name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Create role</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
