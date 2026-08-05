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

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', title: '', departmentId: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/admin/staff`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) setStaff(body.data);
          else setError(body.message || 'Failed to load staff');
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
      const resp = await fetch(`${API_BASE}/api/admin/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success) setStaff(body.data);
    } catch (e) { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const body = await resp.json();
      if (body.success) {
        setIsOpen(false);
        setForm({ name: '', email: '', title: '', departmentId: '' });
        refresh();
      } else {
        alert(body.message || 'Failed to create staff');
      }
    } catch (e) {
      alert('Could not create staff');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Human Resources"
          title="Staff Management"
          description="Manage staff records and assignments."
          badge={<Badge tone="info">{staff.length} staff</Badge>}
          actions={(
            <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Add staff</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Staff" value={staff.length} description="Total staff records" badge="All" />
          <MetricTile title="Assignments" value={staff.reduce((s, x) => s + (x._count?.assignments || 0), 0)} description="Linked assignments" badgeTone="info" badge="Asgn" />
          <MetricTile title="Academic staff" value={staff.filter((s) => s.role === 'LECTURER' || s.role === 'HOD' || s.role === 'DEAN').length} description="Teaching roles" badgeTone="success" badge="Teach" />
        </div>

        <Card title="Staff" description="All staff within your institution.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading staff...</p>
          ) : (
            <Table
              columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Email', accessor: 'email' },
                { header: 'Title', accessor: 'title', render: (_v, row) => row.staffProfile?.title || '—' },
                { header: 'Department', accessor: 'department', render: (_v, row) => row.staffProfile?.department?.name || '—' },
                { header: 'Assignments', accessor: 'assignments', render: (_v, row) => row._count?.assignments || 0 },
              ]}
              rows={staff}
              emptyText="No staff records yet."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="Add staff"
        description="Create a new staff record."
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
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Add staff</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
