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

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d) ? '—' : d.toLocaleDateString();
}

export default function AcademicSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/admin/academic/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) setSessions(body.data);
          else setError(body.message || 'Failed to load academic sessions');
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
      const resp = await fetch(`${API_BASE}/api/admin/academic/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success) setSessions(body.data);
    } catch (e) { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/academic/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const body = await resp.json();
      if (body.success) {
        setIsOpen(false);
        setForm({ name: '', startDate: '', endDate: '' });
        refresh();
      } else {
        alert(body.message || 'Failed to create academic session');
      }
    } catch (e) {
      alert('Could not create academic session');
    }
  }

  const active = sessions.filter((s) => s.active).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Academic Calendar"
          title="Academic Sessions"
          description="Manage academic calendar sessions."
          badge={<Badge tone="info">{sessions.length} sessions</Badge>}
          actions={(
            <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Add session</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Sessions" value={sessions.length} description="Total sessions" badge="All" />
          <MetricTile title="Active" value={active} description="Current session" badgeTone="success" badge="Live" />
          <MetricTile title="Semesters" value={sessions.reduce((s, x) => s + (x._count?.semesters || 0), 0)} description="Linked semesters" badgeTone="info" badge="Sem" />
        </div>

        <Card title="Academic sessions" description="All academic sessions within your institution.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading sessions...</p>
          ) : (
            <Table
              columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Start', accessor: 'startDate', render: formatDate },
                { header: 'End', accessor: 'endDate', render: formatDate },
                { header: 'Status', accessor: 'active', render: (value) => <Badge tone={value ? 'success' : 'neutral'}>{value ? 'Active' : 'Inactive'}</Badge> },
                { header: 'Semesters', accessor: 'semesters', render: (_v, row) => row._count?.semesters || 0 },
              ]}
              rows={sessions}
              emptyText="No academic sessions created yet."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="Create academic session"
        description="Add a new academic session to the calendar."
        onClose={() => setIsOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        )}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Session name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Start date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            <Input label="End date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Create session</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
