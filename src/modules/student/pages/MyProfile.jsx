"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/auth/AuthProvider';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import Input from '../../../shared/components/ui/Input';
import Alert from '../../../shared/components/ui/Alert';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function MyProfile() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/student/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) {
            setStudent(body.data);
          } else {
            setError(body.message || 'Failed to load student profile');
          }
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Student"
          title="My Profile"
          description="Your personal and academic information as recorded by the university."
          badge={<Badge tone="info">{student ? 'Active' : 'Profile'}</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="max-w-4xl">
          <Card title="Personal information" description="Basic identity details.">
            {loading ? (
              <p className="text-sm text-[var(--color-muted-text)]">Loading profile...</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Matriculation number" defaultValue={student?.matricNo || student?.studentId || '—'} readOnly />
                <Input label="Full name" defaultValue={`${student?.firstName || ''} ${student?.lastName || ''}`.trim() || user?.name || ''} readOnly />
                <Input label="Email" defaultValue={student?.email || user?.email || ''} readOnly />
                <Input label="Phone" defaultValue={student?.phone || '—'} readOnly />
              </div>
            )}
          </Card>

          <div className="mt-4">
            <Card title="Academic information" description="Programme, level, and department details.">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Department" defaultValue={student?.department?.name || student?.departmentId || '—'} readOnly />
                <Input label="Programme" defaultValue={student?.programme?.name || student?.programmeId || '—'} readOnly />
                <Input label="Current level" defaultValue={student?.level || '—'} readOnly />
                <Input label="Enrolment status" defaultValue={student?.status || '—'} readOnly />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

