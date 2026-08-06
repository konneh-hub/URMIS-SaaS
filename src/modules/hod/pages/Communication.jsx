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
    case 'SENT': return 'success';
    case 'READ': return 'info';
    case 'PENDING': return 'warning';
    case 'FAILED': return 'danger';
    default: return 'neutral';
  }
}

export default function Communication() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', channel: 'EMAIL' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/admin/platform/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) setNotifications(body.data);
          else setError(body.message || 'Failed to load communication');
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
      const resp = await fetch(`${API_BASE}/api/admin/platform/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success) setNotifications(body.data);
    } catch (e) { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/platform/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const body = await resp.json();
      if (body.success) {
        setIsOpen(false);
        setForm({ title: '', message: '', channel: 'EMAIL' });
        refresh();
      } else {
        alert(body.message || 'Failed to send message');
      }
    } catch (e) {
      alert('Could not send message');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Communication"
          title="Communication"
          description="Message lecturers and academic staff within your department."
          badge={<Badge tone="info">{notifications.length} messages</Badge>}
          actions={<Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Send message</Button>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Messages" value={notifications.length} description="All communications" badge="All" />
          <MetricTile title="Sent" value={notifications.filter((n) => n.status === 'SENT').length} description="Delivered" badgeTone="success" badge="Sent" />
          <MetricTile title="Pending" value={notifications.filter((n) => n.status === 'PENDING').length} description="Awaiting delivery" badgeTone="warning" badge="Queue" />
        </div>

        <Card title="Message log" description="Communications sent from your department workspace.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading messages...</p>
          ) : (
            <Table
              columns={[
                { header: 'Title', accessor: 'title' },
                { header: 'Channel', accessor: 'channel', render: (value) => <Badge tone="info">{value}</Badge> },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value)}>{value}</Badge> },
              ]}
              rows={notifications}
              emptyText="No messages sent yet."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="Send message"
        description="Broadcast a message to your department or academic team."
        onClose={() => setIsOpen(false)}
        footer={<div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button></div>}
      >
        <form onSubmit={handleSend} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          <label className="block text-sm font-medium text-[var(--color-text)]">
            <span className="mb-2 block">Channel</span>
            <select
              className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-primary)]"
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value })}
            >
              <option value="EMAIL">Email</option>
              <option value="SMS">SMS</option>
              <option value="PUSH">Push</option>
            </select>
          </label>
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Send message</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
