"use client";

import React, { useEffect, useState } from 'react';

const applyTheme = (value) => {
  const root = document.documentElement;
  const resolved = value === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : value;
  root.setAttribute('data-theme', resolved);
  root.style.colorScheme = resolved;
};

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'system';
  return window.localStorage.getItem('urmis-theme') || 'system';
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem('urmis-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text)] shadow-sm"
      aria-label="Toggle color theme"
    >
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
