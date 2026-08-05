"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/auth/AuthProvider';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import MetricTile from '../../../shared/components/ui/MetricTile';
import Alert from '../../../shared/components/ui/Alert';
import NotificationPanel from '../../../shared/components/ui/NotificationPanel';
import Charts from '../../../shared/components/Charts';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function LecturerDashboard() {
  const { user } = useAuth();
  const [staffId, setStaffId] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [staffResp, studentsResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/staff`, { headers }),
          fetch(`${API_BASE}/api/admin/students`, { headers }),
        ]);
        const staffBody = await staffResp.json();
        const studentsBody = await studentsResp.json();
        if (!cancelled) {
          const staffList = staffBody.success ? staffBody.data : [];
          const current = staffList.find((s) => s.email === user?.email) || staffList[0];
          if (current) {
            setStaffId(current.id);
            const assignResp = await fetch(`${API_BASE}/api/admin/staff/${current.id}/assignments`, { headers });
            const assignBody = await assignResp.json();
            if (assignBody.success) setAssignments(assignBody.data);
          }
          if (studentsBody.success) setStudents(studentsBody.data);
          if (!staffBody.success) setError(staffBody.message || 'Failed to load staff');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  const courseCount = assignments.length;
  const studentCount = students.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Lecturer Workspace"
          title={`Welcome back, ${user?.name || 'Lecturer'}`}
          description="Overview of your assigned courses, students, and result activities."
          badge={<Badge tone="info">Lecturer</Badge>}
          actions={<Button variant="secondary" size="sm" onClick={() => window.location.reload()}>Refresh</Button>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        {!loading ? (
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <MetricTile title="Assigned courses" value={courseCount} description="Courses you teach" badge="Courses" />
            <MetricTile title="Students" value={studentCount} description="Registered students" badgeTone="info" badge="Students" />
            <MetricTile title="Assessments" value="Pending" description="Awaiting setup" badgeTone="warning" badge="Draft" />
            <MetricTile title="Score entry" value="Ready" description="Open for entry" badgeTone="success" badge="Live" />
            <MetricTile title="Submitted results" value="0" description="This session" badgeTone="info" badge="Sent" />
            <MetricTile title="Pending results" value="0" description="Awaiting submission" badgeTone="warning" badge="Queue" />
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[0.7fr_0.3fr]">
          <Card title="My course assignments" description="Courses allocated to you for the current academic session.">
            {loading ? (
              <p className="text-sm text-[var(--color-muted-text)]">Loading assignments...</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {assignments.length === 0 ? (
                  <p className="text-sm text-[var(--color-muted-text)]">No course assignments yet.</p>
                ) : (
                  assignments.map((assignment) => (
                    <div key={assignment.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-3 text-sm text-[var(--color-text)]">
                      <p className="font-semibold">{assignment.course?.title || assignment.courseId || 'Course'}</p>
                      <p className="mt-1 text-[var(--color-muted-text)]">{assignment.course?.code || '—'}</p>
                      <div className="mt-2"><Badge tone="info">{assignment.status || 'ACTIVE'}</Badge></div>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>

          <NotificationPanel
            title="Course updates"
            items={[
              { title: 'Registration window open', message: 'Students can register for your courses.', time: 'Today' },
              { title: 'Assessment deadline', message: 'Ensure assessment plans are published.', time: '3d' },
              { title: 'Result submission', message: 'Submit scores before the session closes.', time: '1w' },
            ]}
          />
        </div>

        <Card title="Course analytics" description="Overview of your teaching workload and performance signals.">
          <Charts title="Teaching activity" series={['Assigned courses', 'Students', 'Assessments', 'Results']} />
        </Card>
      </div>
    </DashboardLayout>
  );
}
