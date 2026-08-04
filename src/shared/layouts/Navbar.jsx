"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth/AuthProvider';
import { getLayoutConfig } from '../layoutConfig';

export default function Navbar({ onMenuToggle }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const layoutConfig = getLayoutConfig(user?.role);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="border-b border-slate-200 bg-[var(--color-surface)] px-4 py-3 shadow-sm lg:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] transition hover:bg-[var(--color-muted)] lg:hidden"
            aria-label="Open navigation menu"
          >
            ☰
          </button>
          <div className="hidden sm:flex flex-wrap items-center gap-2">
            {layoutConfig.navbar.slice(0, 5).map((item) => (
              <span key={item} className="rounded-full border border-[var(--color-border)] bg-[var(--color-muted)] px-3 py-1 text-sm text-[var(--color-text)]">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-[var(--color-text)]">{user?.name || 'User'}</p>
            <p className="text-xs text-[var(--color-muted-text)]">{user?.email || 'No email'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-muted)]"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
