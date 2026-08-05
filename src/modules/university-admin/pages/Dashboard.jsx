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

export default function UniversityAdminDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [stuResp, staffResp, facResp, resResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/students`, { headers }),
          fetch(`${API_BASE}/api/admin/staff`, { headers }),
          fetch(`${API_BASE}/api/admin/academic/faculties`, { headers }),
          fetch(`${API_BASE}/api/admin/platform/results`, { headers }),
        ]);
        const stuBody = await stuResp.json();
        const staffBody = await staffResp.json();
        const facBody = await facResp.json();
        const resBody = await resResp.json();
        if (!cancelled) {
          if (stuBody.success) setStudents(stuBody.data);
          if (staffBody.success) setStaff(staffBody.data);
          if (facBody.success) setFaculties(facBody.data);
          if (resBody.success) setResults(resBody.data);
          if (!stuBody.success) setError(stuBody.message || 'Failed to load data');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const pendingResults = results.filter((r) => r.status === 'PENDING').length;
  const publishedResults = results.filter((r) => r.status === 'PUBLISHED').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="URMIS University"
          title={`Welcome back, ${user?.name || 'Administrator'}`}
          description="University-wide overview of academics, students, staff, and results."
          badge={<Badge tone="info">University Administrator</Badge>}
          actions={(
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>Refresh</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        {!loading ? (
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <MetricTile title="Students" value={students.length} description="Enrolled students" badge="All" />
            <MetricTile title="Staff" value={staff.length} description="Staff records" badgeTone="info" badge="Staff" />
            <MetricTile title="Faculties" value={faculties.length} description="Academic faculties" badgeTone="success" badge="Fac" />
            <MetricTile title="Departments" value={faculties.reduce((s, f) => s + (f._count?.departments || 0), 0)} description="Departments" badgeTone="warning" badge="Dept" />
            <MetricTile title="Pending results" value={pendingResults} description="Awaiting approval" badgeTone="warning" badge="Queue" />
            <MetricTile title="Published results" value={publishedResults} description="Live results" badgeTone="success" badge="Live" />
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[0.7fr_0.3fr]">
          <Card title="University analytics" description="Key metrics across your institution.">
            <Charts
              title="Institution activity"
              series={['Students', 'Staff', 'Faculties', 'Results']}
            />
          </Card>

          <NotificationPanel
            title="University alerts"
            items={[
              { title: 'Results pending approval', message: `${pendingResults} results require review.`, time: 'Today' },
              { title: 'Registration window', message: 'Course registration is active.', time: 'Live' },
              { title: 'New student records', message: `${students.length} students on record.`, time: 'Updated' },
            ]}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
