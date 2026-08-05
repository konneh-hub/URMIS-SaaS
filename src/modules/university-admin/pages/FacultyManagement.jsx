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

export default function FacultyManagement() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', code: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/admin/academic/faculties`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) setFaculties(body.data);
          else setError(body.message || 'Failed to load faculties');
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
      const resp = await fetch(`${API_BASE}/api/admin/academic/faculties`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success) setFaculties(body.data);
    } catch (e) { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/academic/faculties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const body = await resp.json();
      if (body.success) {
        setIsOpen(false);
        setForm({ name: '', code: '' });
        refresh();
      } else {
        alert(body.message || 'Failed to create faculty');
      }
    } catch (e) {
      alert('Could not create faculty');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Academic Structure"
          title="Faculty Management"
          description="Create and manage faculties across your university."
          badge={<Badge tone="info">{faculties.length} faculties</Badge>}
          actions={(
            <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Add faculty</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Faculties" value={faculties.length} description="Academic faculties" badge="All" />
          <MetricTile title="Departments" value={faculties.reduce((s, f) => s + (f._count?.departments || 0), 0)} description="Linked departments" badgeTone="info" badge="Depts" />
          <MetricTile title="Programmes" value={faculties.reduce((s, f) => s + (f._count?.programmes || 0), 0)} description="Linked programmes" badgeTone="success" badge="Progs" />
        </div>

        <Card title="Faculties" description="All faculties within your institution.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading faculties...</p>
          ) : (
            <Table
              columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Code', accessor: 'code', render: (value) => <Badge tone="info">{value}</Badge> },
                { header: 'Departments', accessor: 'departments', render: (_v, row) => row._count?.departments || 0 },
                { header: 'Programmes', accessor: 'programmes', render: (_v, row) => row._count?.programmes || 0 },
              ]}
              rows={faculties}
              emptyText="No faculties created yet."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="Create faculty"
        description="Add a new academic faculty."
        onClose={() => setIsOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        )}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Faculty name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Create faculty</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
