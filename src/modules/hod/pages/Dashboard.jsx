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
    case 'PUBLISHED':
    case 'SENT':
      return 'success';
    case 'APPROVED':
    case 'VERIFIED':
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

export default function HodDashboard() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({ lecturers: 0, students: 0, courses: 0, assessments: 0, pendingResults: 0, verifiedResults: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [staffResp, studentsResp, coursesResp, assessmentsResp, resultsResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/staff`, { headers }),
          fetch(`${API_BASE}/api/admin/students`, { headers }),
          fetch(`${API_BASE}/api/admin/academic/curricula`, { headers }),
          fetch(`${API_BASE}/api/admin/platform/assessments`, { headers }),
          fetch(`${API_BASE}/api/admin/platform/results`, { headers }),
        ]);
        const staffBody = await staffResp.json();
        const studentsBody = await studentsResp.json();
        const coursesBody = await coursesResp.json();
        const assessmentsBody = await assessmentsResp.json();
        const resultsBody = await resultsResp.json();
        if (!cancelled) {
          const staffList = staffBody.success ? staffBody.data : [];
          const studentList = studentsBody.success ? studentsBody.data : [];
          const courseList = coursesBody.success ? coursesBody.data : [];
          const assessmentList = assessmentsBody.success ? assessmentsBody.data : [];
          const resultList = resultsBody.success ? resultsBody.data : [];
          setResults(resultList);
          setStats({
            lecturers: staffList.filter((s) => s.role === 'LECTURER' || s.role === 'HOD').length,
            students: studentList.length,
            courses: courseList.length,
            assessments: assessmentList.length,
            pendingResults: resultList.filter((r) => r.status === 'PENDING').length,
            verifiedResults: resultList.filter((r) => r.status === 'APPROVED').length,
          });
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Department oversight"
          title="HOD Dashboard"
          description={`Monitor department performance, results, and approvals. Welcome, ${user?.name || 'Head of Department'}.`}
          badge={<Badge tone="info">Live</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <MetricTile title="Lecturers" value={stats.lecturers} description="Active academic staff" badge="Staff" />
          <MetricTile title="Students" value={stats.students} description="Registered students" badge="Enrolled" badgeTone="info" />
          <MetricTile title="Courses" value={stats.courses} description="Department courses" badge="Courses" badgeTone="success" />
          <MetricTile title="Assessments" value={stats.assessments} description="Assessment plans" badge="Plans" badgeTone="warning" />
          <MetricTile title="Pending" value={stats.pendingResults} description="Awaiting verification" badge="Review" badgeTone="warning" />
          <MetricTile title="Verified" value={stats.verifiedResults} description="Ready for approval" badge="Approved" badgeTone="success" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.7fr_0.3fr]">
          <Card title="Recent department result flow" description="Latest results progressing through the HOD approval pipeline.">
            {loading ? (
              <p className="text-sm text-[var(--color-muted-text)]">Loading department data...</p>
            ) : (
              <Table
                columns={[
                  { header: 'Student', accessor: 'student', render: (_value, row) => row.student ? `${row.student.firstName || ''} ${row.student.lastName || ''}`.trim() || '—' : '—' },
                  { header: 'Course', accessor: 'course', render: (_value, row) => row.course?.title || row.courseId || '—' },
                  { header: 'Grade', accessor: 'grade', render: (value) => <Badge tone="info">{value || '—'}</Badge> },
                  { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value)}>{value || '—'}</Badge> },
                ]}
                rows={results.slice(0, 5)}
                emptyText="No result activity in the department yet."
              />
            )}
          </Card>

          <Card title="HOD actions" description="Quick actions for department oversight.">
            <div className="space-y-3">
              <Button variant="primary" size="sm" onClick={() => window.location.href = '/dashboard/result-verification'}>Verify results</Button>
              <Button variant="secondary" size="sm" onClick={() => window.location.href = '/dashboard/result-approval'}>Approve results</Button>
              <Button variant="secondary" size="sm" onClick={() => window.location.href = '/dashboard/course-allocation'}>Assign courses</Button>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/dashboard/department-reports'}>Department reports</Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
