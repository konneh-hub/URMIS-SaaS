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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
      const resp = await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const body = await resp.json();
      if (!body.success) {
        setError(body.message || 'Login failed');
        return;
      }
      const { user, accessToken } = body.data;
      // store token and user
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        user.accessToken = accessToken;
      }
      login(user);
      router.push('/dashboard');
    } catch (e) {
      setError('Login failed');
    }
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
              {error && <div className="text-sm text-red-600">{error}</div>}
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} hint="Your account password" />
              <Button type="submit" className="w-full">Sign in</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
