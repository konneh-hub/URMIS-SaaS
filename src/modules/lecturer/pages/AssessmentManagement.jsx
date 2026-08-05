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

export default function AssessmentManagement() {
  const [assessments, setAssessments] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ title: '', type: '', weight: '', maxScore: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [assessmentResp, typesResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/platform/assessments`, { headers }),
          fetch(`${API_BASE}/api/admin/platform/assessment-types`, { headers }),
        ]);
        const assessmentBody = await assessmentResp.json();
        const typesBody = await typesResp.json();
        if (!cancelled) {
          if (assessmentBody.success) setAssessments(assessmentBody.data);
          if (typesBody.success) setTypes(typesBody.data);
          if (!assessmentBody.success) setError(assessmentBody.message || 'Failed to load assessments');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/platform/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: form.title, type: form.type, weight: Number(form.weight), maxScore: Number(form.maxScore) }),
      });
      const body = await resp.json();
      if (body.success) {
        setIsOpen(false);
        setForm({ title: '', type: '', weight: '', maxScore: '' });
        setAssessments((prev) => [...prev, body.data]);
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
          description="Create and manage assessments for your courses."
          badge={<Badge tone="info">{assessments.length} assessments</Badge>}
          actions={<Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Add assessment</Button>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Assessments" value={assessments.length} description="Total created" badge="All" />
          <MetricTile title="Types" value={types.length} description="Available types" badgeTone="info" badge="Types" />
          <MetricTile title="Active" value={assessments.filter((a) => a.status === 'ACTIVE').length} description="Currently active" badgeTone="success" badge="Live" />
        </div>

        <Card title="Assessment inventory" description="Assessments created for your courses.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading assessments...</p>
          ) : (
            <Table
              columns={[
                { header: 'Title', accessor: 'title' },
                { header: 'Type', accessor: 'type', render: (value) => <Badge tone="info">{value || '—'}</Badge> },
                { header: 'Weight', accessor: 'weight', render: (value) => (value ?? '—') },
                { header: 'Max score', accessor: 'maxScore', render: (value) => (value ?? '—') },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={value === 'ACTIVE' ? 'success' : 'warning'}>{value || 'DRAFT'}</Badge> },
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
        description="Add a new assessment plan."
        onClose={() => setIsOpen(false)}
        footer={<div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button></div>}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required placeholder="e.g. EXAM, TEST, ASSIGNMENT" />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Weight (%)" type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} required />
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
