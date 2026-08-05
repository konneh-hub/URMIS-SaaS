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

export default function ProgrammeManagement() {
  const [programmes, setProgrammes] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ title: '', code: '', description: '', facultyId: '', departmentId: '', levelId: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [progResp, facResp, deptResp, lvlResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/academic/programmes`, { headers }),
          fetch(`${API_BASE}/api/admin/academic/faculties`, { headers }),
          fetch(`${API_BASE}/api/admin/academic/departments`, { headers }),
          fetch(`${API_BASE}/api/admin/academic/levels`, { headers }),
        ]);
        const progBody = await progResp.json();
        const facBody = await facResp.json();
        const deptBody = await deptResp.json();
        const lvlBody = await lvlResp.json();
        if (!cancelled) {
          if (progBody.success) setProgrammes(progBody.data);
          if (facBody.success) setFaculties(facBody.data);
          if (deptBody.success) setDepartments(deptBody.data);
          if (lvlBody.success) setLevels(lvlBody.data);
          if (!progBody.success) setError(progBody.message || 'Failed to load programmes');
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
      const resp = await fetch(`${API_BASE}/api/admin/academic/programmes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success) setProgrammes(body.data);
    } catch (e) { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/academic/programmes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const body = await resp.json();
      if (body.success) {
        setIsOpen(false);
        setForm({ title: '', code: '', description: '', facultyId: '', departmentId: '', levelId: '' });
        refresh();
      } else {
        alert(body.message || 'Failed to create programme');
      }
    } catch (e) {
      alert('Could not create programme');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Academic Structure"
          title="Programme Management"
          description="Manage academic programmes and curricula."
          badge={<Badge tone="info">{programmes.length} programmes</Badge>}
          actions={(
            <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Add programme</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-4">
          <MetricTile title="Programmes" value={programmes.length} description="Academic programmes" badge="All" />
          <MetricTile title="Faculties" value={faculties.length} description="Parent faculties" badgeTone="info" badge="Facts" />
          <MetricTile title="Departments" value={departments.length} description="Owning departments" badgeTone="success" badge="Depts" />
          <MetricTile title="Levels" value={levels.length} description="Linked levels" badgeTone="warning" badge="Levels" />
        </div>

        <Card title="Programmes" description="All academic programmes within your institution.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading programmes...</p>
          ) : (
            <Table
              columns={[
                { header: 'Title', accessor: 'title' },
                { header: 'Code', accessor: 'code', render: (value) => <Badge tone="info">{value}</Badge> },
                { header: 'Faculty', accessor: 'faculty', render: (_v, row) => row.faculty?.name || '—' },
                { header: 'Department', accessor: 'department', render: (_v, row) => row.department?.name || '—' },
                { header: 'Level', accessor: 'level', render: (_v, row) => row.level?.name || '—' },
              ]}
              rows={programmes}
              emptyText="No programmes created yet."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="Create programme"
        description="Add a new academic programme."
        onClose={() => setIsOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        )}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Programme title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            <div>
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
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)]">
                <span className="mb-2 block">Department</span>
                <select
                  className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-primary)]"
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)]">
                <span className="mb-2 block">Level</span>
                <select
                  className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-primary)]"
                  value={form.levelId}
                  onChange={(e) => setForm({ ...form, levelId: e.target.value })}
                  required
                >
                  <option value="">Select level</option>
                  {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </label>
            </div>
          </div>
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Create programme</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
