"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../shared/auth/AuthProvider';
import Button from '../../shared/components/ui/Button';
import Card from '../../shared/components/ui/Card';
import Input from '../../shared/components/ui/Input';
import Alert from '../../shared/components/ui/Alert';
import Image from 'next/image';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState(() => {
    try {
      const storedRemember = localStorage.getItem('rememberMe') === 'true';
      const storedEmail = localStorage.getItem('rememberedEmail');
      return storedRemember && storedEmail ? storedEmail : '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return localStorage.getItem('rememberMe') === 'true';
    } catch {
      return false;
    }
  });
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
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedEmail');
      }
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        user.accessToken = accessToken;
      }
      login(user);
      router.push('/dashboard');
    } catch {
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
          <div className="mb-6 flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-slate-100 p-1">
              <Image src="/urmis.png" alt="URMIS logo" fill style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-primary)]">URMIS</p>
              <h2 className="text-xl font-semibold text-[var(--color-text)]">Sign in to your account</h2>
            </div>
          </div>
          <Card title="Sign in" description="Choose a demo role to explore the unified dashboard experience.">
            <Alert title="Demo mode" tone="info" className="mb-5">This preview uses a simulated onboarding flow for design validation and role-based navigation.</Alert>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="text-sm text-red-600">{error}</div>}
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} hint="Your account password" />
              <div className="flex items-center justify-between gap-4 text-sm text-[var(--color-muted-text)]">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  Remember me
                </label>
                <Link href="/forgot-password" className="font-semibold text-[var(--color-primary)] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full">Sign in</Button>
              <div className="text-center text-sm text-[var(--color-muted-text)]">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-semibold text-[var(--color-primary)] hover:underline">
                  Create one
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
