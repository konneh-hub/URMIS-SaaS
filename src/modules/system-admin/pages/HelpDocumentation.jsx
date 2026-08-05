"use client";

import React from 'react';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';

const guides = [
  { title: 'Getting started', description: 'Set up your institution and invite your first administrators.', category: 'Onboarding' },
  { title: 'Managing institutions', description: 'Create, activate, and suspend university tenants.', category: 'Administration' },
  { title: 'Roles & permissions', description: 'Understand the role matrix and permission grants.', category: 'Access control' },
  { title: 'Subscription & billing', description: 'Manage plans, invoices, and payments.', category: 'Billing' },
  { title: 'Monitoring & security', description: 'Track system health and respond to security alerts.', category: 'Operations' },
  { title: 'Backups & recovery', description: 'Create restore points and manage backup schedules.', category: 'Operations' },
];

export default function HelpDocumentation() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Support"
          title="Help & Documentation"
          description="Guides, references, and operational documentation for the platform."
          badge={<Badge tone="info">{guides.length} guides</Badge>}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {guides.map((guide) => (
            <Card key={guide.title} title={guide.title} description={guide.description}>
              <div className="flex items-center justify-between">
                <Badge tone="info">{guide.category}</Badge>
                <Button variant="ghost" size="sm">Open guide</Button>
              </div>
            </Card>
          ))}
        </div>

        <Card title="Need help?" description="Reach out to the platform support team.">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm">Contact support</Button>
            <Button variant="ghost" size="sm">View API reference</Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
