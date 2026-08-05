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

function statusTone(status) {
  switch (status) {
    case 'OPEN': return 'success';
    case 'DRAFT': return 'neutral';
    case 'CLOSED': return 'warning';
    default: return 'neutral';
  }
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d) ? '—' : d.toLocaleDateString();
}

export default function CourseRegistration() {
  const [windows, setWindows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/admin/platform/registration-windows`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) setWindows(body.data);
          else setError(body.message || 'Failed to load registration windows');
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
      const resp = await fetch(`${API_BASE}/api/admin/platform/registration-windows`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success) setWindows(body.data);
    } catch (e) { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/platform/registration-windows`, {
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
        alert(body.message || 'Failed to create registration window');
      }
    } catch (e) {
      alert('Could not create registration window');
    }
  }

  async function setWindowStatus(id, status) {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE}/api/admin/platform/registration-windows/${id}/${status}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      refresh();
    } catch (e) { /* ignore */ }
  }

  const open = windows.filter((w) => w.status === 'OPEN').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Enrollment"
          title="Course Registration"
          description="Coordinate student course registration windows."
          badge={<Badge tone="info">{windows.length} windows</Badge>}
          actions={(
            <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Open window</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Windows" value={windows.length} description="Registration windows" badge="All" />
          <MetricTile title="Open" value={open} description="Currently open" badgeTone="success" badge="Live" />
          <MetricTile title="Closed" value={windows.filter((w) => w.status === 'CLOSED').length} description="Completed windows" badgeTone="warning" badge="Done" />
        </div>

        <Card title="Registration windows" description="Manage course registration windows.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading windows...</p>
          ) : (
            <Table
              columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Start', accessor: 'startDate', render: formatDate },
                { header: 'End', accessor: 'endDate', render: formatDate },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value)}>{value}</Badge> },
                { header: 'Actions', accessor: 'actions', render: (_v, row) => (
                  <div className="flex flex-wrap gap-2">
                    {row.status !== 'OPEN' ? <Button variant="success" size="sm" onClick={() => setWindowStatus(row.id, 'open')}>Open</Button> : null}
                    {row.status !== 'CLOSED' ? <Button variant="warning" size="sm" onClick={() => setWindowStatus(row.id, 'close')}>Close</Button> : null}
                  </div>
                ) },
              ]}
              rows={windows}
              emptyText="No registration windows created yet."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="Create registration window"
        description="Define a new course registration period."
        onClose={() => setIsOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        )}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Window name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Start date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            <Input label="End date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Create window</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
