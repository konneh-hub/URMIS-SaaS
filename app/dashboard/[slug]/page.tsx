"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../src/shared/auth/AuthProvider';
import DashboardLayout from '../../../src/shared/layouts/DashboardLayout';
import { getMenuForRole, formatRoleLabel } from '../../../src/shared/layouts/sidebarConfig';

const sectionMeta = {
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

export default function DashboardSlugPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useAuth() as { user?: { role?: string } };
  const menuItems = getMenuForRole(user?.role);
  const currentItem = menuItems.find((item: { slug?: string }) => item.slug === slug) || menuItems[0];
  const meta = sectionMeta[slug as keyof typeof sectionMeta] || sectionMeta.dashboard;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">URMIS</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{meta.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{meta.description}</p>
          <p className="mt-4 text-sm text-slate-500">Role: {formatRoleLabel(user?.role)} · Active section: {currentItem?.label || 'Dashboard'}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Section access</h2>
          <p className="mt-2 text-sm text-slate-600">This page is routed for the {currentItem?.label || 'dashboard'} section and is ready for detailed module content.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
