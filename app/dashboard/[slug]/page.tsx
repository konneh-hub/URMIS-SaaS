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
import SystemNotifications from '../../../src/modules/system-admin/pages/Notifications';
import Backups from '../../../src/modules/system-admin/pages/Backups';
import GlobalSettings from '../../../src/modules/system-admin/pages/GlobalSettings';
import Integrations from '../../../src/modules/system-admin/pages/Integrations';
import HelpDocumentation from '../../../src/modules/system-admin/pages/HelpDocumentation';
import Profile from '../../../src/modules/system-admin/pages/Profile';
import Logout from '../../../src/modules/system-admin/pages/Logout';

import UniversityAdminFacultyManagement from '../../../src/modules/university-admin/pages/FacultyManagement';
import UniversityAdminDepartmentManagement from '../../../src/modules/university-admin/pages/DepartmentManagement';
import UniversityAdminProgrammeManagement from '../../../src/modules/university-admin/pages/ProgrammeManagement';
import UniversityAdminCourseManagement from '../../../src/modules/university-admin/pages/CourseManagement';
import UniversityAdminAcademicSessions from '../../../src/modules/university-admin/pages/AcademicSessions';
import UniversityAdminSemesters from '../../../src/modules/university-admin/pages/Semesters';
import UniversityAdminLevels from '../../../src/modules/university-admin/pages/Levels';
import UniversityAdminStudentManagement from '../../../src/modules/university-admin/pages/StudentManagement';
import UniversityAdminStaffManagement from '../../../src/modules/university-admin/pages/StaffManagement';
import UniversityAdminUserManagement from '../../../src/modules/university-admin/pages/UserManagement';
import UniversityAdminRoleManagement from '../../../src/modules/university-admin/pages/RoleManagement';
import UniversityAdminCourseRegistration from '../../../src/modules/university-admin/pages/CourseRegistration';
import UniversityAdminAssessmentManagement from '../../../src/modules/university-admin/pages/AssessmentManagement';
import UniversityAdminResultManagement from '../../../src/modules/university-admin/pages/ResultManagement';
import UniversityAdminResultApprovalWorkflow from '../../../src/modules/university-admin/pages/ResultApprovalWorkflow';
import UniversityAdminTranscriptManagement from '../../../src/modules/university-admin/pages/TranscriptManagement';
import UniversityAdminGraduationManagement from '../../../src/modules/university-admin/pages/GraduationManagement';
import UniversityAdminReports from '../../../src/modules/university-admin/pages/Reports';
import UniversityAdminDocuments from '../../../src/modules/university-admin/pages/Documents';
import UniversityAdminCommunication from '../../../src/modules/university-admin/pages/Communication';
import UniversityAdminNotifications from '../../../src/modules/university-admin/pages/Notifications';
import UniversityAdminUniversitySettings from '../../../src/modules/university-admin/pages/UniversitySettings';
import UniversityAdminAuditLogs from '../../../src/modules/university-admin/pages/AuditLogs';
import UniversityAdminProfile from '../../../src/modules/university-admin/pages/Profile';
import UniversityAdminLogout from '../../../src/modules/university-admin/pages/Logout';

import {
  DeanDashboard,
  FacultyOverview,
  Departments,
  Lecturers,
  Students,
  CourseManagement,
  AssessmentReview,
  ResultApproval,
  FacultyReports,
  FacultyStatistics,
  Communication,
  DeanNotifications,
  DeanProfile,
  DeanLogout,
} from '../../../src/modules/dean/pages';

import {
  LecturerDashboard,
  MyCourses,
  CourseAllocation,
  StudentLists,
  AssessmentManagement,
  ScoreEntry,
  ResultSubmission,
  Attendance,
  Reports as LecturerReports,
  Communication as LecturerCommunication,
  Notifications as LecturerNotifications,
  Profile as LecturerProfile,
  Logout as LecturerLogout,
} from '../../../src/modules/lecturer/pages';

import {
  HodDashboard,
  DepartmentOverview,
  Lecturers as HodLecturers,
  Students as HodStudents,
  Courses as HodCourses,
  CourseAllocation as HodCourseAllocation,
  AssessmentReview as HodAssessmentReview,
  ResultVerification as HodResultVerification,
  ResultApproval as HodResultApproval,
  DepartmentReports as HodDepartmentReports,
  Communication as HodCommunication,
  Notifications as HodNotifications,
  Profile as HodProfile,
  Logout as HodLogout,
} from '../../../src/modules/hod/pages';

