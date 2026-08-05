"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Table from '../../../shared/components/ui/Table';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import MetricTile from '../../../shared/components/ui/MetricTile';
import Alert from '../../../shared/components/ui/Alert';
import NotificationPanel from '../../../shared/components/ui/NotificationPanel';
import { useAuth } from '../../../shared/auth/AuthProvider';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

function deanStatusTone(status) {
  switch (status) {
    case 'PUBLISHED':
    case 'SENT':
      return 'success';
    case 'APPROVED':
    case 'READ':
      return 'info';
    case 'PENDING':
      return 'warning';
    case 'FAILED':
    case 'REJECTED':
      return 'danger';
    default:
      return 'neutral';
  }
}

function SectionShell({ eyebrow, title, description, badge, children }) {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader eyebrow={eyebrow} title={title} description={description} badge={badge} />
        {children}
      </div>
    </DashboardLayout>
  );
}

function useDeanData(fetcher, deps = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const value = await fetcher();
        if (!active) return;
        setData(Array.isArray(value) ? value : value ?? []);
        setError(null);
      } catch (e) {
        if (!active) return;
        setError(e.message || 'Unable to load dean data.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, deps);

  return { data, loading, error };
}

async function deanRequest(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    throw new Error(body.message || `Request failed (${response.status})`);
  }
  return body.data ?? [];
}

export function DeanDashboard() {
  const [stats, setStats] = useState({ faculties: 0, departments: 0, lecturers: 0, students: 0, pendingResults: 0, approvedResults: 0 });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [faculties, departments, staff, students, results] = await Promise.all([
          deanRequest('/api/admin/academic/faculties'),
          deanRequest('/api/admin/academic/departments'),
          deanRequest('/api/admin/staff'),
          deanRequest('/api/admin/students'),
          deanRequest('/api/admin/platform/results'),
        ]);
        if (!active) return;
        setStats({
          faculties: faculties.length,
          departments: departments.length,
          lecturers: staff.filter((member) => member.role === 'LECTURER' || member.role === 'DEAN' || member.role === 'HOD').length,
          students: students.length,
          pendingResults: results.filter((result) => result.status === 'PENDING').length,
          approvedResults: results.filter((result) => result.status === 'APPROVED').length,
        });
        setRows(results.slice(0, 5));
      } catch (e) {
        if (active) setError(e.message || 'Unable to load faculty dashboard.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <SectionShell
      eyebrow="Faculty oversight"
      title="Dean Dashboard"
      description="Track faculty performance, results, and approvals in real time."
      badge={<Badge tone="info">Live</Badge>}
    >
      {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricTile title="Faculties" value={stats.faculties} description="Faculty units" badge="Total" />
        <MetricTile title="Departments" value={stats.departments} description="Academic departments" badge="Units" badgeTone="info" />
        <MetricTile title="Lecturers" value={stats.lecturers} description="Active academic staff" badge="Staff" badgeTone="success" />
        <MetricTile title="Students" value={stats.students} description="Registered students" badge="Enrolled" badgeTone="warning" />
        <MetricTile title="Pending" value={stats.pendingResults} description="Awaiting dean review" badge="Review" badgeTone="warning" />
        <MetricTile title="Approved" value={stats.approvedResults} description="Ready for publication" badge="Approved" badgeTone="success" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.7fr_0.3fr]">
        <Card title="Recent faculty result flow" description="Latest results progressing through the dean approval pipeline.">
          {loading ? <p className="text-sm text-[var(--color-muted-text)]">Loading faculty data...</p> : (
            <Table
              columns={[
                { header: 'Student', accessor: 'student', render: (_value, row) => row.student ? `${row.student.firstName || ''} ${row.student.lastName || ''}`.trim() || '—' : '—' },
                { header: 'Course', accessor: 'course', render: (_value, row) => row.course?.title || row.courseId || '—' },
                { header: 'Grade', accessor: 'grade', render: (value) => <Badge tone="info">{value || '—'}</Badge> },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={deanStatusTone(value)}>{value || '—'}</Badge> },
              ]}
              rows={rows}
              emptyText="No result activity in the faculty yet."
            />
          )}
        </Card>

        <Card title="Dean actions" description="Quick actions for faculty oversight.">
          <div className="space-y-3">
            <Button variant="primary" size="sm" onClick={() => window.location.href = '/dashboard/result-approval'}>Review approvals</Button>
            <Button variant="secondary" size="sm" onClick={() => window.location.href = '/dashboard/faculty-reports'}>Faculty reports</Button>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/dashboard/notifications'}>View notifications</Button>
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}

