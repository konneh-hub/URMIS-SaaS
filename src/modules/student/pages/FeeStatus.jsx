"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/auth/AuthProvider';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Table from '../../../shared/components/ui/Table';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import MetricTile from '../../../shared/components/ui/MetricTile';
import Alert from '../../../shared/components/ui/Alert';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

function statusTone(status) {
  switch (status) {
    case 'PAID': return 'success';
    case 'PARTIAL': return 'warning';
    case 'OVERDUE': return 'danger';
    case 'WAIVED': return 'info';
    default: return 'neutral';
  }
}

function formatCurrency(value) {
  if (value === null || value === undefined) return '—';
  return Number(value).toLocaleString(undefined, { style: 'currency', currency: 'NGN' });
}

export default function FeeStatus() {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/institution/student/fees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          setFees(Array.isArray(body) ? body : (body.data || []));
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  const totalCharged = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalPaid = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const balance = totalCharged - totalPaid;
  const unpaid = fees.filter((f) => (f.amount || 0) - (f.paidAmount || 0) > 0).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Finance"
          title="Fee Status"
          description="Your fee obligations and payment status for the current session."
          badge={<Badge tone={balance > 0 ? 'warning' : 'success'}>{balance > 0 ? 'Balance due' : 'Paid up'}</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Total charged" value={formatCurrency(totalCharged)} description="Session fees" badge="Due" />
          <MetricTile title="Total paid" value={formatCurrency(totalPaid)} description="Payments made" badgeTone="success" badge="Paid" />
          <MetricTile title="Balance" value={formatCurrency(balance)} description="Outstanding balance" badgeTone={balance > 0 ? 'warning' : 'success'} badge={balance > 0 ? 'Due' : 'Clear'} />
        </div>

        <Card title="Fee breakdown" description="Itemized fees and payment status.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading fees...</p>
          ) : (
            <Table
              columns={[
                { header: 'Item', accessor: 'description' },
                { header: 'Amount', accessor: 'amount', render: formatCurrency },
                { header: 'Paid', accessor: 'paidAmount', render: formatCurrency },
                { header: 'Balance', accessor: 'balance', render: (_v, row) => formatCurrency((row.amount || 0) - (row.paidAmount || 0)) },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value || 'PARTIAL')}>{value || 'PARTIAL'}</Badge> },
              ]}
              rows={fees}
              emptyText="No fee records available."
            />
          )}
        </Card>

        {unpaid > 0 ? (
          <div className="flex justify-end">
            <Button variant="primary" size="sm">Make payment</Button>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
