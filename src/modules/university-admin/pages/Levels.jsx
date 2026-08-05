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

export default function Levels() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/admin/academic/levels`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) setLevels(body.data);
          else setError(body.message || 'Failed to load levels');
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
      const resp = await fetch(`${API_BASE}/api/admin/academic/levels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success) setLevels(body.data);
    } catch (e) { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/academic/levels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const body = await resp.json();
      if (body.success) {
        setIsOpen(false);
        setForm({ name: '', code: '', description: '' });
        refresh();
      } else {
        alert(body.message || 'Failed to create level');
      }
    } catch (e) {
      alert('Could not create level');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Academics"
          title="Levels"
          description="Manage academic levels and progression."
          badge={<Badge tone="info">{levels.length} levels</Badge>}
          actions={(
            <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Add level</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Levels" value={levels.length} description="Academic levels" badge="All" />
          <MetricTile title="Programmes" value={levels.reduce((s, l) => s + (l._count?.programmes || 0), 0)} description="Linked programmes" badgeTone="info" badge="Progs" />
          <MetricTile title="Progression" value="100%" description="Level coverage" badgeTone="success" badge="Ready" />
        </div>

        <Card title="Levels" description="All academic levels within your institution.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading levels...</p>
          ) : (
            <Table
              columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Code', accessor: 'code', render: (value) => <Badge tone="info">{value}</Badge> },
                { header: 'Description', accessor: 'description' },
                { header: 'Programmes', accessor: 'programmes', render: (_v, row) => row._count?.programmes || 0 },
              ]}
              rows={levels}
              emptyText="No levels created yet."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="Create level"
        description="Add a new academic level."
        onClose={() => setIsOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        )}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Level name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Create level</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
