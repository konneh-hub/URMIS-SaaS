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
    case 'REGISTERED': return 'success';
    case 'PENDING': return 'warning';
    case 'DROPPED': return 'danger';
    case 'OPEN': return 'info';
    default: return 'neutral';
  }
}

export default function CourseRegistration() {
  const { user } = useAuth();
  const [availableCourses, setAvailableCourses] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
const [availableResp, registeredResp] = await Promise.all([
          fetch(`${API_BASE}/api/student/courses`, { headers }),
          fetch(`${API_BASE}/api/student/registered-courses`, { headers }),
        ]);
        const availableBody = await availableResp.json();
        const registeredBody = await registeredResp.json();
        if (!cancelled) {
          setAvailableCourses(Array.isArray(availableBody) ? availableBody : (availableBody.data || []));
          setRegisteredCourses(Array.isArray(registeredBody) ? registeredBody : (registeredBody.data || []));
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  async function registerCourse(courseId) {
    try {
      const token = localStorage.getItem('accessToken');
const resp = await fetch(`${API_BASE}/api/student/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId }),
      });
      const body = await resp.json();
      if (body.success || resp.ok) {
        setRegisteredCourses((prev) => [...prev, { id: courseId, courseId, status: 'REGISTERED' }]);
      } else {
        alert(body.message || 'Failed to register for course');
      }
    } catch (e) {
      alert('Could not register for course');
    }
  }

  async function dropCourse(courseId) {
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/institution/student/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success || resp.ok) {
        setRegisteredCourses((prev) => prev.filter((c) => c.courseId !== courseId && c.id !== courseId));
      } else {
        alert(body.message || 'Failed to drop course');
      }
    } catch (e) {
      alert('Could not drop course');
    }
  }

  const registeredIds = new Set(registeredCourses.map((c) => c.courseId || c.id));
  const available = availableCourses.filter((c) => !registeredIds.has(c.id));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Enrollment"
          title="Course Registration"
          description="Register for courses for the current academic session."
          badge={<Badge tone="info">{registeredCourses.length} registered</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Available courses" value={available.length} description="Open for registration" badge="Open" />
          <MetricTile title="Registered" value={registeredCourses.length} description="Courses you registered" badgeTone="success" badge="Done" />
          <MetricTile title="Credits" value={registeredCourses.reduce((sum, c) => sum + (c.creditHours || c.credits || 0), 0)} description="Total credit hours" badgeTone="info" badge="Credits" />
        </div>

        <Card title="Available courses" description="Courses you can register for this session.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading courses...</p>
          ) : (
            <Table
              columns={[
                { header: 'Course', accessor: 'title', render: (_v, row) => row.title || row.code || '—' },
                { header: 'Code', accessor: 'code' },
                { header: 'Credits', accessor: 'creditHours', render: (v) => v ?? '—' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value || 'OPEN')}>{value || 'OPEN'}</Badge> },
                { header: 'Action', accessor: 'id', render: (value) => (
                  <Button variant="primary" size="sm" onClick={() => registerCourse(value)}>Register</Button>
                ) },
              ]}
              rows={available}
              emptyText="No courses available for registration."
            />
          )}
        </Card>

        <Card title="My registered courses" description="Courses you have registered for.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading registrations...</p>
          ) : (
            <Table
              columns={[
                { header: 'Course', accessor: 'title', render: (_v, row) => row.title || row.code || '—' },
                { header: 'Code', accessor: 'code' },
                { header: 'Credits', accessor: 'creditHours', render: (v) => v ?? '—' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value || 'REGISTERED')}>{value || 'REGISTERED'}</Badge> },
                { header: 'Action', accessor: 'courseId', render: (value, row) => (
                  <Button variant="danger" size="sm" onClick={() => dropCourse(value || row.id)}>Drop</Button>
                ) },
              ]}
              rows={registeredCourses}
              emptyText="You have not registered for any courses yet."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

