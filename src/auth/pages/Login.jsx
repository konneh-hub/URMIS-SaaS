"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../shared/auth/AuthProvider';
import Button from '../../shared/components/ui/Button';
import Card from '../../shared/components/ui/Card';
import Input from '../../shared/components/ui/Input';
import Alert from '../../shared/components/ui/Alert';

const roleProfiles = {
  LECTURER: {
    id: 'lecturer-demo',
    name: 'Amina Yusuf',
    email: 'amina@urmis.edu',
    role: 'LECTURER',
    institution_id: 'inst-demo',
    permissions: ['VIEW_ASSIGNED_COURSES', 'ENTER_RESULTS', 'SUBMIT_RESULTS', 'VIEW_RESULTS'],
  },
  UNIVERSITY_ADMIN: {
    id: 'admin-demo',
    name: 'Grace Okafor',
    email: 'grace@urmis.edu',
    role: 'UNIVERSITY_ADMIN',
    institution_id: 'inst-demo',
    permissions: ['MANAGE_STUDENTS', 'MANAGE_COURSES', 'MANAGE_DEPARTMENTS', 'MANAGE_FACULTIES', 'VIEW_RESULTS'],
  },
  STUDENT: {
    id: 'student-demo',
    name: 'Bola Ade',
    email: 'bola@student.urmis.edu',
    role: 'STUDENT',
    institution_id: 'inst-demo',
    permissions: ['VIEW_RESULTS', 'VIEW_TRANSCRIPT', 'VIEW_PROFILE'],
  },
};

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('LECTURER');

  const handleSubmit = (event) => {
    event.preventDefault();
    login(roleProfiles[selectedRole]);
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-elevated)] lg:grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-gradient-to-br from-[var(--color-primary)] to-slate-700 p-8 text-white sm:p-10 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-100">URMIS</p>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Secure access for every campus role</h1>
          <p className="mt-4 max-w-lg text-sm text-blue-50 sm:text-base">Deliver role-aware experiences for lecturers, administrators, students, and academic leaders with a single responsive portal.</p>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <Card title="Sign in" description="Choose a demo role to explore the unified dashboard experience.">
            <Alert title="Demo mode" tone="info" className="mb-5">This preview uses a simulated onboarding flow for design validation and role-based navigation.</Alert>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Email" type="email" defaultValue="demo@urmis.edu" />
              <Input label="Password" type="password" defaultValue="password123" hint="Use any password in this demo" />
              <label className="block text-sm font-medium text-[var(--color-text)]">
                <span className="mb-2 block">Demo role</span>
                <select
                  value={selectedRole}
                  onChange={(event) => setSelectedRole(event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
                >
                  <option value="LECTURER">Lecturer</option>
                  <option value="UNIVERSITY_ADMIN">University Admin</option>
                  <option value="STUDENT">Student</option>
                </select>
              </label>
              <Button type="submit" className="w-full">Continue to dashboard</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
