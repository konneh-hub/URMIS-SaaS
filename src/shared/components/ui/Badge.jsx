import React from 'react';

export default function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-[var(--color-muted)] text-[var(--color-muted-text)]',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  };

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tones[tone] || tones.neutral} ${className}`.trim()}>{children}</span>;
}
