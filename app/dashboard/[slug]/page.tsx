"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../src/shared/auth/AuthProvider';
import DashboardLayout from '../../../src/shared/layouts/DashboardLayout';
import { getMenuForRole } from '../../../src/shared/layouts/sidebarConfig';
import PageHeader from '../../../src/shared/components/ui/PageHeader';
import Card from '../../../src/shared/components/ui/Card';
import Button from '../../../src/shared/components/ui/Button';
import Badge from '../../../src/shared/components/ui/Badge';
import Tabs from '../../../src/shared/components/ui/Tabs';
import Table from '../../../src/shared/components/ui/Table';

// System-admin dedicated page components
import UniversityManagement from '../../../src/modules/system-admin/pages/UniversityManagement';
import UniversityAdministrators from '../../../src/modules/system-admin/pages/UniversityAdministrators';
import PlatformUsers from '../../../src/modules/system-admin/pages/PlatformUsers';
import RolesPermissions from '../../../src/modules/system-admin/pages/RolesPermissions';
import SubscriptionManagement from '../../../src/modules/system-admin/pages/SubscriptionManagement';
import BillingPayments from '../../../src/modules/system-admin/pages/BillingPayments';
import ReportsAnalytics from '../../../src/modules/system-admin/pages/ReportsAnalytics';
import Monitoring from '../../../src/modules/system-admin/pages/Monitoring';
import AuditLogs from '../../../src/modules/system-admin/pages/AuditLogs';
import SecurityCenter from '../../../src/modules/system-admin/pages/SecurityCenter';
import Notifications from '../../../src/modules/system-admin/pages/Notifications';
import Backups from '../../../src/modules/system-admin/pages/Backups';
import GlobalSettings from '../../../src/modules/system-admin/pages/GlobalSettings';
import Integrations from '../../../src/modules/system-admin/pages/Integrations';
import HelpDocumentation from '../../../src/modules/system-admin/pages/HelpDocumentation';
import Profile from '../../../src/modules/system-admin/pages/Profile';
import Logout from '../../../src/modules/system-admin/pages/Logout';

