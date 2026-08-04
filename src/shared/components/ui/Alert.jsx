import React from 'react';

export default function Alert({ title, children, tone = 'info', className = '' }) {
  const tones = {
    info: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-300',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
    warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
    danger: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300',
  };

  return (
    <div className={`rounded-2xl border p-4 text-sm ${tones[tone] || tones.info} ${className}`.trim()}>
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <div className="mt-1">{children}</div> : null}
    </div>
  );
}
