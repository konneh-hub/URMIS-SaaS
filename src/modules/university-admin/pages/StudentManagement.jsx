"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Table from '../../../shared/components/ui/Table';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Dialog from '../../../shared/components/ui/Dialog';
import MetricTile from '../../../shared/components/ui/MetricTile';
import Alert from '../../../shared/components/ui/Alert';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ studentNumber: '', firstName: '', lastName: '', email: '', phone: '', admissionYear: '', departmentId: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [stuResp, deptResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/students`, { headers }),
          fetch(`${API_BASE}/api/admin/academic/departments`, { headers }),
        ]);
        const stuBody = await stuResp.json();
        const deptBody = await deptResp.json();
        if (!cancelled) {
          if (stuBody.success) setStudents(stuBody.data);
          if (deptBody.success) setDepartments(deptBody.data);
          if (!stuBody.success) setError(stuBody.message || 'Failed to load students');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success) setStudents(body.data);
    } catch (e) { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, admissionYear: Number(form.admissionYear) }),
      });
      const body = await resp.json();
      if (body.success) {
        setIsOpen(false);
        setForm({ studentNumber: '', firstName: '', lastName: '', email: '', phone: '', admissionYear: '', departmentId: '' });
        refresh();
      } else {
        alert(body.message || 'Failed to create student');
      }
    } catch (e) {
      alert('Could not create student');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Student Affairs"
          title="Student Management"
          description="Oversee student profiles and records."
          badge={<Badge tone="info">{students.length} students</Badge>}
          actions={(
            <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>Add student</Button>
          )}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-4">
          <MetricTile title="Students" value={students.length} description="Enrolled students" badge="All" />
          <MetricTile title="Departments" value={departments.length} description="Owning departments" badgeTone="info" badge="Depts" />
          <MetricTile title="Admissions" value={new Set(students.map((s) => s.admissionYear)).size} description="Admission years" badgeTone="success" badge="Years" />
          <MetricTile title="Registrations" value={students.reduce((s, x) => s + (x._count?.registrations || 0), 0)} description="Course registrations" badgeTone="warning" badge="Regs" />
        </div>

        <Card title="Students" description="All students within your institution.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading students...</p>
          ) : (
            <Table
              columns={[
                { header: 'Student number', accessor: 'studentNumber', render: (value) => <Badge tone="info">{value}</Badge> },
                { header: 'Name', accessor: 'name', render: (_v, row) => `${row.firstName} ${row.lastName}` },
                { header: 'Email', accessor: 'email' },
                { header: 'Department', accessor: 'department', render: (_v, row) => row.department?.name || '—' },
                { header: 'Admission year', accessor: 'admissionYear' },
              ]}
              rows={students}
              emptyText="No students created yet."
            />
          )}
        </Card>
      </div>

      <Dialog
        open={isOpen}
        title="Add student"
        description="Create a new student record."
        onClose={() => setIsOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        )}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Student number" value={form.studentNumber} onChange={(e) => setForm({ ...form, studentNumber: e.target.value })} required />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            <Input label="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Admission year" type="number" value={form.admissionYear} onChange={(e) => setForm({ ...form, admissionYear: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)]">
              <span className="mb-2 block">Department</span>
              <select
                className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-primary)]"
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                required
              >
                <option value="">Select department</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" size="sm">Add student</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
