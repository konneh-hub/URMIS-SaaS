"use client";

import React from 'react';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';

const integrations = [
  { name: 'Email delivery', description: 'Transactional emails for invitations, notifications, and alerts.', status: 'Connected', tone: 'success' },
  { name: 'File storage', description: 'Cloud storage for transcripts, certificates, and documents.', status: 'Connected', tone: 'success' },
  { name: 'Payment gateway', description: 'Process subscription payments and invoices securely.', status: 'Connected', tone: 'success' },
  { name: 'SMS provider', description: 'Send SMS notifications for critical alerts.', status: 'Not configured', tone: 'warning' },
  { name: 'Analytics export', description: 'Stream platform analytics to external BI tools.', status: 'Available', tone: 'info' },
];

export default function Integrations() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Ecosystem"
          title="Integrations"
          description="Connect external services and APIs to extend the platform."
          badge={<Badge tone="info">{integrations.length} integrations</Badge>}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {integrations.map((item) => (
            <Card key={item.name} title={item.name} description={item.description}>
              <div className="flex items-center justify-between">
                <Badge tone={item.tone}>{item.status}</Badge>
                <Button variant="secondary" size="sm">Manage</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
