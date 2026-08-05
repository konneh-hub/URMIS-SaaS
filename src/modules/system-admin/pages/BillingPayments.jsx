"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Table from '../../../shared/components/ui/Table';
import Badge from '../../../shared/components/ui/Badge';
import MetricTile from '../../../shared/components/ui/MetricTile';
import Alert from '../../../shared/components/ui/Alert';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

function formatCents(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function invoiceTone(status) {
  switch (status) {
    case 'PAID': return 'success';
    case 'PENDING': return 'warning';
    case 'FAILED': return 'danger';
    case 'REFUNDED': return 'neutral';
    default: return 'neutral';
  }
}

export default function BillingPayments() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [invoiceResp, paymentResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/platform/invoices`, { headers }),
          fetch(`${API_BASE}/api/admin/platform/payments`, { headers }),
        ]);
        const invoiceBody = await invoiceResp.json();
        const paymentBody = await paymentResp.json();
        if (!cancelled) {
          if (invoiceBody.success) setInvoices(invoiceBody.data);
          if (paymentBody.success) setPayments(paymentBody.data);
          if (!invoiceBody.success) setError(invoiceBody.message || 'Failed to load invoices');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const totalBilled = invoices.reduce((sum, inv) => sum + (inv.amountCents || 0), 0);
  const totalPaid = payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + (p.amountCents || 0), 0);
  const pendingCount = invoices.filter((i) => i.status === 'PENDING').length;
  const failedCount = invoices.filter((i) => i.status === 'FAILED').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="SaaS Operations"
          title="Billing & Payments"
          description="Track invoices, payments, and revenue across the platform."
          badge={<Badge tone="info">{invoices.length} invoices</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-4">
          <MetricTile title="Total billed" value={formatCents(totalBilled)} description="All invoices" badge="Sum" />
          <MetricTile title="Collected" value={formatCents(totalPaid)} description="Paid revenue" badgeTone="success" badge="Paid" />
          <MetricTile title="Pending" value={pendingCount} description="Awaiting payment" badgeTone="warning" badge="Due" />
          <MetricTile title="Failed" value={failedCount} description="Payment failures" badgeTone="danger" badge="Errors" />
        </div>

        <Card title="Invoices" description="Billing records issued to institutions.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading invoices...</p>
          ) : (
            <Table
              columns={[
                { header: 'Institution', accessor: 'institution', render: (_v, row) => row.institution?.name || '—' },
                { header: 'Amount', accessor: 'amountCents', render: (value) => formatCents(value) },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={invoiceTone(value)}>{value}</Badge> },
                { header: 'Due date', accessor: 'dueDate', render: (value) => value ? new Date(value).toLocaleDateString() : '—' },
              ]}
              rows={invoices}
              emptyText="No invoices found."
            />
          )}
        </Card>

        <Card title="Payments" description="Payment transactions recorded on the platform.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading payments...</p>
          ) : (
            <Table
              columns={[
                { header: 'Institution', accessor: 'institution', render: (_v, row) => row.institution?.name || '—' },
                { header: 'Amount', accessor: 'amountCents', render: (value) => formatCents(value) },
                { header: 'Method', accessor: 'method' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={invoiceTone(value)}>{value}</Badge> },
                { header: 'Transaction', accessor: 'transactionId', render: (value) => value ? <code className="rounded bg-[var(--color-muted)] px-2 py-0.5 text-xs">{value}</code> : '—' },
              ]}
              rows={payments}
              emptyText="No payments recorded yet."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
