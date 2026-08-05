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

function planTone(active) {
  return active ? 'success' : 'warning';
}

function formatCents(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function SubscriptionManagement() {
  const [plans, setPlans] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', priceCents: 0, currency: 'USD', interval: 'monthly', trialDays: 0, active: true });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [plansResp, couponResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/platform/plans`, { headers }),
          fetch(`${API_BASE}/api/admin/platform/coupons`, { headers }),
        ]);
        const plansBody = await plansResp.json();
        const couponBody = await couponResp.json();
        if (!cancelled) {
          if (plansBody.success) setPlans(plansBody.data);
          if (couponBody.success) setCoupons(couponBody.data);
          if (!plansBody.success) setError(plansBody.message || 'Failed to load plans');
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
    const token = localStorage.getItem('accessToken');
    const headers = { Authorization: `Bearer ${token}` };
    const [plansResp, couponResp] = await Promise.all([
      fetch(`${API_BASE}/api/admin/platform/plans`, { headers }),
      fetch(`${API_BASE}/api/admin/platform/coupons`, { headers }),
    ]);
    const plansBody = await plansResp.json();
    const couponBody = await couponResp.json();
    if (plansBody.success) setPlans(plansBody.data);
    if (couponBody.success) setCoupons(couponBody.data);
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/platform/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const body = await resp.json();
      if (body.success) {
        setIsOpen(false);
        setForm({ name: '', description: '', priceCents: 0, currency: 'USD', interval: 'monthly', trialDays: 0, active: true });
        refresh();
      } else {
        alert(body.message || 'Failed to create plan');
      }
    } catch (e) {
      alert('Could not create plan');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="SaaS Operations"
          title="Subscription Management"
          description="Manage subscription plans, trials, and pricing for institutions."
          badge={<Badge tone="info">{plans.length} plans</Badge>}
          actions={(
            <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Create plan</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Plans" value={plans.length} description="Available plans" badge="All" />
          <MetricTile title="Active plans" value={plans.filter((p) => p.active).length} description="Currently purchasable" badgeTone="success" badge="Live" />
          <MetricTile title="Coupons" value={coupons.length} description="Discount codes" badgeTone="info" badge="Codes" />
        </div>

        <Card title="Subscription plans" description="Recurring revenue plans offered to institutions.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading plans...</p>
          ) : (
            <Table
              columns={[
                { header: 'Plan', accessor: 'name', render: (value) => <Badge tone="info">{value}</Badge> },
                { header: 'Price', accessor: 'priceCents', render: (value, row) => `${formatCents(value)} / ${row.interval}` },
                { header: 'Trial days', accessor: 'trialDays' },
                { header: 'Status', accessor: 'active', render: (value) => <Badge tone={planTone(value)}>{value ? 'Active' : 'Inactive'}</Badge> },
                { header: 'Description', accessor: 'description' },
              ]}
              rows={plans}
              emptyText="No plans defined yet."
            />
          )}
        </Card>

        <Card title="Coupons" description="Discount codes that can be applied to invoices.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading coupons...</p>
          ) : (
            <Table
              columns={[
                { header: 'Code', accessor: 'code', render: (value) => <code className="rounded bg-[var(--color-muted)] px-2 py-0.5 text-xs">{value}</code> },
                { header: 'Discount', accessor: 'discountPct', render: (value) => `${value}%` },
                { header: 'Status', accessor: 'active', render: (value) => <Badge tone={value ? 'success' : 'warning'}>{value ? 'Active' : 'Inactive'}</Badge> },
              ]}
              rows={coupons}
              emptyText="No coupons defined yet."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="Create subscription plan"
        description="Add a new pricing plan for institutions."
        onClose={() => setIsOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        )}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Plan name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Price (cents)" type="number" value={form.priceCents} onChange={(e) => setForm({ ...form, priceCents: Number(e.target.value) })} required />
            <Input label="Interval" value={form.interval} onChange={(e) => setForm({ ...form, interval: e.target.value })} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Trial days" type="number" value={form.trialDays} onChange={(e) => setForm({ ...form, trialDays: Number(e.target.value) })} />
            <Input label="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Create plan</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
