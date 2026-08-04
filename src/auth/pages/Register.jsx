"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../shared/auth/AuthProvider';
import Button from '../../shared/components/ui/Button';
import Card from '../../shared/components/ui/Card';
import Input from '../../shared/components/ui/Input';

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
      const resp = await fetch(`${base}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include',
      });
      const body = await resp.json();
      if (!body.success) return setError(body.message || 'Registration failed');
      const { user, accessToken } = body.data;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        user.accessToken = accessToken;
      }
      login(user);
      router.push('/dashboard');
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card title="Create account">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit" className="w-full">Create account</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
