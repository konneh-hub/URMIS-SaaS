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
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', title: '', departmentId: '', facultyId: '', phone: '', firstName: '', lastName: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const [staffResp, deptResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/staff`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/admin/academic/departments`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const [staffBody, deptBody] = await Promise.all([staffResp.json(), deptResp.json()]);
        if (!cancelled) {
          if (staffBody.success) setStaff(staffBody.data);
          else setError(staffBody.message || 'Failed to load staff');
          if (deptBody.success) setDepartments(deptBody.data);
        }
      } catch {
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
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const firstName = form.firstName || form.name.trim().split(/\s+/)[0] || '';
      const lastName = form.lastName || form.name.trim().split(/\s+/).slice(1).join(' ') || '';
      const normalizedTitle = (form.title || '').trim();
      const role = normalizedTitle.toUpperCase() === 'HOD'
        ? 'HOD'
        : normalizedTitle.toUpperCase() === 'DEAN'
          ? 'DEAN'
          : normalizedTitle.toUpperCase() === 'EXAM_OFFICER'
            ? 'EXAM_OFFICER'
            : 'LECTURER';
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role,
        title: normalizedTitle,
        departmentId: form.departmentId || undefined,
        facultyId: form.facultyId || undefined,
        phone: form.phone || undefined,
        firstName,
        lastName,
        profile: {
          title: normalizedTitle || undefined,
          departmentId: form.departmentId || undefined,
          facultyId: form.facultyId || undefined,
          firstName,
          lastName,
          phone: form.phone || undefined,
        },
        employment: {
          position: normalizedTitle || role,
          departmentId: form.departmentId || undefined,
          facultyId: form.facultyId || undefined,
        },
      };
      const resp = await fetch(`${API_BASE}/api/admin/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const body = await resp.json();
      if (body.success) {
        setIsOpen(false);
        setForm({ name: '', email: '', title: '', departmentId: '', facultyId: '', phone: '', firstName: '', lastName: '' });
        refresh();
      } else {
        alert(body.message || 'Failed to create staff');
      }
    } catch {
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
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <Input label="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)]">
                <span className="mb-2 block">Department</span>
                <select
                  className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-primary)]"
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <Input label="Faculty ID" value={form.facultyId} onChange={(e) => setForm({ ...form, facultyId: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Add staff</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
