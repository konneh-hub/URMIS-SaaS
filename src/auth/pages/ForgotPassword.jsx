"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '../../shared/components/ui/Button';
import Card from '../../shared/components/ui/Card';
import Input from '../../shared/components/ui/Input';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card title="Reset your password" description="Enter your account email and we’ll send a password reset link.">
          {submitted ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-sm text-green-900">
              If an account with that email exists, a password reset link has been sent.
              <div className="mt-4">
                <Link href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">
                  Back to login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">Send reset link</Button>
              <div className="text-center text-sm text-[var(--color-muted-text)]">
                Remembered your password?{' '}
                <Link href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
