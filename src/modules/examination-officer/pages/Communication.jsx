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

  async function loadNotifications() {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/platform/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success) setNotifications(body.data);
      else setError(body.message || 'Failed to load notifications');
    } catch (e) {
      setError('Could not reach the platform API.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

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
        loadNotifications();
      } else {
        setError(body.message || 'Failed to send message');
      }
    } catch (e) {
      setError('Could not send message.');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Communication"
          title="Communication"
          description="Send announcements and track notifications for exam operations."
          badge={<Badge tone="info">{notifications.length} messages</Badge>}
          actions={<Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Send message</Button>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Messages" value={notifications.length} description="Total communications" badge="Messages" />
          <MetricTile title="Sent" value={notifications.filter((item) => item.status === 'SENT').length} description="Delivered messages" badgeTone="success" badge="Sent" />
          <MetricTile title="Pending" value={notifications.filter((item) => item.status === 'PENDING').length} description="Awaiting dispatch" badgeTone="warning" badge="Pending" />
        </div>

        <Card title="Communication log" description="Review and manage exam office communication." >
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading communications...</p>
          ) : (
            <Table
              columns={[
                { header: 'Title', accessor: 'title' },
                { header: 'Channel', accessor: 'channel', render: (value) => <Badge tone="info">{value}</Badge> },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value)}>{value}</Badge> },
              ]}
              rows={notifications}
              emptyText="No communications available."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="Send announcement"
        description="Broadcast a notification to students and academic staff."
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