function FacultyOverviewPage() {
  const { data, loading, error } = useDeanData(async () => {
    const [facultiesData, departmentsData, staffData, studentsData] = await Promise.all([
      deanRequest('/api/admin/academic/faculties'),
      deanRequest('/api/admin/academic/departments'),
      deanRequest('/api/admin/staff'),
      deanRequest('/api/admin/students'),
    ]);
    return { faculties: facultiesData, departments: departmentsData, staff: staffData, students: studentsData };
  });

  const summary = useMemo(() => {
    const facultyList = Array.isArray(data?.faculties) ? data.faculties : [];
    const deptList = Array.isArray(data?.departments) ? data.departments : [];
    const staffList = Array.isArray(data?.staff) ? data.staff : [];
    const studentList = Array.isArray(data?.students) ? data.students : [];
    return {
      faculties: facultyList.length,
      departments: deptList.length,
      lecturers: staffList.filter((member) => member.role === 'LECTURER').length,
      students: studentList.length,
    };
  }, [data]);

  return (
    <SectionShell eyebrow="Faculty" title="Faculty Overview" description="Monitor faculty-level performance, staff, and enrollment." badge={<Badge tone="info">{summary.faculties} faculties</Badge>}>
      {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricTile title="Faculties" value={summary.faculties} description="Faculty units" badge="Units" />
        <MetricTile title="Departments" value={summary.departments} description="Academic departments" badge="Dept" badgeTone="info" />
        <MetricTile title="Lecturers" value={summary.lecturers} description="Faculty lecturers" badge="Staff" badgeTone="success" />
        <MetricTile title="Students" value={summary.students} description="Students under this faculty" badge="Students" badgeTone="warning" />
      </div>

      <Card title="Faculty portfolio" description="Academic units in the current institution.">
        {loading ? <p className="text-sm text-[var(--color-muted-text)]">Loading faculty overview...</p> : (
<Table
            columns={[
                { header: 'Faculty', accessor: 'name' },
                { header: 'Code', accessor: 'code', render: (value) => <Badge tone="info">{value || '—'}</Badge> },
                { header: 'Departments', accessor: 'departments', render: (_value, row) => row._count?.departments || 0 },
                { header: 'Programmes', accessor: 'programmes', render: (_value, row) => row._count?.programmes || 0 },
            ]}
            rows={Array.isArray(data?.faculties) ? data.faculties : []}
            emptyText="No faculty record found."
          />
        )}
      </Card>
    </SectionShell>
  );
}

export function DeanDepartments() {
  const { data: departments, loading, error } = useDeanData(async () => deanRequest('/api/admin/academic/departments'));

  return (
    <SectionShell eyebrow="Academic structure" title="Departments" description="Review every department managed by the faculty." badge={<Badge tone="info">{departments.length} departments</Badge>}>
      {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}
      <Card title="Department list" description="Department portfolio and assigned faculty context.">
        {loading ? <p className="text-sm text-[var(--color-muted-text)]">Loading departments...</p> : (
          <Table
            columns={[
              { header: 'Name', accessor: 'name' },
              { header: 'Code', accessor: 'code', render: (value) => <Badge tone="info">{value || '—'}</Badge> },
              { header: 'Head', accessor: 'headName', render: (value) => value || 'Not assigned' },
              { header: 'Status', accessor: 'status', render: (value) => <Badge tone={deanStatusTone(value)}>{value || 'ACTIVE'}</Badge> },
            ]}
            rows={departments}
            emptyText="No departments found for this faculty."
          />
        )}
      </Card>
    </SectionShell>
  );
}

export function DeanLecturers() {
  const { data: lecturers, loading, error } = useDeanData(async () => {
    const staff = await deanRequest('/api/admin/staff');
    return staff.filter((person) => person.role === 'LECTURER' || person.role === 'HOD');
  });

  return (
    <SectionShell eyebrow="Faculty staff" title="Lecturers" description="Review the teaching staff active within the faculty." badge={<Badge tone="info">{lecturers.length} staff</Badge>}>
      {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}
      <Card title="Staff roster" description="Lecturers and academic leaders available for course oversight.">
        {loading ? <p className="text-sm text-[var(--color-muted-text)]">Loading lecturers...</p> : (
          <Table
            columns={[
              { header: 'Name', accessor: 'name' },
              { header: 'Email', accessor: 'email' },
              { header: 'Role', accessor: 'role', render: (value) => <Badge tone="info">{value || 'LECTURER'}</Badge> },
              { header: 'Department', accessor: 'departmentName', render: (value) => value || '—' },
            ]}
            rows={lecturers}
            emptyText="No lecturers are registered for this faculty."
          />
        )}
      </Card>
    </SectionShell>
  );
}

export function DeanStudents() {
  const { data: students, loading, error } = useDeanData(async () => deanRequest('/api/admin/students'));

  return (
    <SectionShell eyebrow="Academic records" title="Students" description="View enrolled students and student population metrics." badge={<Badge tone="info">{students.length} students</Badge>}>
      {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}
      <Card title="Student directory" description="Student list under the faculty's institutions.">
        {loading ? <p className="text-sm text-[var(--color-muted-text)]">Loading students...</p> : (
          <Table
            columns={[
              { header: 'Name', accessor: 'name', render: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || value || '—' },
              { header: 'Email', accessor: 'email' },
              { header: 'Matric', accessor: 'matricNumber', render: (value) => value || '—' },
              { header: 'Programme', accessor: 'programme', render: (value) => value || '—' },
            ]}
            rows={students}
            emptyText="No students available in the faculty directory."
          />
        )}
      </Card>
    </SectionShell>
  );
}

export function DeanCourseManagement() {
  const { data: courses, loading, error } = useDeanData(async () => {
    const curricula = await deanRequest('/api/admin/academic/curricula');
    return curricula.length ? curricula : await deanRequest('/api/admin/academic/programmes');
  });

  return (
    <SectionShell eyebrow="Academic planning" title="Course Management" description="Keep course catalog and academic delivery aligned to faculty needs." badge={<Badge tone="info">{courses.length} records</Badge>}>
      {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}
      <Card title="Course catalogue" description="Courses and programme-linked academic offerings.">
        {loading ? <p className="text-sm text-[var(--color-muted-text)]">Loading course records...</p> : (
          <Table
            columns={[
              { header: 'Title', accessor: 'title', render: (value, row) => value || row.name || '—' },
              { header: 'Code', accessor: 'code', render: (value) => value || '—' },
              { header: 'Credits', accessor: 'creditHours', render: (value) => value ?? '—' },
              { header: 'Status', accessor: 'status', render: (value) => <Badge tone={deanStatusTone(value)}>{value || 'ACTIVE'}</Badge> },
            ]}
            rows={courses}
            emptyText="No course records have been created yet."
          />
        )}
      </Card>
    </SectionShell>
  );
}

export function DeanAssessmentReview() {
  const { data: assessments, loading, error } = useDeanData(async () => deanRequest('/api/admin/platform/assessments'));

  return (
    <SectionShell eyebrow="Assessment review" title="Assessment Review" description="Review assessments sent across the faculty for approval." badge={<Badge tone="info">{assessments.length} assessments</Badge>}>
      {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}
      <Card title="Assessment inventory" description="Current assessment plans and evaluation records.">
        {loading ? <p className="text-sm text-[var(--color-muted-text)]">Loading assessments...</p> : (
          <Table
            columns={[
              { header: 'Name', accessor: 'name' },
              { header: 'Type', accessor: 'type', render: (value) => value || '—' },
              { header: 'Weight', accessor: 'weight', render: (value) => value ?? '—' },
              { header: 'Status', accessor: 'status', render: (value) => <Badge tone={deanStatusTone(value)}>{value || 'ACTIVE'}</Badge> },
            ]}
            rows={assessments}
            emptyText="No assessments have been submitted for faculty review."
          />
        )}
      </Card>
    </SectionShell>
  );
}

export function DeanResultApproval() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await deanRequest('/api/admin/platform/results');
      setResults(data);
      setError(null);
    } catch (e) {
      setError(e.message || 'Unable to load result approval queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approveResult = async (id) => {
    try {
      await fetch(`${API_BASE}/api/admin/platform/results/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      }).then((response) => response.json().catch(() => ({})));
      await load();
    } catch (e) {
      setError('Unable to approve selected result.');
    }
  };

  return (
    <SectionShell eyebrow="Result approval" title="Result Approval" description="Review submitted results and approve faculty outcomes before publication." badge={<Badge tone="info">{results.length} records</Badge>}>
      {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}
      <Card title="Dean approval queue" description="Faculty result reviews that require approval.">
        {loading ? <p className="text-sm text-[var(--color-muted-text)]">Loading result queue...</p> : (
          <Table
            columns={[
              { header: 'Student', accessor: 'student', render: (_value, row) => row.student ? `${row.student.firstName || ''} ${row.student.lastName || ''}`.trim() || '—' : '—' },
              { header: 'Course', accessor: 'course', render: (_value, row) => row.course?.title || row.courseId || '—' },
              { header: 'Score', accessor: 'score', render: (value) => value ?? '—' },
              { header: 'Grade', accessor: 'grade', render: (value) => <Badge tone="info">{value || '—'}</Badge> },
              { header: 'Status', accessor: 'status', render: (value) => <Badge tone={deanStatusTone(value)}>{value || 'PENDING'}</Badge> },
              { header: 'Action', accessor: 'id', render: (value, row) => (
                <Button variant={row.status === 'PENDING' ? 'primary' : 'secondary'} size="sm" onClick={() => approveResult(value)}>
                  {row.status === 'PENDING' ? 'Approve' : 'Reviewed'}
                </Button>
              ) },
            ]}
            rows={results}
            emptyText="No results are waiting for dean approval."
          />
        )}
      </Card>
    </SectionShell>
  );
}

export function DeanFacultyReports() {
  const { data: reports, loading, error } = useDeanData(async () => {
    const academicReport = await deanRequest('/api/admin/platform/reports/academic').catch(() => []);
    const resultReport = await deanRequest('/api/admin/platform/reports/results').catch(() => []);
    return { academicReport, resultReport };
  });

  const reportRows = Array.isArray(reports?.academicReport) ? reports.academicReport : [];
  const resultRows = Array.isArray(reports?.resultReport) ? reports.resultReport : [];

  return (
    <SectionShell eyebrow="Reports" title="Faculty Reports" description="Review faculty performance and academic result reports." badge={<Badge tone="info">{reportRows.length + resultRows.length} entries</Badge>}>
      {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Academic report" description="Institutional academic activity overview.">
          {loading ? <p className="text-sm text-[var(--color-muted-text)]">Loading academic reports...</p> : (
            <Table
              columns={[{ header: 'Metric', accessor: 'label' }, { header: 'Value', accessor: 'value' }]}
              rows={reportRows}
              emptyText="No academic report data available."
            />
          )}
        </Card>

        <Card title="Result report" description="Result and publication trend summary.">
          {loading ? <p className="text-sm text-[var(--color-muted-text)]">Loading result reports...</p> : (
            <Table
              columns={[{ header: 'Metric', accessor: 'label' }, { header: 'Value', accessor: 'value' }]}
              rows={resultRows}
              emptyText="No result report data available."
            />
          )}
        </Card>
      </div>
    </SectionShell>
  );
}

export function DeanFacultyStatistics() {
  const { data: stats, loading, error } = useDeanData(async () => {
    const academic = await deanRequest('/api/admin/platform/reports/academic').catch(() => []);
    const analytics = await deanRequest('/api/admin/platform/reports/analytics').catch(() => []);
    return [...academic, ...analytics];
  });

  return (
    <SectionShell eyebrow="Analytics" title="Faculty Statistics" description="Track student and faculty performance using the live analytics feed." badge={<Badge tone="info">Analytics</Badge>}>
      {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricTile title="Academic metrics" value={Array.isArray(stats) ? stats.length : 0} description="Live statistics entries" badge="Live" />
        <MetricTile title="Reporting" value="Faculty" description="Dean-level insight" badge="Scope" badgeTone="info" />
        <MetricTile title="Review" value="Ready" description="Published and actionable" badge="Status" badgeTone="success" />
      </div>

      <Card title="Analytics feed" description="Operational metrics supplied by the platform.">
        {loading ? <p className="text-sm text-[var(--color-muted-text)]">Loading statistics...</p> : (
          <Table
            columns={[{ header: 'Metric', accessor: 'label' }, { header: 'Value', accessor: 'value' }, { header: 'Summary', accessor: 'summary' }]}
            rows={stats}
            emptyText="No faculty statistics are available."
          />
        )}
      </Card>
    </SectionShell>
  );
}

export function DeanCommunication() {
  const { data: notifications, loading, error } = useDeanData(async () => deanRequest('/api/admin/platform/notifications'));

  return (
    <SectionShell eyebrow="Communication" title="Communication" description="Send and review internal communication to faculty and academic units." badge={<Badge tone="info">{notifications.length} messages</Badge>}>
      {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}
      <div className="grid gap-4 xl:grid-cols-[0.7fr_0.3fr]">
        <Card title="Communication log" description="Recent notifications relevant to faculty decisions.">
          {loading ? <p className="text-sm text-[var(--color-muted-text)]">Loading communication log...</p> : (
            <Table
              columns={[
                { header: 'Title', accessor: 'title' },
                { header: 'Channel', accessor: 'channel', render: (value) => <Badge tone="info">{value || '—'}</Badge> },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={deanStatusTone(value)}>{value || 'SENT'}</Badge> },
              ]}
              rows={notifications}
              emptyText="No communication records available."
            />
          )}
        </Card>

        <NotificationPanel title="Faculty updates" items={notifications.slice(0, 5).map((item) => ({ title: item.title, message: item.message, time: item.createdAt ? new Date(item.createdAt).toLocaleString() : '—' }))} />
      </div>
    </SectionShell>
  );
}

export function DeanNotifications() {
  const { data: notifications, loading, error } = useDeanData(async () => deanRequest('/api/admin/platform/notifications'));

  return (
    <SectionShell eyebrow="Alerts" title="Notifications" description="Review alerts, approvals, and faculty-sensitive updates." badge={<Badge tone="info">{notifications.length} alerts</Badge>}>
      {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}
      <Card title="Alert center" description="Latest platform alerts for the dean.">
        {loading ? <p className="text-sm text-[var(--color-muted-text)]">Loading notifications...</p> : (
          <Table
            columns={[
              { header: 'Title', accessor: 'title' },
              { header: 'Channel', accessor: 'channel' },
              { header: 'Status', accessor: 'status', render: (value) => <Badge tone={deanStatusTone(value)}>{value || 'SENT'}</Badge> },
            ]}
            rows={notifications}
            emptyText="No notifications are available."
          />
        )}
      </Card>
    </SectionShell>
  );
}

function DeanProfilePage() {
  const { user } = useAuth();

  return (
    <SectionShell eyebrow="Account" title="Profile" description="Manage your dean profile and account details." badge={<Badge tone="info">{user?.role || 'DEAN'}</Badge>}>
      <Card title="Account information" description="Your profile details as visible across the platform.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-border)] p-3 text-sm"><span className="text-[var(--color-muted-text)]">Full name</span><p className="mt-2 font-medium">{user?.name || 'Dean'}</p></div>
          <div className="rounded-xl border border-[var(--color-border)] p-3 text-sm"><span className="text-[var(--color-muted-text)]">Email</span><p className="mt-2 font-medium">{user?.email || '—'}</p></div>
          <div className="rounded-xl border border-[var(--color-border)] p-3 text-sm"><span className="text-[var(--color-muted-text)]">Role</span><p className="mt-2 font-medium">{user?.role || 'DEAN'}</p></div>
          <div className="rounded-xl border border-[var(--color-border)] p-3 text-sm"><span className="text-[var(--color-muted-text)]">Institution ID</span><p className="mt-2 font-medium">{user?.institutionId || user?.institution_id || '—'}</p></div>
        </div>
      </Card>
    </SectionShell>
  );
}

function DeanLogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    const timer = setTimeout(() => router.push('/login'), 800);
    return () => clearTimeout(timer);
  }, [logout, router]);

  return (
    <SectionShell eyebrow="Session" title="Signing out" description="You are being securely signed out of the platform.">
      <Card title="Signing out" description="Redirecting you back to the login portal.">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
          <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>Go to login</Button>
        </div>
      </Card>
    </SectionShell>
  );
}

export { DeanDashboard as default };
export const Departments = DeanDepartments;
export const Lecturers = DeanLecturers;
export const Students = DeanStudents;
export const CourseManagement = DeanCourseManagement;
export const AssessmentReview = DeanAssessmentReview;
export const ResultApproval = DeanResultApproval;
export const FacultyReports = DeanFacultyReports;
export const FacultyStatistics = DeanFacultyStatistics;
export const Communication = DeanCommunication;
export const Notifications = DeanNotifications;
export const DeanProfile = DeanProfilePage;
export const DeanLogout = DeanLogoutPage;
export const FacultyOverview = FacultyOverviewPage;


