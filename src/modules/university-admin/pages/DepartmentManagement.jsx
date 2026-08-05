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

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', facultyId: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [deptResp, facResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/academic/departments`, { headers }),
          fetch(`${API_BASE}/api/admin/academic/faculties`, { headers }),
        ]);
        const deptBody = await deptResp.json();
        const facBody = await facResp.json();
        if (!cancelled) {
          if (deptBody.success) setDepartments(deptBody.data);
          if (facBody.success) setFaculties(facBody.data);
          if (!deptBody.success) setError(deptBody.message || 'Failed to load departments');
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
      const headers = { Authorization: `Bearer ${token}` };
      const [deptResp, facResp] = await Promise.all([
        fetch(`${API_BASE}/api/admin/academic/departments`, { headers }),
        fetch(`${API_BASE}/api/admin/academic/faculties`, { headers }),
      ]);
      const deptBody = await deptResp.json();
      const facBody = await facResp.json();
      if (deptBody.success) setDepartments(deptBody.data);
      if (facBody.success) setFaculties(facBody.data);
    } catch (e) { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/academic/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const body = await resp.json();
      if (body.success) {
        setIsOpen(false);
        setForm({ name: '', code: '', facultyId: '' });
        refresh();
      } else {
        alert(body.message || 'Failed to create department');
      }
    } catch (e) {
      alert('Could not create department');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Academic Structure"
          title="Department Management"
          description="Create and maintain academic departments."
          badge={<Badge tone="info">{departments.length} departments</Badge>}
          actions={(
            <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Add department</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Departments" value={departments.length} description="Academic departments" badge="All" />
          <MetricTile title="Faculties" value={faculties.length} description="Parent faculties" badgeTone="info" badge="Facts" />
          <MetricTile title="Courses" value={departments.reduce((s, d) => s + (d._count?.courses || 0), 0)} description="Linked courses" badgeTone="success" badge="Courses" />
        </div>

        <Card title="Departments" description="All departments within your institution.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading departments...</p>
          ) : (
            <Table
              columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Code', accessor: 'code', render: (value) => <Badge tone="info">{value}</Badge> },
                { header: 'Faculty', accessor: 'faculty', render: (_v, row) => row.faculty?.name || '—' },
                { header: 'Courses', accessor: 'courses', render: (_v, row) => row._count?.courses || 0 },
                { header: 'Students', accessor: 'students', render: (_v, row) => row._count?.students || 0 },
              ]}
              rows={departments}
              emptyText="No departments created yet."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="Create department"
        description="Add a new academic department."
        onClose={() => setIsOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        )}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Department name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            <label className="block text-sm font-medium text-[var(--color-text)]">
              <span className="mb-2 block">Faculty</span>
              <select
                className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-primary)]"
                value={form.facultyId}
                onChange={(e) => setForm({ ...form, facultyId: e.target.value })}
                required
              >
                <option value="">Select faculty</option>
                {faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Create department</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
