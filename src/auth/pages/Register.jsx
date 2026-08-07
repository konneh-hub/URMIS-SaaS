"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../shared/auth/AuthProvider';
import Button from '../../shared/components/ui/Button';
import Card from '../../shared/components/ui/Card';
import Input from '../../shared/components/ui/Input';
import Alert from '../../shared/components/ui/Alert';

const roleOptions = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'LECTURER', label: 'Lecturer' },
  { value: 'HOD', label: 'Head of Department' },
  { value: 'DEAN', label: 'Dean' },
  { value: 'EXAM_OFFICER', label: 'Exam Officer' },
];
const steps = ['Role & university', 'University details', 'Personal info'];

function buildApiUrl(path) {
  const rawBase = process.env.NEXT_PUBLIC_API_BASE || '';
  const base = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
  if (!base) return path.startsWith('/') ? path : `/${path}`;
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('token') || '';
  const inviteEmail = searchParams.get('email') || '';
  const inviteMode = Boolean(inviteToken);
  const { login } = useAuth();
  const [step, setStep] = useState(0);
  const [institutions, setInstitutions] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(inviteMode ? false : true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    role: 'STUDENT',
    institutionId: '',
    facultyName: '',
    departmentName: '',
    title: '',
    studentNumber: '',
    admissionYear: new Date().getFullYear(),
    // personal
    firstName: '',
    middleName: '',
    lastName: '',
    name: '',
    gender: '',
    dob: '',
    nationality: '',
    profilePhoto: '',
    profilePhotoFile: null,
    profilePhotoPreview: '',
    address: '',
    // employment / academic
    staffId: '',
    staffType: '',
    position: '',
    employmentStatus: '',
    dateJoined: '',
    programme: '',
    programmeType: '',
    level: '',
    academicSession: '',
    admissionDate: '',
    studentStatus: '',
    // account
    email: inviteEmail,
    password: '',
    phone: '',
  });

  useEffect(() => {
    let canceled = false;
    if (inviteMode) {
      return () => { canceled = true; };
    }

    async function loadInstitutions() {
      try {
        const resp = await fetch(buildApiUrl('/api/institutions'));
        const body = await resp.json();
        if (!canceled) {
          if (!resp.ok) {
            setError(body.message || 'Unable to load institutions.');
            return;
          }
          if (body.success) {
            setInstitutions(body.data || []);
          } else {
            setError(body.message || 'Unable to load institutions.');
          }
        }
      } catch {
        if (!canceled) setError('Unable to load institutions.');
      } finally {
        if (!canceled) setLoadingInstitutions(false);
      }
    }
    loadInstitutions();
    return () => { canceled = true; };
  }, [inviteMode]);

  const isStudent = form.role === 'STUDENT';
  const isStaff = !isStudent;

  const stepDescription = useMemo(() => {
    if (inviteMode) return 'Use your invitation token to complete registration with a secure password.';
    if (step === 0) return 'Choose your role and the university you belong to.';
    if (step === 1) {
      return isStudent
        ? 'Provide your student details and academic department.'
        : 'Provide your staff role, department, and faculty information.';
    }
    return 'Enter the personal details you will use to sign in.';
  }, [inviteMode, isStudent, step]);

  const canContinue = useMemo(() => {
    if (inviteMode) {
      return Boolean(form.password.length >= 6 && form.email);
    }
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
      return Boolean((form.name || (form.firstName && form.lastName)) && form.email && form.password.length >= 6);
    }
    return false;
  }, [form, isStudent, step, inviteMode]);

  const handleNext = (e) => {
    e.preventDefault();
    if (inviteMode) {
      handleSubmit();
      return;
    }
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }
    handleSubmit();
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      const endpoint = inviteMode ? '/accept-invite' : '/register';
      const bodyPayload = inviteMode
        ? {
            token: inviteToken,
            password: form.password,
          }
        : {
          // account
          email: form.email,
          password: form.password,
          name: form.name || `${form.firstName || ''} ${form.middleName || ''} ${form.lastName || ''}`.trim(),
          role: form.role,
          institutionId: form.institutionId || undefined,
          // affiliation
          facultyName: form.facultyName || undefined,
          departmentName: form.departmentName || undefined,
          // student-specific
          studentNumber: form.studentNumber || undefined,
          admissionYear: form.admissionYear ? Number(form.admissionYear) : undefined,
          admissionDate: form.admissionDate || undefined,
          programme: form.programme || undefined,
          programmeType: form.programmeType || undefined,
          level: form.level || undefined,
          academicSession: form.academicSession || undefined,
          studentStatus: form.studentStatus || undefined,
          // staff/employment
          staffId: form.staffId || undefined,
          staffType: form.staffType || undefined,
          position: form.position || undefined,
          employmentStatus: form.employmentStatus || undefined,
          dateJoined: form.dateJoined || undefined,
          // personal
          firstName: form.firstName || undefined,
          middleName: form.middleName || undefined,
          lastName: form.lastName || undefined,
          gender: form.gender || undefined,
          dob: form.dob || undefined,
          nationality: form.nationality || undefined,
          address: form.address || undefined,
          profilePhoto: form.profilePhoto || undefined,
          phone: form.phone || undefined,
          profile: isStaff ? { title: form.title || undefined } : undefined,
            };
      const resp = await fetch(buildApiUrl(`/api/auth${endpoint}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bodyPayload),
      });
      // if a photo file is present, upload it separately as base64 before continuing
      if (form.profilePhotoFile && !form.profilePhoto) {
        try {
          const toBase64 = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          const base64 = await toBase64(form.profilePhotoFile);
          // attach and resend payload with profilePhotoBase64
          bodyPayload.profilePhotoBase64 = base64;
          const resp2 = await fetch(buildApiUrl(`/api/auth${endpoint}`), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(bodyPayload),
          });
          const body2 = await resp2.json();
          if (!body2.success) {
            setError(body2.message || 'Registration failed');
            return;
          }
          const { user, accessToken } = body2.data;
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
            user.accessToken = accessToken;
          }
          login(user);
          router.push('/dashboard');
          return;
        } catch (err) {
          console.error('photo upload failed', err);
        }
      }
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
        <div className="mb-6 flex items-center gap-3">
          <img src="/urmis.png" alt="URMIS logo" className="h-12 w-auto rounded-lg bg-[var(--color-surface)] p-1 shadow-sm" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-primary)]">URMIS</p>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Create your account</h2>
          </div>
        </div>
        <Card title="Create account">
          <div className="mb-4 rounded-2xl bg-[var(--surface)] px-4 py-3 text-sm text-[var(--color-muted-text)] shadow-sm">
            <div className="font-semibold text-[var(--color-text)]">{inviteMode ? 'Invitation registration' : `Step ${step + 1} of ${steps.length}`}</div>
            <div>{inviteMode ? 'Complete your invitation with a password.' : steps[step]}</div>
            <div className="mt-2 text-xs text-[var(--color-muted-text)]">{stepDescription}</div>
          </div>

          <form onSubmit={handleNext} className="space-y-4">
            {error && <Alert title="Error" tone="danger">{error}</Alert>}

            {inviteMode ? (
              <>
                <p className="text-sm text-[var(--color-muted-text)]">Enter a password to complete your invitation. If your email is known from the invitation, leave it as shown.</p>
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
            ) : (
              <>
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
                    <div className="grid gap-4 md:grid-cols-3">
                      <Input
                        label="First name"
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        required
                      />
                      <Input
                        label="Middle name"
                        value={form.middleName}
                        onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                      />
                      <Input
                        label="Last name"
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Input
                        label="Gender"
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      />
                      <Input
                        label="Date of birth"
                        type="date"
                        value={form.dob}
                        onChange={(e) => setForm({ ...form, dob: e.target.value })}
                      />
                      <Input
                        label="Nationality"
                        value={form.nationality}
                        onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                      />
                    </div>
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
                    <Input
                      label="Address"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text)]">Profile photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files && e.target.files[0];
                          if (f) {
                            setForm({ ...form, profilePhotoFile: f, profilePhotoPreview: URL.createObjectURL(f) });
                          }
                        }}
                        className="mt-2"
                      />
                      {form.profilePhotoPreview && (
                        <img src={form.profilePhotoPreview} alt="preview" className="mt-2 h-24 w-24 rounded-md object-cover" />
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            <div className="flex items-center justify-between gap-2">
              {!inviteMode && step > 0 ? (
                <Button type="button" variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>
              ) : <div />}
              <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                <Button type="submit" className="min-w-[10rem]" disabled={!canContinue}>
                  {inviteMode ? 'Complete invitation' : step < steps.length - 1 ? 'Continue' : 'Create account'}
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
