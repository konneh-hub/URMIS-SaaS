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
    case 'ACTIVE': return 'success';
    case 'DRAFT': return 'neutral';
    case 'CLOSED': return 'warning';
    default: return 'neutral';
  }
}

export default function AssessmentManagement() {
  const [assessments, setAssessments] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ title: '', typeId: '', weight: '', maxScore: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [assResp, typeResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/platform/assessments`, { headers }),
          fetch(`${API_BASE}/api/admin/platform/assessment-types`, { headers }),
        ]);
        const assBody = await assResp.json();
        const typeBody = await typeResp.json();
        if (!cancelled) {
          if (assBody.success) setAssessments(assBody.data);
          if (typeBody.success) setTypes(typeBody.data);
          if (!assBody.success) setError(assBody.message || 'Failed to load assessments');
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
      const resp = await fetch(`${API_BASE}/api/admin/platform/assessments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success) setAssessments(body.data);
    } catch (e) { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/platform/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: form.title, typeId: form.typeId, weight: Number(form.weight), maxScore: Number(form.maxScore) }),
      });
      const body = await resp.json();
      if (body.success) {
        setIsOpen(false);
        setForm({ title: '', typeId: '', weight: '', maxScore: '' });
        refresh();
      } else {
        alert(body.message || 'Failed to create assessment');
      }
    } catch (e) {
      alert('Could not create assessment');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Evaluation"
          title="Assessment Management"
          description="Manage assessments and evaluation structure."
          badge={<Badge tone="info">{assessments.length} assessments</Badge>}
          actions={(
            <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Add assessment</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Assessments" value={assessments.length} description="Created assessments" badge="All" />
          <MetricTile title="Active" value={assessments.filter((a) => a.status === 'ACTIVE').length} description="Running now" badgeTone="success" badge="Live" />
          <MetricTile title="Types" value={types.length} description="Assessment types" badgeTone="info" badge="Types" />
        </div>

        <Card title="Assessments" description="All assessments within your institution.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading assessments...</p>
          ) : (
            <Table
              columns={[
                { header: 'Title', accessor: 'title' },
                { header: 'Type', accessor: 'type', render: (_v, row) => row.type?.name || '—' },
                { header: 'Course', accessor: 'course', render: (_v, row) => row.course?.title || '—' },
                { header: 'Weight', accessor: 'weight' },
                { header: 'Max score', accessor: 'maxScore' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value)}>{value}</Badge> },
              ]}
              rows={assessments}
              emptyText="No assessments created yet."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="Create assessment"
        description="Add a new assessment to the evaluation structure."
        onClose={() => setIsOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        )}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)]">
              <span className="mb-2 block">Type</span>
              <select
                className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-primary)]"
                value={form.typeId}
                onChange={(e) => setForm({ ...form, typeId: e.target.value })}
                required
              >
                <option value="">Select type</option>
                {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Weight" type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} required />
            <Input label="Max score" type="number" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} required />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Create assessment</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
