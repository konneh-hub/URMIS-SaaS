"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/auth/AuthProvider';
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
    case 'RESOLVED': return 'success';
    case 'OPEN': return 'warning';
    case 'IN_PROGRESS': return 'info';
    default: return 'neutral';
  }
}

export default function Support() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/institution/student/support-tickets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          setTickets(Array.isArray(body) ? body : (body.data || []));
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/institution/student/support-tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const body = await resp.json();
      if (body.success || resp.ok) {
        setIsOpen(false);
        setTickets((prev) => [...prev, { ...form, status: 'OPEN', createdAt: new Date().toISOString() }]);
        setForm({ subject: '', message: '' });
      } else {
        alert(body.message || 'Failed to submit support ticket');
      }
    } catch (e) {
      alert('Could not submit support ticket');
    }
  }

  const open = tickets.filter((t) => t.status === 'OPEN').length;
  const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Help"
          title="Support"
          description="Submit support tickets and track resolutions for your account issues."
          badge={<Badge tone="info">{tickets.length} tickets</Badge>}
          actions={<Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>New ticket</Button>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Total" value={tickets.length} description="All support tickets" badge="All" />
          <MetricTile title="Open" value={open} description="Awaiting response" badgeTone="warning" badge="Open" />
          <MetricTile title="Resolved" value={resolved} description="Completed" badgeTone="success" badge="Done" />
        </div>

        <Card title="My support tickets" description="History of your support requests.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading tickets...</p>
          ) : (
            <Table
              columns={[
                { header: 'Subject', accessor: 'subject' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value || 'OPEN')}>{value || 'OPEN'}</Badge> },
                { header: 'Created', accessor: 'createdAt', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
              ]}
              rows={tickets}
              emptyText="You have no support tickets yet."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="New support ticket"
        description="Describe your issue and we will get back to you."
        onClose={() => setIsOpen(false)}
        footer={(<div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button></div>)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          <Input label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Submit ticket</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