import ExaminationOfficerDashboard from '../../../src/modules/examination-officer/pages/Dashboard';
import AcademicRecords from '../../../src/modules/examination-officer/pages/AcademicRecords';
import ExamOfficerAuditLogs from '../../../src/modules/examination-officer/pages/AuditLogs';
import ExamOfficerCommunication from '../../../src/modules/examination-officer/pages/Communication';
import ExamOfficerNotifications from '../../../src/modules/examination-officer/pages/Notifications';
import ResultCorrections from '../../../src/modules/examination-officer/pages/ResultCorrections';
import ResultProcessing from '../../../src/modules/examination-officer/pages/ResultProcessing';
import ResultPublication from '../../../src/modules/examination-officer/pages/ResultPublication';
import TranscriptRequests from '../../../src/modules/examination-officer/pages/TranscriptRequests';
import ResultVerification from '../../../src/modules/examination-officer/pages/ResultVerification';
import ExamOfficerReports from '../../../src/modules/examination-officer/pages/Reports';
import GraduationClearance from '../../../src/modules/examination-officer/pages/GraduationClearance';
import ExamOfficerProfile from '../../../src/modules/examination-officer/pages/Profile';
import ExamOfficerLogout from '../../../src/modules/examination-officer/pages/Logout';

import {
  StudentDashboard,
  MyProfile,
  CourseRegistration as StudentCourseRegistration,
  RegisteredCourses,
  Assessments,
Results as StudentResults,
  TranscriptRequests as StudentTranscriptRequests,
  AcademicHistory,
  FeeStatus,
  Documents as StudentDocuments,
  Notifications as StudentNotifications,
  Support,
  ProfileSettings,
  Logout as StudentLogout,
} from '../../../src/modules/student/pages';

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
  'my-courses': { title: 'My Courses', description: 'Courses assigned to you for the current session.' },
  'course-allocation': { title: 'Course Allocation', description: 'Course allocations linked to your lecturer profile.' },
  'student-lists': { title: 'Student Lists', description: 'Student rosters for your courses and class groups.' },
  'score-entry': { title: 'Score Entry', description: 'Enter and update assessment scores for your students.' },
  'result-submission': { title: 'Result Submission', description: 'Submit verified results for review and approval.' },
  attendance: { title: 'Attendance', description: 'Record and track student attendance for class sessions.' },
  'result-processing': { title: 'Result Processing', description: 'Process submitted results and move them through the exam workflow.' },
  'result-verification': { title: 'Result Verification', description: 'Verify submitted results before publishing.' },
  'result-publication': { title: 'Result Publication', description: 'Publish approved results for students and stakeholders.' },
  'result-corrections': { title: 'Result Corrections', description: 'Apply corrections to published or approved result records.' },
  'transcript-requests': { title: 'Transcript Requests', description: 'Review and manage student transcript requests.' },
  'graduation-clearance': { title: 'Graduation Clearance', description: 'Manage graduation clearance status and ceremonies.' },
'academic-records': { title: 'Academic Records', description: 'Review academic records and student result history.' },
  'my-profile': { title: 'My Profile', description: 'Your personal and academic information.' },
  'registered-courses': { title: 'Registered Courses', description: 'Courses you are registered for this session.' },
  assessments: { title: 'Assessments', description: 'Scheduled and completed assessments.' },
  results: { title: 'Results', description: 'Your published results and grades.' },
  'academic-history': { title: 'Academic History', description: 'Your academic progression across sessions.' },
  'fee-status': { title: 'Fee Status', description: 'Your fee obligations and payment status.' },
  support: { title: 'Support', description: 'Submit and track support tickets.' },
  'profile-settings': { title: 'Profile Settings', description: 'Manage your contact details and security.' },
};

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
  notifications: SystemNotifications,
  backups: Backups,
  'global-settings': GlobalSettings,
  integrations: Integrations,
  'help-documentation': HelpDocumentation,
  profile: Profile,
  logout: Logout,
};

const deanSlugComponents: Record<string, React.ComponentType> = {
  dashboard: DeanDashboard,
  'faculty-overview': FacultyOverview,
  departments: Departments,
  lecturers: Lecturers,
  students: Students,
  'course-management': CourseManagement,
  'assessment-review': AssessmentReview,
  'result-approval': ResultApproval,
  'faculty-reports': FacultyReports,
  'faculty-statistics': FacultyStatistics,
  communication: Communication,
  notifications: DeanNotifications,
  profile: DeanProfile,
  logout: DeanLogout,
};

const universityAdminSlugComponents: Record<string, React.ComponentType> = {
  'faculty-management': UniversityAdminFacultyManagement,
  'department-management': UniversityAdminDepartmentManagement,
  'programme-management': UniversityAdminProgrammeManagement,
  'course-management': UniversityAdminCourseManagement,
  'academic-sessions': UniversityAdminAcademicSessions,
  semesters: UniversityAdminSemesters,
  levels: UniversityAdminLevels,
  'student-management': UniversityAdminStudentManagement,
  'staff-management': UniversityAdminStaffManagement,
  'user-management': UniversityAdminUserManagement,
  'role-management': UniversityAdminRoleManagement,
  'course-registration': UniversityAdminCourseRegistration,
  'assessment-management': UniversityAdminAssessmentManagement,
  'result-management': UniversityAdminResultManagement,
  'result-approval-workflow': UniversityAdminResultApprovalWorkflow,
  'transcript-management': UniversityAdminTranscriptManagement,
  'graduation-management': UniversityAdminGraduationManagement,
  reports: UniversityAdminReports,
  documents: UniversityAdminDocuments,
  communication: UniversityAdminCommunication,
  notifications: UniversityAdminNotifications,
  'university-settings': UniversityAdminUniversitySettings,
  'audit-logs': UniversityAdminAuditLogs,
  profile: UniversityAdminProfile,
  logout: UniversityAdminLogout,
};

