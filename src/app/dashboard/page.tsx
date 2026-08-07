"use client";

import React, { useState } from 'react';
import { useAuth } from '../../shared/auth/AuthProvider';
import ProtectedRoute from '../../shared/auth/ProtectedRoute';
import DashboardLayout from '../../shared/layouts/DashboardLayout';
import PermissionGuard from '../../shared/guards/PermissionGuard';
import SystemAdminWidgets from '../../modules/dashboard/components/SystemAdminWidgets';
import UniversityAdminWidgets from '../../modules/dashboard/components/UniversityAdminWidgets';
import LecturerWidgets from '../../modules/dashboard/components/LecturerWidgets';
import StudentWidgets from '../../modules/dashboard/components/StudentWidgets';
import { getLayoutConfig } from '../../shared/layoutConfig';
import PageHeader from '../../shared/components/ui/PageHeader';
import Card from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';
import Badge from '../../shared/components/ui/Badge';
import Dialog from '../../shared/components/ui/Dialog';
import Tabs from '../../shared/components/ui/Tabs';
import Table from '../../shared/components/ui/Table';
import NotificationPanel from '../../shared/components/ui/NotificationPanel';

export default function DashboardPage() {
  const { user } = useAuth() as {
    user?: { role?: string; name?: string; institution_id?: string };
  };

  const role = user?.role || 'STUDENT';
  const layoutConfig = getLayoutConfig(role);

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <ProtectedRoute fallback={null}>
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeader
            eyebrow="URMIS Dashboard"
            title={`Welcome back, ${user?.name || 'User'}`}
            description={`Role: ${role} ┬╖ Institution: ${user?.institution_id || 'N/A'}`}
            badge={<Badge tone="info">{role.replace(/_/g, ' ')}</Badge>}
            actions={(
              <Button variant="secondary" size="sm" onClick={() => setIsHelpOpen(true)}>
                View workflow guide
              </Button>
            )}
          />

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card title="Role-based dashboard modules" description="Modules and content areas tailored to your role.">
              <div className="grid gap-3 md:grid-cols-2">
                {layoutConfig.cards.map((card: string) => (
                  <div key={card} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-3 text-sm text-[var(--color-text)]">
                    {card}
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Quick actions" description="Take the next best action from your workspace.">
              <div className="flex flex-wrap gap-2">
                {layoutConfig.quickActions.map((action: string) => (
                  <Button key={action} variant="secondary" size="sm">{action}</Button>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.75fr_0.25fr]">
            <Card title="Analytics cockpit" description="A quick overview of the most important dashboard insights.">
              <Tabs
                tabs={[
                  {
                    value: 'overview',
                    label: 'Overview',
                    content: (
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card title="Live traffic" description="Usage events and sessions" className="bg-[var(--color-background)]" />
                        <Card title="Pending approvals" description="Items requiring your attention" className="bg-[var(--color-background)]" />
                        <Card title="Team response" description="Average action times" className="bg-[var(--color-background)]" />
                      </div>
                    ),
                  },
                  {
                    value: 'performance',
                    label: 'Performance',
                    content: (
                      <div className="space-y-4">
                        <p className="text-sm text-[var(--color-muted-text)]">Fast metrics by role and institution, updated in near real time.</p>
                        <Table
                          columns={[
                            { header: 'Metric', accessor: 'metric' },
                            { header: 'Today', accessor: 'today' },
                            { header: 'Change', accessor: 'change' },
                          ]}
                          rows={[
                            { metric: 'Login rate', today: '92%', change: '+4%' },
                            { metric: 'Course submissions', today: '135', change: '+18%' },
                            { metric: 'Support tickets', today: '11', change: '-2' },
                          ]}
                        />
                      </div>
                    ),
                  },
                  {
                    value: 'actions',
                    label: 'Actions',
                    content: (
                      <div className="grid gap-3 md:grid-cols-3">
                        <Button variant="primary" size="sm">Create report</Button>
                        <Button variant="secondary" size="sm">Review workflows</Button>
                        <Button variant="ghost" size="sm">Open insights</Button>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>

            <NotificationPanel
              items={[
                { title: 'New audit log entry', message: 'A security event was logged 10 minutes ago.', time: '10m ago' },
                { title: 'Institution renewal due', message: 'A subscription renewal is due in 5 days.', time: '5d ago' },
                { title: 'Result review pending', message: '2 pending result approvals require action.', time: '1h ago' },
              ]}
            />
          </div>

          {role === 'SYSTEM_ADMIN' ? <SystemAdminWidgets /> : null}
          {role === 'UNIVERSITY_ADMIN' ? <UniversityAdminWidgets /> : null}
          {role === 'LECTURER' ? <LecturerWidgets /> : null}
          {role === 'STUDENT' ? <StudentWidgets /> : null}

          <PermissionGuard permission="ENTER_RESULTS">
            <Card title="Result Entry Panel" description="Permission-gated result entry area.">
              <p className="text-sm text-[var(--color-muted-text)]">This section is available to users with the result entry permission.</p>
            </Card>
          </PermissionGuard>

          <PermissionGuard permission="VIEW_RESULTS">
            <Card title="Results Access" description="Results module is available for your role.">
              <p className="text-sm text-[var(--color-muted-text)]">The results workspace adapts to tablets and mobile screens while keeping the full context visible.</p>
            </Card>
          </PermissionGuard>
        </div>
      </DashboardLayout>

      <Dialog
        open={isHelpOpen}
        title="Dashboard workflow guide"
        description="Use the dashboard to access role-specific modules, monitor performance, and take quick actions." 
        onClose={() => setIsHelpOpen(false)}
        footer={<Button variant="primary" onClick={() => setIsHelpOpen(false)}>Understood</Button>}
      >
        <div className="space-y-3 text-sm text-[var(--color-muted-text)]">
          <p>Use the quick action panel to launch the most common tasks for your role.</p>
          <p>The analytics cockpit gives you a fast, mobile-friendly snapshot of performance metrics.</p>
          <p>Explore individual widgets below for deeper reports and live updates.</p>
        </div>
      </Dialog>
    </ProtectedRoute>
  );
}

