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

export default function StudentDashboard() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [results, setResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
const [coursesResp, resultsResp, notificationsResp] = await Promise.all([
          fetch(`${API_BASE}/api/student/registered-courses`, { headers }),
          fetch(`${API_BASE}/api/student/results`, { headers }),
          fetch(`${API_BASE}/api/student/notifications`, { headers }),
        ]);
        const coursesBody = await coursesResp.json();
        const resultsBody = await resultsResp.json();
        const notificationsBody = await notificationsResp.json();
        if (!cancelled) {
          if (Array.isArray(coursesBody)) setRegistrations(coursesBody);
          else setRegistrations(coursesBody.data || []);
          if (Array.isArray(resultsBody)) setResults(resultsBody);
          else setResults(resultsBody.data || []);
          if (notificationsBody.success) setNotifications(notificationsBody.data || []);
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const registeredCourses = registrations.filter((r) => r.status !== 'DROPPED').length;
  const publishedResults = results.filter((r) => r.status === 'PUBLISHED').length;

  const panelItems = notifications.slice(0, 4).map((n) => ({
    title: n.title,
    message: n.message,
    time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : '—',
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Student Portal"
          title={`Welcome back, ${user?.name || 'Student'}`}
          description="Overview of your courses, results, and academic activities."
          badge={<Badge tone="info">Student</Badge>}
          actions={<Button variant="secondary" size="sm" onClick={() => window.location.reload()}>Refresh</Button>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        {!loading ? (
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <MetricTile title="Registered courses" value={registeredCourses} description="Courses this session" badge="Courses" />
            <MetricTile title="Published results" value={publishedResults} description="Results available" badgeTone="success" badge="Results" />
            <MetricTile title="GPA" value="—" description="Cumulative average" badgeTone="info" badge="GPA" />
            <MetricTile title="Assessments" value="Pending" description="Upcoming assessments" badgeTone="warning" badge="Schedule" />
            <MetricTile title="Transcripts" value="Ready" description="Transcript requests" badgeTone="info" badge="Requests" />
            <MetricTile title="Fee balance" value="Clear" description="Fee status" badgeTone="success" badge="Paid" />
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[0.65fr_0.35fr]">
          <Card title="My registered courses" description="Courses you are currently registered for.">
            {loading ? (
              <p className="text-sm text-[var(--color-muted-text)]">Loading courses...</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {registrations.length === 0 ? (
                  <p className="text-sm text-[var(--color-muted-text)]">No registered courses yet.</p>
                ) : (
                  registrations.slice(0, 6).map((course, index) => (
                    <div key={course.id || index} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-3 text-sm text-[var(--color-text)]">
                      <p className="font-semibold">{course.title || course.code || 'Course'}</p>
                      <p className="mt-1 text-[var(--color-muted-text)]">{course.code || '—'}</p>
                      <div className="mt-2"><Badge tone="info">{course.status || 'REGISTERED'}</Badge></div>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>

          <NotificationPanel
            title="Recent notifications"
            items={panelItems}
          />
        </div>

        <Card title="Academic analytics" description="Overview of your academic standing and workload.">
          <Charts title="Academic overview" series={['Registered courses', 'Published results', 'Assessments', 'GPA']} />
        </Card>
      </div>
    </DashboardLayout>
  );
}

