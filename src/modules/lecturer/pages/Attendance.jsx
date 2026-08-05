"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Table from '../../../shared/components/ui/Table';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import MetricTile from '../../../shared/components/ui/MetricTile';
import Alert from '../../../shared/components/ui/Alert';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/admin/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) setStudents(body.data);
          else setError(body.message || 'Failed to load students');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function toggleAttendance(studentId) {
    setAttendance((prev) => {
      const next = { ...prev };
      next[studentId] = !next[studentId];
      return next;
    });
  }

  const present = Object.values(attendance).filter(Boolean).length;
  const absent = students.length - present;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Class Tracking"
          title="Attendance"
          description="Record and track student attendance for your class sessions."
          badge={<Badge tone="info">{present} present</Badge>}
          actions={<Button variant="primary" size="sm" onClick={() => setAttendance({})}>Reset</Button>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <MetricTile title="Present" value={present} description="Students marked present" badgeTone="success" badge="Present" />
          <MetricTile title="Absent" value={absent} description="Students marked absent" badgeTone="danger" badge="Absent" />
          <MetricTile title="Total" value={students.length} description="Students enrolled" badgeTone="info" badge="Total" />
        </div>

        <Card title="Class attendance" description="Mark attendance for each student.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading students...</p>
          ) : (
            <Table
              columns={[
                { header: 'Name', accessor: 'name', render: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || value || '—' },
                { header: 'Email', accessor: 'email' },
                {
                  header: 'Status',
                  accessor: 'id',
                  render: (value, row) => (
                    attendance[row.id] ? <Badge tone="success">Present</Badge> : <Badge tone="danger">Absent</Badge>
                  ),
                },
                {
                  header: 'Action',
                  accessor: 'id',
                  render: (value, row) => (
                    <Button variant={attendance[row.id] ? 'secondary' : 'primary'} size="sm" onClick={() => toggleAttendance(row.id)}>
                      {attendance[row.id] ? 'Mark Absent' : 'Mark Present'}
                    </Button>
                  ),
                },
              ]}
              rows={students}
              emptyText="No students available."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