const sectionMeta: Record<string, { title: string; description: string }> = {
  dashboard: { title: 'Dashboard Overview', description: 'Overview of the current academic workspace.' },
  'university-management': { title: 'University Management', description: 'Manage institutions and platform-wide academic operations.' },
  'university-administrators': { title: 'University Administrators', description: 'Manage university-level admin accounts and access.' },
  'platform-users': { title: 'Platform Users', description: 'View and manage all platform users.' },
  'roles-permissions': { title: 'Roles & Permissions', description: 'Configure role-based access and permissions.' },
  'subscription-management': { title: 'Subscription Management', description: 'Manage SaaS subscriptions and billing plans.' },
  'billing-payments': { title: 'Billing & Payments', description: 'Handle payments, invoices, and billing history.' },
  'reports-analytics': { title: 'Reports & Analytics', description: 'Track platform performance and institution metrics.' },
  monitoring: { title: 'Monitoring', description: 'System health and performance monitoring.' },
  'audit-logs': { title: 'Audit Logs', description: 'Review security, access, and activity logs.' },
  'security-center': { title: 'Security Center', description: 'Security configurations and compliance.' },
  notifications: { title: 'Notifications', description: 'Broadcasts, alerts, and inbox messages.' },
  backups: { title: 'Backups', description: 'Restore points and system recovery tasks.' },
  'global-settings': { title: 'Global Settings', description: 'Configure global platform settings.' },
  integrations: { title: 'Integrations', description: 'Connect external services and APIs.' },
  'help-documentation': { title: 'Help & Documentation', description: 'Support guides and operational documentation.' },
  profile: { title: 'Profile', description: 'Manage your personal account details.' },
  logout: { title: 'Logout', description: 'Sign out of the current session.' },
  'faculty-management': { title: 'Faculty Management', description: 'Manage faculties and departments.' },
  'department-management': { title: 'Department Management', description: 'Create and maintain academic departments.' },
  'programme-management': { title: 'Programme Management', description: 'Manage academic programmes and curricula.' },
  'course-management': { title: 'Course Management', description: 'Organize and manage the university course catalog.' },
  'academic-sessions': { title: 'Academic Sessions', description: 'Manage academic calendar sessions.' },
  semesters: { title: 'Semesters', description: 'Create and manage semesters.' },
  levels: { title: 'Levels', description: 'Manage academic levels and progression.' },
  'student-management': { title: 'Student Management', description: 'Oversee student profiles and records.' },
  'staff-management': { title: 'Staff Management', description: 'Manage staff records and assignments.' },
  'user-management': { title: 'User Management', description: 'Manage users and their access permissions.' },
  'role-management': { title: 'Role Management', description: 'Manage role definitions and assignments.' },
  'course-registration': { title: 'Course Registration', description: 'Coordinate student course registration.' },
  'assessment-management': { title: 'Assessment Management', description: 'Manage assessments and evaluation structure.' },
  'result-management': { title: 'Result Management', description: 'Review, organize, and oversee results.' },
  'result-approval-workflow': { title: 'Result Approval Workflow', description: 'Coordinate result approvals across stakeholders.' },
  'transcript-management': { title: 'Transcript Management', description: 'Handle transcript generation and review.' },
  'graduation-management': { title: 'Graduation Management', description: 'Coordinate graduation lists and certificates.' },
  reports: { title: 'Reports', description: 'Institution reports and summary dashboards.' },
  documents: { title: 'Documents', description: 'Upload and organize institutional documents.' },
  communication: { title: 'Communication', description: 'Messaging and communication center.' },
  'university-settings': { title: 'University Settings', description: 'Configure university preferences.' },
  'faculty-overview': { title: 'Faculty Overview', description: 'Faculty-level summaries and metrics.' },
  departments: { title: 'Departments', description: 'Browse and manage departments.' },
  lecturers: { title: 'Lecturers', description: 'Manage academic staff members.' },
  students: { title: 'Students', description: 'Manage student records and academic progress.' },
  'assessment-review': { title: 'Assessment Review', description: 'Review and approve assessments.' },
  'result-approval': { title: 'Result Approval', description: 'Approve results before publishing.' },
  'faculty-reports': { title: 'Faculty Reports', description: 'Faculty-level reports and analytics.' },
  'faculty-statistics': { title: 'Faculty Statistics', description: 'Faculty performance and enrollment statistics.' },
  'department-overview': { title: 'Department Overview', description: 'Departmental summaries and activities.' },
  'course-allocation': { title: 'Course Allocation', description: 'Assign courses to lecturers and departments.' },
  'result-verification': { title: 'Result Verification', description: 'Verify results for accuracy and compliance.' },
  'department-reports': { title: 'Department Reports', description: 'Department-specific reports.' },
  'my-courses': { title: 'My Courses', description: 'Courses assigned to you.' },
  'student-lists': { title: 'Student Lists', description: 'View student rosters for your courses.' },
  'score-entry': { title: 'Score Entry', description: 'Enter and update assessment scores.' },
  'result-submission': { title: 'Result Submission', description: 'Submit verified results for review.' },
  attendance: { title: 'Attendance', description: 'Manage student attendance records.' },
  'result-processing': { title: 'Result Processing', description: 'Process raw marks into official results.' },
  'result-publication': { title: 'Result Publication', description: 'Publish approved results to students.' },
  'result-corrections': { title: 'Result Corrections', description: 'Correct published or pending results.' },
  'transcript-requests': { title: 'Transcript Requests', description: 'Manage transcript and certificate requests.' },
  'graduation-clearance': { title: 'Graduation Clearance', description: 'Clear candidates for graduation.' },
  'academic-records': { title: 'Academic Records', description: 'Access student academic records.' },
  'my-profile': { title: 'My Profile', description: 'View and update your personal profile.' },
  'registered-courses': { title: 'Registered Courses', description: 'View your current registered courses.' },
  assessments: { title: 'Assessments', description: 'Review your assessment deadlines and grades.' },
  results: { title: 'Results', description: 'View your published academic results.' },
  'academic-history': { title: 'Academic History', description: 'Track your academic progress and history.' },
  'fee-status': { title: 'Fee Status', description: 'Review your financial status and invoices.' },
  support: { title: 'Support', description: 'Raise support requests and get help.' },
  'profile-settings': { title: 'Profile Settings', description: 'Update your student account settings.' },
};

