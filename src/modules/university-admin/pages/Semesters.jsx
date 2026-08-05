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

export default function Semesters() {
  const [semesters, setSemesters] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', sessionId: '', startDate: '', endDate: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [semResp, sessResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/academic/curricula`, { headers }),
          fetch(`${API_BASE}/api/admin/academic/sessions`, { headers }),
        ]);
        const semBody = await semResp.json();
        const sessBody = await sessResp.json();
        if (!cancelled) {
          if (sessBody.success) setSessions(sessBody.data);
          if (semBody.success) setSemesters(semBody.data);
          if (!sessBody.success) setError(sessBody.message || 'Failed to load sessions');
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
      const resp = await fetch(`${API_BASE}/api/admin/academic/curricula`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success) setSemesters(body.data);
    } catch (e) { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/academic/curricula`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ programmeId: form.sessionId, year: 1 }),
      });
      const body = await resp.json();
      if (body.success) {
        setIsOpen(false);
        setForm({ name: '', sessionId: '', startDate: '', endDate: '' });
        refresh();
      } else {
        alert(body.message || 'Failed to create semester entry');
      }
    } catch (e) {
      alert('Could not create semester entry');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Academic Calendar"
          title="Semesters"
          description="Create and manage semesters across academic sessions."
          badge={<Badge tone="info">{semesters.length} entries</Badge>}
          actions={(
            <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Add semester</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Semester entries" value={semesters.length} description="Curricula mappings" badge="All" />
          <MetricTile title="Sessions" value={sessions.length} description="Academic sessions" badgeTone="info" badge="Sess" />
          <MetricTile title="Courses" value={semesters.reduce((s, x) => s + (x._count  ? 0 : 0), 0)} description="Linked via curricula" badgeTone="success" badge="Courses" />
        </div>

        <Card title="Semesters" description="Semester structure across your academic calendar.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading semesters...</p>
          ) : (
            <Table
              columns={[
                { header: 'Semester', accessor: 'semester', render: (_v, row) => row.semester?.name || '—' },
                { header: 'Session', accessor: 'session', render: (_v, row) => row.programme?.title || formatDate(row.semester?.startDate) },
                { header: 'Start', accessor: 'startDate', render: (_v, row) => formatDate(row.semester?.startDate) },
                { header: 'End', accessor: 'endDate', render: (_v, row) => formatDate(row.semester?.endDate) },
                { header: 'Course', accessor: 'course', render: (_v, row) => row.course?.title || '—' },
              ]}
              rows={semesters}
              emptyText="No semester entries yet."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="Add semester"
        description="Map a semester entry to a session."
        onClose={() => setIsOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        )}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Semester name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)]">
              <span className="mb-2 block">Academic session</span>
              <select
                className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-primary)]"
                value={form.sessionId}
                onChange={(e) => setForm({ ...form, sessionId: e.target.value })}
                required
              >
                <option value="">Select session</option>
                {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Start date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            <Input label="End date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Add semester</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
