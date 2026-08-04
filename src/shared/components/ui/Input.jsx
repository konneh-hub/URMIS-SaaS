import React from 'react';

export default function Input({ label, hint, error, className = '', ...props }) {
  return (
    <label className="block text-sm font-medium text-[var(--color-text)]">
      {label ? <span className="mb-2 block">{label}</span> : null}
      <input
        className={`min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 ${error ? 'border-rose-500' : ''} ${className}`.trim()}
        {...props}
      />
      {hint && !error ? <span className="mt-2 block text-xs text-[var(--color-muted-text)]">{hint}</span> : null}
      {error ? <span className="mt-2 block text-xs font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}