// Map each SYSTEM_ADMIN slug to its dedicated page component
const systemAdminSlugComponents: Record<string, React.ComponentType> = {
  'university-management': UniversityManagement,
  'university-administrators': UniversityAdministrators,
  'platform-users': PlatformUsers,
  'roles-permissions': RolesPermissions,
  'subscription-management': SubscriptionManagement,
  'billing-payments': BillingPayments,
  'reports-analytics': ReportsAnalytics,
  monitoring: Monitoring,
  'audit-logs': AuditLogs,
  'security-center': SecurityCenter,
  notifications: Notifications,
  backups: Backups,
  'global-settings': GlobalSettings,
  integrations: Integrations,
  'help-documentation': HelpDocumentation,
  profile: Profile,
  logout: Logout,
};

export default function DashboardSlugPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useAuth() as { user?: { role?: string } };
  const role = user?.role || 'STUDENT';
  const menuItems = getMenuForRole(role);
  const currentItem = menuItems.find((item: { slug?: string }) => item.slug === slug) || menuItems[0];
  const meta = sectionMeta[slug as keyof typeof sectionMeta] || sectionMeta.dashboard;

  // For System Administrators, render the dedicated page component when available.
  if (role === 'SYSTEM_ADMIN' && systemAdminSlugComponents[slug]) {
    const PageComponent = systemAdminSlugComponents[slug];
    return <PageComponent />;
  }

  const tabs = [
    {
      value: 'overview',
      label: 'Overview',
      badge: 'Live',
      badgeTone: 'info',
      content: (
        <div className="grid gap-4 xl:grid-cols-[0.65fr_0.35fr]">
          <Card title="Section summary" description={meta.description}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-[var(--color-muted)] p-4 text-sm text-[var(--color-text)]">
                <p className="font-semibold text-[var(--color-text)]">Current focus</p>
                <p className="mt-2 text-[var(--color-muted-text)]">Keep your workflows aligned with compliance and operational requests.</p>
              </div>
              <div className="rounded-2xl bg-[var(--color-muted)] p-4 text-sm text-[var(--color-text)]">
                <p className="font-semibold text-[var(--color-text)]">Guideline</p>
                <p className="mt-2 text-[var(--color-muted-text)]">Actions in this section are synced to the role permissions in real time.</p>
              </div>
            </div>
          </Card>

          <Card title="Status" description="Current health for this section.">
            <div className="space-y-3">
              <div className="rounded-2xl bg-[var(--color-background)] p-4">
                <p className="text-sm text-[var(--color-muted-text)]">Pending workload</p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">12 items</p>
              </div>
              <div className="rounded-2xl bg-[var(--color-background)] p-4">
                <p className="text-sm text-[var(--color-muted-text)]">Actionable alerts</p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">3 high priority</p>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      value: 'data',
      label: 'Data table',
      badge: 'Report',
      badgeTone: 'info',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-muted-text)]">Review the latest data rows for this section and use quick actions to update or export.</p>
          <Table
            columns={[
              { header: 'Item', accessor: 'item' },
              { header: 'Status', accessor: 'status' },
              { header: 'Updated', accessor: 'updated' },
              { header: 'Action', accessor: 'action', render: (value) => <Button variant="secondary" size="sm">{value}</Button> },
            ]}
            rows={[
              { item: 'Academic session', status: 'Published', updated: 'Today', action: 'Edit' },
              { item: 'Result approval', status: 'Pending', updated: '2h ago', action: 'Review' },
              { item: 'User provisioning', status: 'In progress', updated: '1d ago', action: 'Open' },
            ]}
          />
        </div>
      ),
    },
    {
      value: 'actions',
      label: 'Actions',
      badge: 'Ready',
      badgeTone: 'success',
      content: (
        <div className="grid gap-4 md:grid-cols-3">
          <Button variant="primary" size="sm">Create new item</Button>
          <Button variant="secondary" size="sm">Run compliance check</Button>
          <Button variant="ghost" size="sm">Export summary</Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Section workspace"
          title={meta.title}
          description={meta.description}
          badge={<Badge tone="info">{currentItem?.label || 'Dashboard'}</Badge>}
          actions={(
            <Button variant="secondary" size="sm">Switch section</Button>
          )}
        />

        <Tabs tabs={tabs} />

        <Card title="Section access" description={`This page is routed for the ${currentItem?.label || 'dashboard'} section and is ready for detailed module content.`}>
          <p className="text-sm text-[var(--color-muted-text)]">Choose the right workflow above to continue.</p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
