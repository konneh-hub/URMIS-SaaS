"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../shared/auth/AuthProvider';
import Button from '../../shared/components/ui/Button';
import Card from '../../shared/components/ui/Card';
import Input from '../../shared/components/ui/Input';
import Alert from '../../shared/components/ui/Alert';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
const roleOptions = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'LECTURER', label: 'Lecturer' },
  { value: 'HOD', label: 'Head of Department' },
  { value: 'DEAN', label: 'Dean' },
  { value: 'EXAM_OFFICER', label: 'Exam Officer' },
];
const steps = ['Role & university', 'University details', 'Personal info'];

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState(0);
  const [institutions, setInstitutions] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    role: 'STUDENT',
    institutionId: '',
    facultyName: '',
    departmentName: '',
    title: '',
    studentNumber: '',
    admissionYear: new Date().getFullYear(),
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  useEffect(() => {
    let canceled = false;
    async function loadInstitutions() {
      try {
        const resp = await fetch(`${API_BASE}/api/institutions`);
        const body = await resp.json();
        if (!canceled && body.success) {
          setInstitutions(body.data || []);
        }
      } catch {
        if (!canceled) setError('Unable to load institutions.');
      } finally {
        if (!canceled) setLoadingInstitutions(false);
      }
    }
    loadInstitutions();
    return () => { canceled = true; };
  }, []);

  const isStudent = form.role === 'STUDENT';
  const isStaff = !isStudent;

  const stepDescription = useMemo(() => {
    if (step === 0) return 'Choose your role and the university you belong to.';
    if (step === 1) {
      return isStudent
        ? 'Provide your student details and academic department.'
        : 'Provide your staff role, department, and faculty information.';
    }
    return 'Enter the personal details you will use to sign in.';
  }, [isStudent, step]);

  const canContinue = useMemo(() => {
    if (step === 0) {
      return Boolean(form.role && form.institutionId);
    }
    if (step === 1) {
      if (isStudent) {
        return Boolean(form.departmentName && form.admissionYear);
      }
      return Boolean(form.title);
    }
    if (step === 2) {
      return Boolean(form.name && form.email && form.password.length >= 6);
    }
    return false;
  }, [form, isStudent, step]);

  const handleNext = (e) => {
    e.preventDefault();
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }
    handleSubmit();
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          role: form.role,
          institutionId: form.institutionId || undefined,
          facultyName: form.facultyName || undefined,
          departmentName: form.departmentName || undefined,
          studentNumber: form.studentNumber || undefined,
          admissionYear: form.admissionYear ? Number(form.admissionYear) : undefined,
          phone: form.phone || undefined,
          profile: isStaff ? { title: form.title || undefined } : undefined,
        }),
      });
      const body = await resp.json();
      if (!body.success) {
        setError(body.message || 'Registration failed');
        return;
      }
      const { user, accessToken } = body.data;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        user.accessToken = accessToken;
      }
      login(user);
      router.push('/dashboard');
    } catch {
      setError('Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        <Card title="Create account">
          <div className="mb-4 rounded-2xl bg-[var(--surface)] px-4 py-3 text-sm text-[var(--color-muted-text)] shadow-sm">
            <div className="font-semibold text-[var(--color-text)]">Step {step + 1} of {steps.length}</div>
            <div>{steps[step]}</div>
            <div className="mt-2 text-xs text-[var(--color-muted-text)]">{stepDescription}</div>
          </div>

          <form onSubmit={handleNext} className="space-y-4">
            {error && <Alert title="Error" tone="danger">{error}</Alert>}

            {step === 0 && (
              <>
                <label className="block text-sm font-medium text-[var(--color-text)]">
                  <span className="mb-2 block">Role</span>
                  <select
                    className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-primary)]"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-[var(--color-text)]">
                  <span className="mb-2 block">University</span>
                  <select
                    className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-primary)]"
                    value={form.institutionId}
                    onChange={(e) => setForm({ ...form, institutionId: e.target.value })}
                    disabled={loadingInstitutions}
                  >
                    <option value="">Select university</option>
                    {institutions.map((institution) => (
                      <option key={institution.id} value={institution.id}>{institution.name}</option>
                    ))}
                  </select>
                </label>
              </>
            )}

            {step === 1 && (
              <>
                {isStudent ? (
                  <>
                    <Input
                      label="Student number"
                      value={form.studentNumber}
                      onChange={(e) => setForm({ ...form, studentNumber: e.target.value })}
                      placeholder="Optional"
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label="Admission year"
                        type="number"
                        value={form.admissionYear}
                        onChange={(e) => setForm({ ...form, admissionYear: e.target.value })}
                        required
                      />
                      <Input
                        label="Phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                    <Input
                      label="Department"
                      value={form.departmentName}
                      onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
                      placeholder="e.g. Computer Science"
                      required
                    />
                    <Input
                      label="Faculty"
                      value={form.facultyName}
                      onChange={(e) => setForm({ ...form, facultyName: e.target.value })}
                      placeholder="Optional"
                    />
                  </>
                ) : (
                  <>
                    <Input
                      label="Job title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Lecturer, HOD, Dean"
                      required
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label="Phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                      <Input
                        label="Department"
                        value={form.departmentName}
                        onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                    <Input
                      label="Faculty"
                      value={form.facultyName}
                      onChange={(e) => setForm({ ...form, facultyName: e.target.value })}
                      placeholder="Optional"
                    />
                  </>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <Input
                  label="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </>
            )}

            <div className="flex items-center justify-between gap-2">
              {step > 0 ? (
                <Button type="button" variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>
              ) : <div />}
              <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                <Button type="submit" className="min-w-[10rem]" disabled={!canContinue}>
                  {step < steps.length - 1 ? 'Continue' : 'Create account'}
                </Button>
              </div>
            </div>
          </form>
        </Card>

        <div className="mt-4 text-center text-sm text-[var(--color-muted-text)]">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