const hodSlugComponents: Record<string, React.ComponentType> = {
  dashboard: HodDashboard,
  'department-overview': DepartmentOverview,
  lecturers: HodLecturers,
  students: HodStudents,
  courses: HodCourses,
  'course-allocation': HodCourseAllocation,
  'assessment-review': HodAssessmentReview,
  'result-verification': HodResultVerification,
  'result-approval': HodResultApproval,
  'department-reports': HodDepartmentReports,
  communication: HodCommunication,
  notifications: HodNotifications,
  profile: HodProfile,
  logout: HodLogout,
};

const lecturerSlugComponents: Record<string, React.ComponentType> = {
  dashboard: LecturerDashboard,
  'my-courses': MyCourses,
  'course-allocation': CourseAllocation,
  'student-lists': StudentLists,
  'assessment-management': AssessmentManagement,
  'score-entry': ScoreEntry,
  'result-submission': ResultSubmission,
  attendance: Attendance,
  reports: LecturerReports,
  communication: LecturerCommunication,
  notifications: LecturerNotifications,
  profile: LecturerProfile,
  logout: LecturerLogout,
};

const examOfficerSlugComponents: Record<string, React.ComponentType> = {
  dashboard: ExaminationOfficerDashboard,
  'result-processing': ResultProcessing,
  'result-verification': ResultVerification,
  'result-publication': ResultPublication,
  'result-corrections': ResultCorrections,
  'transcript-requests': TranscriptRequests,
  'graduation-clearance': GraduationClearance,
  'academic-records': AcademicRecords,
  'audit-logs': ExamOfficerAuditLogs,
  'communication': ExamOfficerCommunication,
  'notifications': ExamOfficerNotifications,
'profile': ExamOfficerProfile,
  'logout': ExamOfficerLogout,
  reports: ExamOfficerReports,
};

const studentSlugComponents: Record<string, React.ComponentType> = {
  dashboard: StudentDashboard,
  'my-profile': MyProfile,
  'course-registration': StudentCourseRegistration,
  'registered-courses': RegisteredCourses,
  assessments: Assessments,
  results: StudentResults,
  'transcript-requests': StudentTranscriptRequests,
  'academic-history': AcademicHistory,
  'fee-status': FeeStatus,
  documents: StudentDocuments,
  notifications: StudentNotifications,
  support: Support,
  'profile-settings': ProfileSettings,
  logout: StudentLogout,
};

export default function DashboardSlugPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useAuth() as { user?: { role?: string } };
  const role = user?.role || 'STUDENT';
  const normalizedRole = (role || 'STUDENT').toUpperCase().replace(/[- ]/g, '_');
  const menuItems = getMenuForRole(normalizedRole);
  const currentItem = menuItems.find((item: { slug?: string }) => item.slug === slug) || menuItems[0];
  const meta = sectionMeta[slug as keyof typeof sectionMeta] || sectionMeta.dashboard;

  if (normalizedRole === 'SYSTEM_ADMIN' && systemAdminSlugComponents[slug]) {
    const PageComponent = systemAdminSlugComponents[slug];
    return <PageComponent />;
  }

  if (normalizedRole === 'DEAN' && deanSlugComponents[slug]) {
    const PageComponent = deanSlugComponents[slug];
    return <PageComponent />;
  }

  if (normalizedRole === 'HOD' && hodSlugComponents[slug]) {
    const PageComponent = hodSlugComponents[slug];
    return <PageComponent />;
  }

  if (normalizedRole === 'UNIVERSITY_ADMIN' && universityAdminSlugComponents[slug]) {
    const PageComponent = universityAdminSlugComponents[slug];
    return <PageComponent />;
  }

  if (normalizedRole === 'LECTURER' && lecturerSlugComponents[slug]) {
    const PageComponent = lecturerSlugComponents[slug];
    return <PageComponent />;
  }

if ((normalizedRole === 'EXAM_OFFICER' || normalizedRole === 'EXAMINATION_OFFICER') && examOfficerSlugComponents[slug]) {
    const PageComponent = examOfficerSlugComponents[slug];
    return <PageComponent />;
  }

  if (normalizedRole === 'STUDENT' && studentSlugComponents[slug]) {
    const PageComponent = studentSlugComponents[slug];
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
          actions={<Button variant="secondary" size="sm">Switch section</Button>}
        />

        <Tabs tabs={tabs} />

        <Card title="Section access" description={`This page is routed for the ${currentItem?.label || 'dashboard'} section and is ready for detailed module content.`}>
          <p className="text-sm text-[var(--color-muted-text)]">Choose the right workflow above to continue.</p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
