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

export default function CourseManagement() {
  const [curricula, setCurricula] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ programmeId: '', year: '', title: '', code: '', creditUnits: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [currResp, progResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/academic/curricula`, { headers }),
          fetch(`${API_BASE}/api/admin/academic/programmes`, { headers }),
        ]);
        const currBody = await currResp.json();
        const progBody = await progResp.json();
        if (!cancelled) {
          if (currBody.success) setCurricula(currBody.data);
          if (progBody.success) setProgrammes(progBody.data);
          if (!currBody.success) setError(currBody.message || 'Failed to load course curricula');
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
      if (body.success) setCurricula(body.data);
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
        body: JSON.stringify({ programmeId: form.programmeId, year: Number(form.year) }),
      });
      const body = await resp.json();
      if (body.success) {
        setIsOpen(false);
        setForm({ programmeId: '', year: '', title: '', code: '', creditUnits: '' });
        refresh();
      } else {
        alert(body.message || 'Failed to create curriculum entry');
      }
    } catch (e) {
      alert('Could not create curriculum entry');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Academics"
          title="Course Management"
          description="Organize and manage the university course catalog and curriculum."
          badge={<Badge tone="info">{curricula.length} curriculum entries</Badge>}
          actions={(
            <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Add curriculum entry</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Curriculum entries" value={curricula.length} description="Course-session mappings" badge="All" />
          <MetricTile title="Programmes" value={programmes.length} description="Linked programmes" badgeTone="info" badge="Progs" />
          <MetricTile title="Years covered" value={new Set(curricula.map((c) => c.year)).size} description="Academic years" badgeTone="success" badge="Years" />
        </div>

        <Card title="Course curriculum" description="Courses mapped across programmes and years.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading curriculum...</p>
          ) : (
            <Table
              columns={[
                { header: 'Programme', accessor: 'programme', render: (_v, row) => row.programme?.title || '—' },
                { header: 'Year', accessor: 'year', render: (value) => <Badge tone="info">Year {value}</Badge> },
                { header: 'Semester', accessor: 'semester', render: (_v, row) => row.semester?.name || '—' },
                { header: 'Course', accessor: 'course', render: (_v, row) => row.course?.title || '—' },
                { header: 'Course code', accessor: 'courseCode', render: (_v, row) => row.course?.code || '—' },
              ]}
              rows={curricula}
              emptyText="No curriculum entries yet."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="Add curriculum entry"
        description="Map a course to a programme and academic year."
        onClose={() => setIsOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        )}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)]">
              <span className="mb-2 block">Programme</span>
              <select
                className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-primary)]"
                value={form.programmeId}
                onChange={(e) => setForm({ ...form, programmeId: e.target.value })}
                required
              >
                <option value="">Select programme</option>
                {programmes.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </label>
          </div>
          <Input label="Year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required />
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Add entry</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
