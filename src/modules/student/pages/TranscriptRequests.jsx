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
    case 'APPROVED': return 'success';
    case 'PENDING': return 'warning';
    case 'PROCESSING': return 'info';
    case 'REJECTED': return 'danger';
    default: return 'neutral';
  }
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d) ? '—' : d.toLocaleDateString();
}

export default function TranscriptRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ purpose: '', copies: 1 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/institution/student/transcript-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          setRequests(Array.isArray(body) ? body : (body.data || []));
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  async function handleRequest(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/institution/student/transcript-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const body = await resp.json();
      if (body.success || resp.ok) {
        setIsOpen(false);
        setRequests((prev) => [...prev, { ...form, status: 'PENDING', requestedAt: new Date().toISOString() }]);
        setForm({ purpose: '', copies: 1 });
      } else {
        alert(body.message || 'Failed to request transcript');
      }
    } catch (e) {
      alert('Could not request transcript');
    }
  }

  const pending = requests.filter((r) => r.status === 'PENDING' || r.status === 'PROCESSING').length;
  const approved = requests.filter((r) => r.status === 'APPROVED').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Records"
          title="Transcript Requests"
          description="Request and track academic transcript requests."
          badge={<Badge tone="info">{requests.length} requests</Badge>}
          actions={<Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Request transcript</Button>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Total requests" value={requests.length} description="All requests" badge="All" />
          <MetricTile title="Pending" value={pending} description="In progress" badgeTone="warning" badge="Pending" />
          <MetricTile title="Approved" value={approved} description="Completed" badgeTone="success" badge="Approved" />
        </div>

        <Card title="My transcript requests" description="History of your transcript requests.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading requests...</p>
          ) : (
            <Table
              columns={[
                { header: 'Purpose', accessor: 'purpose' },
                { header: 'Copies', accessor: 'copies' },
                { header: 'Requested', accessor: 'requestedAt', render: formatDate },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value || 'PENDING')}>{value || 'PENDING'}</Badge> },
              ]}
              rows={requests}
              emptyText="You have not made any transcript requests."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="Request transcript"
        description="Submit a new transcript request."
        onClose={() => setIsOpen(false)}
        footer={(<div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button></div>)}
      >
        <form onSubmit={handleRequest} className="space-y-4">
          <Input label="Purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="e.g. Scholarship application" required />
          <Input label="Number of copies" type="number" min="1" value={form.copies} onChange={(e) => setForm({ ...form, copies: Number(e.target.value) })} required />
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Submit request</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
